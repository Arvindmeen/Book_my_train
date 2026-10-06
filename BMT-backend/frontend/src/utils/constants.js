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
  WAITLISTED: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
  CANCELLING: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  FAILED: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-200/60',
  EXPIRED: 'bg-slate-100 text-slate-500 border border-slate-200/60',
};

export const MAX_SEATS_PER_BOOKING = 6;

// Authentic Indian Railways (IRCTC) Travel Classes
export const IRCTC_CLASSES = [
  { code: 'SL', name: 'Sleeper', fullLabel: 'Sleeper Class (SL)', priceMultiplier: 0.7, defaultBerths: ['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'] },
  { code: '3A', name: 'AC 3 Tier', fullLabel: 'AC 3 Tier (3A)', priceMultiplier: 1.0, defaultBerths: ['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'] },
  { code: '2A', name: 'AC 2 Tier', fullLabel: 'AC 2 Tier (2A)', priceMultiplier: 1.45, defaultBerths: ['LOWER', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'] },
  { code: '1A', name: 'AC First Class', fullLabel: 'AC First Class (1A)', priceMultiplier: 2.2, defaultBerths: ['LOWER', 'UPPER'] },
  { code: '2S', name: 'Second Sitting', fullLabel: 'Second Sitting (2S)', priceMultiplier: 0.35, defaultBerths: ['WINDOW', 'MIDDLE', 'AISLE'] },
];

export const BERTH_PREFERENCE_OPTIONS = [
  { value: 'NO_PREF', label: 'No Preference' },
  { value: 'LOWER', label: 'Lower Berth (LB)' },
  { value: 'MIDDLE', label: 'Middle Berth (MB)' },
  { value: 'UPPER', label: 'Upper Berth (UB)' },
  { value: 'SIDE_LOWER', label: 'Side Lower (SL)' },
  { value: 'SIDE_UPPER', label: 'Side Upper (SU)' },
];
