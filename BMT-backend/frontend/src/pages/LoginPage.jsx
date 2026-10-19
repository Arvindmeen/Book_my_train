import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AnimatedEyeToggle from '../components/ui/AnimatedEyeToggle';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = () => {
    if (location.pathname === '/forgot-password' || searchParams.get('tab') === 'forgot') return 'forgot';
    if (location.pathname === '/reset-password' || searchParams.get('tab') === 'reset') return 'reset';
    if (searchParams.get('tab') === 'register' || location.pathname === '/register' || location.pathname === '/signup') return 'register';
    return 'login';
  };

  const [tab, setTab] = useState(getInitialTab); // 'login' | 'register' | 'otp' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToast();

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form
  const [regData, setRegData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showRegPassword, setShowRegPassword] = useState(false);

  // OTP form
  const [otp, setOtp] = useState('');

  // Forgot password form
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const redirect = searchParams.get('redirect') || '/';

  // Timer for OTP resend countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (location.pathname === '/forgot-password' || searchParams.get('tab') === 'forgot') {
      setTab('forgot');
    } else if (location.pathname === '/reset-password' || searchParams.get('tab') === 'reset') {
      setTab('reset');
    } else if (location.pathname === '/register' || location.pathname === '/signup' || searchParams.get('tab') === 'register') {
      setTab('register');
    } else if (location.pathname === '/login' && !searchParams.get('tab')) {
      setTab('login');
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    // If arriving at /login without auth tokens, ensure memory store is synchronously cleared
    if (typeof window !== 'undefined') {
      const hasToken = localStorage.getItem('bmt_access_token');
      const hasStoredUser = localStorage.getItem('bmt_auth_user');
      if (!hasToken && !hasStoredUser && useAuthStore.getState().user) {
        useAuthStore.getState().logout();
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      let user = res.loggedInUser || res.data?.user || res.data;

      if (res.accessToken) {
        localStorage.setItem('bmt_access_token', res.accessToken);
      }
      if (res.refreshToken) {
        localStorage.setItem('bmt_refresh_token', res.refreshToken);
      }

      setUser(user);
      showToast('Welcome back to Book My Train!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (!msg || msg.includes('401') || msg.includes('status code')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(regData);
      showToast('Verification OTP sent to your email!', 'success');
      setTab('otp');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (!msg || msg.includes('status code')) {
        setError('Registration could not be completed. Please check your details and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyOtp(otp);
      showToast('Email verified successfully! Please sign in.', 'success');
      setEmail(regData.email);
      setTab('login');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (!msg || msg.includes('status code')) {
        setError('Invalid or expired OTP code. Please request a new code.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!resetEmail || !resetEmail.trim()) {
      setError('Please enter your registered email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(resetEmail.trim());
      if (res?.otpSessionId) setOtpSessionId(res.otpSessionId);
      setResendTimer(60);
      showToast('Password reset code sent to your email!', 'success');
      setTab('reset');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        otp: resetOtp,
        otpSessionId,
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      showToast('Password updated successfully! Please sign in.', 'success');
      setEmail(resetEmail);
      setPassword('');
      setTab('login');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-start sm:justify-center px-4 pt-3 sm:pt-6 pb-6 bg-groww-hero">
      <div className="w-full max-w-md animate-fade-in-up">
        
        {/* Brand Header */}
        <div className="text-center mb-3 sm:mb-4">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-1.5 sm:mb-2 group" title="Book My Train Home">
            <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-1 shadow-md shadow-emerald-500/25 transition-all duration-300 group-hover:scale-105">
              <img
                src="/navbar-logo.jpg"
                alt="Book My Train Logo"
                className="h-full w-full rounded-xl object-contain bg-white/90"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-black text-xl sm:text-2xl tracking-tight leading-none text-slate-900 group-hover:text-emerald-700 transition-colors">
                Book My <span className="text-emerald-600">Train</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wide mt-0.5">
                Smart Rail Ticketing Portal
              </span>
            </div>
          </Link>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            {tab === 'login'
              ? 'Sign in to your account'
              : tab === 'register'
              ? 'Create your passenger account'
              : tab === 'otp'
              ? 'Verify Email OTP'
              : tab === 'forgot'
              ? 'Reset your password'
              : 'Set new password'}
          </h2>
          <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 font-medium">
            {tab === 'forgot' || tab === 'reset'
              ? 'Secure password recovery for your railway account'
              : "India's premier portal for express railway ticket bookings"}
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="card p-4 sm:p-6 md:p-7 bg-white border border-slate-150 shadow-card-hover">
          
          {/* Tabs: Login / Register (Only visible in login or register mode) */}
          {(tab === 'login' || tab === 'register') && (
            <div className="flex mb-3.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-2.5 sm:p-3 mb-3.5 flex items-center gap-2 animate-scale-in">
              <span className="font-bold text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-3.5" autoComplete="off">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="off"
                required
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                rightElement={
                  <AnimatedEyeToggle
                    isOpen={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    passwordLength={password.length}
                  />
                }
              />

              {/* Forgot password link */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setError('');
                    setTab('forgot');
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              
              <div className="pt-1.5">
                <Button type="submit" loading={loading} className="w-full py-2.5 sm:py-3 shadow-md shadow-emerald-500/20 font-bold">
                  Sign In to Account
                </Button>
              </div>

              {/* Divider & Google Sign-In */}
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">Or continue with</span>
                </div>
              </div>

              <GoogleSignInButton mode="signin" redirect={redirect} onError={setError} />

            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3" autoComplete="off">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={regData.firstName}
                  onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                  placeholder="e.g. John"
                  autoComplete="off"
                  required
                />
                <Input
                  label="Last Name"
                  value={regData.lastName}
                  onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                  placeholder="e.g. Doe"
                  autoComplete="off"
                  required
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                placeholder="name@example.com"
                autoComplete="off"
                required
              />
              <Input
                label="Password"
                type={showRegPassword ? "text" : "password"}
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                required
                rightElement={
                  <AnimatedEyeToggle
                    isOpen={showRegPassword}
                    onToggle={() => setShowRegPassword(!showRegPassword)}
                    passwordLength={regData.password.length}
                  />
                }
              />
              <Input
                label="Confirm Password"
                type={showRegPassword ? "text" : "password"}
                value={regData.confirmPassword}
                onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
              
              <div className="pt-1.5">
                <Button type="submit" loading={loading} className="w-full py-2.5 sm:py-3 shadow-md shadow-emerald-500/20 font-bold">
                  Create Account &rarr;
                </Button>
              </div>

              {/* Divider & Google Sign-Up */}
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">Or sign up with</span>
                </div>
              </div>

              <GoogleSignInButton mode="signup" redirect={redirect} onError={setError} />

              <div className="text-center pt-2 space-y-1">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setError(''); }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
                <p className="text-xs text-slate-500">
                  Forgot your password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(regData.email || '');
                      setError('');
                      setTab('forgot');
                    }}
                    className="text-emerald-600 font-semibold hover:text-emerald-800 hover:underline"
                  >
                    Recover with OTP
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* OTP Verification Form (for Registration) */}
          {tab === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="text-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-2xl mb-0.5 inline-block">📩</span>
                <p className="text-xs font-semibold text-slate-700">
                  Verification OTP code sent to:
                </p>
                <p className="text-sm font-bold text-emerald-800 mt-0.5">{regData.email}</p>
              </div>

              <Input
                label="6-Digit Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                className="text-center tracking-widest font-mono text-lg"
              />

              <div className="pt-1.5">
                <Button type="submit" loading={loading} className="w-full py-2.5 sm:py-3 shadow-md font-bold">
                  Verify &amp; Activate Account
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold w-full text-center pt-1"
              >
                &larr; Back to registration details
              </button>
            </form>
          )}

          {/* Forgot Password Request Form */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3" autoComplete="off">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address below. We will send you a 6-digit OTP code to safely reset your password.
                </p>
              </div>

              <Input
                label="Registered Email Address"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="off"
                required
              />

              <div className="pt-1.5">
                <Button type="submit" loading={loading} className="w-full py-2.5 sm:py-3 shadow-md shadow-emerald-500/20 font-bold">
                  Send Password Reset Code &rarr;
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Form (Enter OTP + New Password) */}
          {tab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
              <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-2xl mb-1 inline-block">🔐</span>
                <p className="text-xs font-semibold text-slate-700">
                  Password reset code sent to:
                </p>
                <p className="text-sm font-bold text-emerald-800 mt-0.5">{resetEmail}</p>
              </div>

              <Input
                label="6-Digit Verification Code"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                autoComplete="off"
                required
                className="text-center tracking-widest font-mono text-lg"
              />

              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                required
                rightElement={
                  <AnimatedEyeToggle
                    isOpen={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    passwordLength={newPassword.length}
                  />
                }
              />

              <Input
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
                required
              />

              {/* Resend OTP countdown & action */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                <span>Didn't receive the OTP?</span>
                {resendTimer > 0 ? (
                  <span className="font-semibold text-slate-400">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-emerald-700 font-bold hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="pt-1.5">
                <Button type="submit" loading={loading} className="w-full py-2.5 sm:py-3 shadow-md shadow-emerald-500/20 font-bold">
                  Update Password &amp; Sign In
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setError(''); }}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Change email
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
