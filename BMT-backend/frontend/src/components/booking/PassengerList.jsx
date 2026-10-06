import PassengerForm from './PassengerForm';

export default function PassengerList({ seats, register, errors, selectedClass, isWaitlist, onRemove }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Passenger Information Records
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {seats.length} {seats.length === 1 ? 'Passenger' : 'Passengers'}
        </span>
      </div>

      <div className="space-y-3">
        {seats.map((seat, i) => (
          <PassengerForm
            key={seat.seatId || i}
            index={i}
            seat={seat}
            register={register}
            errors={errors}
            selectedClass={selectedClass}
            isWaitlist={isWaitlist}
            onRemove={onRemove}
            canRemove={seats.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
