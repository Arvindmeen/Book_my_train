import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchApi } from '../../api/search.api';

/**
 * Station autocomplete input.
 * onChange(value) is called:
 *   - with station.code when user clicks a suggestion
 *   - with the raw typed text on blur (so user can also just type and search)
 */
export default function StationAutocomplete({ label, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Track whether the user explicitly selected from dropdown
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(!!value);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchApi.autocomplete(debouncedQuery).then((res) => {
      if (!cancelled) {
        setSuggestions(res.data || []);
        setOpen(true);
      }
    }).catch(() => {
      if (!cancelled) setSuggestions([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external value changes (e.g. swap button)
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

  // On blur: if user typed something but didn't select from dropdown, use typed text
  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      if (!selectedFromDropdown && query.trim().length >= 2) {
        // Pass the raw typed query — backend resolveStation handles fuzzy matching
        onChange(query.trim());
      }
    }, 150); // small delay so click on suggestion fires first
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="input-field"
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-[38px]">
          <div className="animate-spin h-4 w-4 border-b-2 border-primary-900 rounded-full" />
        </div>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.stationId || s.code}
              onMouseDown={() => handleSelect(s)}  // mousedown fires before blur
              className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm flex justify-between"
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">{s.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
