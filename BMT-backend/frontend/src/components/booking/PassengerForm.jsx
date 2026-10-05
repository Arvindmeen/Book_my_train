import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatSeatType } from '../../utils/format';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export default function PassengerForm({ index, seat, register, errors }) {
  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all hover:bg-slate-50 hover:border-slate-300">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-extrabold text-slate-800">
            Passenger {index + 1}
          </span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
          seat?.seatType === 'Waitlist'
            ? 'text-amber-800 bg-amber-100 border border-amber-300'
            : 'text-emerald-800 bg-emerald-100'
        }`}>
          {seat?.seatType === 'Waitlist'
            ? `${seat.seatNumber} (Waitlist Queue)`
            : `Seat #${seat.seatNumber} (${formatSeatType(seat.seatType)})`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="sm:col-span-1">
          <Input
            label="Full Name (As per Govt ID)"
            placeholder="Enter full name"
            {...register(`passengers.${index}.name`, { required: 'Name is required' })}
            error={errors?.passengers?.[index]?.name?.message}
          />
        </div>
        <div>
          <Input
            label="Age"
            type="number"
            placeholder="Age (Years)"
            {...register(`passengers.${index}.age`, {
              required: 'Age is required',
              min: { value: 1, message: 'Min 1' },
              max: { value: 120, message: 'Max 120' },
              valueAsNumber: true,
            })}
            error={errors?.passengers?.[index]?.age?.message}
          />
        </div>
        <div>
          <Select
            label="Gender"
            placeholder="Choose Gender"
            options={GENDER_OPTIONS}
            {...register(`passengers.${index}.gender`, { required: 'Gender is required' })}
            error={errors?.passengers?.[index]?.gender?.message}
          />
        </div>
      </div>
    </div>
  );
}
