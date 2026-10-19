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
        type = 'error'; // Orange failure toast
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
      {/* High-priority notification stack mounted at top z-index with responsive mobile width */}
      <div className="fixed top-3.5 sm:top-5 left-0 right-0 sm:left-auto sm:right-5 z-[100000] flex flex-col items-center sm:items-end gap-2.5 pointer-events-none px-3.5 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error' || t.type === 'service_fail';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-xl border transition-all duration-300 animate-toast-in hover:shadow-2xl w-full max-w-sm sm:max-w-md ${
                isSuccess
                  ? 'bg-white/95 text-slate-800 border-emerald-200/90 shadow-emerald-950/10 border-l-[5px] border-l-emerald-500'
                  : isError
                  ? 'bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] text-white border-orange-300/60 shadow-orange-600/35'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-500 via-[#F97316] to-amber-600 text-white border-amber-300/60 shadow-amber-600/30'
                  : 'bg-white/95 text-slate-800 border-sky-200/90 shadow-slate-900/10 border-l-[5px] border-l-sky-500'
              }`}
            >
              {/* Icon badge */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && (
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs">
                    <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                )}
                {isError && (
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white border border-white/30 shadow-xs">
                    <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  </div>
                )}
                {isWarning && (
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white border border-white/30 shadow-xs font-bold text-sm">
                    ⚡
                  </div>
                )}
                {!isSuccess && !isError && !isWarning && (
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shadow-xs">
                    <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {isSuccess && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                      Success
                    </span>
                  )}
                  {isError && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-950 bg-white/80 px-1.5 py-0.5 rounded-md">
                      Notice
                    </span>
                  )}
                  {isWarning && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-950 bg-white/80 px-1.5 py-0.5 rounded-md">
                      Alert
                    </span>
                  )}
                  {!isSuccess && !isError && !isWarning && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded-md">
                      Info
                    </span>
                  )}
                </div>
                <p className={`text-xs font-semibold leading-snug break-words ${
                  isSuccess || (!isError && !isWarning) ? 'text-slate-800' : 'text-white'
                }`}>
                  {t.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(t.id)}
                className={`shrink-0 p-1 rounded-lg transition-all cursor-pointer ${
                  isSuccess || (!isError && !isWarning)
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
                aria-label="Close notification"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Countdown Progress Bar */}
              <div
                className={`absolute bottom-0 left-0 h-1 animate-toast-progress ${
                  isSuccess
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400'
                    : isError || isWarning
                    ? 'bg-white/50'
                    : 'bg-sky-500'
                }`}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
