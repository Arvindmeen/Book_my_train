import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  
  const [tab, setTab] = useState(initialTab);
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

  // OTP form
  const [otp, setOtp] = useState('');

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setTab('register');
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      let user = res.loggedInUser || res.data?.user || res.data;

      setUser(user);
      showToast('Welcome back to BooK my Train!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
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
      setError(err.message);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-groww-hero">
      <div className="w-full max-w-md animate-fade-in-up">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-2.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="4" y="3" width="16" height="16" rx="2" />
                <path d="M4 11h16" />
                <path d="M12 3v8" />
              </svg>
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight">
              BooK my <span className="text-emerald-600">Train</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">
            {tab === 'login' ? 'Sign in to your account' : tab === 'register' ? 'Create your passenger account' : 'Verify Email OTP'}
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            India's premier portal for express railway ticket bookings
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="card p-6 md:p-8 bg-white border border-slate-150 shadow-card-hover">
          
          {/* Tabs: Login / Register */}
          {tab !== 'otp' && (
            <div className="flex mb-6 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
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
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
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
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 mb-5 flex items-center gap-2 animate-scale-in">
              <span className="font-bold text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8.5 text-xs font-semibold text-slate-400 hover:text-emerald-700 transition-colors py-1 px-1.5 rounded"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              
              <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full py-3 shadow-md shadow-emerald-500/20 font-bold">
                  Sign In to Account
                </Button>
              </div>

            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={regData.firstName}
                  onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                  placeholder="Arvind"
                  required
                />
                <Input
                  label="Last Name"
                  value={regData.lastName}
                  onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                  placeholder="Meena"
                  required
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                placeholder="name@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={regData.confirmPassword}
                onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                required
              />
              
              <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full py-3 shadow-md shadow-emerald-500/20 font-bold">
                  Create Account &rarr;
                </Button>
              </div>

              <div className="text-center pt-2">
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
              </div>
            </form>
          )}

          {/* OTP Verification Form */}
          {tab === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-2xl mb-1 inline-block">📩</span>
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

              <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full py-3 shadow-md font-bold">
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

        </div>

      </div>
    </div>
  );
}
