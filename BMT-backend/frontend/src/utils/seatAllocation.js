/**
 * Intelligent IRCTC-style Automatic Seat Allocation Engine
 *
 * Automatically allocates seats for travelling passenger groups:
 * 1. Prioritizes contiguous/adjacent seat numbers in the same coach compartment (coupe/bay).
 * 2. If contiguous block not available, groups seats within the same coupe (8-berth bay).
 * 3. Falls back to closest available scattered seats.
 * 4. Respects individual berth preferences (Lower, Middle, Upper, Side Lower, Side Upper) where available.
 */

export function allocateSeatsTogether(availableSeats = [], passengers = []) {
  if (!availableSeats || availableSeats.length === 0 || !passengers || passengers.length === 0) {
    return [];
  }

  const numPax = passengers.length;
  // Sort available seats by seatNumber ascending
  const sorted = [...availableSeats].sort((a, b) => a.seatNumber - b.seatNumber);

  if (sorted.length < numPax) {
    return sorted; // Fewer seats available than requested
  }

  // Strategy 1: Strictly contiguous block (e.g. seat 1, 2 or seat 9, 10, 11)
  let bestBlock = null;
  for (let i = 0; i <= sorted.length - numPax; i++) {
    let isContiguous = true;
    for (let j = 0; j < numPax - 1; j++) {
      if (sorted[i + j + 1].seatNumber !== sorted[i + j].seatNumber + 1) {
        isContiguous = false;
        break;
      }
    }
    if (isContiguous) {
      bestBlock = sorted.slice(i, i + numPax);
      break;
    }
  }

  // Strategy 2: Seats within the same coupe/bay (standard 8-berth compartment in IRCTC)
  let selectedSeats = bestBlock;
  if (!selectedSeats) {
    const coupeGroups = new Map();
    for (const s of sorted) {
      const coupeId = Math.floor((s.seatNumber - 1) / 8);
      if (!coupeGroups.has(coupeId)) coupeGroups.set(coupeId, []);
      coupeGroups.get(coupeId).push(s);
    }

    for (const [_, coupeSeats] of coupeGroups) {
      if (coupeSeats.length >= numPax) {
        selectedSeats = coupeSeats.slice(0, numPax);
        break;
      }
    }
  }

  // Strategy 3: Best available scattered seats
  if (!selectedSeats) {
    selectedSeats = sorted.slice(0, numPax);
  }

  // Match berth preferences where possible within selected seats
  const remaining = [...selectedSeats];
  const allocated = [];

  passengers.forEach((p) => {
    const pref = p.berthPreference;
    let matchIdx = -1;
    if (pref && pref !== 'NO_PREF') {
      matchIdx = remaining.findIndex((s) => s.seatType === pref);
    }
    if (matchIdx === -1) {
      matchIdx = 0;
    }
    const [assigned] = remaining.splice(matchIdx, 1);
    allocated.push(assigned);
  });

  return allocated;
}
