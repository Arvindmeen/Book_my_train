import { useState } from 'react';
import SearchForm from '../components/search/SearchForm';
import TrainList from '../components/search/TrainList';
import { useSearchStore } from '../store/search.store';
import { searchApi } from '../api/search.api';

const POPULAR_ROUTES = [
  { from: 'New Delhi (NDLS)', to: 'Varanasi (BSB)', icon: '⚡', label: 'Vande Bharat Special', time: '8h 00m' },
  { from: 'Mumbai Central (MMCT)', to: 'Ahmedabad (ADI)', icon: '🚄', label: 'Western Superfast', time: '5h 25m' },
  { from: 'New Delhi (NDLS)', to: 'Howrah Jn (HWH)', icon: '👑', label: 'Rajdhani Express', time: '17h 05m' },
  { from: 'KSR Bengaluru (SBC)', to: 'Chennai Central (MAS)', icon: '⭐', label: 'Shatabdi Express', time: '4h 50m' },
  { from: 'New Delhi (NDLS)', to: 'Bhopal Jn (BPL)', icon: '⚡', label: 'Vande Bharat Express', time: '7h 45m' },
  { from: 'Jaipur Jn (JP)', to: 'Delhi Cantt (DEC)', icon: '🚄', label: 'Double Decker Exp', time: '4h 30m' }
];

export default function SearchPage() {
  const { results, isSearching, setSearchParams, setResults, setSearching } = useSearchStore();
  const [filterType, setFilterType] = useState('ALL');

  const error = results?.error || null;
  const trains = results?.trains || [];
  const filteredTrains = filterType === 'ALL'
    ? trains
    : trains.filter((t) => {
        if (filterType === 'VANDE') return t.trainName?.toLowerCase().includes('vande');
        if (filterType === 'RAJDHANI') return t.trainName?.toLowerCase().includes('rajdhani');
        if (filterType === 'SHATABDI') return t.trainName?.toLowerCase().includes('shatabdi');
        return true;
      });

  const handleQuickRoute = async (route) => {
    const today = new Date().toISOString().split('T')[0];
    setSearchParams(route.from, route.to, today, 'GN');
    setSearching(true);
    try {
      const res = await searchApi.search(route.from, route.to, today);
      setResults(res.data || res);
    } catch {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Title & Search Bar Card */}
        <div className="card p-5 md:p-6 bg-white border border-slate-150 shadow-card rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Search & Filter Trains
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Check real-time train schedules, seat quotas & AI waitlist predictions across India
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Live Railway Network
              </span>
            </div>
          </div>
          <SearchForm compact />
        </div>

        {/* Results Body */}
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-slate-150 shadow-xs">
            <div className="animate-spin h-10 w-10 border-3 border-slate-200 border-t-emerald-600 rounded-full" />
            <p className="text-xs font-bold text-slate-600 animate-pulse">
              Querying live railway schedules & inventory...
            </p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center bg-white border border-rose-150 rounded-2xl shadow-xs">
            <span className="text-3xl mb-2 inline-block">⚠️</span>
            <p className="text-sm font-bold text-rose-600">{error}</p>
            <p className="text-xs text-slate-500 mt-1">Please try modifying your search query or station names.</p>
          </div>
        ) : filteredTrains.length > 0 ? (
          <div className="space-y-4">
            {/* Search Results Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Found <span className="text-emerald-700 font-extrabold">{filteredTrains.length}</span> trains
                  {results.from?.resolved && ` from ${results.from.resolved}`}
                  {results.to?.resolved && ` to ${results.to.resolved}`}
                  {results.date && results.date !== 'any' && ` on ${results.date}`}
                </p>
                <p className="text-[11px] text-slate-500">
                  Select your desired class and view live seat availability or AI waitlist forecast.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterType === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({trains.length})
                </button>
                <button
                  onClick={() => setFilterType('VANDE')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterType === 'VANDE'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  ⚡ Vande Bharat
                </button>
                <button
                  onClick={() => setFilterType('RAJDHANI')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterType === 'RAJDHANI'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  👑 Rajdhani
                </button>
                <button
                  onClick={() => setFilterType('SHATABDI')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterType === 'SHATABDI'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  ⭐ Shatabdi
                </button>
              </div>
            </div>

            {/* Trains List */}
            <TrainList trains={filteredTrains} />
          </div>
        ) : (
          /* Empty / Default Initial State with 1-Click Popular Routes */
          <div className="space-y-6">
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-150 p-8 shadow-card">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-sm">
                🚄
              </div>
              <h3 className="text-xl font-black text-slate-900">Explore Trains Across India</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                Choose your boarding station, destination, and journey date above, or tap any popular express corridor below to load live schedules instantly.
              </p>

              {/* Popular Corridor Quick Links */}
              <div className="mt-8 text-left max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Popular Express Corridors (1-Click Search):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {POPULAR_ROUTES.map((route, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickRoute(route)}
                      className="group p-3.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all duration-200 hover:shadow-sm flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{route.icon}</span>
                          <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700">
                            {route.label}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-700">
                          {route.from.split(' (')[0]} &rarr; {route.to.split(' (')[0]}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block">{route.time}</span>
                        <span className="text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition-transform inline-block">
                          &rarr;
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">AI Waitlist Prediction</h4>
                  <p className="text-[11px] text-slate-500">Historical trend probability score</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Fast Tatkal Engine</h4>
                  <p className="text-[11px] text-slate-500">Auto-fill passenger master data</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl">
                  🛡️
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">100% Instant Refund</h4>
                  <p className="text-[11px] text-slate-500">Direct rollback to original UPI ID</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
