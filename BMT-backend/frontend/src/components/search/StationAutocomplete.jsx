import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchApi } from '../../api/search.api';

/**
 * Modern Groww-style station autocomplete input with map pin and code badges.
 */
export default function StationAutocomplete({ label, value, onChange, placeholder, icon, closeSignal }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(!!value);
  const debouncedQuery = useDebounce(query, 250);
  const wrapperRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (selectedFromDropdown || debouncedQuery.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    searchApi.autocomplete(debouncedQuery).then((res) => {
      if (!cancelled && requestId === requestIdRef.current) {
        setSuggestions(res.data || []);
        setOpen(true);
      }
    }).catch(() => {
      if (!cancelled && requestId === requestIdRef.current) setSuggestions([]);
    }).finally(() => {
      if (!cancelled && requestId === requestIdRef.current) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [debouncedQuery, selectedFromDropdown]);

  useEffect(() => {
    requestIdRef.current += 1;
    setOpen(false);
    setSuggestions([]);
  }, [closeSignal]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
      setSelectedFromDropdown(!!value);
    }
  }, [value]);

  const handleSelect = (station) => {
    setQuery(`${station.name} (${station.code})`);
    setSelectedFromDropdown(true);
    onChange(station.code);
    setOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedFromDropdown(false);
    if (val.length < 2) {
      onChange('');
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      if (!selectedFromDropdown && query.trim().length >= 2) {
        onChange(query.trim());
      }
    }, 150);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-400 pointer-events-none text-sm">
          {icon || (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="input-field pl-10 pr-9 font-medium text-slate-800 focus:bg-white"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3">
            <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-card-hover max-h-60 overflow-y-auto p-1.5 animate-scale-in">
          {suggestions.map((s) => (
            <li
              key={s.stationId || s.code}
              onMouseDown={() => handleSelect(s)}
              className="px-3.5 py-2.5 hover:bg-emerald-50/70 rounded-xl cursor-pointer text-sm flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-400 group-hover:text-emerald-600 transition-colors">🚉</span>
                <span className="font-semibold text-slate-800 truncate group-hover:text-slate-900">{s.name}</span>
              </div>
              <span className="text-emerald-800 bg-emerald-100 font-bold text-xs px-2 py-0.5 rounded-md ml-2 flex-shrink-0">
                {s.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
