import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Monitor page scroll to resize and add shadows
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const themeToggleBtn = (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-accent-400 hover:text-accent-300 transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95 shadow-inner"
      aria-label="Toggle Theme"
      title="Toggle Light/Dark Mode"
    >
      {isDark ? (
        <svg className="w-5 h-5 text-amber-400 transition-transform duration-500 hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-200 transition-transform duration-500 hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? (isDark 
            ? 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl shadow-black/35' 
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xl shadow-slate-100/30') 
        : (isDark 
            ? 'bg-slate-950/80 backdrop-blur-sm border-b border-slate-900/50' 
            : 'bg-slate-50/80 backdrop-blur-sm border-b border-slate-200/50')
    }`}>
      
      {/* 1. Upper Utility Topbar */}
      <div className={`transition-all duration-500 ${
        scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-8 flex items-center'
      } ${
        isDark 
          ? 'bg-slate-950 border-b border-slate-900 text-slate-400' 
          : 'bg-slate-100 border-b border-slate-200 text-slate-600'
      } text-[10.5px] font-semibold tracking-wide`}>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="text-[10px] bg-accent-500 text-white rounded px-1.5 py-0.2 font-black leading-none uppercase tracking-wider">Authorized</span>
              <span>Express Booking Partner</span>
            </span>
            <span className={`hidden sm:inline ${isDark ? 'text-white/20' : 'text-slate-300'}`}>|</span>
            <span>Helpline: 139</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <a href="#app" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors flex items-center gap-1">
              <span>📱</span> App Download
            </a>
            <span className={`hidden sm:inline ${isDark ? 'text-white/20' : 'text-slate-300'}`}>|</span>
            <a href="#support" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors flex items-center gap-1">
              <span>💬</span> Support 24x7
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${
          scrolled ? 'h-16' : 'h-20'
        }`}>
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-2.5 shadow-lg shadow-accent-600/20 group-hover:scale-105 transition-transform duration-300">
              {/* Sleek Bullet Train Front Icon */}
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r group-hover:opacity-90 transition-all duration-300 ${
                isDark 
                  ? 'from-white via-slate-100 to-accent-200' 
                  : 'from-slate-900 via-primary-950 to-accent-650'
              }`}>
                BooK my Train
              </span>
              <span className="text-[9.5px] text-accent-500 font-extrabold tracking-widest uppercase mt-0.5 select-none">
                Express Booking Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link 
              to="/" 
              className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${
                isActive('/') 
                  ? (isDark ? 'bg-white/10 text-white shadow-inner' : 'bg-slate-200 text-slate-900 shadow-inner') 
                  : (isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900')
              }`}
            >
              <span>🏠</span> Home
              {isActive('/') && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent-500" />}
            </Link>
            <Link 
              to="/search" 
              className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${
                isActive('/search') 
                  ? (isDark ? 'bg-white/10 text-white shadow-inner' : 'bg-slate-200 text-slate-900 shadow-inner') 
                  : (isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900')
              }`}
            >
              <span>🔍</span> Search Trains
              {isActive('/search') && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent-500" />}
            </Link>

            {/* Theme Toggle - Commented out for now. I will restore this later. */}
            {/*
            <div className={`h-6 w-px mx-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            {themeToggleBtn}
            */}

            {isAuthenticated ? (
              <>
                <Link 
                  to="/bookings" 
                  className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${
                    isActive('/bookings') 
                      ? (isDark ? 'bg-white/10 text-white shadow-inner' : 'bg-slate-200 text-slate-900 shadow-inner') 
                      : (isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                >
                  <span>📅</span> My Bookings
                  {isActive('/bookings') && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent-500" />}
                </Link>
                <Link 
                  to="/admin" 
                  className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${
                    isActive('/admin') 
                      ? (isDark ? 'bg-white/10 text-white shadow-inner' : 'bg-slate-200 text-slate-900 shadow-inner') 
                      : (isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                >
                  <span>⚙️</span> Admin
                  {isActive('/admin') && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent-500" />}
                </Link>
                
                <div className={`h-6 w-px mx-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                
                {/* Interactive Dropdown Profile Menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all select-none ${
                      isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-md">
                      {user?.firstName ? user.firstName[0] : 'U'}
                    </div>
                    <span className={`text-sm font-bold max-w-[90px] truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user?.firstName}
                    </span>
                    <svg className="w-4 h-4 text-slate-400 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800 shadow-2xl p-2.5 text-slate-800 dark:text-slate-100 animate-slide-in select-none">
                      <div className="px-3.5 py-2.5 border-b dark:border-slate-800 border-slate-100">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Active Account</p>
                        <p className="font-extrabold text-sm text-slate-850 dark:text-slate-100 truncate mt-0.5">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      
                      <div className="py-1.5 space-y-0.5 text-xs font-bold">
                        <Link 
                          to="/bookings" 
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
                        >
                          <span>🎫</span> Passenger Profile
                        </Link>
                        <a 
                          href="#help" 
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
                        >
                          <span>🛠️</span> Support Tickets
                        </a>
                        <a 
                          href="#help" 
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left border-b dark:border-slate-800 border-slate-100 pb-2 mb-1"
                        >
                          <span>ℹ️</span> Settings & Safety
                        </a>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-left text-xs font-black text-red-650 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <span>🚪</span> Log Out Account
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={`h-6 w-px mx-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white shadow-lg shadow-accent-600/25 hover:shadow-accent-500/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions (Theme Toggle & Menu Button) */}
          <div className="flex items-center md:hidden">
            {/* Theme Toggle - Commented out for now. I will restore this later. */}
            {/* {themeToggleBtn} */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t backdrop-blur-lg animate-fade-in-up ${
          isDark ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/95'
        }`}>
          <div className="px-3 pt-3 pb-8 space-y-2">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-bold ${
                isActive('/') 
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900') 
                  : (isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100')
              }`}
            >
              🏠 Home
            </Link>
            <Link 
              to="/search" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-bold ${
                isActive('/search') 
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900') 
                  : (isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100')
              }`}
            >
              🔍 Search Trains
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/bookings" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold ${
                    isActive('/bookings') 
                      ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900') 
                      : (isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100')
                  }`}
                >
                  📅 My Bookings
                </Link>
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold ${
                    isActive('/admin') 
                      ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900') 
                      : (isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100')
                  }`}
                >
                  ⚙️ Admin
                </Link>
                <div className={`border-t my-4 pt-4 px-4 flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center font-bold text-white shadow-md">
                      {user?.firstName ? user.firstName[0] : 'U'}
                    </div>
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.firstName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600/20 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 pt-4">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-5 py-3.5 rounded-xl text-base font-bold bg-accent-600 hover:bg-accent-500 text-white shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
