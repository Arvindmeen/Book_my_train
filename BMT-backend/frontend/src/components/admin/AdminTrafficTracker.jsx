import { useState, useEffect } from 'react';

const CORRIDORS = [
  {
    id: 'corridor-1',
    route: 'New Delhi (NDLS) ⇄ Mumbai Central (MMCT)',
    zone: 'Northern / Western',
    distance: '1,384 km',
    capacity: 98,
    passengersToday: 34250,
    activeTrains: ['12952 Rajdhani Exp', '12954 Aug Kranti', '12009 Shatabdi Exp'],
    avgSpeed: '130 km/h',
    status: 'Critical Rush',
    waitlistCount: 384,
    recommendation: 'Deploy +2 AC-3 Tier auxiliary coaches to absorb waitlist backlog.',
    trend: '+8.4% vs last week'
  },
  {
    id: 'corridor-2',
    route: 'New Delhi (NDLS) ⇄ Varanasi Jn (BSB)',
    zone: 'Northern Railway',
    distance: '759 km',
    capacity: 100,
    passengersToday: 21400,
    activeTrains: ['22436 Vande Bharat Exp', '12560 Shiv Ganga Exp'],
    avgSpeed: '140 km/h',
    status: 'Sold Out',
    waitlistCount: 460,
    recommendation: 'High festive & pilgrim demand. Announce Special Tatkal train.',
    trend: '+14.2% vs last week'
  },
  {
    id: 'corridor-3',
    route: 'Howrah Jn (HWH) ⇄ New Delhi (NDLS)',
    zone: 'Eastern / Northern',
    distance: '1,450 km',
    capacity: 94,
    passengersToday: 29800,
    activeTrains: ['12301 Howrah Rajdhani', '12305 Kolkata Rajdhani'],
    avgSpeed: '125 km/h',
    status: 'Heavy Rush',
    waitlistCount: 215,
    recommendation: 'Track telemetry optimal. Green corridor assigned via Prayagraj.',
    trend: '+5.1% vs last week'
  },
  {
    id: 'corridor-4',
    route: 'Ahmedabad Jn (ADI) ⇄ Mumbai Central (MMCT)',
    zone: 'Western Railway',
    distance: '493 km',
    capacity: 91,
    passengersToday: 23600,
    activeTrains: ['20902 Vande Bharat', '12010 Shatabdi Exp', '12932 Double Decker'],
    avgSpeed: '130 km/h',
    status: 'High Volume',
    waitlistCount: 140,
    recommendation: 'Business traveler peak between 06:00 - 08:30. Seat turnover healthy.',
    trend: '+3.7% vs last week'
  },
  {
    id: 'corridor-5',
    route: 'KSR Bengaluru (SBC) ⇄ MGR Chennai Central (MAS)',
    zone: 'Southern / South Western',
    distance: '359 km',
    capacity: 82,
    passengersToday: 16900,
    activeTrains: ['20608 Vande Bharat Exp', '12028 Shatabdi Exp', '12610 Intercity'],
    avgSpeed: '115 km/h',
    status: 'Normal Traffic',
    waitlistCount: 45,
    recommendation: 'All booked passengers confirmed. Berth availability healthy.',
    trend: '-1.2% vs last week'
  },
  {
    id: 'corridor-6',
    route: 'New Delhi (NDLS) ⇄ Jammu Tawi (JAT)',
    zone: 'Northern Railway',
    distance: '577 km',
    capacity: 88,
    passengersToday: 18300,
    activeTrains: ['22439 Vande Bharat Exp', '12425 Rajdhani Exp'],
    avgSpeed: '120 km/h',
    status: 'Moderate Rush',
    waitlistCount: 92,
    recommendation: 'Pilgrim traffic to Katra stable. Weather alert cleared.',
    trend: '+6.5% vs last week'
  }
];

const STATION_FOOTFALL = [
  { rank: 1, name: 'Howrah Junction (HWH)', city: 'Kolkata', dailyPassengers: '540,000+', platforms: 23, load: 96 },
  { rank: 2, name: 'New Delhi (NDLS)', city: 'Delhi NCR', dailyPassengers: '495,000+', platforms: 16, load: 94 },
  { rank: 3, name: 'CSMT Mumbai (CSMT)', city: 'Mumbai', dailyPassengers: '430,000+', platforms: 18, load: 89 },
  { rank: 4, name: 'Chennai Central (MAS)', city: 'Chennai', dailyPassengers: '360,000+', platforms: 12, load: 82 },
  { rank: 5, name: 'Kanpur Central (CNB)', city: 'Kanpur', dailyPassengers: '310,000+', platforms: 10, load: 88 }
];

export default function AdminTrafficTracker() {
  const [filterZone, setFilterZone] = useState('ALL');
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());
  const [pulse, setPulse] = useState(false);

  const handleRefresh = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 800);
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  const filteredCorridors = filterZone === 'ALL'
    ? CORRIDORS
    : CORRIDORS.filter(c => c.zone.toLowerCase().includes(filterZone.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Live Status Bar (Clean White & Emerald Styling) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                Live Railway Network Traffic &amp; Passenger Density Tracker
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Real-time express corridor load, seat allocation telemetry &amp; passenger surge analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Telemetry Synced</span>
            <span className="text-xs font-mono font-bold text-emerald-700">{lastRefreshed} IST</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={pulse}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${pulse ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Network Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Tracked Commuters</span>
            <span className="text-emerald-600 text-xs font-bold">Today</span>
          </div>
          <div className="text-2xl font-black text-slate-900">144,250</div>
          <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-block">
            &uarr; 9.4% higher than seasonal average
          </span>
        </div>

        <div className="card p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Overall Network Load</span>
            <span className="text-amber-600 text-xs font-bold">Live</span>
          </div>
          <div className="text-2xl font-black text-slate-900">92.4%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '92.4%' }} />
          </div>
        </div>

        <div className="card p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Waitlist Backlog</span>
            <span className="text-rose-600 text-xs font-bold">Action Needed</span>
          </div>
          <div className="text-2xl font-black text-rose-600">1,336 pax</div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 inline-block">
            Across top 6 busy corridors
          </span>
        </div>

        <div className="card p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">On-Time Punctuality Rate</span>
            <span className="text-emerald-600 text-xs font-bold">GPS Radar</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">96.8%</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">
            Average delay &lt; 8.2 mins
          </span>
        </div>
      </div>

      {/* Filter Tabs for Corridors */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['ALL', 'Northern', 'Western', 'Eastern', 'Southern'].map(zone => (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterZone === zone
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {zone === 'ALL' ? 'All Corridors' : `${zone} Zone`}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredCorridors.length} High-Density Express Corridors
        </span>
      </div>

      {/* Corridor Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCorridors.map((c) => {
          const isCritical = c.capacity >= 95;
          const isHigh = c.capacity >= 90 && c.capacity < 95;

          return (
            <div
              key={c.id}
              className={`card p-5 bg-white border rounded-2xl transition-all hover:shadow-md ${
                isCritical
                  ? 'border-rose-200 ring-1 ring-rose-100'
                  : isHigh
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {c.zone} &bull; {c.distance}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5 leading-snug">
                    {c.route}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : isHigh
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {c.status} ({c.capacity}%)
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Seat Occupancy</span>
                  <span className="text-slate-900 font-bold">{c.passengersToday.toLocaleString()} passengers</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${c.capacity}%` }}
                  />
                </div>
              </div>

              {/* Active Trains Tag Cloud */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Active Rail Services:</span>
                <div className="flex flex-wrap gap-1.5">
                  {c.activeTrains.map(t => (
                    <span key={t} className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80">
                      🚆 {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-800">
                  <span>💡</span> Recommendation for Dispatchers:
                </div>
                <p className="text-slate-600 pl-4">{c.recommendation}</p>
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1">
                  <span>Waitlist: <strong className="text-rose-600">{c.waitlistCount} pax</strong></span>
                  <span className="text-emerald-700">{c.trend}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Major Railway Terminals Footfall Table */}
      <div className="card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              🚉 Highest Traffic Terminal Footfall &amp; Platform Occupancy
            </h3>
            <p className="text-xs text-slate-500">Live passenger density across major interchange hubs</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            All Platforms Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">City / Division</th>
                <th className="py-2.5 px-3">Daily Passenger Surge</th>
                <th className="py-2.5 px-3">Platforms</th>
                <th className="py-2.5 px-3">Congestion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {STATION_FOOTFALL.map((s) => (
                <tr key={s.rank} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-400">{s.rank}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-3 text-slate-600">{s.city}</td>
                  <td className="py-3 px-3 font-bold text-emerald-800">{s.dailyPassengers}</td>
                  <td className="py-3 px-3 font-mono">{s.platforms} Platforms</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.load >= 90
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {s.load}% Peak Load
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
