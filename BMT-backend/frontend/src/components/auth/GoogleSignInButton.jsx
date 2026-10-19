import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { useToast } from '../ui/Toast';

export default function GoogleSignInButton({ mode = 'signin', redirect = '/', onError }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToast();
  const navigate = useNavigate();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '285711246913-fma3kt05h73e9vb8nsijut84obkmbsgo.apps.googleusercontent.com';

  // Handle successful Google token credential from Google Identity Services
  const handleCredentialResponse = useCallback(async (response) => {
    if (!response || !response.credential) {
      showToast('No credential returned from Google', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.googleAuth(response.credential);
      const user = res.loggedInUser || res.data?.user || res.data;

      if (res.accessToken) {
        localStorage.setItem('bmt_access_token', res.accessToken);
      }
      if (res.refreshToken) {
        localStorage.setItem('bmt_refresh_token', res.refreshToken);
      }

      setUser(user);
      showToast(`Welcome ${user?.firstName || 'Traveler'}! Signed in with Google 🚀`, 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error('Google Auth backend error:', err);
      const msg = err.response?.data?.message || err.message || 'Google sign-in could not be completed';
      showToast(msg, 'error');
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  }, [setUser, showToast, navigate, redirect, onError]);

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setSdkReady(true);
      return;
    }

    const scriptId = 'google-identity-services-script';
    const existing = document.getElementById(scriptId);

    if (existing) {
      existing.addEventListener('load', () => setSdkReady(true));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load.');
    };
    document.body.appendChild(script);
  }, []);

  const renderGoogleButton = useCallback(() => {
    if (!sdkReady || !clientId || typeof window === 'undefined' || !window.google?.accounts?.id || !containerRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Compute precise width without clipping
      const rect = containerRef.current.getBoundingClientRect();
      const availableWidth = Math.floor(rect.width) || containerRef.current.clientWidth || 320;
      // Clamped between Google minimum (200) and maximum (400), with safety margin
      const targetWidth = Math.min(Math.max(availableWidth - 6, 220), 400);

      containerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: targetWidth,
      });
    } catch (err) {
      console.warn('Google button initialization error:', err);
    }
  }, [sdkReady, clientId, mode, handleCredentialResponse]);

  // Render button once SDK is ready and re-render on resize
  useEffect(() => {
    if (!sdkReady) return;
    renderGoogleButton();

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const ro = new ResizeObserver(() => {
        renderGoogleButton();
      });
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }
  }, [sdkReady, renderGoogleButton]);

  const handleManualClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full flex items-center justify-center min-h-[46px]">
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex items-center justify-center z-20 rounded-full">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Signing in with Google...</span>
            </div>
          </div>
        )}

        {/* Official Google render container - with gsi-button-wrapper and NO overflow-hidden */}
        <div
          ref={containerRef}
          className="gsi-button-wrapper w-full flex items-center justify-center transition-all duration-200"
        />

        {/* Smooth fallback placeholder before Google SDK loads */}
        {!sdkReady && (
          <button
            type="button"
            onClick={handleManualClick}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full text-slate-700 text-xs font-bold shadow-xs hover:shadow-sm transition-all duration-200 active:scale-98 group"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
