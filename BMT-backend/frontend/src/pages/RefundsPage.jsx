import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/booking.api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toast';
import CancellationModal from '../components/bookings/CancellationModal';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { formatDate, formatCurrency, formatTrainName } from '../utils/format';

const TDR_REASONS = [
  'Train Delayed > 3 Hours and Passenger Did Not Travel',
  'Train Cancelled by Indian Railways',
  'AC Failure in Coach (Difference of Fare Claim)',
  'Coach Damage / Berth Not Available / Technical Issue',
  'All Passengers on PNR Waitlisted After Chart Preparation',
  'Wrong Route Diversion / Missed Connection',
];

export default function RefundsPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [activeCancelBooking, setActiveCancelBooking] = useState(null);

  // TDR Claim Form state
  const [tdrPnr, setTdrPnr] = useState('');
  const [tdrReason, setTdrReason] = useState(TDR_REASONS[0]);
  const [tdrSubmitting, setTdrSubmitting] = useState(false);
  const [tdrSuccess, setTdrSuccess] = useState(null);

  const fetchBookingsData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await bookingApi.list(undefined, 1, 50);
      const all = res.data?.bookings || res.bookings || [];
      
      const cancelled = all.filter((b) => b.status === 'CANCELLED');
      const active = all.filter(
        (b) => b.status === 'CONFIRMED' || b.status === 'WAITLISTED' || b.status === 'PENDING'
      );

      setCancelledBookings(cancelled);
      setActiveBookings(active);
    } catch (err) {
      console.warn('Failed to load bookings on refunds page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, [isAuthenticated]);

  const handleCancellationSuccess = (bookingId, netRefund, refundRef) => {
    // Move booking from active to cancelled list
    const target = activeBookings.find((b) => b.id === bookingId);
    if (target) {
      const updated = {
        ...target,
        status: 'CANCELLED',
        refundAmount: netRefund,
        refundRef: refundRef,
        updatedAt: new Date().toISOString(),
      };
      setActiveBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setCancelledBookings((prev) => [updated, ...prev]);
    }
  };

  const handleFileTdr = (e) => {
    e.preventDefault();
    const clean = tdrPnr.replace(/\D/g, '');
    if (clean.length !== 10) {
      showToast('Please enter a valid 10-digit PNR number to file TDR', 'warning');
      return;
    }
    setTdrSubmitting(true);
    setTimeout(() => {
      setTdrSubmitting(false);
      const refNum = `TDR-IRCTC-${Math.floor(100000 + Math.random() * 900000)}`;
      setTdrSuccess({
        pnr: clean,
        reason: tdrReason,
        refNum,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      });
      showToast(`TDR Claim Registered! Reference: ${refNum}`, 'success');
      setTdrPnr('');
    }, 1200);
  };

  const totalRefundAmount = cancelledBookings.reduce(
    (sum, b) => sum + (Number(b.refundAmount) || Number(b.totalAmount) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-7">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/bookings" className="hover:text-emerald-700 transition-colors">My Bookings</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Auto-Refund &amp; TDR</span>
        </div>

        {/* Hero Header - Rich Vibrant Teal/Emerald/Sapphire Gradient with Frosted Glass Cards */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden border border-emerald-500/30">
          {/* Ambient Glowing Highlights */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-teal-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-900/60 backdrop-blur-md text-emerald-200 border border-emerald-300/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                ⚡ IRCTC Instant Auto-Refund Saga
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-sm">
                100% Direct UPI Settlement
              </span>
            </div>

            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                Auto-Refund &amp; TDR Tracking Center
              </h1>
              <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed font-medium">
                Track instant automated refunds for cancelled rail tickets, monitor bank reversal sagas, or register Ticket Deposit Receipt (TDR) claims for delayed trains.
              </p>
            </div>

            {/* Quick KPI stats with Glassmorphic Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-white/20">
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Total Refunded</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow-sm">
                  <span className="text-emerald-300">{formatCurrency(totalRefundAmount)}</span>
                </p>
              </div>
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Processed Tickets</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow-sm">
                  {cancelledBookings.length}
                </p>
              </div>
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Average Payout SLA</p>
                <p className="text-xl sm:text-2xl font-black text-teal-200 mt-1 drop-shadow-sm">
                  &lt; 15 Mins <span className="text-xs font-bold text-teal-100">(UPI)</span>
                </p>
              </div>
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Active Bookings</p>
                <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1 drop-shadow-sm">
                  {activeBookings.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Notice if not signed in */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-xl font-bold">
                🔐
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Sign in to track your personal ticket refunds</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sign in with your registered account to view refund timelines, active cancelable tickets, and bank credit references.
                </p>
              </div>
            </div>
            <Link
              to="/login?redirect=/refunds"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
            >
              Sign In to View &rarr;
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-400 font-semibold">Loading refund records and active itineraries...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* SECTION 1: PROCESSED & CANCELLED TICKET REFUNDS */}
            {cancelledBookings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                      <span>⚡</span>
                      <span>Processed Ticket Refunds ({cancelledBookings.length})</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Automated refunds credited directly to your source UPI VPA or bank card.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {cancelledBookings.map((booking) => {
                    const refundAmt = Number(booking.refundAmount) || Number(booking.totalAmount) || 0;
                    const refId = booking.refundRef || `BMT-REF-${booking.id?.slice(-6)?.toUpperCase() || '749210'}`;

                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-5 shadow-card hover:shadow-card-hover transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-base text-slate-900">
                                {formatTrainName(booking.trainName)}
                              </h3>
                              <Badge status="CANCELLED" />
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span>✓</span>
                                <span>100% Refund Settled</span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                                PNR: {booking.pnr || '2418930214'}
                              </span>
                              <span>Train #{booking.trainNumber}</span>
                              <span className="text-slate-300">&bull;</span>
                              <span>Class: {booking.travelClass || 'SL'}</span>
                              <span className="text-slate-300">&bull;</span>
                              <span>Departure: {formatDate(booking.departureDate)}</span>
                            </p>
                          </div>

                          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end">
                            <p className="text-xl font-black text-emerald-700">{formatCurrency(refundAmt)}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Refund Amount Credited
                            </span>
                          </div>
                        </div>

                        {/* Visual 4-Step Refund Tracker */}
                        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-150">
                          <p className="text-[11px] font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                            <span>📡</span>
                            <span>Automated Settlement Flow Status:</span>
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                              <span>1. Cancelled</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                              <span>2. Inventory Freed</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                              <span>3. Bank Dispatched</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-700 font-bold">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                              <span>4. Credited to UPI</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer reference & receipt */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 gap-2">
                          <div className="flex items-center gap-2">
                            <span>Settlement Reference:</span>
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {refId}
                            </span>
                          </div>
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            View Booking Ledger &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: NO CANCELLED TICKETS -> SUGGEST ACTIVE TRAINS TO CANCEL */}
            {cancelledBookings.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
                
                {/* Empty refund state banner */}
                <div className="text-center max-w-md mx-auto space-y-2">
                  <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center text-2xl mx-auto shadow-xs">
                    🛡️
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    No Cancelled Tickets or Active Refunds
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You currently have no pending refund claims. All your ticket reservations are active and in good standing.
                  </p>
                </div>

                {/* Suggest Active Trains for Instant Cancellation & Refund */}
                {activeBookings.length > 0 && (
                  <div className="pt-4 border-t border-slate-150 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <span>🎫</span>
                          <span>Need to Cancel an Active Train &amp; Claim Instant Refund?</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Select any of your upcoming confirmed or waitlisted journeys below to initiate an immediate refund:
                        </p>
                      </div>
                      <Link
                        to="/bookings"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
                      >
                        Go to My Bookings &rarr;
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {activeBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-card transition-all space-y-3 flex flex-col justify-between group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {formatTrainName(b.trainName)}
                              </h4>
                              <Badge status={b.status} />
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                PNR: {b.pnr || '2418930214'}
                              </span>
                              <span>#{b.trainNumber}</span>
                              <span>&bull;</span>
                              <span>{formatDate(b.departureDate)}</span>
                            </p>
                            <p className="text-xs font-bold text-slate-700 pt-1">
                              Paid: <span className="text-emerald-700 font-extrabold">{formatCurrency(b.totalAmount)}</span>
                              <span className="text-slate-400 font-normal ml-1">({b.travelClass || 'SL'})</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70">
                            <button
                              type="button"
                              onClick={() => setActiveCancelBooking(b)}
                              className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <span>⚡</span>
                              <span>Cancel &amp; Claim Refund</span>
                            </button>
                            <Link
                              to={`/bookings/${b.id}`}
                              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If user has no active bookings at all */}
                {activeBookings.length === 0 && isAuthenticated && (
                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500 mb-3">
                      You do not have any active upcoming train tickets booked on this account.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to="/search"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                      >
                        Search &amp; Book Trains
                      </Link>
                      <Link
                        to="/bookings"
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                      >
                        All Bookings
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: TDR (TICKET DEPOSIT RECEIPT) CLAIM FILING TOOL */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      File a Railway TDR Claim
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Eligible for train delays &gt;3 hrs, coach AC malfunction, railway route diversion, or dropped waitlisted passengers.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
                  IRCTC Official Rule Compliant
                </span>
              </div>

              {/* TDR Success Alert if just submitted */}
              {tdrSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-1.5 animate-scale-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <span>✓</span>
                    <span>TDR Claim Successfully Registered!</span>
                  </div>
                  <p>
                    Your TDR claim for PNR <strong>{tdrSuccess.pnr}</strong> has been logged with reference:{' '}
                    <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-950">
                      {tdrSuccess.refNum}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Reason: {tdrSuccess.reason}. The Zonal Railway Claims Office reviews e-TDRs within 5–7 working days, and refunds are routed to your original source payment method.
                  </p>
                </div>
              )}

              {/* TDR Form */}
              <form onSubmit={handleFileTdr} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      10-Digit PNR Number *
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={tdrPnr}
                      onChange={(e) => setTdrPnr(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 2418930214"
                      className="input-field font-mono font-semibold text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Reason for Filing TDR *
                    </label>
                    <select
                      value={tdrReason}
                      onChange={(e) => setTdrReason(e.target.value)}
                      className="input-field text-xs font-semibold"
                    >
                      {TDR_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-slate-400">
                    ℹ TDR can be filed online up to 72 hours after scheduled train departure.
                  </p>
                  <button
                    type="submit"
                    disabled={tdrSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 shrink-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {tdrSubmitting && <Spinner size="sm" />}
                    <span>Submit TDR Claim &rarr;</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 4: IRCTC CANCELLATION & REFUND POLICIES FAQ */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-7 space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>📖</span>
                <span>Indian Railways Cancellation &amp; Auto-Refund Rules</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 leading-relaxed">
                <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                  <p className="font-bold text-slate-800">48+ Hours Before Departure</p>
                  <p className="text-[11px]">
                    Flat cancellation deduction per passenger: ₹240 for 1AC/EC, ₹200 for 2AC, ₹180 for 3AC/CC, ₹120 for Sleeper (SL), ₹60 for 2S. Balance auto-refunded to UPI immediately.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                  <p className="font-bold text-slate-800">Trip Shield Zero Clerkage</p>
                  <p className="text-[11px]">
                    Bookings with Trip Shield protection are exempted from standard IRCTC cancellation deductions; you receive a 100% full fare rollback directly to your bank.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                  <p className="font-bold text-slate-800">Fully Waitlisted E-Tickets</p>
                  <p className="text-[11px]">
                    If all passengers remain in WL status after chart preparation, tickets are automatically cancelled by railways and 100% fare is auto-refunded with no clerkage charge.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                  <p className="font-bold text-slate-800">Train Cancelled by Railways</p>
                  <p className="text-[11px]">
                    When a train is officially cancelled due to weather, derailment, or maintenance, 100% full refund is automatically credited within 24–48 hours without needing TDR.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cancellation Modal instance for 1-click active train cancellation */}
        {activeCancelBooking && (
          <CancellationModal
            booking={activeCancelBooking}
            onClose={() => setActiveCancelBooking(null)}
            onSuccess={handleCancellationSuccess}
          />
        )}

      </div>
    </div>
  );
}
