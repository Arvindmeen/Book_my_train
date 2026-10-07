import { formatCurrency, formatSeatType, formatDate, formatTrainName } from '../../utils/format';

export default function BookingSummary({ train, seats, totalPrice, departureDate, tripShield = false, tripShieldFee = 0, onTripShieldChange }) {
  const finalPayable = totalPrice + (tripShield ? tripShieldFee : 0);

  return (
    <div className="card p-6 bg-white border border-slate-150 shadow-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Selected Train
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1">{formatTrainName(train?.trainName)}</h3>
          <p className="text-xs text-slate-500">#{train?.trainNumber}</p>
        </div>
        {departureDate && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Departure</span>
            <p className="text-xs font-bold text-slate-800">{formatDate(departureDate)}</p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-150 text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 text-left font-bold">Seat #</th>
              <th className="py-2.5 text-left font-bold">Berth Type</th>
              <th className="py-2.5 text-right font-bold">Base Fare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seats.map((s) => (
              <tr key={s.seatId} className="hover:bg-slate-50/50">
                <td className="py-3 font-bold text-slate-900">
                  {String(s.seatNumber).startsWith('WL') ? s.seatNumber : `#${s.seatNumber}`}
                </td>
                <td className="py-3 font-semibold text-slate-600">
                  {s.seatType === 'Waitlist' ? 'Waitlist Queue (WL)' : formatSeatType(s.seatType)}
                </td>
                <td className="py-3 text-right font-bold text-slate-800">{formatCurrency(s.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-150 space-y-2 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Convenience Fee (UPI Promo)</span>
          <span className="text-emerald-700 font-bold">FREE (₹0)</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Travel Insurance</span>
          <span className="text-emerald-700 font-bold">INCLUDED</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-emerald-900 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tripShield}
              onChange={(event) => onTripShieldChange?.(event.target.checked)}
              className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
            <span>Optional Cancellation Protection</span>
          </label>
          <span className="font-bold text-emerald-800">
            {tripShield ? `+${formatCurrency(tripShieldFee)}` : `${formatCurrency(49)} / passenger`}
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 text-slate-900">
          <span className="font-bold text-sm">Total Payable</span>
          <span className="text-2xl font-black text-emerald-700">{formatCurrency(finalPayable)}</span>
        </div>
      </div>
    </div>
  );
}
