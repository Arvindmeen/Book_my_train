import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/booking.store';
import { formatCurrency } from '../../utils/format';
import { MAX_SEATS_PER_BOOKING } from '../../utils/constants';

export default function SelectionSummary() {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const navigate = useNavigate();

  const count = selectedSeats.size;
  let totalPrice = 0;
  selectedSeats.forEach((s) => (totalPrice += s.price || 0));

  if (count === 0) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-[70] max-w-4xl mx-auto animate-fade-in-up pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/95 rounded-2xl shadow-2xl shadow-slate-900/15 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-lg shrink-0 shadow-2xs">
            {count}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {count} of {MAX_SEATS_PER_BOOKING} Seats Selected
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Total: <span className="text-emerald-700">{formatCurrency(totalPrice)}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          id="proceed-to-passenger-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/booking');
          }}
          className="w-full sm:w-auto min-h-[48px] py-3.5 px-7 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none touch-manipulation"
        >
          <span>Proceed to Passenger Details</span>
          <span className="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
