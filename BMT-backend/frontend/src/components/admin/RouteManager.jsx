import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CustomSelect from '../ui/CustomSelect';

export default function RouteManager() {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState('');
  const [creating, setCreating] = useState(false);
  const [stops, setStops] = useState([{ stationId: '', sequenceNumber: 1, arrivalTime: '', departureTime: '', distanceFromOrigin: 0 }]);
  const showToast = useToast();

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      adminApi.getTrains(),
      adminApi.getBookings('ALL', 1, 500),
    ]).then(([trainsRes, bookingsRes]) => {
      let list = [];
      if (trainsRes.status === 'fulfilled') {
        const val = trainsRes.value;
        list = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
      }
      let bList = [];
      if (bookingsRes.status === 'fulfilled') {
        const bVal = bookingsRes.value;
        const bRaw = bVal?.data !== undefined ? bVal.data : bVal;
        bList = Array.isArray(bRaw?.bookings) ? bRaw.bookings : Array.isArray(bRaw) ? bRaw : [];
        setBookings(bList);
      }
      list.sort((t1, t2) => {
        const bCount1 = bList.filter((b) => b && (b.trainNumber === t1.trainNumber || b.trainId === t1.id)).length;
        const bCount2 = bList.filter((b) => b && (b.trainNumber === t2.trainNumber || b.trainId === t2.id)).length;
        if (bCount1 > 0 && bCount2 === 0) return -1;
        if (bCount1 === 0 && bCount2 > 0) return 1;
        if (bCount1 > 0 && bCount2 > 0) return bCount2 - bCount1;
        return String(t1.trainNumber).localeCompare(String(t2.trainNumber));
      });
      setTrains(list);
    }).catch((err) => {
      showToast(err.message || 'Failed to fetch trains', 'error');
    });

    adminApi.getStations(1, 300).then((res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setStations(list);
    }).catch((err) => {
      showToast(err.message || 'Failed to fetch stations', 'error');
    });
  }, []);

  const trainOptions = useMemo(() => {
    return trains.map((t) => {
      const bCount = bookings.filter((b) => b && (b.trainNumber === t.trainNumber || b.trainId === t.id)).length;
      return {
        value: t.id,
        label: `#${t.trainNumber} — ${t.trainName}`,
        subtitle: t.coachName ? `${t.coachName} Coach • ${t.runsOn || 'Daily Service'}` : t.runsOn,
        badge: bCount > 0 ? `🔥 ${bCount} Bookings` : (t.route ? '✓ Route Configured' : '⚪ Unused Fleet'),
        badgeColor: bCount > 0
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          : t.route
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200',
      };
    });
  }, [trains, bookings]);

  const stationOptions = useMemo(() => {
    return stations.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.code})`,
      subtitle: s.city ? `${s.city}${s.state ? ', ' + s.state : ''}` : undefined,
      badge: s.code,
      badgeColor: 'bg-indigo-50 text-indigo-700 font-mono font-black',
    }));
  }, [stations]);

  const addStop = () => {
    setStops([...stops, { stationId: '', sequenceNumber: stops.length + 1, arrivalTime: '', departureTime: '', distanceFromOrigin: 0 }]);
  };

  const removeStop = (i) => setStops(stops.filter((_, idx) => idx !== i));

  const updateStop = (i, field, value) => {
    const updated = [...stops];
    updated[i] = { ...updated[i], [field]: value };
    setStops(updated);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedTrain) { showToast('Select a train', 'warning'); return; }
    setCreating(true);
    try {
      const stationsPayload = stops.map((s) => ({
        stationId: s.stationId,
        sequenceNumber: parseInt(s.sequenceNumber, 10),
        arrivalTime: s.arrivalTime || null,
        departureTime: s.departureTime || null,
        distanceFromOrigin: parseInt(s.distanceFromOrigin, 10) || 0,
      }));
      await adminApi.createRoute({ trainId: selectedTrain, stations: stationsPayload });
      showToast('Route created successfully! 30-day schedules auto-provisioned.', 'success');
      setSelectedTrain('');
      setStops([{ stationId: '', sequenceNumber: 1, arrivalTime: '', departureTime: '', distanceFromOrigin: 0 }]);
      // Refresh trains to update route status
      adminApi.getTrains().then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setTrains(list);
      }).catch(() => {});
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif font-black text-slate-900 text-lg">Create Train Routes</h3>
          <p className="text-xs text-slate-500 font-medium">Link stations, scheduled arrival/departure halts, and track corridor distances</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {trains.length} Trains
          </span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {stations.length} Stations
          </span>
        </div>
      </div>

      <div className="mb-6 max-w-2xl">
        <CustomSelect
          label="Select Train Service (Prioritizing Active Fleet)"
          value={selectedTrain}
          onChange={(e) => setSelectedTrain(e.target.value)}
          options={trainOptions}
          placeholder={trains.length === 0 ? 'Loading fleet roster...' : `Search & select a train (${trains.length} available)...`}
          searchPlaceholder="Search by train number, name, or route..."
          required
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-900">Route Intermediate &amp; Terminal Stops</h4>
        <span className="text-xs text-slate-500 font-medium">{stops.length} stop{stops.length === 1 ? '' : 's'} configured</span>
      </div>

      <div className="space-y-3 mb-6">
        {stops.map((stop, i) => (
          <div key={i} className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-500 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <CustomSelect
                  label="Station Stop"
                  value={stop.stationId}
                  onChange={(e) => updateStop(i, 'stationId', e.target.value)}
                  options={stationOptions}
                  placeholder="Choose station..."
                  searchPlaceholder="Search station name or code..."
                  required
                />
              </div>
              {stops.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStop(i)}
                  className="text-rose-500 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 text-base font-bold cursor-pointer transition-colors shrink-0 self-end mb-0.5"
                  title="Remove Stop"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-slate-150">
              <Input label="Arrival Time" type="time" value={stop.arrivalTime} onChange={(e) => updateStop(i, 'arrivalTime', e.target.value)} className="w-full" />
              <Input label="Departure Time" type="time" value={stop.departureTime} onChange={(e) => updateStop(i, 'departureTime', e.target.value)} className="w-full" />
              <Input label="Distance (km)" type="number" value={stop.distanceFromOrigin} onChange={(e) => updateStop(i, 'distanceFromOrigin', e.target.value)} className="w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={addStop}>+ Add Stop</Button>
        <Button type="submit" loading={creating}>Create Route</Button>
      </div>
    </form>
  );
}
