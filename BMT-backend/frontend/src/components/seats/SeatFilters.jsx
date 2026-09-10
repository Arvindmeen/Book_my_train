import { SEAT_TYPES, SEAT_TYPE_LABELS } from '../../utils/constants';

export default function SeatFilters({ activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          !activeFilter
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        All Berths
      </button>
      {SEAT_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === type
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {SEAT_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
