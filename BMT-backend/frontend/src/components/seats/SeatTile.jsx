import { formatSeatType, formatCurrency } from '../../utils/format';

const STATUS_STYLES = {
  AVAILABLE: 'bg-white hover:bg-emerald-50/80 border-2 border-emerald-300 hover:border-emerald-500 text-slate-800 shadow-xs cursor-pointer hover:-translate-y-0.5',
  LOCKED: 'bg-amber-50 border-2 border-amber-200/80 text-amber-700/80 cursor-not-allowed opacity-70',
  BOOKED: 'bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-not-allowed opacity-60',
  CANCELLED: 'bg-slate-50 border-2 border-slate-200 text-slate-300 cursor-not-allowed opacity-40',
  SELECTED: 'bg-emerald-600 border-2 border-emerald-700 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-200 cursor-pointer -translate-y-0.5',
};

export default function SeatTile({ seat, isSelected, onToggle }) {
  // --- SEGMENT BOOKING: When segmentStatus is present, trust it as authoritative ---
  const effectiveStatus = seat.segmentStatus
    ? (seat.segmentStatus === 'AVAILABLE' ? 'AVAILABLE' : 'BOOKED')
    : seat.status;
  const status = isSelected ? 'SELECTED' : effectiveStatus;
  const canSelect = effectiveStatus === 'AVAILABLE';

  return (
    <button
      type="button"
      onClick={() => canSelect && onToggle(seat)}
      disabled={!canSelect && !isSelected}
      className={`rounded-xl p-2.5 text-center transition-all duration-200 min-w-[72px] flex flex-col items-center justify-between ${STATUS_STYLES[status]}`}
      title={`Seat #${seat.seatNumber} - ${formatSeatType(seat.seatType)} - ${formatCurrency(seat.price)}`}
    >
      <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
        #{seat.seatNumber}
      </span>
      <span className={`text-[9.5px] font-bold uppercase tracking-wider my-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
        {formatSeatType(seat.seatType)}
      </span>
      <span className={`text-[11px] font-extrabold ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
        {formatCurrency(seat.price)}
      </span>
    </button>
  );
}
