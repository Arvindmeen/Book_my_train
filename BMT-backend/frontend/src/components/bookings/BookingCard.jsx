import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency, formatTrainName } from '../../utils/format';

export default function BookingCard({ booking, onCancel }) {
  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'WAITLISTED';
  const isCancelled = booking.status === 'CANCELLED';
  const isWaitlist = booking.status === 'WAITLISTED' || booking.isWaitlist;

  const displayPnr = booking.pnr || (() => {
    let hash = 0;
    for (let i = 0; i < (booking.id || '').length; i++) {
      hash = (hash * 31 + booking.id.charCodeAt(i)) >>> 0;
    }
    return `241${String(hash).padStart(7, '0').slice(-7)}`;
  })();

  return (
    <div className="card p-5 bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-card-hover rounded-2xl transition-all duration-200 group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Train & Passenger Info */}
        <Link to={`/bookings/${booking.id}`} className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
              {formatTrainName(booking.trainName)}
            </h3>
            <Badge status={booking.status} />

            {booking.tripShield && (
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🛡️</span>
                <span>Trip Shield Protected</span>
              </span>
            )}
          </div>
          
          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] tracking-wider">
              PNR: {displayPnr}
            </span>
            <span>Train #{booking.trainNumber}</span>
            <span className="text-slate-300">&bull;</span>
            <span className="font-semibold text-slate-700">{formatDate(booking.departureDate)}</span>
            <span className="text-slate-300">&bull;</span>
            <span className="font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
              {booking.travelClass || 'SL'}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className={isWaitlist ? 'font-bold text-amber-700' : ''}>
              {booking.seatCount} Passenger{booking.seatCount !== 1 ? 's' : ''} {isWaitlist ? `(Waitlisted - ${booking.travelClass || 'SL'})` : '(Confirmed)'}
            </span>
          </p>

          {isCancelled && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl w-fit mt-1">
              <span>⚡</span>
              <span>
                {booking.refundAmount ? formatCurrency(booking.refundAmount) : formatCurrency(booking.totalAmount)} Refunded Instantly to UPI
              </span>
              {booking.refundRef && (
                <span className="font-mono text-[10px] text-emerald-900">({booking.refundRef})</span>
              )}
            </div>
          )}
        </Link>

        {/* Right Fare and Action Point */}
        <div className="sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
          <div>
            <p className="font-black text-lg text-emerald-700">{formatCurrency(booking.totalAmount)}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Fare Paid</p>
          </div>

          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel(booking);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                title="Cancel ticket & receive instant UPI refund"
              >
                <span>⚡</span>
                <span>Cancel &amp; Refund</span>
              </button>
            )}

            <Link
              to={`/bookings/${booking.id}`}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Details &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
