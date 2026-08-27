import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StationAutocomplete from './StationAutocomplete';
import Button from '../ui/Button';
import { searchApi } from '../../api/search.api';
import { useSearchStore } from '../../store/search.store';
import { useToast } from '../ui/Toast';

export default function SearchForm({ compact }) {
  const { from, to, date, setSearchParams, setResults, setSearching, isSearching } = useSearchStore();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);
  const [travelDate, setTravelDate] = useState(date);
  const navigate = useNavigate();
  const showToast = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();

    // Accept any non-empty text — backend does fuzzy station name resolution
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

    setSearchParams(fromQuery, toQuery, travelDate);
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

  return (
    <form onSubmit={handleSearch} className={compact ? 'space-y-3' : ''}>
      <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}>
        <StationAutocomplete
          label="From"
          value={fromValue}
          onChange={(val) => setFromValue(val)}
          placeholder="City, station or code"
        />
        <StationAutocomplete
          label="To"
          value={toValue}
          onChange={(val) => setToValue(val)}
          placeholder="City, station or code"
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            min={today}
            className="input-field"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" loading={isSearching} className="w-full">
            Search Trains
          </Button>
        </div>
      </div>
    </form>
  );
}
