import { useState, useRef, useEffect, useMemo } from 'react';

export default function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  searchable = true,
  disabled = false,
  error = '',
  className = '',
  required = false,
  name,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((opt) => {
      const labelMatch = String(opt.label || '').toLowerCase().includes(q);
      const valMatch = String(opt.value || '').toLowerCase().includes(q);
      const subMatch = String(opt.subtitle || '').toLowerCase().includes(q);
      const badgeMatch = String(opt.badge || '').toLowerCase().includes(q);
      return labelMatch || valMatch || subMatch || badgeMatch;
    });
  }, [options, search]);

  const handleSelect = (opt) => {
    if (disabled || opt.disabled) return;
    if (onChange) {
      // Provide standard event-like object for backwards compatibility
      onChange({
        target: {
          name: name || '',
          value: opt.value,
        },
      });
    }
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-extrabold text-[11px]">* Required</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-left text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer select-none ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : error
            ? 'border-rose-400 ring-2 ring-rose-500/10'
            : isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate text-slate-900 font-bold">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                    selectedOption.badgeColor || 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}

      {/* Animated Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200/95 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 transform origin-top">
          {/* Embedded Search Input */}
          {searchable && options.length > 5 && (
            <div className="p-2.5 bg-slate-50 border-b border-slate-150">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-16 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium shadow-2xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-2 text-[10px] font-bold text-slate-400 hover:text-slate-700 my-auto h-5 px-1 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between pt-1.5 px-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Matching Options</span>
                <span>{filteredOptions.length} of {options.length}</span>
              </div>
            </div>
          )}

          {/* Options Scroll List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100/70 p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <span className="text-xl block mb-1">🔍</span>
                <p className="font-semibold text-slate-600">No matches found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try searching with another keyword</p>
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer group ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-50'
                        : isSelected
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50/60 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-400/40'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <span className={`block truncate ${isSelected ? 'font-black text-emerald-950' : 'font-medium group-hover:text-emerald-900'}`}>
                          {opt.label}
                        </span>
                        {opt.subtitle && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate mt-0.5">
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            opt.badgeColor || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
