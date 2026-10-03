import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function AdminHomeView({ onSwitchToPassenger }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const adminName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Arvind Meena';
  const adminEmail = user?.email || 'arvindmeena8171@gmail.com';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-6 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* 1. EXECUTIVE OPERATIONS HEADER (Light, Modern, Clean & High-Contrast)      */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 transition-all">
          {/* Subtle ambient gradient mesh for depth */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-20 h-48 w-48 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Authority & Greeting */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Central Railway Control Hub
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Administrator Authority
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Welcome back, <span className="text-emerald-700">{adminName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Operations Command &bull; Master Account:{' '}
                  <span className="font-mono text-slate-800 font-semibold">{adminEmail}</span>
                </p>
              </div>
            </div>

            {/* Right: Live Clock & Quick Navigation Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Digital Timepiece Card */}
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl px-4 py-2 text-right hidden sm:block shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Indian Standard Time</span>
                <span className="text-sm font-mono font-black text-slate-900">{time} IST</span>
              </div>

              {/* Switch to Passenger Experience */}
              {onSwitchToPassenger && (
                <button
                  onClick={onSwitchToPassenger}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs hover:border-slate-300 transition-all flex items-center gap-2"
                  title="Switch to Passenger Booking Home"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Passenger View</span>
                </button>
              )}

              {/* Primary Admin Action */}
              <Link
                to="/admin?tab=Trains"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Manage Railway Services &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DOCKER & MICROSERVICES ARCHITECTURE HEALTH STRIP                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">API GATEWAY</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-mono truncate">:4000 &bull; 12ms</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">POSTGRES &amp; REDIS</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-mono truncate">Cluster Synced</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">KAFKA EVENT BUS</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-mono truncate">3 Topics Active</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">SEARCH ENGINE</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-mono truncate">Elasticsearch Green</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CORE ADMINISTRATIVE KPI METRIC CARDS                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Active Express Trains */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Express Trains</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="3" width="16" height="15" rx="3" strokeWidth="2" />
                  <circle cx="8" cy="14" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="14" r="1.5" fill="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M4 11h16M7 18l-2 3M17 18l2 3" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">28 Trains</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-emerald-700 font-semibold">96.8% On-Time Performance</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-3">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '96.8%' }} />
            </div>
          </div>

          {/* KPI 2: Daily Passenger Load */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Daily Passenger Load</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">144,250</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                &uarr; 9.4%
              </span>
              <p className="text-xs text-slate-500 font-medium">Higher than last week</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-3">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>

          {/* KPI 3: Average Network Occupancy */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Network Seat Occupancy</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">92.4%</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <p className="text-xs text-amber-700 font-semibold truncate">High demand on Delhi &amp; Mumbai</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-3">
              <div className="bg-amber-500 h-1 rounded-full" style={{ width: '92.4%' }} />
            </div>
          </div>

          {/* KPI 4: Gross Turnover */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Today's Gross Turnover</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">₹2.48 Cr</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-slate-600 font-semibold">99.8% Gateway Success Rate</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-3">
              <div className="bg-emerald-600 h-1 rounded-full" style={{ width: '99.8%' }} />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. ONE-CLICK OPERATIONS HUB (Clean, Uniform & Professional SVGs)          */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Operations Management Directory
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Immediate access to train scheduling, station directory, traffic radar, and passenger manifest
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
              Full Administrative Controls
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* 1. Rail Services */}
            <button
              onClick={() => navigate('/admin?tab=Trains')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left group active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="3" width="16" height="15" rx="3" strokeWidth="2" />
                  <circle cx="8" cy="14" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="14" r="1.5" fill="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M4 11h16M7 18l-2 3M17 18l2 3" />
                </svg>
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">Rail Services</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Coaches &amp; timetables</span>
            </button>

            {/* 2. Live Traffic */}
            <button
              onClick={() => navigate('/admin?tab=Traffic')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left group active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">Live Traffic</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Corridor density radar</span>
            </button>

            {/* 3. Railway Stations */}
            <button
              onClick={() => navigate('/admin?tab=Stations')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left group active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-800 transition-colors">Stations</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Platforms &amp; junctions</span>
            </button>

            {/* 4. Train Routes */}
            <button
              onClick={() => navigate('/admin?tab=Routes')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left group active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition-colors">Train Routes</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Stops &amp; distances</span>
            </button>

            {/* 5. Search PNR Audit */}
            <button
              onClick={() => navigate('/admin?tab=Audit')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left group active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-purple-800 transition-colors">Passenger Audit</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Global PNR lookup</span>
            </button>

            {/* 6. System Status */}
            <button
              onClick={() => navigate('/admin?tab=System')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left group active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-rose-800 transition-colors">System Health</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">8 Microservices check</span>
            </button>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. LIVE CORRIDORS RADAR & TICKETING STREAM (Executive Split Grid)          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: High-Density Rail Corridors Telemetry */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>High-Density Corridors Live Telemetry</span>
                </h3>
                <p className="text-xs text-slate-500">Real-time seat occupancy and passenger surge monitoring</p>
              </div>
              <Link
                to="/admin?tab=Traffic"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                Full Traffic Radar &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { route: 'New Delhi (NDLS) ⇄ Mumbai Central (MMCT)', capacity: 98, status: 'Critical Rush', waitlist: 384, badge: 'bg-rose-50 text-rose-700 border-rose-200' },
                { route: 'New Delhi (NDLS) ⇄ Varanasi Jn (BSB)', capacity: 100, status: '100% Full', waitlist: 460, badge: 'bg-rose-50 text-rose-700 border-rose-200' },
                { route: 'Howrah Jn (HWH) ⇄ New Delhi (NDLS)', capacity: 94, status: 'Heavy Rush', waitlist: 215, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
                { route: 'Ahmedabad Jn (ADI) ⇄ Mumbai Central (MMCT)', capacity: 91, status: 'High Volume', waitlist: 140, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
              ].map((c) => (
                <div key={c.route} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{c.route}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
                      {c.status} ({c.capacity}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${c.capacity >= 95 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${c.capacity}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Waitlist Backlog: <strong className="text-slate-800">{c.waitlist} passengers</strong></span>
                    <span className="text-emerald-700 font-semibold">Priority Corridor Telemetry</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Ticketing Stream */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Live Ticketing Stream</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { pnr: '248-918-2301', text: 'Confirmed • 12301 Howrah Rajdhani', time: 'Just now', type: 'confirm' },
                { pnr: '652-301-9842', text: 'Confirmed • 22436 Vande Bharat', time: '2 mins ago', type: 'confirm' },
                { pnr: '810-459-2019', text: 'Waitlist Assigned • WL-14 (12952)', time: '5 mins ago', type: 'wl' },
                { pnr: '391-048-2910', text: 'Refund Processed • ₹680', time: '8 mins ago', type: 'refund' },
                { pnr: '492-817-2039', text: 'Confirmed • 12002 Bhopal Shatabdi', time: '12 mins ago', type: 'confirm' },
              ].map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                  <div className="mt-0.5">
                    {ev.type === 'confirm' ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                    ) : ev.type === 'wl' ? (
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">⏱</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">↩</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{ev.pnr}</span>
                      <span className="text-[10px] text-slate-400">{ev.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] font-medium leading-tight truncate">{ev.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/admin?tab=Audit"
              className="block text-center text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors pt-2"
            >
              Search Any PNR in Audit Ledger &rarr;
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
