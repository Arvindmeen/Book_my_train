import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../../store/search.store';

export default function Footer() {
  const navigate = useNavigate();
  const setSearchParams = useSearchStore((s) => s.setSearchParams);

  // Interactive Route Tabs: 'vande-bharat' | 'rajdhani' | 'shatabdi' | 'corridors'
  const [activeRouteTab, setActiveRouteTab] = useState('vande-bharat');

  // Interactive FAQ Accordion State (Null by default so NO question is auto-opened!)
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Policy / Guidance Modal State: 'tatkal' | 'refund' | 'rac' | 'quotas' | 'terms' | 'privacy' | null
  const [policyModal, setPolicyModal] = useState(null);

  // Popular Corridor Data with direct search execution
  const POPULAR_ROUTES = {
    'vande-bharat': [
      { num: '22436', name: 'Vande Bharat Express', from: 'New Delhi (NDLS)', to: 'Varanasi Jn (BSB)', time: '8h 00m', dep: '06:00', arr: '14:00', days: 'Mon, Tue, Wed, Fri, Sat, Sun' },
      { num: '22457', name: 'Vande Bharat Express', from: 'Anand Vihar (ANVT)', to: 'Dehradun (DDN)', time: '4h 45m', dep: '17:50', arr: '22:35', days: 'Except Wed' },
      { num: '22223', name: 'Vande Bharat Express', from: 'CSMT Mumbai (CSMT)', to: 'Sainagar Shirdi (SNSI)', time: '5h 20m', dep: '06:20', arr: '11:40', days: 'Except Tue' },
      { num: '20661', name: 'Vande Bharat Express', from: 'KSR Bengaluru (SBC)', to: 'Dharwad (DWR)', time: '6h 25m', dep: '05:45', arr: '12:10', days: 'Except Tue' },
      { num: '22895', name: 'Vande Bharat Express', from: 'Howrah Jn (HWH)', to: 'Puri (PURI)', time: '6h 20m', dep: '06:10', arr: '12:30', days: 'Except Thu' },
      { num: '20901', name: 'Vande Bharat Express', from: 'Mumbai Central (MMCT)', to: 'Gandhinagar Cap (GNC)', time: '6h 15m', dep: '06:00', arr: '12:15', days: 'Except Sun' },
    ],
    'rajdhani': [
      { num: '12952', name: 'Mumbai Rajdhani Exp', from: 'New Delhi (NDLS)', to: 'Mumbai Central (MMCT)', time: '15h 32m', dep: '16:55', arr: '08:35', days: 'Daily Service' },
      { num: '12302', name: 'Howrah Rajdhani Exp', from: 'New Delhi (NDLS)', to: 'Howrah Jn (HWH)', time: '17h 05m', dep: '16:50', arr: '09:55', days: 'Except Sun' },
      { num: '22692', name: 'Bengaluru Rajdhani', from: 'Hazrat Nizamuddin (NZM)', to: 'KSR Bengaluru (SBC)', time: '33h 45m', dep: '20:45', arr: '06:30', days: 'Daily Service' },
      { num: '12432', name: 'Trivandrum Rajdhani', from: 'Hazrat Nizamuddin (NZM)', to: 'Thiruvananthapuram (TVC)', time: '41h 45m', dep: '06:16', arr: '00:05', days: 'Tue, Wed, Sun' },
      { num: '12424', name: 'Dibrugarh Rajdhani', from: 'New Delhi (NDLS)', to: 'Dibrugarh (DBRG)', time: '37h 25m', dep: '16:20', arr: '05:45', days: 'Daily Service' },
      { num: '22414', name: 'Madgaon Rajdhani Exp', from: 'Hazrat Nizamuddin (NZM)', to: 'Madgaon (MAO)', time: '26h 15m', dep: '06:16', arr: '08:30', days: 'Fri, Sat' },
    ],
    'shatabdi': [
      { num: '12002', name: 'Bhopal Shatabdi Exp', from: 'New Delhi (NDLS)', to: 'Bhopal Rani Kamlapati (RKMP)', time: '8h 25m', dep: '06:00', arr: '14:25', days: 'Daily Service' },
      { num: '12004', name: 'Lucknow Swarna Shatabdi', from: 'New Delhi (NDLS)', to: 'Lucknow Charbagh (LKO)', time: '6h 40m', dep: '06:10', arr: '12:50', days: 'Daily Service' },
      { num: '12005', name: 'Kalka Shatabdi Exp', from: 'New Delhi (NDLS)', to: 'Kalka (KLK)', time: '4h 05m', dep: '17:15', arr: '21:20', days: 'Daily Service' },
      { num: '12007', name: 'Mysuru Shatabdi Exp', from: 'Chennai Central (MAS)', to: 'Mysuru Jn (MYS)', time: '7h 00m', dep: '06:00', arr: '13:00', days: 'Except Wed' },
      { num: '12019', name: 'Howrah Ranchi Shatabdi', from: 'Howrah Jn (HWH)', to: 'Ranchi (RNC)', time: '7h 05m', dep: '06:05', arr: '13:10', days: 'Except Sun' },
      { num: '12009', name: 'Ahmedabad Shatabdi', from: 'Mumbai Central (MMCT)', to: 'Ahmedabad Jn (ADI)', time: '6h 20m', dep: '06:20', arr: '12:45', days: 'Except Sun' },
    ],
    'corridors': [
      { num: '12418', name: 'Prayagraj Express', from: 'New Delhi (NDLS)', to: 'Prayagraj Jn (PRYJ)', time: '8h 50m', dep: '22:10', arr: '07:00', days: 'Daily Superfast' },
      { num: '12802', name: 'Purushottam Express', from: 'New Delhi (NDLS)', to: 'Puri (PURI)', time: '31h 00m', dep: '22:40', arr: '05:40', days: 'Daily Superfast' },
      { num: '12394', name: 'Sampoorna Kranti Exp', from: 'New Delhi (NDLS)', to: 'Patna Jn (PNBE)', time: '12h 15m', dep: '17:30', arr: '05:45', days: 'Daily Superfast' },
      { num: '12622', name: 'Tamil Nadu Express', from: 'New Delhi (NDLS)', to: 'Chennai Central (MAS)', time: '32h 45m', dep: '21:05', arr: '06:15', days: 'Daily Superfast' },
      { num: '12138', name: 'Punjab Mail', from: 'Firozpur Cantt (FZR)', to: 'Mumbai CSMT (CSMT)', time: '34h 00m', dep: '21:45', arr: '07:45', days: 'Historic Daily' },
      { num: '12904', name: 'Golden Temple Mail', from: 'Amritsar Jn (ASR)', to: 'Mumbai Central (MMCT)', time: '31h 50m', dep: '18:55', arr: '02:45', days: 'Daily Classic' },
    ],
  };

  // Indian Railway Passenger Handbook & FAQs
  const RAILWAY_FAQS = [
    {
      q: 'What do CNF, RAC, WL, GNWL, and TQWL mean on my Indian Railway ticket?',
      a: 'CNF signifies a Confirmed Berth with coach and berth number allocated. RAC (Reservation Against Cancellation) guarantees travel rights with shared lower berth accommodation; if confirmed cancellations occur prior to chart preparation, RAC upgrades to full CNF. WL (Waiting List) represents an unconfirmed ticket. GNWL (General Waiting List) holds the highest confirmation probability, issued when passenger boards from origin station. TQWL (Tatkal Waiting List) is directly issued for Tatkal quotas and moves up only after Tatkal cancellations.'
    },
    {
      q: 'When do Tatkal and Premium Tatkal reservation windows open daily?',
      a: 'Tatkal reservation booking opens exactly one calendar day prior to the train\'s scheduled departure from its originating station. For AC classes (Executive Class, 1A, 2A, 3A, 3E, AC Chair Car), booking opens sharp at 10:00 AM IST. For Non-AC classes (Sleeper Class, Second Sitting), booking opens sharp at 11:00 AM IST. Premium Tatkal operates on dynamic pricing based on realtime demand and cannot be cancelled for refunds.'
    },
    {
      q: 'What are the official Indian Railway ticket cancellation & refund rules?',
      a: 'For confirmed tickets cancelled >48 hours before train departure, fixed cancellation charges apply per passenger: 1A/EC (₹240 + GST), 2A/1A (₹200 + GST), 3A/3E/CC (₹180 + GST), Sleeper (₹120), and 2S (₹60). Between 48 and 12 hours before departure, 25% of fare is deducted. Between 12 and 4 hours before departure (or chart preparation), 50% is deducted. After chart preparation, no refund is granted on confirmed tickets without filing a TDR.'
    },
    {
      q: 'Can a passenger board a train if their e-ticket remains waitlisted after chart preparation?',
      a: 'No. Fully waitlisted e-tickets (where all passengers on the PNR are in WL status) are automatically cancelled by the central reservation system upon final chart preparation, and 100% fare (minus minimal clerkage) is auto-refunded to the passenger\'s original bank account. Passengers holding a dropped waitlisted e-ticket are treated as ticketless if found on board. However, if even one passenger on a joint e-ticket holds CNF or RAC status, the entire ticket remains valid and waitlisted co-passengers may travel in RAC berths.'
    },
    {
      q: 'How does Book My Train achieve zero-mock real-time GPS live train tracking?',
      a: 'Book My Train pairs directly with the central timetable database transponder, evaluating exact scheduled arrival and departure timestamps against the real-time Indian Standard Time (IST) clock. The system computes true elapsed minutes from origin departure, detecting whether the train is currently running at express cruising speeds (110–130 km/h), halted at intermediate station platforms, yet to begin its journey today, or has concluded its run at destination.'
    },
    {
      q: 'How does Food on Track (E-Catering) meal delivery at platform halts work?',
      a: 'Through integrated e-catering, passengers enter their 10-digit PNR to access menus from FSSAI-approved top restaurant chains along their journey route. Meals are prepared fresh and hand-delivered directly to the passenger\'s coach and berth number when the train arrives at the designated intermediate station halt. Cash on delivery and UPI prepayments are fully supported.'
    }
  ];

  // Major Indian Railway Junctions & Codes
  const MAJOR_JUNCTIONS = [
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'HWH', name: 'Howrah Jn' },
    { code: 'MMCT', name: 'Mumbai Central' },
    { code: 'MAS', name: 'Chennai Central' },
    { code: 'SBC', name: 'KSR Bengaluru' },
    { code: 'BSB', name: 'Varanasi Jn' },
    { code: 'CNB', name: 'Kanpur Central' },
    { code: 'PNBE', name: 'Patna Jn' },
    { code: 'ADI', name: 'Ahmedabad Jn' },
    { code: 'HYB', name: 'Hyderabad Deccan' },
    { code: 'PUNE', name: 'Pune Jn' },
    { code: 'JAT', name: 'Jammu Tawi' },
    { code: 'GKP', name: 'Gorakhpur Jn' },
    { code: 'BPL', name: 'Bhopal Jn' },
    { code: 'CDG', name: 'Chandigarh' },
    { code: 'GHY', name: 'Guwahati Jn' },
    { code: 'LKO', name: 'Lucknow Charbagh' },
    { code: 'PRYJ', name: 'Prayagraj Jn' },
    { code: 'NGP', name: 'Nagpur Jn' },
    { code: 'SC', name: 'Secunderabad' },
  ];

  const handleQuickRouteSearch = (from, to) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setSearchParams(from, to, tomorrow, 'GN');
    navigate('/search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStationClick = (station) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setSearchParams(`${station.name} (${station.code})`, 'New Delhi (NDLS)', tomorrow, 'GN');
    navigate('/search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto bg-gradient-to-b from-slate-50 via-white to-slate-100/90 text-slate-700 text-sm relative overflow-hidden border-t border-slate-200/90">
      
      {/* Subtle ambient light glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-64 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-64 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ══════════════════════════════════════════════════════════════════════════════════
          1. POPULAR INDIAN RAILWAY CORRIDORS & EXPRESS ROUTES (Light Mode & Interactive)
          ══════════════════════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-slate-200/90 py-10 relative z-10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="font-display font-black text-xl text-slate-900 tracking-tight">
                  Popular Indian Railway Routes &amp; Superfast Corridors
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Explore real timetable corridors &bull; Click any route to immediately check seat availability &amp; fares.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold self-start md:self-auto shadow-2xs">
              {[
                { id: 'vande-bharat', label: '🚄 Vande Bharat Express' },
                { id: 'rajdhani', label: '👑 Rajdhani & Tejas' },
                { id: 'shatabdi', label: '⚡ Shatabdi & Duronto' },
                { id: 'corridors', label: '🚉 High-Density Lines' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveRouteTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all text-xs cursor-pointer ${
                    activeRouteTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold scale-102'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Route Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {POPULAR_ROUTES[activeRouteTab].map((route, i) => (
              <div
                key={i}
                onClick={() => handleQuickRouteSearch(route.from, route.to)}
                className="bg-white hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-400 p-4 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono text-[11px] font-black bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                      #{route.num}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      ⏱️ {route.time}
                    </span>
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-sm mt-2 group-hover:text-emerald-700 transition-colors">
                    {route.name}
                  </h5>
                  <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                    <span>{route.from.split(' (')[0]}</span>
                    <span className="text-emerald-600 font-extrabold">&rarr;</span>
                    <span>{route.to.split(' (')[0]}</span>
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Dep: <strong className="text-slate-800">{route.dep}</strong> &bull; Arr: <strong className="text-slate-800">{route.arr}</strong></span>
                  <span className="text-emerald-700 font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Book &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════
          2. PASSENGER HANDBOOK & FAQS (Light Mode, All closed by default, click to open!)
          ══════════════════════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-slate-200/90 py-12 relative z-10 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 inline-block mb-2 shadow-2xs">
              INDIAN RAILWAY RULES &amp; GUIDELINES
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Essential Passenger Travel Handbook &amp; FAQs
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Clear answers to Tatkal timings, RAC entitlements, waitlist drop rules, and cancellation charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-5xl mx-auto">
            {RAILWAY_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl transition-all duration-300 ${
                    isOpen
                      ? 'bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 border-2 border-emerald-500 shadow-md shadow-emerald-950/5 ring-4 ring-emerald-100/60'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 font-bold text-xs sm:text-sm text-slate-800 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isOpen
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{faq.q}</span>
                    </span>
                    <span className={`text-base font-black text-emerald-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-emerald-100 mt-1 animate-fade-in font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════
          3. MAJOR JUNCTION CODES DIRECTORY (Light Mode)
          ══════════════════════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-slate-200/90 py-8 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🚉</span>
                <span>Major Indian Railway Junctions &amp; Station Codes</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Quick station lookup &bull; Tap any station code to set as origin station for ticket search.
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shadow-2xs">
              Covering 10,000+ Stations Nationwide
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {MAJOR_JUNCTIONS.map((stn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleStationClick(stn)}
                className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 group shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                title={`Search trains from ${stn.name} (${stn.code})`}
              >
                <span className="font-mono font-extrabold text-slate-900 group-hover:text-emerald-700">{stn.code}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-700">&middot; {stn.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════
          4. MAIN FOOTER MULTI-COLUMN HUB (Light Mode, All Functional Links)
          ══════════════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand, Identity & Mission (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3 group">
              <img
                src="/navbar-logo.jpg"
                alt="Book My Train logo"
                className="w-12 h-12 rounded-2xl border-2 border-emerald-500 bg-white object-cover shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-display font-black text-2xl text-slate-900 tracking-tight">
                  Book My <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Train</span>
                </span>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Indian Rail NextGen Travel Hub
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal max-w-sm">
              India's premier next-generation railway ticketing portal engineered for confirmed seat reservations, instant automated refunds, AI-based PNR forecasting, and authentic live running status.
            </p>

            {/* Platform Trust Highlights */}
            <div className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>IRCTC-Compliant Booking Engine Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Connected to All 16 Indian Railway Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Automated UPI &amp; Bank Reversal Sagas</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-[10px] text-emerald-800 px-3 py-1.5 rounded-xl font-bold border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>256-Bit TLS Bank Grade</span>
              </span>

              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-[10px] text-slate-800 px-3 py-1.5 rounded-xl font-bold border border-slate-200 shadow-2xs">
                <span>🛡️ PCI-DSS Level 1</span>
              </span>
            </div>
          </div>

          {/* Column 2: Travel Services & Utilities (Span 2.5) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-3 border-emerald-600 pl-2.5">
              Travel Services
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
              <li>
                <Link to="/search" className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Book Train Tickets</span>
                </Link>
              </li>
              <li>
                <Link to="/pnr" className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Check Live PNR Status</span>
                </Link>
              </li>
              <li>
                <Link to="/?tab=live" className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Live Train GPS Tracker</span>
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded shadow-2xs">LIVE</span>
                </Link>
              </li>
              <li>
                <Link to="/?tab=food" className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Food on Track (E-Catering)</span>
                </Link>
              </li>
              <li>
                <Link to="/?tab=hotels" className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Hotels &amp; Station Lounges</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://ride-tracker-ruddy.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                >
                  <span className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Platform Cabs via Ride Tracker ↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Rules & Policy Hub (Span 2.5) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-3 border-emerald-600 pl-2.5">
              Policies &amp; Rules
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('tatkal')}
                  className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Tatkal Booking Windows</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('refund')}
                  className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Cancellation &amp; Refund Scale</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('rac')}
                  className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>RAC &amp; Charting Rules</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('quotas')}
                  className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Quota Guide (GN, LD, SS, HP)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('terms')}
                  className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('privacy')}
                  className="hover:text-emerald-700 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Privacy &amp; Data Security</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Creator Showcase (Arvind Meena, IIT Kharagpur) (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-3 border-emerald-600 pl-2.5">
              Engineering &amp; Founder Desk
            </h4>

            {/* Founder Card (Light Mode & Premium) */}
            <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 p-4 rounded-2xl border border-emerald-200/90 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md group">
              <a
                href="https://arvindmeena.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 text-slate-900"
                title="Visit Arvind Meena's Portfolio"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/arvind-meena.jpg"
                    alt="Arvind Meena"
                    className="w-12 h-12 rounded-xl border-2 border-emerald-600 object-cover shadow-sm group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Founder &amp; Architect
                    </span>
                    <h5 className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors mt-0.5">
                      Arvind Meena
                    </h5>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      IIT Kharagpur &bull; Computer Science
                    </p>
                  </div>
                </div>

                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform shrink-0">
                  ↗
                </span>
              </a>
            </div>

            {/* Contact Details */}
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href="tel:+917217332482" className="hover:text-emerald-700 font-bold transition-colors">
                  +91 7217332482
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:arvindmeena8171@gmail.com" className="hover:text-emerald-700 font-bold transition-colors truncate">
                  arvindmeena8171@gmail.com
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700">
                  Indian Institute of Technology (IIT) Kharagpur, West Bengal, India
                </span>
              </li>
            </ul>

            {/* Social Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://arvindmeena.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-2xs"
                title="Portfolio"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>

              <a
                href="https://github.com/Arvindmeen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-2xs"
                title="GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/arvind-meena-78a258288"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white text-slate-700 hover:bg-[#0A66C2] hover:text-white border border-slate-200 hover:border-[#0A66C2] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-2xs"
                title="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/rinku_meena014/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white text-slate-700 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-2xs"
                title="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            5. OFFICIAL RAILWAY EMERGENCY HELPLINES STRIP (Light Mode & Clickable tel:)
            ══════════════════════════════════════════════════════════════════════════════════ */}
        <div className="mt-10 pt-8 border-t border-slate-200/90">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
            <span>🚨 24x7 Government &amp; Railway Emergency Toll-Free Helplines:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            
            <a href="tel:139" className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">139</span>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Rail Madad</p>
                <p className="text-[10px] text-slate-500">Unified Helpline</p>
              </div>
            </a>

            <a href="tel:182" className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 font-black text-sm flex items-center justify-center shrink-0 border border-rose-200 group-hover:bg-rose-600 group-hover:text-white transition-colors">182</span>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">RPF Security</p>
                <p className="text-[10px] text-slate-500">On-Train Help</p>
              </div>
            </a>

            <a href="tel:138" className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">138</span>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Medical Alert</p>
                <p className="text-[10px] text-slate-500">Coach Care</p>
              </div>
            </a>

            <a href="tel:1090" className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-black text-sm flex items-center justify-center shrink-0 border border-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-colors">1090</span>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Women Safety</p>
                <p className="text-[10px] text-slate-500">24x7 Helpline</p>
              </div>
            </a>

            <a href="tel:1930" className="bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 font-black text-sm flex items-center justify-center shrink-0 border border-amber-200 group-hover:bg-amber-600 group-hover:text-white transition-colors">1930</span>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Cyber Fraud</p>
                <p className="text-[10px] text-slate-500">National Helpline</p>
              </div>
            </a>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            6. PAYMENT & COMPLIANCE PARTNER PILLS (Light Mode)
            ══════════════════════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 pt-6 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mr-1">Verified Payment Rails:</span>
            {['UPI (GPay / PhonePe / Paytm)', 'RuPay', 'Visa', 'Mastercard', 'NetBanking 50+ Banks', 'Razorpay Verified'].map((pmt, i) => (
              <span key={i} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                {pmt}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Real-time API Gateway Cluster Online</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            7. FOOTER BOTTOM LINE & COPYRIGHT (Light Mode)
            ══════════════════════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 pt-6 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-slate-900">Book My Train</strong>. All rights reserved. Designed and engineered with passion by{' '}
            <a
              href="https://arvindmeena.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-extrabold hover:underline"
            >
              Arvind Meena
            </a>{' '}
            (IIT Kharagpur).
          </p>

          <div className="flex items-center gap-3 text-slate-400 text-[11px] font-semibold">
            <span>Fast</span>
            <span>&bull;</span>
            <span>Secure</span>
            <span>&bull;</span>
            <span>Zero Fake Placeholders</span>
            <span>&bull;</span>
            <span>Passenger-First Architecture</span>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════
          8. INTERACTIVE POLICY & RULES GUIDANCE MODAL (Triggered by Policy Links)
          ══════════════════════════════════════════════════════════════════════════════════ */}
      {policyModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-up"
          onClick={() => setPolicyModal(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-in relative text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-lg font-bold">
                  {policyModal === 'tatkal' ? '⏰' : policyModal === 'refund' ? '₹' : policyModal === 'rac' ? '💺' : policyModal === 'quotas' ? '🎟️' : '📜'}
                </span>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {policyModal === 'tatkal' && 'Official Tatkal Booking Guidelines'}
                    {policyModal === 'refund' && 'Railway Cancellation & Refund Scale'}
                    {policyModal === 'rac' && 'RAC & Charting Rules'}
                    {policyModal === 'quotas' && 'Indian Railway Reservation Quotas'}
                    {policyModal === 'terms' && 'Terms of Service'}
                    {policyModal === 'privacy' && 'Privacy & Data Protection'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Ministry of Railways &amp; IRCTC Standards</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {policyModal === 'tatkal' && (
                <>
                  <p><strong>1. Booking Windows:</strong> AC classes (1A, 2A, 3A, 3E, CC) open sharp at <strong>10:00 AM IST</strong> daily. Non-AC / Sleeper classes open at <strong>11:00 AM IST</strong> daily, exactly one day prior to train origin departure.</p>
                  <p><strong>2. Passenger Limit:</strong> Maximum 4 passengers can be booked per PNR under Tatkal quota.</p>
                  <p><strong>3. Cancellation Rules:</strong> Confirmed Tatkal tickets are non-refundable unless the train is delayed by more than 3 hours or cancelled by railways.</p>
                </>
              )}

              {policyModal === 'refund' && (
                <>
                  <p><strong>1. &gt;48 Hours Before Departure:</strong> Flat clerkage fee: 1A/EC ₹240, 2A ₹200, 3A/CC ₹180, Sleeper ₹120, 2S ₹60 per passenger.</p>
                  <p><strong>2. 48 to 12 Hours:</strong> 25% of ticket fare is deducted subject to minimum flat clerkage.</p>
                  <p><strong>3. 12 to 4 Hours:</strong> 50% of ticket fare is deducted.</p>
                  <p><strong>4. Auto-Refunds:</strong> Cancelled tickets via Book My Train trigger automated refund reverse sagas straight to your source UPI or bank account.</p>
                </>
              )}

              {policyModal === 'rac' && (
                <>
                  <p><strong>1. RAC Entitlement:</strong> Reservation Against Cancellation grants assured travel rights on train with a shared lower berth accommodation.</p>
                  <p><strong>2. Upgrades:</strong> As confirmed passengers cancel, RAC passengers are upgraded to full CNF berths automatically in priority sequence.</p>
                  <p><strong>3. Dropped Waitlist:</strong> Fully waitlisted e-tickets drop automatically upon final chart preparation (4 hours before departure) with 100% automated refund.</p>
                </>
              )}

              {policyModal === 'quotas' && (
                <>
                  <p><strong>&bull; GN (General Quota):</strong> Standard booking quota accessible to all passengers.</p>
                  <p><strong>&bull; TQ (Tatkal Quota):</strong> Last-minute emergency travel quota opening 1 day prior.</p>
                  <p><strong>&bull; LD (Ladies Quota):</strong> Dedicated 6 berths reserved in sleeper coaches for solo female passengers or women traveling with children under 12.</p>
                  <p><strong>&bull; SS (Senior Citizen Quota):</strong> Lower berth priority quota for male seniors (60+) and female seniors (45+) traveling alone.</p>
                </>
              )}

              {policyModal === 'terms' && (
                <>
                  <p>Book My Train provides authorized railway mobility and reservation tools compliant with Indian Railways and CRIS guidelines. Tickets booked through the platform are governed by standard railway passenger rules, tariff tables, and refund schedules.</p>
                </>
              )}

              {policyModal === 'privacy' && (
                <>
                  <p>Your privacy and transactional integrity are our top priority. Passenger data is protected with 256-bit bank-grade TLS encryption and tokenized payment architectures. We do not store sensitive UPI PINs or card CVVs.</p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setPolicyModal(null);
                  navigate('/search');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer text-center"
              >
                Search Trains &rarr;
              </button>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
