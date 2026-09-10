import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../ui/Toast';

export default function PwaInstallModal({ isOpen, onClose }) {
  const [canPrompt, setCanPrompt] = useState(Boolean(window.deferredPrompt));
  const [isInstalled, setIsInstalled] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const handlePwaReady = () => setCanPrompt(Boolean(window.deferredPrompt));
    const handlePwaInstalled = () => {
      setIsInstalled(true);
      setCanPrompt(false);
      showToast('BooK my Train app installed successfully on your device!', 'success');
      onClose();
    };

    window.addEventListener('pwa:ready', handlePwaReady);
    window.addEventListener('pwa:installed', handlePwaInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('pwa:ready', handlePwaReady);
      window.removeEventListener('pwa:installed', handlePwaInstalled);
    };
  }, [onClose, showToast]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (window.deferredPrompt) {
      try {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Installing BooK my Train app...', 'success');
          window.deferredPrompt = null;
          setCanPrompt(false);
          onClose();
        } else {
          showToast('App installation postponed', 'info');
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else {
      showToast('Use Chrome address bar (⤓) or menu to Install!', 'info');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-scale-in relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Banner */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl mx-auto shadow-md shadow-emerald-500/25">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="4" y="3" width="16" height="16" rx="2" />
            <path d="M4 11h16" />
            <path d="M12 3v8" />
            <circle cx="8" cy="15" r="1.5" fill="currentColor" />
            <circle cx="16" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            📲 Native Web App · Chrome &amp; Edge
          </span>
          <h3 className="font-extrabold text-xl text-slate-900 mt-2">
            Download BooK my Train App
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5 max-w-sm mx-auto">
            Convert this website into a standalone native application on your PC, Android, or iPhone with zero download wait.
          </p>
        </div>

        {/* Benefits Pill Grid */}
        <div className="grid grid-cols-3 gap-2 text-left p-3 bg-slate-50 rounded-2xl border border-slate-150 text-[11px]">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 flex items-center gap-1">⚡ Instant</span>
            <p className="text-[10px] text-slate-400">Zero MB storage size</p>
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 flex items-center gap-1">📶 Offline</span>
            <p className="text-[10px] text-slate-400">View ticket offline</p>
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 flex items-center gap-1">🔔 Alerts</span>
            <p className="text-[10px] text-slate-400">Live chart updates</p>
          </div>
        </div>

        {/* Install Action or Step Guidance */}
        <div className="space-y-2 pt-1">
          {canPrompt ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install App on this Device</span>
            </button>
          ) : (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-slate-700 text-left space-y-2">
              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span>💡</span> Chrome Built-in Install Tool:
              </p>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                <li><strong className="text-slate-800">In PC (Chrome/Edge):</strong> Click the <strong>Install icon (⤓)</strong> on the right side of the address bar (next to the star bookmark icon).</li>
                <li><strong className="text-slate-800">In Mobile (Android):</strong> Tap the <strong>3 dots (⋮)</strong> &rarr; select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li><strong className="text-slate-800">In iPhone (Safari):</strong> Tap <strong>Share (⎙)</strong> &rarr; select <strong>"Add to Home Screen"</strong>.</li>
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
