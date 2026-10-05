import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StationAutocomplete from './StationAutocomplete';
import Button from '../ui/Button';
import { searchApi } from '../../api/search.api';
import { useSearchStore } from '../../store/search.store';
import { useToast } from '../ui/Toast';
import { formatTime } from '../../utils/format';

const QUOTA_OPTIONS = [
  { id: 'GN', label: 'General (GN)', icon: '🎫' },
  { id: 'TQ', label: 'Tatkal (TQ)', icon: '⚡' },
  { id: 'PT', label: 'Premium Tatkal', icon: '🚀' },
  { id: 'LD', label: 'Ladies (LD)', icon: '👩' },
  { id: 'SS', label: 'Senior Citizen', icon: '🧓' },
];

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function SearchForm({ compact }) {
  const { from, to, date, quota, setQuota, setSearchParams, setResults, setSearching, isSearching } = useSearchStore();
  const [searchMode, setSearchMode] = useState('route'); // 'route' | 'train'
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);
  const [travelDate, setTravelDate] = useState(date || getLocalDateString());
  const [selectedQuota, setSelectedQuota] = useState(quota || 'GN');
  const [swapRotated, setSwapRotated] = useState(false);
  const [autocompleteCloseSignal, setAutocompleteCloseSignal] = useState(0);

  // Train Name/Number Search State
  const [trainQuery, setTrainQuery] = useState('');
  const [trainResults, setTrainResults] = useState([]);
  const [isSearchingTrain, setIsSearchingTrain] = useState(false);
  const [hasSearchedTrain, setHasSearchedTrain] = useState(false);
  const [expandedTrainId, setExpandedTrainId] = useState(null);

  const navigate = useNavigate();
  const showToast = useToast();

  const handleSwap = () => {
    setSwapRotated(!swapRotated);
    const temp = fromValue;
    setFromValue(toValue);
    setToValue(temp);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const fromQuery = fromValue?.trim();
    const toQuery = toValue?.trim();

    if (!fromQuery) {
      showToast('Please enter or select a From station', 'warning');
      return;
    }
    if (!toQuery) {
      showToast('Please enter or select a To station', 'warning');
      return;
    }
    if (fromQuery.toLowerCase() === toQuery.toLowerCase()) {
      showToast('From and To stations cannot be the same', 'warning');
      return;
    }

    setAutocompleteCloseSignal((signal) => signal + 1);
    setSearchParams(fromQuery, toQuery, travelDate, selectedQuota);
    setQuota(selectedQuota);
    setSearching(true);

    try {
      const res = await searchApi.search(fromQuery, toQuery, travelDate);
      setResults(res.data || res);
      navigate('/search');
    } catch (err) {
      showToast(err.message || 'Search failed', 'error');
      setSearching(false);
    }
  };

  const handleTrainSearch = async (e) => {
    e.preventDefault();
    const q = trainQuery?.trim();
    if (!q) {
      showToast('Enter train name or number', 'warning');
      return;
    }
    setIsSearchingTrain(true);
    setHasSearchedTrain(true);
    try {
      const data = await searchApi.searchByTrain(q);
      setTrainResults(data || []);
      if (!data || data.length === 0) {
        showToast('No matching trains found for this query', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Train search failed', 'error');
      setTrainResults([]);
    } finally {
      setIsSearchingTrain(false);
    }
  };

  const handleSelectTrainForBooking = (t) => {
    if (t.origin?.name && t.destination?.name) {
      setFromValue(`${t.origin.name} (${t.origin.code})`);
      setToValue(`${t.destination.name} (${t.destination.code})`);
      setSearchMode('route');
      showToast(`Selected ${t.trainName} corridor. Ready to book!`, 'success');
    }
  };

  const today = getLocalDateString();
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  const tomorrow = getLocalDateString(tmrw);

  return (
    <div className="space-y-4 relative z-30">
      {/* Top Search Mode Selector: Route vs Train Explorer & Quota Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-150">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setSearchMode('route')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              searchMode === 'route'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🚆</span>
            <span>Station to Station</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('train')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              searchMode === 'train'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔍</span>
            <span>By Train Name / No.</span>
          </button>
        </div>

        {/* Quota Selector (Visible in Both Station-to-Station & By Train Search Modes!) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Quota:</span>
          {QUOTA_OPTIONS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setSelectedQuota(q.id);
                setQuota(q.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                selectedQuota === q.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{q.icon}</span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tatkal Quota Live Notice Banner (Shown in both modes whenever Tatkal is active) */}
      {(selectedQuota === 'TQ' || selectedQuota === 'PT') && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-300/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-950 font-semibold animate-scale-in">
          <div className="flex items-center gap-2">
            <span className="text-base">🚀</span>
            <span>
              <strong>Tatkal Quota Active:</strong> AC Tatkal opens at <strong>10:00 AM</strong> &middot; Non-AC Tatkal opens at <strong>11:00 AM</strong> daily.
            </span>
          </div>
          <span className="text-[10px] uppercase font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md hidden sm:inline-block">
            Tatkal Mode
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: STATION TO STATION ROUTE SEARCH                                    */}
      {/* ========================================================================= */}
      {searchMode === 'route' && (
        <form onSubmit={handleSearch} className="space-y-4 animate-fade-in">

          <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 lg:grid-cols-12' : 'md:grid-cols-12'} gap-3 items-end relative z-30`}>
            {/* From Station */}
            <div className={`${compact ? 'lg:col-span-3' : 'md:col-span-4'} relative z-30`}>
              <StationAutocomplete
                label="From Station"
                value={fromValue}
                onChange={(val) => setFromValue(val)}
                closeSignal={autocompleteCloseSignal}
                placeholder="Boarding station or code"
                icon="🟢"
              />
            </div>

            {/* Station Swap Button — hidden on mobile (swap appears below instead) */}
            <div className="hidden md:flex md:col-span-1 justify-center pb-1">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap Stations"
                title="Swap Origin and Destination"
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 shadow-sm flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-500 ${swapRotated ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* Mobile inline swap button between From/To fields */}
            <div className="flex md:hidden justify-center">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap Stations"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 shadow-sm text-xs font-bold transition-all active:scale-95"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-500 ${swapRotated ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Swap Stations</span>
              </button>
            </div>

            {/* To Station */}
            <div className={`${compact ? 'lg:col-span-3' : 'md:col-span-4'} relative z-20`}>
              <StationAutocomplete
                label="To Destination"
                value={toValue}
                onChange={(val) => setToValue(val)}
                closeSignal={autocompleteCloseSignal}
                placeholder="Destination station or code"
                icon="🔴"
              />
            </div>

            {/* Date of Journey */}
            <div className={`${compact ? 'lg:col-span-3' : 'md:col-span-3'} relative z-10`}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Travel Date
                </label>
                <div className="flex gap-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTravelDate(today)}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      travelDate === today ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelDate(tomorrow)}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      travelDate === tomorrow ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={today}
                  className="input-field font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className={`${compact ? 'lg:col-span-2' : 'md:col-span-12 lg:col-span-12'} relative z-10`}>
              <Button
                type="submit"
                loading={isSearching}
                className={`w-full ${!compact ? 'py-3.5 text-base shadow-lg shadow-emerald-500/25' : 'py-2.5 text-sm'}`}
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Trains
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TRAIN NAME / NUMBER SCHEDULE EXPLORER                             */}
      {/* ========================================================================= */}
      {searchMode === 'train' && (
        <div className="space-y-4 animate-fade-in">
          <form onSubmit={handleTrainSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={trainQuery}
                onChange={(e) => setTrainQuery(e.target.value)}
                placeholder="Enter Train Name (e.g. Rajdhani, Vande Bharat) or 5-digit Number (e.g. 12431)..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <Button
              type="submit"
              loading={isSearchingTrain}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold whitespace-nowrap"
            >
              Explore Schedule &amp; Route
            </Button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Popular Trains:</span>
            {['12431', 'Rajdhani', 'Vande Bharat', 'Shatabdi'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setTrainQuery(name);
                  searchApi.searchByTrain(name).then((data) => {
                    setTrainResults(data || []);
                    setHasSearchedTrain(true);
                  });
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-medium transition-colors"
              >
                {name}
              </button>
            ))}
          </div>

          {/* Train Search Results Display */}
          {hasSearchedTrain && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Found {trainResults.length} {trainResults.length === 1 ? 'Service' : 'Services'}
                </span>
                {trainResults.length > 0 && (
                  <span className="text-[11px] text-slate-500">
                    Click any card to inspect all stops &amp; timings
                  </span>
                )}
              </div>

              {trainResults.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-sm font-bold text-slate-700 mb-1">No train found matching "{trainQuery}"</p>
                  <p className="text-xs text-slate-500">Please verify the train name or 5-digit number and try again.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {trainResults.map((t) => {
                    const isExpanded = expandedTrainId === t.trainId;
                    return (
                      <div
                        key={t.trainId || t.trainNumber}
                        className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs hover:shadow-sm overflow-hidden"
                      >
                        {/* Compact Header */}
                        <div className="px-3.5 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-black text-xs text-white bg-slate-900 px-2 py-0.5 rounded shadow-xs shrink-0">
                              #{t.trainNumber}
                            </span>
                            <h4 className="font-serif font-black text-slate-900 text-xs sm:text-sm truncate">
                              {t.trainName}
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/70 shrink-0">
                              {t.runsOn || 'Daily Service'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectTrainForBooking(t)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
                          >
                            Book &rarr;
                          </button>
                        </div>

                        {/* Compact Journey Strip */}
                        <div className="px-3.5 py-2 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                          {/* Origin */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-bold text-slate-900 truncate">
                              {t.origin?.name} ({t.origin?.code})
                            </span>
                            <span className="font-mono text-[11px] font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                              🕒 {formatTime(t.origin?.departureTime)}
                            </span>
                          </div>

                          <span className="text-slate-400 font-bold">&rarr;</span>

                          {/* Destination */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-slate-900 truncate">
                              {t.destination?.name} ({t.destination?.code})
                            </span>
                            <span className="font-mono text-[11px] font-bold text-indigo-900 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-200 shrink-0">
                              🏁 {formatTime(t.destination?.arrivalTime)}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          </div>
                        </div>

                        {/* Compact Accordion toggle for stops */}
                        {t.route && t.route.length > 0 && (
                          <div className="px-3.5 py-1.5 bg-white border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setExpandedTrainId(isExpanded ? null : t.trainId)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                            >
                              <span>{isExpanded ? '▲ Hide Intermediate Stops' : `▼ View All ${t.route.length} Stops &amp; Timings`}</span>
                            </button>

                            {isExpanded && (
                              <div className="mt-2 pt-2 border-t border-slate-100 overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-slate-400 text-[10px] uppercase border-b border-slate-100 text-left">
                                      <th className="py-1">#</th>
                                      <th className="py-1">Station</th>
                                      <th className="py-1">Arr</th>
                                      <th className="py-1">Dep</th>
                                      <th className="py-1 text-right">Distance</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {t.route.map((st, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                        <td className="py-1 font-mono text-slate-400">{st.sequenceNumber}</td>
                                        <td className="py-1 font-semibold text-slate-800">
                                          {st.stationName} <span className="font-mono text-slate-500">({st.stationCode})</span>
                                        </td>
                                        <td className="py-1 font-mono text-slate-600">{formatTime(st.arrivalTime)}</td>
                                        <td className="py-1 font-mono text-slate-600">{formatTime(st.departureTime)}</td>
                                        <td className="py-1 font-mono text-slate-600 text-right">{st.distanceFromOrigin} km</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
