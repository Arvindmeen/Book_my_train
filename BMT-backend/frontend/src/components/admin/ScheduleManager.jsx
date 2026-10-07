import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/format';

export default function ScheduleManager() {
  const [trains, setTrains] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState('');
  const [date, setDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const [filterQuery, setFilterQuery] = useState('');

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
      // Sort: used trains first, 0-booked after
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
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSchedules();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSchedules(list);
    } catch (err) {
      showToast(err.message || 'Failed to fetch schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedTrain || !date) { showToast('Select train and date', 'warning'); return; }
    setCreating(true);
    try {
      await adminApi.createSchedule({ trainId: selectedTrain, departureDate: date });
      showToast('Schedule created successfully!', 'success');
      setSelectedTrain('');
      setDate('');
      fetchSchedules();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await adminApi.cancelSchedule(id);
      showToast('Schedule cancelled', 'success');
      fetchSchedules();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredSchedules = [...schedules]
    .filter((s) => {
      if (!filterQuery) return true;
      const q = filterQuery.toLowerCase();
      const trainNum = String(s.train?.trainNumber || s.trainId || '').toLowerCase();
      const trainName = String(s.train?.trainName || '').toLowerCase();
      const dateStr = String(s.departureDate || '').toLowerCase();
      return trainNum.includes(q) || trainName.includes(q) || dateStr.includes(q);
    })
    .sort((s1, s2) => {
      const b1 = bookings.filter((b) => b && (b.trainNumber === s1.train?.trainNumber || b.trainId === s1.trainId)).length;
      const b2 = bookings.filter((b) => b && (b.trainNumber === s2.train?.trainNumber || b.trainId === s2.trainId)).length;
      if (b1 > 0 && b2 === 0) return -1;
      if (b1 === 0 && b2 > 0) return 1;
      return b2 - b1;
    });

  return (
    <div>
      <form onSubmit={handleCreate} className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Create Schedule</h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {trains.length} Trains Registered
          </span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Train (Prioritizing Used Fleet)</label>
            <select value={selectedTrain} onChange={(e) => setSelectedTrain(e.target.value)} className="input-field" required>
              <option value="">{trains.length === 0 ? 'Loading trains...' : `Select train (${trains.length} available)`}</option>
              {trains.map((t) => {
                const bCount = bookings.filter((b) => b && (b.trainNumber === t.trainNumber || b.trainId === t.id)).length;
                return (
                  <option key={t.id} value={t.id}>
                    {bCount > 0 ? `🔥 [${bCount} Bookings] ` : '⚪ [0 Bookings] '}#{t.trainNumber} — {t.trainName}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today} className="input-field" required />
          </div>
          <Button type="submit" loading={creating} className="px-5">Create Schedule</Button>
        </div>
      </form>

      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">Schedules</h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {schedules.length} Total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter by train no, name or date..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="input-field text-xs py-1.5 px-3 w-64"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">Fetching real-time schedules...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-sm font-bold text-slate-700 mb-1">
              {schedules.length === 0 ? 'No train schedules found' : `No schedules match "${filterQuery}"`}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {schedules.length === 0
                ? 'Select a train and departure date above to provision new active schedules, or seed the railway dataset.'
                : 'Try adjusting your search query or clear the filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-2.5 text-left font-bold">Train</th>
                  <th className="py-2.5 text-left font-bold">Date</th>
                  <th className="py-2.5 text-left font-bold">Status</th>
                  <th className="py-2.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs mr-2">
                        #{s.train?.trainNumber || s.trainId}
                      </span>
                      <span className="font-medium text-slate-800">
                        {s.train?.trainName || ''}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-slate-700">{formatDate(s.departureDate)}</td>
                    <td className="py-2.5"><Badge status={s.status} /></td>
                    <td className="py-2.5 text-right">
                      {s.status === 'ACTIVE' && (
                        <Button variant="danger" onClick={() => handleCancel(s.id)} className="text-xs py-1 px-2.5">Cancel</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
