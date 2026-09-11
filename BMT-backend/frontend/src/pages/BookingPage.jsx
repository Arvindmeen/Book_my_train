import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useBookingStore } from '../store/booking.store';
import { useSearchStore } from '../store/search.store';
import { useAuthStore } from '../store/auth.store';
import BookingSummary from '../components/booking/BookingSummary';
import PassengerList from '../components/booking/PassengerList';
import PaymentButton from '../components/booking/PaymentButton';
import { useToast } from '../components/ui/Toast';

export default function BookingPage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const selectedTrain = useBookingStore((s) => s.selectedTrain);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const scheduleId = useBookingStore((s) => s.scheduleId);
  const quota = useSearchStore((s) => s.quota);
  const user = useAuthStore((s) => s.user);

  const [optTripShield, setOptTripShield] = useState(true);

  const seats = useMemo(() => Array.from(selectedSeats.values()), [selectedSeats]);
  const seatIds = useMemo(() => seats.map((s) => s.seatId), [seats]);
  const totalPrice = useMemo(() => seats.reduce((sum, s) => sum + (s.price || 0), 0), [seats]);
  const tripShieldFee = seats.length * 49;

  const { register, handleSubmit, setValue, formState: { errors, isValid }, getValues } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (seats.length === 0) {
      navigate('/search');
    }
  }, [seats.length, navigate]);

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

      seats.forEach((seat, idx) => {
        const p = masterList[idx] || masterList[0];
        setValue(`passengers.${idx}.name`, p.name, { shouldValidate: true });
        setValue(`passengers.${idx}.age`, Number(p.age) || 25, { shouldValidate: true });
        setValue(`passengers.${idx}.gender`, p.gender === 'FEMALE' ? 'FEMALE' : 'MALE', { shouldValidate: true });
      });

      showToast('⚡ Fast Tatkal Autofill: Loaded from Master Passenger List in 24ms!', 'success');
    } catch {
      showToast('Failed to load master passengers', 'error');
    }
  };

  if (seats.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <Link
            to={scheduleId ? `/seats/${scheduleId}` : '/search'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <span>&larr;</span> Back to Seat Selection
          </Link>
          <div className="flex items-center gap-2">
            {quota === 'TQ' && (
              <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <span>⚡</span>
                <span>Fast Tatkal Mode</span>
              </span>
            )}
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Step 3 of 3: Passenger Details
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Your Reservation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide government-approved identification details for all travelling passengers.
          </p>
        </div>

        {/* Fare and Train Summary */}
        <BookingSummary
          train={selectedTrain}
          seats={seats}
          totalPrice={totalPrice}
          tripShield={optTripShield}
          tripShieldFee={tripShieldFee}
        />

        {/* Fast Tatkal 1-Click Rush Autofill Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Fast Tatkal Passenger Engine</p>
              <p className="text-xs text-slate-600">Skip typing during high-load 10 AM / 11 AM Tatkal rush.</p>
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
        <div className="card p-6 md:p-8 bg-white border border-slate-150 shadow-card">
          <form id="passenger-form" onSubmit={handleSubmit(() => {})}>
            <PassengerList seats={seats} register={register} errors={errors} />
          </form>
        </div>

        {/* Free Cancellation Pass (BMT Trip Shield) Opt-In Card */}
        <div
          onClick={() => setOptTripShield(!optTripShield)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden ${
            optTripShield
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-300 shadow-md ring-1 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 p-1 flex-shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
                <img src="/free_cancellation.jpg" alt="Trip Shield" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Zero Clerkage Deduction
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">₹49 / passenger</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                  Free Cancellation Pass &middot; BMT Trip Shield
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Eliminate all railway clerkage fees. Cancel anytime prior to chart preparation and receive an instant 100% full refund to UPI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="checkbox"
                checked={optTripShield}
                onChange={() => setOptTripShield(!optTripShield)}
                className="w-5 h-5 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700 hidden sm:inline-block">
                {optTripShield ? 'Included' : 'Add Pass'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="text-base">🔒</span>
              <span>256-Bit Encrypted Payment with BooK my Train Direct Gateway</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">Instant Refund Eligible</span>
          </div>

          <PaymentButton
            passengers={getValues('passengers') || []}
            scheduleId={scheduleId}
            seatIds={seatIds}
            disabled={!isValid}
            tripShield={optTripShield}
          />
        </div>

      </div>
    </div>
  );
}
