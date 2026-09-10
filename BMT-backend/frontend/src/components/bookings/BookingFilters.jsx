const FILTERS = [
  { label: 'All Bookings', value: '' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Pending Payment', value: 'PAYMENT_PENDING' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Failed', value: 'FAILED' },
];

export default function BookingFilters({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            active === f.value
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
