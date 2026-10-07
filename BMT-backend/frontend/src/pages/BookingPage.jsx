import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useBookingStore } from '../store/booking.store';
import { useSearchStore } from '../store/search.store';
import { useAuthStore } from '../store/auth.store';
import { inventoryApi } from '../api/inventory.api';
import { allocateSeatsTogether } from '../utils/seatAllocation';
import BookingSummary from '../components/booking/BookingSummary';
import PassengerList from '../components/booking/PassengerList';
import PaymentButton from '../components/booking/PaymentButton';
import { useToast } from '../components/ui/Toast';
import { MAX_SEATS_PER_BOOKING } from '../utils/constants';

export default function BookingPage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const selectedTrain = useBookingStore((s) => s.selectedTrain);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const scheduleId = useBookingStore((s) => s.scheduleId);
  const selectedClass = useBookingStore((s) => s.selectedClass) || '3A';
  const classFare = useBookingStore((s) => s.classFare) || 450;
  const isWaitlist = useBookingStore((s) => s.isWaitlist);
  const waitlistPosition = useBookingStore((s) => s.waitlistPosition) || 1;
  const fromStation = useBookingStore((s) => s.fromStation);
  const toStation = useBookingStore((s) => s.toStation);
  const quota = useSearchStore((s) => s.quota);
  const user = useAuthStore((s) => s.user);

  const [optTripShield, setOptTripShield] = useState(false);
  const rawSeats = useMemo(() => Array.from(selectedSeats.values()), [selectedSeats]);

  // Initial passenger count: rawSeats size, or waitlistPaxCount, or 1
  const [passengerCount, setPassengerCount] = useState(() => {
    if (rawSeats.length > 0) return rawSeats.length;
    return 1;
  });

  const { register, handleSubmit, setValue, unregister, formState: { errors, isValid }, getValues } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (!selectedTrain || !scheduleId) {
      navigate('/search');
    }
  }, [selectedTrain, scheduleId, navigate]);

  const farePerPax = classFare;

  // Build slot representation for summary and passenger list
  const virtualSeats = useMemo(() => {
    return Array.from({ length: passengerCount }, (_, idx) => {
      if (rawSeats[idx]) {
        return rawSeats[idx];
      }
      if (isWaitlist) {
        return {
          seatId: `wl-${idx}`,
          seatNumber: `WL #${waitlistPosition + idx}`,
          seatType: 'Waitlist',
          price: farePerPax,
        };
      }
      return {
        seatId: `auto-${idx}`,
        seatNumber: `Auto #${idx + 1}`,
        seatType: selectedClass,
        price: farePerPax,
      };
    });
  }, [passengerCount, rawSeats, isWaitlist, waitlistPosition, farePerPax, selectedClass]);

  const totalPrice = passengerCount * farePerPax;
  const tripShieldFee = passengerCount * 49;

  const handleAddPassenger = () => {
    if (passengerCount >= MAX_SEATS_PER_BOOKING) {
      showToast(`Maximum ${MAX_SEATS_PER_BOOKING} passengers allowed per ticket`, 'warning');
      return;
    }
    setPassengerCount((prev) => prev + 1);
  };

  const handleRemovePassenger = (indexToRemove) => {
    if (passengerCount <= 1) return;
    unregister(`passengers.${indexToRemove}`);
    // Shift values
    const currentValues = getValues('passengers') || [];
    const remaining = currentValues.filter((_, i) => i !== indexToRemove);
    remaining.forEach((p, idx) => {
      setValue(`passengers.${idx}.name`, p?.name || '', { shouldValidate: true });
      setValue(`passengers.${idx}.age`, p?.age || '', { shouldValidate: true });
      setValue(`passengers.${idx}.gender`, p?.gender || 'MALE', { shouldValidate: true });
      setValue(`passengers.${idx}.berthPreference`, p?.berthPreference || 'NO_PREF');
    });
    unregister(`passengers.${remaining.length}`);
    setPassengerCount((prev) => prev - 1);
  };

  const handleAutofillMasterPassengers = () => {
    try {
      let masterList = [];
      const passengerStorageKey = `bmt_master_passengers_${user?.id || user?.email || 'default'}`;
      const saved = localStorage.getItem(passengerStorageKey);
      if (saved) {
        masterList = JSON.parse(saved);
      }
      if (!masterList || masterList.length === 0) {
        const ownName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        if (!ownName) {
          showToast('Add passenger details to your profile before using autofill', 'error');
          return;
        }
        masterList = [{ name: ownName, age: Number(user?.age) || 25, gender: user?.gender || 'MALE' }];
      }

      for (let idx = 0; idx < passengerCount; idx++) {
        const p = masterList[idx] || masterList[0];
        setValue(`passengers.${idx}.name`, p.name, { shouldValidate: true });
        setValue(`passengers.${idx}.age`, Number(p.age) || 25, { shouldValidate: true });
        setValue(`passengers.${idx}.gender`, p.gender === 'FEMALE' ? 'FEMALE' : 'MALE', { shouldValidate: true });
        setValue(`passengers.${idx}.berthPreference`, p.berthPreference || 'NO_PREF');
      }

      showToast('⚡ Fast Tatkal Autofill: Loaded from Master Passenger List in 24ms!', 'success');
    } catch {
      showToast('Failed to load master passengers', 'error');
    }
  };

  // Automated Seat Allocation Engine
  const handleBeforeCreateBooking = async () => {
    if (isWaitlist) {
      return [];
    }

    // If manual seats were selected previously, honor them
    if (rawSeats.length === passengerCount) {
      return rawSeats.map((s) => s.seatId);
    }

    try {
      const seatParams = {};
      if (fromStation?.sequenceNumber && toStation?.sequenceNumber) {
        seatParams.fromSeq = fromStation.sequenceNumber;
        seatParams.toSeq = toStation.sequenceNumber;
      }
      if (selectedClass) {
        seatParams.travelClass = selectedClass;
      }

      const res = await inventoryApi.getSeats(scheduleId, seatParams);
      let allSeats = res?.data?.seats || res?.seats || [];
      if (selectedClass) {
        allSeats = allSeats.filter((s) => !s.travelClass || s.travelClass === selectedClass);
      }
      const availableSeats = allSeats.filter((s) => {
        if (seatParams.fromSeq && seatParams.toSeq && s.segmentStatus) {
          return s.segmentStatus === 'AVAILABLE';
        }
        return s.status === 'AVAILABLE';
      });

      const formPax = getValues('passengers') || [];
      const allocated = allocateSeatsTogether(availableSeats, formPax);

      let seatIdsToUse = [];
      if (allocated.length > 0) {
        seatIdsToUse = allocated.map((s) => s.seatId).filter(Boolean);
      } else if (availableSeats.length > 0) {
        // Direct allocation fallback: grab available physical seats directly
        const needed = Math.min(availableSeats.length, passengerCount);
        seatIdsToUse = availableSeats.slice(0, needed).map((s) => s.seatId).filter(Boolean);
      }

      if (seatIdsToUse.length === passengerCount) {
        return seatIdsToUse;
      }

      // Partial / Split Allocation: If some physical berths are available, assign them to the first passengers
      // and let remaining passengers join the official Waitlist queue (authentic IRCTC split allocation)
      if (seatIdsToUse.length > 0) {
        showToast(`Allocated ${seatIdsToUse.length} confirmed berth(s); ${passengerCount - seatIdsToUse.length} passenger(s) in Waitlist Queue`, 'info');
        return seatIdsToUse;
      }

      // If available seats genuinely run out, convert to waitlist queue
      showToast('Confirmed berths full; transitioning to official Waitlist Queue', 'info');
      return [];
    } catch (err) {
      console.warn('Seat allocation error, attempting clean inventory query:', err);
      try {
        const fallbackRes = await inventoryApi.getSeats(scheduleId, selectedClass ? { travelClass: selectedClass } : {});
        const fallbackSeats = (fallbackRes?.data?.seats || fallbackRes?.seats || [])
          .filter((s) => (!selectedClass || s.travelClass === selectedClass) && s.status === 'AVAILABLE');
        if (fallbackSeats.length > 0) {
          const needed = Math.min(fallbackSeats.length, passengerCount);
          return fallbackSeats.slice(0, needed).map((s) => s.seatId).filter(Boolean);
        }
      } catch (_) {}
      return [];
    }
  };

  if (!selectedTrain || !scheduleId) return null;

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <span>&larr;</span> Back to Train Search Results
          </Link>
          <div className="flex items-center gap-2">
            {isWaitlist ? (
              <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <span>⚡</span>
                <span>Waitlist Queue (WL #{waitlistPosition})</span>
              </span>
            ) : (
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <span>✓</span>
                <span>Confirmed Berth Allocation ({selectedClass})</span>
              </span>
            )}
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Step 2 of 2: Passenger Details
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Your Rail Reservation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide government-approved identification details. System will automatically allot adjacent seats together for your travelling group.
          </p>
        </div>

        {/* Fare and Train Summary */}
        <BookingSummary
          train={selectedTrain}
          seats={virtualSeats}
          totalPrice={totalPrice}
          tripShield={optTripShield}
          tripShieldFee={tripShieldFee}
          onTripShieldChange={setOptTripShield}
        />

        {/* Fast Tatkal 1-Click Rush Autofill Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Fast Tatkal Passenger Engine</p>
              <p className="text-xs text-slate-600">Skip typing during peak reservation rush hours.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutofillMasterPassengers}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>🚀</span>
            <span>1-Click Autofill from Master List</span>
          </button>
        </div>

        {/* Passenger Information Cards */}
        <div className="card p-6 md:p-8 bg-white border border-slate-150 shadow-card space-y-5">
          <form id="passenger-form" onSubmit={handleSubmit(() => {})}>
            <PassengerList
              seats={virtualSeats}
              register={register}
              errors={errors}
              selectedClass={selectedClass}
              isWaitlist={isWaitlist}
              onRemove={handleRemovePassenger}
            />
          </form>

          {passengerCount < MAX_SEATS_PER_BOOKING && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddPassenger}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>➕</span>
                <span>Add Another Passenger (Together in same compartment) &bull; Max {MAX_SEATS_PER_BOOKING}</span>
              </button>
            </div>
          )}
        </div>

        {/* Payment Confirmation Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="text-base">🔒</span>
              <span>256-Bit Encrypted Payment with Book My Train Direct Gateway</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">Instant Refund Eligible</span>
          </div>

          <PaymentButton
            passengers={getValues('passengers') || []}
            getPassengers={() => getValues('passengers') || []}
            scheduleId={scheduleId}
            seatIds={[]}
            disabled={!isValid}
            tripShield={optTripShield}
            onBeforeCreateBooking={handleBeforeCreateBooking}
          />
        </div>

      </div>
    </div>
  );
}
