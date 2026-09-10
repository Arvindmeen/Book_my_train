import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((rawMessage, type = 'info') => {
    let message = rawMessage;

    // Detect service down, outage or failure automatically
    if (typeof message === 'string') {
      const lower = message.toLowerCase();
      const isOutage =
        lower.includes('network error') ||
        lower.includes('failed to fetch') ||
        lower.includes('econnrefused') ||
        lower.includes('temporarily undergoing maintenance') ||
        lower.includes('service is temporarily') ||
        lower.includes('502') ||
        lower.includes('503') ||
        lower.includes('504') ||
        lower.includes('500');

      if (isOutage) {
        message = 'Currently this service is temporarily undergoing maintenance. We will connect back soon!';
        type = 'error'; // Red-orange failure toast
      }
    }

    // Normalize failure types
    if (type === 'failed' || type === 'failure' || type === 'service_fail') {
      type = 'error';
    }

    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* High-priority notification stack mounted at top z-index */}
      <div className="fixed top-5 right-5 z-[100000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error' || t.type === 'service_fail';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-xl border transition-all duration-300 animate-slide-in ${
                isSuccess
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white border-emerald-300/60 shadow-emerald-600/35 ring-1 ring-emerald-300/40'
                  : isError
                  ? 'bg-gradient-to-r from-[#EA580C] via-[#DC2626] to-[#E11D48] text-white border-orange-300/70 shadow-orange-600/35 ring-1 ring-orange-400/40'
                  : isWarning
                  ? 'bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#DC2626] text-white border-orange-300/60 shadow-orange-500/30 ring-1 ring-orange-400/30'
                  : 'bg-slate-900/95 text-slate-100 border-blue-500/40 shadow-blue-950/20'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && (
                  <span className="w-5 h-5 rounded-full bg-white/25 text-white flex items-center justify-center text-xs font-black ring-1 ring-white/50 shadow-xs">
                    ✓
                  </span>
                )}
                {isError && (
                  <span className="w-5 h-5 rounded-full bg-white/25 text-white flex items-center justify-center text-xs font-bold ring-1 ring-white/50 shadow-xs">
                    ✕
                  </span>
                )}
                {isWarning && (
                  <span className="w-5 h-5 rounded-full bg-white/25 text-white flex items-center justify-center text-xs font-bold ring-1 ring-white/50 shadow-xs">
                    ⚡
                  </span>
                )}
                {!isSuccess && !isError && !isWarning && (
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold ring-1 ring-blue-500/30">
                    ℹ
                  </span>
                )}
              </div>

              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {t.message}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-white/80 hover:text-white transition-colors text-xs font-bold p-1 -mr-1 -mt-1 cursor-pointer"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
