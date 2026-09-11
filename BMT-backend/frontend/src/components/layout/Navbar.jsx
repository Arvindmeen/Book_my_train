import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useState, useEffect, useRef } from 'react';
import ProfileModal from '../profile/ProfileModal';
import PwaInstallModal from '../common/PwaInstallModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  // Robust helper to extract first and last word initials (e.g. Arvind Meena -> AM)
  const getUserInitials = (currentUser) => {
    if (!currentUser) return 'U';
    const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || currentUser.email || '';
    if (!fullName) return 'U';
    const words = fullName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    const single = words[0];
    return single.length >= 2 ? single.slice(0, 2).toUpperCase() : single[0].toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const isAdmin = user?.role === 'ADMIN' || user?.isAdmin === true;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-card'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
          
          {/* Brand logo & name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-1 shadow-md shadow-emerald-500/25 transition-all duration-300 group-hover:scale-105">
              <img
                src="/navbar-logo.jpg"
                alt="Book my Train"
                className="h-full w-full rounded-xl object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight leading-none text-slate-900 group-hover:text-emerald-700 transition-colors">
                BooK my <span className="text-emerald-600">Train</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wide mt-0.5">
                Smart Rail Ticketing Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Available for both Logged-in and Logout/Guest Users) */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            
            {/* 1. Home */}
            <Link
              to="/"
              className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isActive('/')
                  ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <svg className={`w-4 h-4 ${isActive('/') ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
              {isActive('/') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-600" />
              )}
            </Link>

            {/* 2. Search Trains */}
            <Link
              to="/search"
              className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isActive('/search')
                  ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <svg className={`w-4 h-4 ${isActive('/search') ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Trains</span>
              {isActive('/search') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-600" />
              )}
            </Link>

            {/* 3. Check PNR (Requested by user for all users!) */}
            <Link
              to="/pnr"
              className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isActive('/pnr')
                  ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <svg className={`w-4 h-4 ${isActive('/pnr') ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Check PNR</span>
              {isActive('/pnr') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-600" />
              )}
            </Link>

            {/* 4. Travel Services (Food, Hotels, Flights) */}
            <Link
              to="/services"
              className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isActive('/services')
                  ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <svg className={`w-4 h-4 ${isActive('/services') ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Services</span>
              {isActive('/services') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-600" />
              )}
            </Link>

            {/* Logged In Features vs Logged Out Features */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/bookings"
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    isActive('/bookings')
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <svg className={`w-4 h-4 ${isActive('/bookings') ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>My Bookings</span>
                  {isActive('/bookings') && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-600" />
                  )}
                </Link>

                {/* Admin Portal for server-authorized administrators */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      isActive('/admin')
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <svg className={`w-4 h-4 ${isActive('/admin') ? 'text-amber-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Admin</span>
                    {isActive('/admin') && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-amber-600" />
                    )}
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {/* Profile Avatar with First & Last Word Character Initials */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-emerald-300 transition-all shadow-xs group select-none"
                  >
                    {user?.profilePicture || user?.avatar ? (
                      <img
                        src={user.profilePicture || user.avatar}
                        alt={user.firstName || 'User'}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-400"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-xs ring-2 ring-emerald-200 tracking-wider">
                        {getUserInitials(user)}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight max-w-[95px] truncate">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Account'}
                      </span>
                      <span className={`text-[10px] font-bold leading-tight flex items-center gap-1 ${isAdmin ? 'text-purple-700' : 'text-emerald-700'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full inline-block ${isAdmin ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
                        profileMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/80 shadow-card-hover p-2 animate-scale-in select-none z-50">
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block p-3 bg-slate-50/80 hover:bg-emerald-50/80 rounded-xl mb-1.5 border border-slate-100 hover:border-emerald-200 transition-all group cursor-pointer"
                        title="View My Profile"
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-sm ring-2 ring-emerald-100 group-hover:ring-emerald-400 transition-all flex-shrink-0">
                              {getUserInitials(user)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                                <span>{user?.firstName} {user?.lastName}</span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                                  {isAdmin ? 'Admin' : 'User'}
                                </span>
                              </p>
                              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            &rarr;
                          </span>
                        </div>
                      </Link>

                      <div className="space-y-1 text-xs font-semibold text-slate-700">
                        <Link
                          to="/bookings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                        >
                          <span className="text-base">🎫</span>
                          <span>My Bookings &amp; Tickets</span>
                        </Link>
                        <Link
                          to="/pnr"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                        >
                          <span className="text-base">🔍</span>
                          <span>Check PNR Status</span>
                        </Link>
                        <Link
                          to="/services"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                        >
                          <span className="text-base">🍴</span>
                          <span>Food &amp; Lounge Services</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-800 transition-colors w-full text-left text-xs font-bold"
                        >
                          <span className="text-base">👤</span>
                          <span>My Profile</span>
                        </Link>

                        {/* Admin Link strictly for Administrator */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors w-full text-left text-xs font-bold"
                          >
                            <span className="text-base">🛡️</span>
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="h-px bg-slate-100 my-1.5" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl w-full text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Floating Mobile Drawer with Blurred Backdrop */}
      <ProfileModal
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onOpenInstall={() => setInstallModalOpen(true)}
      />

      {/* PWA Install / Convert Website to App Modal */}
      <PwaInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </nav>
  );
}
