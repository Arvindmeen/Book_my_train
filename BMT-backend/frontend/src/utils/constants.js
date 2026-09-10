export const SEAT_TYPES = ['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'];

export const SEAT_TYPE_LABELS = {
  LOWER: 'Lower',
  MIDDLE: 'Middle',
  UPPER: 'Upper',
  SIDE_LOWER: 'Side Lower',
  SIDE_UPPER: 'Side Upper',
};

export const SEAT_STATUS_COLORS = {
  AVAILABLE: 'bg-green-500',
  LOCKED: 'bg-yellow-500',
  BOOKED: 'bg-red-400',
  SELECTED: 'bg-primary-600',
};

export const BOOKING_STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  SEATS_HELD: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  PAYMENT_PENDING: 'bg-orange-50 text-orange-700 border border-orange-200/60',
  CONFIRMING: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  CANCELLING: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  FAILED: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-200/60',
  EXPIRED: 'bg-slate-100 text-slate-500 border border-slate-200/60',
};

export const MAX_SEATS_PER_BOOKING = 6;
