import { create } from 'zustand';
import { MAX_SEATS_PER_BOOKING } from '../utils/constants';

export const useBookingStore = create((set, get) => ({
  selectedTrain: null,
  scheduleId: null,
  fromStation: null,  // --- SEGMENT BOOKING: { stationId, name, code, sequenceNumber }
  toStation: null,    // --- SEGMENT BOOKING: { stationId, name, code, sequenceNumber }
  selectedSeats: new Map(),
  passengers: [],
  selectedClass: '3A',
  classFare: 450,
  isWaitlist: false,
  waitlistPaxCount: 1,
  waitlistFare: 450,
  waitlistPosition: 1,

  // --- SEGMENT BOOKING: Store from/to station data when selecting a train ---
  setSelectedTrain: (train, scheduleId, classCode = '3A', fare = 450, waitlist = false, wlPos = 1) => set({
    selectedTrain: train,
    scheduleId,
    fromStation: train?.from ? { stationId: train.from.stationId, name: train.from.name, code: train.from.code, sequenceNumber: train.from.sequenceNumber } : null,
    toStation: train?.to ? { stationId: train.to.stationId, name: train.to.name, code: train.to.code, sequenceNumber: train.to.sequenceNumber } : null,
    selectedClass: classCode,
    classFare: fare,
    isWaitlist: Boolean(waitlist),
    waitlistPosition: wlPos,
    selectedSeats: new Map(),
    passengers: [],
    waitlistPaxCount: 1,
    waitlistFare: fare,
  }),

  setSelectedClass: (classCode, fare, waitlist = false, wlPos = 1) => set({
    selectedClass: classCode,
    classFare: fare,
    isWaitlist: Boolean(waitlist),
    waitlistPosition: wlPos,
    waitlistFare: fare,
  }),

  setWaitlistBooking: ({ isWaitlist = true, paxCount = 1, fare = 450, wlPos = 1 } = {}) => set({
    isWaitlist: Boolean(isWaitlist),
    waitlistPaxCount: Math.max(1, Math.min(MAX_SEATS_PER_BOOKING, paxCount)),
    waitlistFare: fare || 450,
    waitlistPosition: wlPos,
    selectedSeats: new Map(),
  }),

  toggleSeat: (seat) => {
    const current = new Map(get().selectedSeats);
    if (current.has(seat.seatId)) {
      current.delete(seat.seatId);
    } else {
      if (current.size >= MAX_SEATS_PER_BOOKING) return false;
      current.set(seat.seatId, seat);
    }
    set({ selectedSeats: current, isWaitlist: false });
    return true;
  },

  setPassengers: (passengers) => set({ passengers }),

  get totalPrice() {
    if (get().isWaitlist) {
      return (get().waitlistPaxCount || 1) * (get().waitlistFare || 450);
    }
    let total = 0;
    get().selectedSeats.forEach((s) => (total += s.price || 0));
    return total;
  },

  reset: () => set({
    selectedTrain: null,
    scheduleId: null,
    fromStation: null,
    toStation: null,
    selectedSeats: new Map(),
    passengers: [],
    isWaitlist: false,
    waitlistPaxCount: 1,
    waitlistFare: 450,
  }), // --- SEGMENT BOOKING: reset from/to station
}));
