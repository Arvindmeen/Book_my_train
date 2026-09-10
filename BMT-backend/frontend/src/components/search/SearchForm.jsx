import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StationAutocomplete from './StationAutocomplete';
import Button from '../ui/Button';
import { searchApi } from '../../api/search.api';
import { useSearchStore } from '../../store/search.store';
import { useToast } from '../ui/Toast';

const QUOTA_OPTIONS = [
  { id: 'GN', label: 'General (GN)', icon: '🎫' },
  { id: 'TQ', label: 'Tatkal (TQ)', icon: '⚡' },
  { id: 'PT', label: 'Premium Tatkal', icon: '🚀' },
  { id: 'LD', label: 'Ladies (LD)', icon: '👩' },
  { id: 'SS', label: 'Senior Citizen', icon: '🧓' },
];

export default function SearchForm({ compact }) {
  const { from, to, date, quota, setQuota, setSearchParams, setResults, setSearching, isSearching } = useSearchStore();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);
  const [travelDate, setTravelDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [selectedQuota, setSelectedQuota] = useState(quota || 'GN');
  const [swapRotated, setSwapRotated] = useState(false);
  const [autocompleteCloseSignal, setAutocompleteCloseSignal] = useState(0);
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

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Quota Selector Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Travel Quota:
        </span>
        {QUOTA_OPTIONS.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setSelectedQuota(q.id);
              setQuota(q.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              selectedQuota === q.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{q.icon}</span>
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Tatkal Quota Live Notice Banner */}
      {(selectedQuota === 'TQ' || selectedQuota === 'PT') && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-300/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-950 font-semibold animate-scale-in">
          <div className="flex items-center gap-2">
            <span className="text-base">🚀</span>
            <span>
              <strong>Fast Tatkal Engine Armed:</strong> AC Tatkal opens at <strong>10:00 AM</strong> &middot; Non-AC Tatkal opens at <strong>11:00 AM</strong>.
            </span>
          </div>
          <span className="text-[10px] uppercase font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md hidden sm:inline-block">
            Sub-50ms Rush Mode
          </span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 lg:grid-cols-12' : 'md:grid-cols-12'} gap-3 items-end`}>
        {/* From Station */}
        <div className={compact ? 'lg:col-span-3' : 'md:col-span-4'}>
          <StationAutocomplete
            label="From Station"
            value={fromValue}
            onChange={(val) => setFromValue(val)}
            closeSignal={autocompleteCloseSignal}
            placeholder="Boarding station or code"
            icon="🟢"
          />
        </div>

        {/* Station Swap Button */}
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

        {/* To Station */}
        <div className={compact ? 'lg:col-span-3' : 'md:col-span-4'}>
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
        <div className={compact ? 'lg:col-span-3' : 'md:col-span-3'}>
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
        <div className={compact ? 'lg:col-span-2' : 'md:col-span-12 lg:col-span-12'}>
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
  );
}
