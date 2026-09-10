import { formatCurrency, formatSeatType, formatDate } from '../../utils/format';

export default function BookingSummary({ train, seats, totalPrice, departureDate, tripShield = false, tripShieldFee = 0 }) {
  const finalPayable = totalPrice + (tripShield ? tripShieldFee : 0);

  return (
    <div className="card p-6 bg-white border border-slate-150 shadow-card mb-6">
      <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Selected Train
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1">{train?.trainName}</h3>
          <p className="text-xs text-slate-500">#{train?.trainNumber}</p>
        </div>
        {departureDate && (
          <div className="text-right">
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
                <td className="py-3 font-bold text-slate-900">#{s.seatNumber}</td>
                <td className="py-3 font-semibold text-slate-600">{formatSeatType(s.seatType)}</td>
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

        {tripShield && (
          <div className="flex justify-between items-center text-emerald-900 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1.5">
              <span>🛡️</span>
              <span>BMT Trip Shield Pass (100% Zero-Deduction Refund)</span>
            </span>
            <span className="font-bold text-emerald-800">+{formatCurrency(tripShieldFee)}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 text-slate-900">
          <span className="font-bold text-sm">Total Payable</span>
          <span className="text-2xl font-black text-emerald-700">{formatCurrency(finalPayable)}</span>
        </div>
      </div>
    </div>
  );
}
