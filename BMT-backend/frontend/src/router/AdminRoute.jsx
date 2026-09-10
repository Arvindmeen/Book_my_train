import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  // Not authenticated at all -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check if user is the administrator (arvindmeena8171@gmail.com)
  const isAdmin = user?.role === 'ADMIN' || user?.isAdmin === true || user?.email?.toLowerCase() === 'arvindmeena8171@gmail.com';

  // If not admin -> show restricted 403 screen and block access to admin features
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="card max-w-md w-full p-8 text-center bg-white border border-rose-200 rounded-3xl shadow-xl space-y-5 animate-scale-in">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-xs">
            🛡️
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Access Restricted
            </span>
            <h2 className="text-xl font-black text-slate-900">Administrator Privileges Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Admin Control Center is reserved exclusively for the system administrator (<strong>arvindmeena8171@gmail.com</strong>).
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 text-left">
              <p><strong>Your Account:</strong> {user?.email || 'Standard User'}</p>
              <p><strong>Account Role:</strong> <span className="text-amber-700 font-bold">{user?.role || 'USER'}</span> (Standard Traveler)</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-center"
            >
              Return to Home
            </Link>
            <Link
              to="/login?redirect=/admin"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-center"
            >
              Sign In as Admin &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin access granted
  return <Outlet />;
}
