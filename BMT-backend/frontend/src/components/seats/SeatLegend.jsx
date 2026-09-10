const items = [
  { label: 'Available', color: 'bg-white border-emerald-400' },
  { label: 'Selected', color: 'bg-emerald-600 border-emerald-700' },
  { label: 'Held', color: 'bg-amber-50 border-amber-300' },
  { label: 'Booked', color: 'bg-slate-100 border-slate-300' },
];

export default function SeatLegend() {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded-md border-2 ${item.color}`} />
          <span className="text-xs font-semibold text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
