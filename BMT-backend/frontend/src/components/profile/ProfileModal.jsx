import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ADMIN_MODULES = [
  {
    id: 'Traffic',
    label: 'Live Traffic',
    subtitle: 'Corridor density radar',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'Trains',
    label: 'Create Train',
    subtitle: 'Coaches & timetables',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="3" width="16" height="15" rx="3" strokeWidth="2" />
        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
        <circle cx="16" cy="14" r="1.5" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M4 11h16M7 18l-2 3M17 18l2 3" />
      </svg>
    ),
  },
  {
    id: 'Stations',
    label: 'Create Stations',
    subtitle: 'Platforms & junctions',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'Routes',
    label: 'Create Train Routes',
    subtitle: 'Stops & distances',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'Schedules',
    label: 'Create Train Schedule',
    subtitle: 'Departure & active runs',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'Audit',
    label: 'Passenger Audit',
    subtitle: 'Global PNR lookup',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'System',
    label: 'System Health',
    subtitle: '8 Microservices check',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  isAdmin,
  isAuthenticated,
  onLogout,
  onOpenInstall,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const modalCardRef = useRef(null);

  const isEffectiveAdmin = Boolean(isAdmin || user?.role === 'ADMIN' || user?.isAdmin === true);
  const isOnAdminPage = location.pathname === '/admin' || location.pathname.startsWith('/admin');

  // Mode: administrators get dedicated 'admin' console; regular users get 'passenger' navigation
  const [viewMode, setViewMode] = useState(isEffectiveAdmin || isOnAdminPage ? 'admin' : 'passenger');

  // Sync mode whenever modal opens or route changes
  useEffect(() => {
    if (isOpen) {
      setViewMode(isEffectiveAdmin || isOnAdminPage ? 'admin' : 'passenger');
    }
  }, [isOpen, isOnAdminPage, isEffectiveAdmin]);

  // Current active admin tab from query param
  const currentTab = new URLSearchParams(location.search).get('tab') || 'Traffic';

  // Close on outside click and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (modalCardRef.current && !modalCardRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
      document.addEventListener('keydown', handleKeyDown);
    }, 50);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user?.name || (isAuthenticated ? (user?.email ? user.email.split('@')[0] : 'Traveler') : 'Guest Traveler'));

  // Extract initials
  const getUserInitials = () => {
    const fullName = displayName;
    const words = fullName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    const single = words[0] || 'A';
    return single.length >= 2 ? single.slice(0, 2).toUpperCase() : single[0].toUpperCase();
  };

  const handleAdminModuleNavigate = (tabId) => {
    onClose();
    navigate(`/admin?tab=${tabId}`);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center cursor-pointer transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Sleek Floating Mobile Navigation Drawer in Green & White Theme */}
      <div
        ref={modalCardRef}
        className="relative w-full max-w-sm my-auto bg-white text-slate-900 border border-emerald-100 shadow-2xl shadow-emerald-950/25 rounded-3xl p-5 overflow-hidden animate-scale-in max-h-[90vh] flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Brand + Status Pill + Close Button */}
        <div className="flex-shrink-0 flex items-center justify-between pb-3.5 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 p-1 flex items-center justify-center shadow-sm">
              <img src="/navbar-logo.jpg" alt="Book My Train logo" className="w-full h-full rounded-lg object-contain" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                <span>Book My <span className="text-emerald-600">Train</span></span>
                {viewMode === 'admin' && (
                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    Admin
                  </span>
                )}
              </h3>
              <p className="text-[10px] font-semibold text-emerald-700 leading-tight flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {viewMode === 'admin' ? 'Central Operations Directory' : 'Smart Rail Navigation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all text-xs font-bold shadow-xs active:scale-90"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>



        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 overscroll-contain space-y-3.5 pt-3 scrollbar-thin scrollbar-thumb-emerald-200">

          {/* Profile Card */}
          <div
            onClick={() => {
              onClose();
              if (isAuthenticated) {
                navigate('/profile');
              } else {
                navigate('/login');
              }
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-xs active:scale-98 ${
              viewMode === 'admin'
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/60 border-emerald-300 hover:border-emerald-400'
                : 'bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100/50 border-slate-200 hover:border-emerald-300'
            }`}
            title="Open Full Profile Page"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  {user?.profilePicture || user?.avatar ? (
                    <img
                      src={user.profilePicture || user.avatar}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center font-bold text-xs text-white shadow-xs ring-2 ring-emerald-400">
                      {getUserInitials()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-serif font-bold text-sm text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                      {displayName}
                    </h4>
                    {isAuthenticated ? (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${isEffectiveAdmin ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                        {isEffectiveAdmin ? 'Admin' : 'User'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-full border border-slate-200">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-mono font-medium truncate">
                    {viewMode === 'admin' ? 'Master Authority • Online' : (isAuthenticated ? 'Open Profile & Account Page' : 'Guest Account • Tap to Sign In')}
                  </p>
                </div>
              </div>

              <span className="w-7 h-7 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all text-xs font-bold shadow-xs flex-shrink-0">
                &rarr;
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEW MODE A: ADMIN OPERATIONS DIRECTORY (7 MODULES)       */}
          {/* ========================================================= */}
          {viewMode === 'admin' ? (
            <div className="space-y-3">
              <div className="text-[10px] font-mono tracking-widest text-emerald-800 font-bold uppercase flex items-center justify-between pt-1">
                <span>OPERATIONS COMMAND</span>
                <span className="text-[9px] font-sans font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  7 Active Modules
                </span>
              </div>

              {/* The 7 Command Modules List */}
              <div className="space-y-1.5">
                {ADMIN_MODULES.map((mod) => {
                  const isActive = isOnAdminPage && currentTab === mod.id;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleAdminModuleNavigate(mod.id)}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-2xl border transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-400/40'
                          : 'bg-slate-50/80 hover:bg-emerald-50/60 border-slate-200/80 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                            isActive
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xs'
                              : `${mod.iconBg} ${mod.iconColor} group-hover:scale-105`
                          }`}
                        >
                          {mod.icon}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`font-serif text-xs font-bold block leading-tight truncate ${
                              isActive ? 'text-emerald-950 font-black' : 'text-slate-900 group-hover:text-emerald-800'
                            }`}
                          >
                            {mod.label}
                          </span>
                          <span
                            className={`text-[10px] block truncate ${
                              isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                            }`}
                          >
                            {mod.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-white border border-slate-200 group-hover:border-emerald-300 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 transition-all text-xs font-bold">
                            &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Admin Actions */}
              <div className="pt-2 border-t border-slate-150 space-y-1.5">


                <div
                  onClick={() => { onClose(); navigate('/profile'); }}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">⚙️</span>
                    <span>Admin Profile &amp; Security Settings</span>
                  </div>
                  <span className="text-slate-400">&rarr;</span>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* VIEW MODE B: PASSENGER NAVIGATION SERVICES                */
            /* ========================================================= */
            <div className="space-y-3">
              <div className="text-[10px] font-mono tracking-widest text-emerald-800 font-bold uppercase flex items-center justify-between pt-1">
                <span>ALL NAVBAR SERVICES</span>
                <span className="text-[9px] font-sans font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Quick Access
                </span>
              </div>

              {/* Passenger Services List */}
              <div className="space-y-1">
                {/* 1. Home */}
                <div
                  onClick={() => { onClose(); navigate('/'); }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🏠</span>
                    <div>
                      <span className="font-serif text-sm font-semibold text-slate-800 group-hover:text-emerald-800 block leading-tight">
                        Home
                      </span>
                      <span className="text-[10px] text-slate-500">Return to main rail portal</span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all text-xs font-bold">
                    &rarr;
                  </span>
                </div>

                {/* 2. Search Trains */}
                <div
                  onClick={() => { onClose(); navigate('/search'); }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🔍</span>
                    <div>
                      <span className="font-serif text-sm font-semibold text-slate-800 group-hover:text-emerald-800 block leading-tight">
                        Search Trains
                      </span>
                      <span className="text-[10px] text-slate-500">Live availability across 10,000+ routes</span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all text-xs font-bold">
                    &rarr;
                  </span>
                </div>

                {/* 3. Check PNR */}
                <div
                  onClick={() => { onClose(); navigate('/pnr'); }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📋</span>
                    <div>
                      <span className="font-serif text-sm font-semibold text-slate-800 group-hover:text-emerald-800 block leading-tight">
                        Check PNR Status
                      </span>
                      <span className="text-[10px] text-slate-500">AI confirmation predictions &amp; coach info</span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all text-xs font-bold">
                    &rarr;
                  </span>
                </div>

                {/* 4. Travel Services */}
                <div
                  onClick={() => { onClose(); navigate('/services'); }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🍴</span>
                    <div>
                      <span className="font-serif text-sm font-semibold text-slate-800 group-hover:text-emerald-800 block leading-tight">
                        Travel Services
                      </span>
                      <span className="text-[10px] text-slate-500">Food on Track, Hotels &amp; Platform Cabs</span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all text-xs font-bold">
                    &rarr;
                  </span>
                </div>

                {/* 5. My Bookings */}
                <div
                  onClick={() => { onClose(); navigate('/bookings'); }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🎫</span>
                    <div>
                      <span className="font-serif text-sm font-semibold text-slate-800 group-hover:text-emerald-800 block leading-tight">
                        My Bookings
                      </span>
                      <span className="text-[10px] text-slate-500">Tickets, invoices &amp; cancellation logs</span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all text-xs font-bold">
                    &rarr;
                  </span>
                </div>

                {/* 6. Download Web App */}
                <div
                  onClick={() => { onClose(); onOpenInstall && onOpenInstall(); }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📲</span>
                    <div>
                      <span className="font-serif text-sm font-semibold text-slate-800 group-hover:text-emerald-800 block leading-tight">
                        Download Web App
                      </span>
                      <span className="text-[10px] text-slate-500">Run standalone on Mobile or PC</span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all text-xs font-bold">
                    &rarr;
                  </span>
                </div>

                {/* 7. Admin Control Center Button for server-authorized administrators */}
                {isEffectiveAdmin && (
                  <div
                    onClick={() => { onClose(); navigate('/admin'); }}
                    className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 hover:border-amber-300 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🛡️</span>
                      <div>
                        <span className="font-serif text-sm font-bold text-amber-950 block leading-tight">
                          Admin Control Center
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">Manage trains, routes, stations &amp; schedules</span>
                      </div>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 transition-all text-xs font-bold">
                      &rarr;
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Authentication Action Row */}
          {!isAuthenticated ? (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-center font-bold text-xs transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login?tab=register"
                onClick={onClose}
                className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-center font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full py-2.5 text-center text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200/60 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{viewMode === 'admin' ? 'Sign Out of Admin Console' : 'Sign Out Account'}</span>
            </button>
          )}

          {/* Bottom Row: Social Icons & Location */}
          <div className="pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Arvindmeen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 text-emerald-800 flex items-center justify-center transition-colors"
                title="GitHub: Arvindmeen"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a
                href="https://www.linkedin.com/in/arvind-meena-78a258288"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 text-emerald-800 flex items-center justify-center transition-colors"
                title="LinkedIn: Arvind Meena"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/rinku_meena014/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 text-emerald-800 flex items-center justify-center transition-all"
                title="Instagram: rinku_meena014"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>

            <span className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              IIT Kharagpur
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
