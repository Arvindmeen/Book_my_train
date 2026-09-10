import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookingPolling } from '../hooks/useBookingPolling';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import BookingStatusPoller from '../components/booking/BookingStatusPoller';
import CancellationModal from '../components/bookings/CancellationModal';
import { formatDate, formatDateTime, formatCurrency, formatSeatType } from '../utils/format';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const { booking, loading, error, refresh } = useBookingPolling(bookingId);
  const [showCancel, setShowCancel] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-semibold">Retrieving ticket status and coach allocations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-center">
          <p className="font-bold text-lg">Error loading booking logs</p>
          <p className="text-xs mt-1 text-rose-600">{error}</p>
          <Link to="/bookings" className="inline-block mt-4 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl">
            Return to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const canCancel = ['CONFIRMED', 'PAYMENT_PENDING', 'SEATS_HELD'].includes(booking.status);

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">
            <span>&larr;</span> Back to All Bookings
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>🖨️</span> Print E-Ticket
            </button>
          </div>
        </div>

        {/* Header with Live Poller */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-card">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Electronic Rail Reservation</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Booking Details</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">PNR / Order Ref: {booking.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {booking.tripShield && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                <span>🛡️</span>
                <span>Trip Shield Active</span>
              </span>
            )}
            <Badge status={booking.status} className="text-sm px-4 py-1.5" />
          </div>
        </div>

        <BookingStatusPoller status={booking.status} />

        {booking.status === 'CONFIRMED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              ✓
            </div>
            <div>
              <p className="font-extrabold text-emerald-900 text-base">Booking Confirmed &amp; Seats Reserved!</p>
              <p className="text-xs text-emerald-700 mt-0.5">Your digital ticket is confirmed. Show this PNR or SMS during onboard chart verification.</p>
            </div>
          </div>
        )}

        {booking.status === 'CANCELLED' && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <p className="font-extrabold text-emerald-950 text-base">Ticket Cancelled &amp; Instant Refund Settled</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Full refund has been transferred to your original UPI payment handle via NPCI instant rollback engine.
              </p>
            </div>
          </div>
        )}

        {booking.status === 'FAILED' && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 animate-scale-in">
            <p className="font-bold text-rose-800 text-base">Booking Failed</p>
            {booking.failureReason && <p className="text-xs text-rose-600 mt-1">{booking.failureReason}</p>}
          </div>
        )}

        {/* Digital E-Ticket Pass Card */}
        <div className="card p-6 md:p-8 bg-white border border-slate-150 shadow-card space-y-6">
          
          {/* Train Identity */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-150 pb-5 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Authorized BooK my Train Express Ticket
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1.5">{booking.trainName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Train #{booking.trainNumber} &middot; Departure: {formatDate(booking.departureDate)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Total Paid</span>
              <p className="text-2xl font-black text-emerald-700">{formatCurrency(booking.totalAmount)}</p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-150">
            <div>
              <p className="text-slate-400 font-medium">Booking ID</p>
              <p className="font-mono text-xs font-bold text-slate-800 mt-0.5 truncate">{booking.id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Booked At</p>
              <p className="font-bold text-slate-800 mt-0.5">{formatDateTime(booking.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Total Passengers</p>
              <p className="font-bold text-slate-800 mt-0.5">{booking.seatCount} Seat{booking.seatCount !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Payment Channel</p>
              <p className="font-bold text-emerald-700 mt-0.5">Instant UPI Rollback Eligible</p>
            </div>
          </div>

          {/* Seats Breakdown */}
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-3">
              Reserved Berths Allotment
            </h4>
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-slate-400 text-left">
                    <th className="py-2.5 px-4 font-bold">Seat #</th>
                    <th className="py-2.5 px-4 font-bold">Berth Type</th>
                    <th className="py-2.5 px-4 font-bold text-right">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.seats?.map((s) => (
                    <tr key={s.seatId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">Seat #{s.seatNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{formatSeatType(s.seatType)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(s.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Passengers Details */}
          {booking.passengers && booking.passengers.length > 0 && (
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-3">
                Passenger Identity Records
              </h4>
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-150 text-slate-400 text-left">
                      <th className="py-2.5 px-4 font-bold">#</th>
                      <th className="py-2.5 px-4 font-bold">Full Name</th>
                      <th className="py-2.5 px-4 font-bold">Age</th>
                      <th className="py-2.5 px-4 font-bold">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {booking.passengers.map((p, i) => (
                      <tr key={p.id || i} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-400">{i + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 text-slate-700">{p.age} Yrs</td>
                        <td className="py-3 px-4 text-slate-700">{p.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Cancellation Action Button */}
        {canCancel && (
          <div className="pt-2">
            <Button
              variant="danger"
              onClick={() => setShowCancel(true)}
              className="w-full py-3.5 shadow-md font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              <span>Cancel Ticket &amp; Request Instant Refund</span>
            </Button>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancel && (
          <CancellationModal
            booking={booking}
            onClose={() => setShowCancel(false)}
            onSuccess={() => {
              setShowCancel(false);
              refresh();
            }}
          />
        )}

      </div>
    </div>
  );
}
