import { useState } from 'react';

const MOCK_SYSTEM_BOOKINGS = [
  {
    pnr: '2489182301',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    route: 'New Delhi (NDLS) → Howrah Jn (HWH)',
    travelDate: '2026-10-15',
    passenger: { name: 'Dr. Ramesh Sharma', age: 48, gender: 'Male', email: 'ramesh.sharma@aiims.edu', phone: '+91 98765 43210' },
    berth: 'Coach B3 • Berth 18 (Lower)',
    classType: '3A (AC 3 Tier)',
    quota: 'General (GN)',
    fare: '₹2,240',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentId: 'pay_live_0982348102',
    bookedAt: 'Today, 14:20 IST'
  },
  {
    pnr: '6523019842',
    trainNumber: '22436',
    trainName: 'Varanasi Vande Bharat Express',
    route: 'New Delhi (NDLS) → Varanasi Jn (BSB)',
    travelDate: '2026-10-12',
    passenger: { name: 'Pooja Agarwal', age: 29, gender: 'Female', email: 'pooja.agarwal@gmail.com', phone: '+91 98111 22334' },
    berth: 'Coach C2 • Seat 34 (Window)',
    classType: 'CC (AC Chair Car)',
    quota: 'Tatkal (TQ)',
    fare: '₹1,750',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentId: 'pay_live_7718293012',
    bookedAt: 'Today, 11:02 IST'
  },
  {
    pnr: '8104592019',
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    route: 'New Delhi (NDLS) → Mumbai Central (MMCT)',
    travelDate: '2026-10-14',
    passenger: { name: 'Vikramaditya Rao', age: 35, gender: 'Male', email: 'v.rao@techcorp.in', phone: '+91 99200 44556' },
    berth: 'WL 14 / WL 6 (Waitlisted)',
    classType: '2A (AC 2 Tier)',
    quota: 'General (GN)',
    fare: '₹3,180',
    status: 'WAITLIST',
    paymentStatus: 'PAID',
    paymentId: 'pay_live_3349182012',
    bookedAt: 'Today, 09:45 IST'
  },
  {
    pnr: '4928172039',
    trainNumber: '12002',
    trainName: 'Bhopal Shatabdi Express',
    route: 'New Delhi (NDLS) → Agra Cantt (AGC)',
    travelDate: '2026-10-18',
    passenger: { name: 'Ananya Mukherjee', age: 24, gender: 'Female', email: 'ananya.m@outlook.com', phone: '+91 97110 88990' },
    berth: 'Coach E1 • Seat 12 (Aisle)',
    classType: 'EC (Exec Chair Car)',
    quota: 'General (GN)',
    fare: '₹1,290',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentId: 'pay_live_8912730192',
    bookedAt: 'Yesterday, 18:30 IST'
  },
  {
    pnr: '3910482910',
    trainNumber: '12626',
    trainName: 'Kerala Express',
    route: 'New Delhi (NDLS) → Trivandrum Central (TVC)',
    travelDate: '2026-10-20',
    passenger: { name: 'K. S. Narayanan', age: 62, gender: 'Male', email: 'ks.narayanan@kerala.gov.in', phone: '+91 94470 12345' },
    berth: 'Cancelled (Refunded)',
    classType: 'SL (Sleeper Class)',
    quota: 'Senior Citizen',
    fare: '₹680',
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    paymentId: 'rfnd_live_5510293819',
    bookedAt: '2 days ago'
  }
];

export default function AdminAuditManager() {
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filtered = MOCK_SYSTEM_BOOKINGS.filter((b) => {
    const matchesQuery =
      b.pnr.includes(query) ||
      b.passenger.name.toLowerCase().includes(query.toLowerCase()) ||
      b.passenger.email.toLowerCase().includes(query.toLowerCase()) ||
      b.trainName.toLowerCase().includes(query.toLowerCase()) ||
      b.trainNumber.includes(query);

    const matchesStatus =
      filterStatus === 'ALL' ? true : b.status === filterStatus;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header (Clean White Card Styling) */}
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
              Global ticket search, passenger manifest audit &amp; electronic ticketing verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-purple-700">
            Audit Authority Active
          </span>
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
              placeholder="Search by 10-digit PNR, Passenger Name, Email, or Train #..."
              className="input-field w-full pl-10 text-xs font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
            {['ALL', 'CONFIRMED', 'WAITLIST', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All Tickets' : st}
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
                <th className="py-3 px-4">PNR Number</th>
                <th className="py-3 px-4">Train &amp; Route</th>
                <th className="py-3 px-4">Primary Passenger</th>
                <th className="py-3 px-4">Coach / Berth</th>
                <th className="py-3 px-4">Fare Paid</th>
                <th className="py-3 px-4">Ticket Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No PNR or bookings matching "{query}"
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.pnr} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tracking-wider">
                      {b.pnr.slice(0, 3)}-{b.pnr.slice(3, 6)}-{b.pnr.slice(6)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.trainNumber} - {b.trainName}</div>
                      <div className="text-[11px] text-slate-500">{b.route}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.passenger.name}</div>
                      <div className="text-[11px] text-slate-400">{b.passenger.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{b.berth}</span>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{b.classType} &bull; {b.quota}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {b.fare}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : b.status === 'WAITLIST'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      >
                        Audit Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Booking Audit Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  OFFICIAL PASSENGER AUDIT RECORD
                </span>
                <h3 className="text-base font-black text-slate-900 font-mono">
                  PNR #{selectedBooking.pnr}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Train Service</span>
                <p className="font-bold text-slate-900">{selectedBooking.trainNumber} - {selectedBooking.trainName}</p>
                <p className="text-slate-600">{selectedBooking.route}</p>
                <p className="text-slate-500 font-medium">Date of Journey: {selectedBooking.travelDate}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Passenger Information</span>
                <p className="font-bold text-slate-900">{selectedBooking.passenger.name} ({selectedBooking.passenger.age} yrs / {selectedBooking.passenger.gender})</p>
                <p className="text-slate-600">Email: {selectedBooking.passenger.email}</p>
                <p className="text-slate-600">Phone: {selectedBooking.passenger.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Seat Allocation</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedBooking.berth}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedBooking.classType} &bull; {selectedBooking.quota}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Payment &amp; Gateway</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{selectedBooking.fare} ({selectedBooking.paymentStatus})</p>
                  <p className="text-[10px] font-mono text-slate-500 truncate">{selectedBooking.paymentId}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-150">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Close Audit
              </button>
              <button
                onClick={() => {
                  alert(`Administrative Advisory notification sent to ${selectedBooking.passenger.email}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                Send Official SMS / Email Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
