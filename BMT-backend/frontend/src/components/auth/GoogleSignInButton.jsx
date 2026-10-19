import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { useToast } from '../ui/Toast';

export default function GoogleSignInButton({ mode = 'signin', redirect = '/', onError }) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const tokenClientRef = useRef(null);

  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToast();
  const navigate = useNavigate();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '285711246913-fma3kt05h73e9vb8nsijut84obkmbsgo.apps.googleusercontent.com';

  // Process verified token (access_token or id_token) with backend
  const handleAuthToken = useCallback(async (token) => {
    if (!token) {
      showToast('No authorization token received from Google', 'error');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.googleAuth(token);
      const user = res.loggedInUser || res.data?.user || res.data;

      if (res.accessToken) {
        localStorage.setItem('bmt_access_token', res.accessToken);
      }
      if (res.refreshToken) {
        localStorage.setItem('bmt_refresh_token', res.refreshToken);
      }

      setUser(user);
      const displayName = user?.firstName || user?.name || 'Traveler';
      showToast(`Welcome ${displayName}! Signed in with Google 🚀`, 'success');
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

    const checkSdk = () => {
      if (window.google?.accounts?.oauth2) {
        setSdkReady(true);
        return true;
      }
      return false;
    };

    if (checkSdk()) return;

    const scriptId = 'google-identity-services-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.addEventListener('load', () => {
      if (window.google?.accounts) {
        setSdkReady(true);
      }
    });

    const interval = setInterval(() => {
      if (checkSdk()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize OAuth2 Token Client (Popup flow - 100% reliable across all browsers)
  useEffect(() => {
    if (!sdkReady || !clientId || typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      return;
    }

    try {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse?.error) {
            console.warn('[Google OAuth] User dismissed or cancelled:', tokenResponse);
            setLoading(false);
            return;
          }
          if (tokenResponse?.access_token) {
            await handleAuthToken(tokenResponse.access_token);
          } else {
            setLoading(false);
          }
        },
        error_callback: (err) => {
          console.warn('[Google OAuth] Popup error details:', err);
          setLoading(false);
          if (err?.type === 'popup_failed_to_open') {
            showToast('Google popup was blocked by your browser. Please allow popups in your URL bar.', 'error');
          } else if (err?.type === 'popup_closed') {
            showToast('Google sign-in window was closed.', 'info');
          } else {
            showToast(err?.message || 'Google sign-in could not open.', 'error');
          }
        },
      });

      // Also initialize id token listener as backup for One Tap
      if (window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              handleAuthToken(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    } catch (err) {
      console.warn('Google client initialization error:', err);
    }
  }, [sdkReady, clientId, handleAuthToken, showToast]);

  // Click handler that triggers direct Google OAuth popup
  const handleGoogleSignInClick = () => {
    if (loading) return;

    if (!clientId) {
      showToast('Google Client ID is not configured.', 'warning');
      return;
    }

    setLoading(true);

    // Auto-reset loading after 12 seconds in case Google popup hangs or closes silently
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 12000);

    if (tokenClientRef.current) {
      try {
        // Triggers Google's official OAuth account selection popup
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth token request error:', err);
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    // Fallback if tokenClient is still initializing
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          clearTimeout(timeout);
          setLoading(false);
        }
      });
    } else {
      clearTimeout(timeout);
      setLoading(false);
      showToast('Connecting to Google services, please try again in a moment.', 'info');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full flex items-center justify-center min-h-[46px]">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex items-center justify-center z-30 rounded-full border border-emerald-200 shadow-sm transition-all animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-800">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to Google...</span>
            </div>
          </div>
        )}

        {/* 100% Reliable, Native-Styled Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignInClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50/90 active:bg-slate-100 border border-slate-200/90 hover:border-slate-300 rounded-full text-slate-700 hover:text-slate-900 text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.99] group cursor-pointer select-none"
          title="Sign in with your Google account"
        >
          {/* Authentic Google 'G' Logo SVG */}
          <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="truncate">
            {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
          </span>
        </button>
      </div>
    </div>
  );
}
