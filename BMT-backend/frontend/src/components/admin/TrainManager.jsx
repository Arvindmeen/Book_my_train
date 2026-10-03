import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { SEAT_TYPES } from '../../utils/constants';

const seatTypeOptions = SEAT_TYPES.map((t) => ({ value: t, label: t.replace('_', ' ') }));

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TRAIN_TYPES = [
  { value: 'EXPRESS', label: 'Express / Superfast' },
  { value: 'VANDE_BHARAT', label: 'Vande Bharat Express' },
  { value: 'RAJDHANI', label: 'Rajdhani Express' },
  { value: 'SHATABDI', label: 'Shatabdi Express' },
  { value: 'TEJAS', label: 'Tejas Express' },
  { value: 'SPECIAL', label: 'Special Fare Service' },
];

export default function TrainManager() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'WITH_ROUTE' | 'DAILY' | 'SPECIAL'
  const [expandedTrainId, setExpandedTrainId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create Train Form State
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    trainNumber: '',
    trainName: '',
    coachName: 'AC',
    trainType: 'EXPRESS',
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
  });
  const [seatRows, setSeatRows] = useState([
    { seatNumber: 1, seatType: 'LOWER', price: '450' },
    { seatNumber: 2, seatType: 'MIDDLE', price: '450' },
    { seatNumber: 3, seatType: 'UPPER', price: '450' },
    { seatNumber: 4, seatType: 'SIDE_LOWER', price: '480' },
    { seatNumber: 5, seatType: 'SIDE_UPPER', price: '450' },
  ]);

  const showToast = useToast();

  const fetchTrains = async (query = '') => {
    setLoading(true);
    try {
      const res = await adminApi.getTrains(query);
      setTrains(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrains(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchTrains('');
  };

  const toggleDaySelection = (dayIdx) => {
    const current = [...(form.runningDays || [])];
    const exists = current.includes(dayIdx);
    const updated = exists ? current.filter((d) => d !== dayIdx) : [...current, dayIdx].sort((a, b) => a - b);
    
    // Auto-update runsOn text label
    let runsOnLabel = 'Custom Schedule';
    if (updated.length === 7) {
      runsOnLabel = 'Daily Service';
    } else if (updated.length === 0) {
      runsOnLabel = 'Suspended Service';
    } else {
      runsOnLabel = updated.map((d) => DAY_NAMES[d]).join(', ');
    }

    setForm({ ...form, runningDays: updated, runsOn: runsOnLabel });
  };

  const addSeatRow = () => {
    const nextNum = seatRows.length > 0 ? Math.max(...seatRows.map((r) => parseInt(r.seatNumber, 10) || 0)) + 1 : 1;
    setSeatRows([...seatRows, { seatNumber: nextNum, seatType: 'LOWER', price: '450' }]);
  };

  const addQuickSeats = (count = 10) => {
    const startNum = seatRows.length > 0 ? Math.max(...seatRows.map((r) => parseInt(r.seatNumber, 10) || 0)) + 1 : 1;
    const types = ['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'];
    const newRows = [];
    for (let i = 0; i < count; i++) {
      newRows.push({
        seatNumber: startNum + i,
        seatType: types[i % types.length],
        price: '450',
      });
    }
    setSeatRows([...seatRows, ...newRows]);
    showToast(`Added ${count} seats to roster`, 'success');
  };

  const removeSeatRow = (i) => setSeatRows(seatRows.filter((_, idx) => idx !== i));
  const updateSeatRow = (i, field, value) => {
    const updated = [...seatRows];
    updated[i] = { ...updated[i], [field]: value };
    setSeatRows(updated);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (seatRows.length === 0) {
      showToast('Please add at least one seat to the train', 'warning');
      return;
    }
    setCreating(true);
    try {
      const seats = seatRows.map((r) => ({
        seatNumber: parseInt(r.seatNumber, 10),
        seatType: r.seatType,
        price: parseFloat(r.price),
      }));
      await adminApi.createTrain({ ...form, seats });
      showToast(`Train ${form.trainNumber} - ${form.trainName} created!`, 'success');
      setForm({
        trainNumber: '',
        trainName: '',
        coachName: 'AC',
        trainType: 'EXPRESS',
        runsOn: 'Daily Service',
        runningDays: [0, 1, 2, 3, 4, 5, 6],
      });
      setSeatRows([
        { seatNumber: 1, seatType: 'LOWER', price: '450' },
        { seatNumber: 2, seatType: 'MIDDLE', price: '450' },
        { seatNumber: 3, seatType: 'UPPER', price: '450' },
      ]);
      setShowCreateForm(false);
      fetchTrains(searchQuery);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Filtered Trains based on quick chips
  const filteredTrains = useMemo(() => {
    if (filterType === 'WITH_ROUTE') {
      return trains.filter((t) => t.route?.routeStations?.length >= 2);
    }
    if (filterType === 'DAILY') {
      return trains.filter((t) => !t.runningDays || t.runningDays.length === 7 || t.runsOn?.toLowerCase().includes('daily'));
    }
    if (filterType === 'SPECIAL') {
      return trains.filter((t) => t.runningDays && t.runningDays.length < 7 && !t.runsOn?.toLowerCase().includes('daily'));
    }
    return trains;
  }, [trains, filterType]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Explorer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Network Fleet Intelligence
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {trains.length} Trains Registered
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Rail Services &amp; Route Inspector</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Search by train name or number to inspect where and when each train starts, where it goes, operational days, and full intermediate stop timelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              showCreateForm
                ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black'
            }`}
          >
            <span>{showCreateForm ? '✕ Close Form' : '+ Add New Train'}</span>
          </button>
        </div>

        {/* Search Bar Embedded in Hero */}
        <form onSubmit={handleSearchSubmit} className="mt-5 relative z-10 flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search train by Name (e.g. Rajdhani), Number (e.g. 12431), or Station (e.g. NDLS)..."
              className="w-full pl-11 pr-24 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-20 my-auto h-7 px-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute inset-y-1.5 right-1.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Filter Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700/60 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'ALL', label: `All Trains (${trains.length})` },
            { id: 'WITH_ROUTE', label: `With Route (${trains.filter((t) => t.route?.routeStations?.length >= 2).length})` },
            { id: 'DAILY', label: 'Daily Services' },
            { id: 'SPECIAL', label: 'Alternative Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterType === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Create Train Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-serif font-black text-lg text-slate-900">Add New Train Service</h3>
              <p className="text-xs text-slate-500">Configure train identity, operating schedule frequency, and seat inventory</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <Input
              label="Train Number (5 Digits)"
              placeholder="e.g. 12431"
              value={form.trainNumber}
              onChange={(e) => setForm({ ...form, trainNumber: e.target.value.trim() })}
              required
            />
            <Input
              label="Train Name"
              placeholder="e.g. Trivandrum Rajdhani"
              value={form.trainName}
              onChange={(e) => setForm({ ...form, trainName: e.target.value })}
              required
            />
            <Input
              label="Coach Name / Category"
              placeholder="e.g. AC 3 Tier / Executive"
              value={form.coachName}
              onChange={(e) => setForm({ ...form, coachName: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Train Type</label>
              <select
                value={form.trainType}
                onChange={(e) => setForm({ ...form, trainType: e.target.value })}
                className="input-field w-full text-xs font-semibold"
              >
                {TRAIN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Running Days Selector */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 mb-5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Operational Schedule &bull; Running Days</span>
                <span className="text-[11px] text-slate-500">Click to toggle the specific days this train operates</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {form.runsOn}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {DAY_NAMES.map((name, idx) => {
                const isSelected = form.runningDays?.includes(idx);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleDaySelection(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '○'}</span>
                    <span>{name}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setForm({ ...form, runningDays: [0, 1, 2, 3, 4, 5, 6], runsOn: 'Daily Service' })}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 underline"
              >
                Set All Days (Daily)
              </button>
            </div>
          </div>

          {/* Seats Builder */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Seat Inventory ({seatRows.length} Total Seats Configured)
                </h4>
                <p className="text-[11px] text-slate-500">Define seat numbers, berth types, and base fare</p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => addQuickSeats(10)} className="text-xs py-1 px-2.5">
                  + Add 10 Seats
                </Button>
                <Button type="button" variant="secondary" onClick={addSeatRow} className="text-xs py-1 px-2.5">
                  + Add 1 Seat
                </Button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
              {seatRows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <div className="w-16">
                    <Input
                      label={i === 0 ? 'Seat #' : undefined}
                      type="number"
                      value={row.seatNumber}
                      onChange={(e) => updateSeatRow(i, 'seatNumber', e.target.value)}
                      placeholder="#"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[130px]">
                    <Select
                      label={i === 0 ? 'Type' : undefined}
                      value={row.seatType}
                      onChange={(e) => updateSeatRow(i, 'seatType', e.target.value)}
                      options={seatTypeOptions}
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      label={i === 0 ? 'Price (₹)' : undefined}
                      type="number"
                      value={row.price}
                      onChange={(e) => updateSeatRow(i, 'price', e.target.value)}
                      placeholder="₹"
                      required
                    />
                  </div>
                  {seatRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSeatRow(i)}
                      className="text-rose-500 hover:text-rose-700 text-lg px-2 mt-auto pb-1"
                      title="Delete seat"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <Button type="submit" loading={creating} className="bg-emerald-600 hover:bg-emerald-700">
              Create Train Service
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Main Results / Train Cards Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-black text-slate-900 text-lg">Active Railway Services</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredTrains.length} {filteredTrains.length === 1 ? 'train' : 'trains'}
            </span>
          </div>

          {searchQuery && (
            <p className="text-xs text-slate-500">
              Showing matches for <span className="font-bold text-slate-800">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-card">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Scanning railway corridor telemetry...</p>
          </div>
        ) : filteredTrains.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 text-xl">
              🔍
            </div>
            <h4 className="font-bold text-slate-800 mb-1">No trains match your search criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Try searching by train number (e.g. 12431), train name (e.g. Rajdhani, Vande Bharat), or station code (e.g. NDLS).
            </p>
            <Button type="button" variant="secondary" onClick={handleClearSearch}>
              Reset Search Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTrains.map((train) => {
              const routeStations = train.route?.routeStations || [];
              const hasRoute = routeStations.length >= 2;
              const firstStop = hasRoute ? routeStations[0] : null;
              const lastStop = hasRoute ? routeStations[routeStations.length - 1] : null;
              const isExpanded = expandedTrainId === train.id;

              return (
                <div
                  key={train.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all shadow-xs hover:shadow-sm overflow-hidden"
                >
                  {/* Compact Header Row */}
                  <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <span className="font-mono font-black text-xs text-white bg-slate-900 px-2.5 py-1 rounded-lg shadow-xs shrink-0 tracking-wider">
                        #{train.trainNumber}
                      </span>
                      <h4 className="font-serif font-black text-sm sm:text-base text-slate-900 truncate">
                        {train.trainName}
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {train.coachName || 'AC'} Coach
                      </span>
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        {train.totalSeats || train.seats?.length || 0} Seats
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                        {train.runsOn || 'Daily Service'}
                      </span>
                    </div>

                    {/* Operational Days Mini Matrix */}
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80 shrink-0">
                      {DAY_LETTERS.map((letter, dayIdx) => {
                        const operates = !train.runningDays || train.runningDays.includes(dayIdx);
                        return (
                          <div
                            key={dayIdx}
                            title={`${DAY_NAMES[dayIdx]}: ${operates ? 'Runs' : 'Does not run'}`}
                            className={`w-5 h-5 rounded-md text-[9px] font-black flex items-center justify-center transition-all ${
                              operates
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200/80 text-slate-400'
                            }`}
                          >
                            {letter}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Compact Journey Corridor Strip (Height reduced significantly) */}
                  <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70 border-b border-slate-100">
                    {hasRoute ? (
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        {/* Origin (Starts here) */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            Starts
                          </span>
                          <span className="font-bold text-slate-900 truncate">
                            {firstStop.station?.name || 'Origin Station'}
                          </span>
                          <span className="font-mono text-slate-500 font-bold shrink-0">
                            ({firstStop.station?.code})
                          </span>
                          <span className="font-mono font-bold text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs shrink-0">
                            🕒 {firstStop.departureTime || 'Starts'}
                          </span>
                        </div>

                        {/* Mid Corridor Track Line */}
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 shrink-0 justify-center">
                          <span className="hidden lg:inline text-slate-400 font-mono">
                            {firstStop.station?.code} ➔ {lastStop.station?.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px]">
                            {routeStations.length} Stops &bull; {lastStop.distanceFromOrigin ? `${lastStop.distanceFromOrigin} km` : 'Direct'}
                          </span>
                          <span className="text-slate-400 font-bold">&rarr;</span>
                        </div>

                        {/* Destination (Where it goes) */}
                        <div className="flex items-center gap-2 min-w-0 justify-start md:justify-end">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 shrink-0">
                            Terminus
                          </span>
                          <span className="font-bold text-slate-900 truncate">
                            {lastStop.station?.name || 'Destination Station'}
                          </span>
                          <span className="font-mono text-slate-500 font-bold shrink-0">
                            ({lastStop.station?.code})
                          </span>
                          <span className="font-mono font-bold text-indigo-950 bg-white px-2 py-0.5 rounded border border-indigo-300 shadow-2xs shrink-0">
                            🏁 {lastStop.arrivalTime || 'Terminates'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-amber-800 font-semibold">⚠️ No station corridor attached yet.</span>
                        <span className="text-slate-500 text-[11px]">Use "Create Route" tab to attach stations.</span>
                      </div>
                    )}
                  </div>

                  {/* Compact Footer Strip: Accordion toggle for complete station timeline */}
                  <div className="px-4 py-2 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
                    {hasRoute ? (
                      <button
                        type="button"
                        onClick={() => setExpandedTrainId(isExpanded ? null : train.id)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 hover:underline"
                      >
                        <span>{isExpanded ? '▲ Hide Route Timeline' : `▼ View Complete Route Stops Timeline (${routeStations.length} Stations)`}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Route timeline unavailable</span>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono text-[11px]">Train ID: {train.id?.slice(0, 18)}...</span>
                    </div>
                  </div>

                  {/* Expanded Route Timeline */}
                  {isExpanded && hasRoute && (
                    <div className="p-5 bg-slate-50 border-t border-slate-200 animate-fade-in space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h5 className="font-serif font-black text-sm text-slate-900">
                          Route Sequence &bull; #{train.trainNumber} {train.trainName}
                        </h5>
                        <span className="text-xs text-slate-500 font-medium">
                          Total Distance: {lastStop.distanceFromOrigin || 0} km
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                              <th className="py-2 text-left w-12">Seq</th>
                              <th className="py-2 text-left">Station</th>
                              <th className="py-2 text-left">Station Code</th>
                              <th className="py-2 text-left">Arrival Time</th>
                              <th className="py-2 text-left">Departure Time</th>
                              <th className="py-2 text-right">Distance (km)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {routeStations.map((rs, idx) => {
                              const isOrigin = idx === 0;
                              const isTerminus = idx === routeStations.length - 1;
                              return (
                                <tr
                                  key={rs.id || idx}
                                  className={`hover:bg-slate-100/70 transition-colors ${
                                    isOrigin ? 'bg-emerald-50/40 font-bold' : isTerminus ? 'bg-indigo-50/40 font-bold' : ''
                                  }`}
                                >
                                  <td className="py-2.5 font-mono text-slate-400">
                                    {rs.sequenceNumber || idx + 1}
                                  </td>
                                  <td className="py-2.5 font-semibold text-slate-800">
                                    <div className="flex items-center gap-1.5">
                                      {isOrigin && <span className="text-emerald-600">🟢</span>}
                                      {isTerminus && <span className="text-indigo-600">🏁</span>}
                                      {!isOrigin && !isTerminus && <span className="text-slate-400">⚪</span>}
                                      <span>{rs.station?.name || 'Station'}</span>
                                      {isOrigin && <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-extrabold">ORIGIN</span>}
                                      {isTerminus && <span className="text-[10px] text-indigo-800 bg-indigo-100 px-1.5 py-0.2 rounded font-extrabold">TERMINUS</span>}
                                    </div>
                                  </td>
                                  <td className="py-2.5 font-mono font-bold text-slate-700">
                                    {rs.station?.code || '—'}
                                  </td>
                                  <td className="py-2.5 font-mono text-slate-700">
                                    {rs.arrivalTime || (isOrigin ? 'Starts Here' : '—')}
                                  </td>
                                  <td className="py-2.5 font-mono text-slate-700">
                                    {rs.departureTime || (isTerminus ? 'Terminates' : '—')}
                                  </td>
                                  <td className="py-2.5 font-mono text-right text-slate-600">
                                    {rs.distanceFromOrigin || 0} km
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
