import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Input from '../ui/Input';

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
        <h3 className="font-semibold text-slate-900">Create Route</h3>
        <div className="flex gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {trains.length} Trains
          </span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {stations.length} Stations
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Train (Prioritizing Used Fleet)</label>
        <select value={selectedTrain} onChange={(e) => setSelectedTrain(e.target.value)} className="input-field max-w-lg" required>
          <option value="">{trains.length === 0 ? 'Loading trains...' : `Select a train (${trains.length} available)`}</option>
          {trains.map((t) => {
            const bCount = bookings.filter((b) => b && (b.trainNumber === t.trainNumber || b.trainId === t.id)).length;
            return (
              <option key={t.id} value={t.id}>
                {bCount > 0 ? `🔥 [${bCount} Bookings] ` : '⚪ [0 Bookings] '}#{t.trainNumber} — {t.trainName} {t.route ? '✓ (Route Configured)' : '• (No Route)'}
              </option>
            );
          })}
        </select>
      </div>

      <h4 className="text-sm font-medium mb-2">Stops</h4>
      <div className="space-y-3 mb-4">
        {stops.map((stop, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-end bg-gray-50 rounded-lg p-3">
            <div className="w-10 text-center text-sm font-bold text-gray-400">{i + 1}</div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1">Station</label>
              <select value={stop.stationId} onChange={(e) => updateStop(i, 'stationId', e.target.value)} className="input-field" required>
                <option value="">Select</option>
                {stations.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <Input label="Arrival" type="time" value={stop.arrivalTime} onChange={(e) => updateStop(i, 'arrivalTime', e.target.value)} className="w-32" />
            <Input label="Departure" type="time" value={stop.departureTime} onChange={(e) => updateStop(i, 'departureTime', e.target.value)} className="w-32" />
            <Input label="Distance (km)" type="number" value={stop.distanceFromOrigin} onChange={(e) => updateStop(i, 'distanceFromOrigin', e.target.value)} className="w-28" />
            {stops.length > 1 && (
              <button type="button" onClick={() => removeStop(i)} className="text-red-500 hover:text-red-700 text-xl pb-1">&times;</button>
            )}
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
