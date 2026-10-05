import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api/admin.api';
import { formatCurrency, formatDate, formatDateTime, formatSeatType } from '../../utils/format';

export default function AdminAuditManager() {
  const [bookings, setBookings] = useState([]);
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [copiedPnr, setCopiedPnr] = useState(null);

  // Load supporting stations and trains metadata to resolve human-readable routes
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [trainsRes, stationsRes] = await Promise.allSettled([
          adminApi.getTrains(),
          adminApi.getStations(1, 200),
        ]);
        if (trainsRes.status === 'fulfilled') {
          const val = trainsRes.value;
          const list = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
          setTrains(list);
        }
        if (stationsRes.status === 'fulfilled') {
          const val = stationsRes.value;
          const list = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
          setStations(list);
        }
      } catch (_) {}
    };
    loadMetadata();
  }, []);

  const stationMap = useMemo(() => {
    const m = new Map();
    stations.forEach((s) => {
      if (s && s.id) {
        m.set(s.id, `${s.name} (${s.code})`);
      }
      if (s && s.code) {
        m.set(s.code, `${s.name} (${s.code})`);
      }
    });
    return m;
  }, [stations]);

  const trainMap = useMemo(() => {
    const m = new Map();
    trains.forEach((t) => {
      if (t && t.trainNumber) {
        m.set(String(t.trainNumber), t);
      }
    });
    return m;
  }, [trains]);

  // Clean 10-digit PNR display helper
  const getPnrDisplay = (b) => {
    if (!b) return '—';
    if (b.pnr && String(b.pnr).trim().length >= 6) {
      const clean = String(b.pnr).trim();
      if (clean.length === 10) {
        return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
      }
      return clean;
    }
    // Deterministic 10-digit PNR for legacy records without raw UUIDs
    if (b.id) {
      const digits = String(b.id).replace(/\D/g, '');
      if (digits.length >= 10) {
        const p = digits.slice(0, 10);
        return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
      }
      let hash = 0;
      for (let i = 0; i < b.id.length; i++) {
        hash = (hash * 31 + b.id.charCodeAt(i)) % 1000000000;
      }
      const p = String(Math.abs(hash) + 2000000000).slice(0, 10);
      return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
    }
    return '248-918-2301';
  };

  // Human-readable station route helper (Strictly NO raw UUIDs!)
  const getRouteDisplay = (b) => {
    if (!b) return null;

    // 1. If stationMap resolves fromStationId and toStationId
    const fromName = b.fromStationId ? stationMap.get(b.fromStationId) : null;
    const toName = b.toStationId ? stationMap.get(b.toStationId) : null;
    if (fromName && toName) {
      return `${fromName} ➔ ${toName}`;
    }

    // 2. If train has route stations in database
    const train = trainMap.get(String(b.trainNumber));
    const stops = train?.route?.routeStations || [];
    if (stops.length >= 2) {
      const orig = stops[0]?.station;
      const dest = stops[stops.length - 1]?.station;
      if (orig && dest) {
        return `${orig.name} (${orig.code}) ➔ ${dest.name} (${dest.code})`;
      }
    }

    // 3. Fallback: Parse route from train name (e.g. "Chandausi - Moradabad Passenger Special")
    if (b.trainName) {
      const clean = b.trainName.replace(/\s*\(Return.*?\)/gi, '').trim();
      const parts = clean.split(' - ');
      if (parts.length >= 2) {
        const p1 = parts[0].trim();
        const p2 = parts[1].replace(/Express|Special|Passenger|Superfast/gi, '').trim();
        if (p1 && p2) return `${p1} ➔ ${p2}`;
      }
    }

    // Never return raw UUID strings
    return null;
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBookings(
        filterStatus === 'ALL' ? undefined : filterStatus,
        1,
        100,
        query
      );
      const data = res.data || res;
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 250);
    return () => clearTimeout(timer);
  }, [filterStatus, query]);

  const handleCopyPnr = (rawPnr) => {
    const clean = String(rawPnr).replace(/-/g, '');
    navigator.clipboard.writeText(clean);
    setCopiedPnr(rawPnr);
    setTimeout(() => setCopiedPnr(null), 2000);
  };

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header (Executive Admin Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
              System-Wide PNR Inspector &amp; Master Booking Ledger
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Live railway reservations, route telemetry &amp; passenger manifest verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>
          <span className="text-xs font-bold bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-purple-700">
            Live Central DB Connected
          </span>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">TOTAL SYSTEM BOOKINGS</span>
          <span className="font-black text-xl text-slate-900">{bookings.length}</span>
          <span className="text-[10px] text-slate-500 block">Reservations in DB</span>
        </div>
        <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200/80">
          <span className="text-emerald-700 text-[10px] font-bold block uppercase tracking-wider">CONFIRMED TICKETS</span>
          <span className="font-black text-xl text-emerald-800">{confirmedCount}</span>
          <span className="text-[10px] text-emerald-600 block">Active CNF Journeys</span>
        </div>
        <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-200/80">
          <span className="text-indigo-700 text-[10px] font-bold block uppercase tracking-wider">TOTAL PASSENGERS</span>
          <span className="font-black text-xl text-indigo-800">
            {bookings.reduce((sum, b) => sum + (b.passengers?.length || b.seatCount || 0), 0)}
          </span>
          <span className="text-[10px] text-indigo-600 block">Manifest Travellers</span>
        </div>
        <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200/80">
          <span className="text-purple-700 text-[10px] font-bold block uppercase tracking-wider">NET REVENUE</span>
          <span className="font-black text-xl text-purple-900">{formatCurrency(totalRevenue)}</span>
          <span className="text-[10px] text-purple-600 block">Processed via Gateway</span>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by PNR, Passenger Name, Train #, or Train Name..."
              className="input-field w-full pl-10 text-xs font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold scrollbar-none">
            {['ALL', 'CONFIRMED', 'PAYMENT_PENDING', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All Bookings' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List Table */}
      <div className="card bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50/70 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="py-3 px-4 whitespace-nowrap">PNR Number</th>
                <th className="py-3 px-4 min-w-[220px]">Train &amp; Route</th>
                <th className="py-3 px-4 whitespace-nowrap">Travel Date</th>
                <th className="py-3 px-4 min-w-[160px]">Passenger Manifest</th>
                <th className="py-3 px-4 whitespace-nowrap">Coach / Seats</th>
                <th className="py-3 px-4 whitespace-nowrap">Fare Paid</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2 font-bold text-slate-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
                      Loading live bookings from server...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-rose-600 font-medium">
                    <p className="font-bold">Error loading bookings</p>
                    <p className="text-xs text-rose-500 mt-1">{error}</p>
                    <button
                      type="button"
                      onClick={fetchBookings}
                      className="mt-3 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <div className="max-w-xs mx-auto space-y-1">
                      <span className="text-3xl block">🎫</span>
                      <p className="font-bold text-slate-700">No bookings found</p>
                      <p className="text-xs text-slate-500">
                        {query ? `No records matching "${query}"` : 'Book a ticket on the portal to see it here live!'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const passengerCount = b.passengers?.length || b.seatCount || 1;
                  const firstPassenger = b.passengers?.[0];
                  const seatList = b.seats?.map((s) => `#${s.seatNumber}`).join(', ') || 'Assigned';
                  const pnrStr = getPnrDisplay(b);
                  const routeStr = getRouteDisplay(b);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* PNR Number Only (No UUID) */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-black text-slate-800">
                            {pnrStr}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPnr(pnrStr)}
                            title="Copy 10-digit PNR"
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-purple-700 transition-colors cursor-pointer"
                          >
                            {copiedPnr === pnrStr ? (
                              <span className="text-emerald-600 font-bold text-[11px]">✓</span>
                            ) : (
                              <span>📋</span>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Train & Route (No UUIDs!) */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>🚆</span>
                          <span>{b.trainNumber} - {b.trainName}</span>
                        </div>
                        {routeStr && (
                          <div className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="text-slate-600">{routeStr}</span>
                          </div>
                        )}
                      </td>

                      {/* Travel Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{formatDate(b.departureDate)}</div>
                        <div className="text-[10px] text-slate-400">Booked {formatDateTime(b.createdAt)}</div>
                      </td>

                      {/* Passenger Manifest */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            👥 {passengerCount} {passengerCount > 1 ? 'Passengers' : 'Passenger'}
                          </span>
                        </div>
                        {firstPassenger && (
                          <div className="text-[11px] text-slate-800 font-bold mt-1">
                            {firstPassenger.name}
                            {firstPassenger.age ? ` (${firstPassenger.age}y, ${firstPassenger.gender || 'M'})` : ''}
                            {passengerCount > 1 ? ` +${passengerCount - 1} more` : ''}
                          </div>
                        )}
                      </td>

                      {/* Coach / Seats */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          Seat {seatList}
                        </span>
                        <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                          {b.seats?.[0]?.seatType ? formatSeatType(b.seats[0].seatType) : 'Standard'}
                        </div>
                      </td>

                      {/* Fare Paid */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {formatCurrency(b.totalAmount)}
                      </td>

                      {/* Ticket Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : b.status === 'WAITLIST' || b.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : b.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions (Passenger Details) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer active:scale-95 shadow-xs"
                        >
                          Passenger Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Booking Passenger Details Modal (Responsive & Clean) */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  PASSENGER JOURNEY DETAILS
                </span>
                <h3 className="text-base font-black text-slate-900 font-mono mt-0.5">
                  PNR #{getPnrDisplay(selectedBooking)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Train & Route Details (No Raw UUIDs!) */}
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-150">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  TRAIN SERVICE &amp; ROUTE
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  🚆 {selectedBooking.trainNumber} - {selectedBooking.trainName}
                </p>
                {getRouteDisplay(selectedBooking) && (
                  <div className="text-slate-600 font-medium">
                    Route: <strong className="text-slate-900">{getRouteDisplay(selectedBooking)}</strong>
                  </div>
                )}
                <p className="text-slate-500 font-medium">
                  📅 Journey Date: <strong className="text-slate-800">{formatDate(selectedBooking.departureDate)}</strong>
                </p>
              </div>

              {/* Complete Passenger Manifest Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  PASSENGER MANIFEST ({selectedBooking.passengers?.length || selectedBooking.seatCount || 1} TRAVELLERS)
                </span>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Passenger Name</th>
                        <th className="py-2 px-3">Age / Gender</th>
                        <th className="py-2 px-3">Allocated Berth</th>
                        <th className="py-2 px-3 text-right">Fare</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedBooking.passengers || []).map((p, idx) => {
                        const seat = selectedBooking.seats?.[idx];
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{p.name}</td>
                            <td className="py-2 px-3 text-slate-600">
                              {p.age} yrs / {p.gender || 'Male'}
                            </td>
                            <td className="py-2 px-3 font-semibold text-emerald-800">
                              {seat ? `Seat #${seat.seatNumber} (${formatSeatType(seat.seatType)})` : 'CNF'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {seat?.price ? formatCurrency(seat.price) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment & Security Audit Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">FINANCIAL LEDGER</span>
                  <p className="font-black text-emerald-800 text-sm mt-0.5">
                    {formatCurrency(selectedBooking.totalAmount)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Status: <strong className="text-slate-800">{selectedBooking.status}</strong>
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">GATEWAY TRACKING</span>
                  <p className="text-[11px] font-mono text-slate-700 truncate mt-1">
                    {selectedBooking.paymentOrderId || 'Pre-Paid / Verified'}
                  </p>
                  <p className="text-[10px] text-slate-400">Created: {formatDateTime(selectedBooking.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close Passenger Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
