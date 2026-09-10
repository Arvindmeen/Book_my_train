import { formatDate } from '../../utils/format';

export default function AvailabilitySummary({ availability, train }) {
  if (!availability) return null;

  return (
    <div className="card p-5 md:p-6 bg-white border border-slate-150 shadow-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Coach Inventory
            </span>
            <span className="text-xs text-slate-400 font-medium">#{train?.trainNumber || availability.trainNumber}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {train?.trainName || availability.trainName}
          </h2>
          {train?.from && (
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
              <span>{train.from.name}</span>
              <span className="text-slate-400">&rarr;</span>
              <span>{train.to.name}</span>
            </p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Departure Date: <strong className="text-slate-800">{formatDate(availability.departureDate)}</strong>
          </p>
        </div>

        {/* Live Counts Statistics */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3">
            <p className="text-2xl font-black text-emerald-700">{availability.available}</p>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">Available</p>
          </div>
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3">
            <p className="text-2xl font-black text-amber-700">{availability.locked}</p>
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-0.5">Held</p>
          </div>
          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3">
            <p className="text-2xl font-black text-rose-700">{availability.booked}</p>
            <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mt-0.5">Booked</p>
          </div>
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3">
            <p className="text-2xl font-black text-slate-800">{availability.totalSeats}</p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
