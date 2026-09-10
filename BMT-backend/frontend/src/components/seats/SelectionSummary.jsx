import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/booking.store';
import { formatCurrency } from '../../utils/format';
import { MAX_SEATS_PER_BOOKING } from '../../utils/constants';
import Button from '../ui/Button';

export default function SelectionSummary() {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const navigate = useNavigate();

  const count = selectedSeats.size;
  let totalPrice = 0;
  selectedSeats.forEach((s) => (totalPrice += s.price || 0));

  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-card-hover p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-base">
            {count}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {count} of {MAX_SEATS_PER_BOOKING} Seats Selected
            </p>
            <p className="text-xl font-black text-slate-900">
              Total: <span className="text-emerald-700">{formatCurrency(totalPrice)}</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/booking')}
          className="py-3 px-6 shadow-md shadow-emerald-500/25 font-bold"
        >
          Proceed to Passenger Details &rarr;
        </Button>
      </div>
    </div>
  );
}
