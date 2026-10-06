import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/booking.store';
import { useSearchStore } from '../../store/search.store';
import { useAuthStore } from '../../store/auth.store';
import { formatSeatType, formatTrainName, formatTime, calculateDurationFromDistance } from '../../utils/format';
import { predictWaitlist } from '../../utils/aiPrediction';
import { getTrainSegmentRoute } from '../../utils/trainRoutes';
import Button from '../ui/Button';

export default function TrainCard({ train }) {
  const navigate = useNavigate();
  const setSelectedTrain = useBookingStore((s) => s.setSelectedTrain);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const quota = useSearchStore((s) => s.quota);

  const [activePrediction, setActivePrediction] = useState(null);
  const [showRoute, setShowRoute] = useState(false);

  const cleanName = formatTrainName(train.trainName);
  const segmentRoute = getTrainSegmentRoute(train);
  const intermediateStops = segmentRoute.intermediateStops || [];
  const stopCount = intermediateStops.length;

  const departureRaw = train.from?.departure || '';
  const arrivalRaw = train.to?.arrival || '';
  const segmentDistanceKm = segmentRoute.segmentDistanceKm || null;
  const tripDuration = calculateDurationFromDistance(segmentDistanceKm);
  const departureFormatted = formatTime(departureRaw) || '�';
  const arrivalFormatted = formatTime(arrivalRaw) || '�';

  const schedule = train.schedule;
  const seatSummary = train.seatSummary || {};

  const handleCheckAvailability = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/seats/${schedule.scheduleId}`)}`);
      return;
    }
    setSelectedTrain(train, schedule.scheduleId);
    navigate(`/seats/${schedule.scheduleId}`);
  };

  const isVandeBharat = train.trainName?.toLowerCase().includes('vande bharat');
  const isRajdhani = train.trainName?.toLowerCase().includes('rajdhani');
  const isShatabdi = train.trainName?.toLowerCase().includes('shatabdi');

  const availableCount = schedule?.available ?? 0;
  const bookedCount = schedule?.booked ?? 0;
  const totalSeats = train.totalSeats || 64;
  const isWaitlist = availableCount === 0;
  const dynamicWlPos = bookedCount > totalSeats ? (bookedCount - totalSeats + 1) : 1;

  // Base fare determination
  const baseFare = train.basePrice || train.schedule?.basePrice || (train.seats?.[0]?.price) || 450;

  // Authentic IRCTC Classes determination
  const availableClasses = useMemo(() => {
    let classList = [];
    if (isVandeBharat || isShatabdi) {
      classList = [
        { code: 'CC', name: 'AC Chair Car', mult: 1.0 },
        { code: 'EC', name: 'Exec Chair Car', mult: 1.85 },
      ];
    } else if (isRajdhani) {
      classList = [
        { code: '3A', name: 'AC 3 Tier', mult: 1.0 },
        { code: '2A', name: 'AC 2 Tier', mult: 1.45 },
        { code: '1A', name: 'AC First Class', mult: 2.2 },
      ];
    } else {
      classList = [
        { code: 'SL', name: 'Sleeper', mult: 0.65 },
        { code: '3A', name: 'AC 3 Tier', mult: 1.0 },
        { code: '2A', name: 'AC 2 Tier', mult: 1.45 },
        { code: '1A', name: 'AC First Class', mult: 2.2 },
        { code: '2S', name: 'Second Sitting', mult: 0.35 },
      ];
    }

    return classList.map((c, idx) => {
      const price = Math.round(baseFare * c.mult);
      const classIsWl = isWaitlist;
      const classWlPos = classIsWl ? Math.max(1, dynamicWlPos + idx) : 1;
      const statusText = classIsWl
        ? `WL ${classWlPos}`
        : `AVAILABLE-${String(availableCount).padStart(4, '0')}`;

      return {
        ...c,
        price,
        isWaitlist: classIsWl,
        wlPos: classWlPos,
        statusText,
      };
    });
  }, [isVandeBharat, isShatabdi, isRajdhani, baseFare, availableCount, isWaitlist, dynamicWlPos]);

  const [selectedClassCode, setSelectedClassCode] = useState(() => {
    return availableClasses[1]?.code || availableClasses[0]?.code || '3A';
  });

  const currentSelectedClass = useMemo(() => {
    return availableClasses.find((c) => c.code === selectedClassCode) || availableClasses[0];
  }, [availableClasses, selectedClassCode]);

  const handleBookNow = (targetClass) => {
    const cls = targetClass || currentSelectedClass;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/booking')}`);
      return;
    }
    if (!schedule?.scheduleId) return;

    setSelectedTrain(
      train,
      schedule.scheduleId,
      cls.code,
      cls.price,
      cls.isWaitlist,
      cls.wlPos
    );
    navigate('/booking');
  };

  return (
    <div className="card border border-slate-200/90 hover:border-emerald-300 hover:shadow-card-hover rounded-2xl bg-white transition-all duration-200 group relative overflow-hidden">

      {/* AI Prediction Modal */}
      {activePrediction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setActivePrediction(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm sm:max-w-md p-5 sm:p-6 space-y-4 text-slate-800 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shrink-0">
                  <img src="/ai_predictor.jpg" alt="AI" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    AI Waitlist Forecast
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-0.5 leading-tight">
                    {activePrediction.className} � {activePrediction.statusText}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePrediction(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm shrink-0 ml-2"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500 uppercase">Clearance Probability</span>
                <span className={`text-xl sm:text-2xl font-black ${
                  activePrediction.probability >= 80 ? 'text-emerald-700' :
                  activePrediction.probability >= 55 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {activePrediction.probability}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    activePrediction.probability >= 80 ? 'bg-emerald-500' :
                    activePrediction.probability >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${activePrediction.probability}%` }}
                />
              </div>
              <p className="text-[11px] font-semibold text-slate-600">{activePrediction.clearanceTrend}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Clearance Indicators:</p>
              <ul className="space-y-1 text-slate-600">
                {activePrediction.factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold mt-0.5">�</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
              <p className="font-bold text-emerald-950 mb-0.5">Traveler Advisory:</p>
              <p className="text-[11px] leading-relaxed text-slate-600">{activePrediction.recommendation}</p>
            </div>

            <Button
              onClick={() => { setActivePrediction(null); handleCheckAvailability(); }}
              className="w-full py-2.5 font-bold shadow-md shadow-emerald-500/20"
            >
              Proceed to Seat Selection &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 sm:p-5 md:p-6">

        {/* ROW 1: Train Identity */}
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              {cleanName}
            </h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
              #{train.trainNumber}
            </span>
            {isVandeBharat && (
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase shrink-0 inline-flex items-center gap-1">
                <span>⚡</span> Vande Bharat
              </span>
            )}
            {isRajdhani && (
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase shrink-0 inline-flex items-center gap-1">
                <span>★</span> Rajdhani
              </span>
            )}
            {isShatabdi && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase shrink-0 inline-flex items-center gap-1">
                <span>⚡</span> Shatabdi
              </span>
            )}
            {quota && quota !== 'GN' && (
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shrink-0">
                <span>⚡</span><span>{quota === 'TQ' ? 'Tatkal' : quota === 'PT' ? 'Prem. Tatkal' : quota === 'LD' ? 'Ladies' : 'Senior'}</span>
              </span>
            )}
          </div>

          <div className="mt-1.5">
            {train.runsOnSelectedDate === false ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span><span>Not on selected date &bull; Runs: {train.runsOn}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span><span>Runs: {train.runsOn || 'Daily'}</span>
              </span>
            )}
          </div>
        </div>

        {/* ROW 2: Route Timeline */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-50/70 rounded-xl px-3 py-3 border border-slate-150 mb-4">

          {/* Origin */}
          <div className="text-left shrink-0 w-[76px] sm:w-[100px]">
            <p className="text-base sm:text-2xl font-black text-slate-900 leading-none tabular-nums">
              {departureFormatted}
            </p>
            <p className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1 line-clamp-1">
              {train.from?.name || 'Origin'}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Depart</span>
          </div>

          {/* Centre track */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <button
              type="button"
              onClick={() => setShowRoute(!showRoute)}
              className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full mb-1 transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
              title="View stops & route"
            >
              <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
              </svg>
              <span>{tripDuration || (stopCount > 0 ? `${stopCount} Stops` : 'Direct')}</span>
              <svg className={`w-2.5 h-2.5 text-emerald-700 transition-transform duration-200 shrink-0 ${showRoute ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              onClick={() => setShowRoute(!showRoute)}
              className="w-full flex items-center cursor-pointer group/track py-1"
            >
              <div className="h-0.5 sm:h-1 bg-slate-200 group-hover/track:bg-emerald-400 rounded-full flex-1 transition-colors" />
              <span className="px-1.5 sm:px-2 transform group-hover/track:scale-110 transition-transform">
                <img src="/navbar-logo.jpg" alt="Train" className="w-4 h-4 sm:w-5 sm:h-5 rounded-md object-contain" />
              </span>
              <div className="h-0.5 sm:h-1 bg-slate-200 group-hover/track:bg-emerald-400 rounded-full flex-1 transition-colors" />
            </div>

            <button
              type="button"
              onClick={() => setShowRoute(!showRoute)}
              className="text-[9px] sm:text-[10px] text-emerald-700 hover:text-emerald-800 font-bold mt-0.5 cursor-pointer underline decoration-dotted whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>{showRoute ? 'Hide Stops' : (stopCount > 0 ? `${stopCount} Stops` : 'View Stops')}</span>
              <svg className={`w-2.5 h-2.5 transition-transform duration-200 shrink-0 ${showRoute ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Destination */}
          <div className="text-right shrink-0 w-[76px] sm:w-[100px]">
            <p className="text-base sm:text-2xl font-black text-slate-900 leading-none tabular-nums">
              {arrivalFormatted}
            </p>
            <p className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1 line-clamp-1">
              {train.to?.name || 'Destination'}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Arrive</span>
          </div>
        </div>

        {/* ROW 3: Authentic IRCTC Travel Classes (SL, 3A, 2A, 1A, 2S) Matching Image 3 */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎟️</span>
              <span>Select Travel Class</span>
            </p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <span>⚡</span> Live IRCTC Seat Availability
            </span>
          </div>

          {/* IRCTC Class Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {availableClasses.map((cls) => {
              const isSelected = selectedClassCode === cls.code;
              return (
                <button
                  key={cls.code}
                  type="button"
                  onClick={() => setSelectedClassCode(cls.code)}
                  className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/40 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-1 mb-1.5">
                    <span className="font-black text-sm text-slate-900 tracking-tight">{cls.code}</span>
                    <span className="font-extrabold text-xs text-slate-700 font-mono">&#8377; {cls.price}</span>
                  </div>

                  <div>
                    <span
                      className={`block font-black text-xs tracking-tight ${
                        cls.isWaitlist ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {cls.statusText}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* IRCTC Advisory and Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 bg-slate-50/60 p-3 rounded-xl border border-slate-150">
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <span>ℹ️</span>
              <span>Please check NTES website or NTES app for actual time before boarding</span>
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowRoute(!showRoute)}
                className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                OTHER DATES
              </button>

              {schedule && schedule.status !== 'CANCELLED' ? (
                <button
                  type="button"
                  id={`book-now-${train.trainNumber}`}
                  onClick={() => handleBookNow(currentSelectedClass)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    currentSelectedClass.isWaitlist
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/30'
                      : 'bg-gradient-to-r from-[#FB792B] to-[#F15A24] hover:from-[#E6691E] hover:to-[#D94F1C] shadow-orange-500/30'
                  }`}
                >
                  <span>{currentSelectedClass.isWaitlist ? 'Book Waitlist \u2192' : 'Book Now \u2192'}</span>
                </button>
              ) : (
                <span className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold">
                  {schedule?.status === 'CANCELLED' ? 'Train Cancelled' : 'Not Scheduled'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Route */}
      {showRoute && (
        <div className="border-t border-slate-200/90">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-gradient-to-r from-emerald-50 via-slate-50 to-teal-50 border-b border-emerald-100">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white px-2.5 py-0.5 rounded-full shrink-0">
                  Route Halts
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {segmentRoute.origin?.stationName} &rarr; {segmentRoute.destination?.stationName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {stopCount} intermediate stop{stopCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRoute(false)}
              className="shrink-0 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg><span className="hidden xs:inline">Hide</span>
            </button>
          </div>

          {/* Mobile card list */}
          <div className="block sm:hidden divide-y divide-slate-100 px-4 py-1">
            <div className="py-3 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs inline-flex items-center justify-center shrink-0 mt-0.5">S</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-extrabold text-slate-900 text-sm">{segmentRoute.origin?.stationName}</p>
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">{segmentRoute.origin?.stationCode}</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">Origin</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-emerald-800">{formatTime(segmentRoute.origin?.departureTime)}</p>
                <p className="text-[10px] text-slate-400">{segmentRoute.origin?.platform || 'PF 1'}</p>
              </div>
            </div>

            {intermediateStops.length > 0 ? intermediateStops.map((stop, i) => (
              <div key={i} className="py-3 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] inline-flex items-center justify-center border border-slate-200 shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-slate-900 text-sm">{stop.stationName}</p>
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{stop.stationCode}</span>
                  </div>
                  {stop.city && <p className="text-[10px] text-slate-400">{stop.city}</p>}
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full mt-1">
                    <svg className="w-2.5 h-2.5 text-amber-700 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" /></svg><span>Halt: {stop.halt || '2 min'}</span>
                  </span>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">{formatTime(stop.arrivalTime)}</p>
                  <p className="text-xs font-bold text-slate-600">{formatTime(stop.departureTime)}</p>
                  <p className="text-[10px] text-slate-400">{stop.platform || 'PF 1'} &bull; {stop.distance} km</p>
                </div>
              </div>
            )) : (
              <p className="py-4 text-center text-xs text-slate-500">Direct non-stop service</p>
            )}

            <div className="py-3 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs inline-flex items-center justify-center shrink-0 mt-0.5">D</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-extrabold text-slate-900 text-sm">{segmentRoute.destination?.stationName}</p>
                  <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200">{segmentRoute.destination?.stationCode}</span>
                </div>
                <p className="text-[10px] font-bold text-teal-700 uppercase mt-0.5">Terminus</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-teal-800">{formatTime(segmentRoute.destination?.arrivalTime)}</p>
                <p className="text-[10px] text-slate-400">{segmentRoute.destination?.platform || 'PF 5'}</p>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4 text-center w-12">#</th>
                  <th className="py-2.5 px-4">Station &amp; Code</th>
                  <th className="py-2.5 px-4">Arrival</th>
                  <th className="py-2.5 px-4">Departure</th>
                  <th className="py-2.5 px-4">Halt</th>
                  <th className="py-2.5 px-4">Distance</th>
                  <th className="py-2.5 px-4 text-center">Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="bg-emerald-50/60 hover:bg-emerald-50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs inline-flex items-center justify-center">S</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900 text-sm">{segmentRoute.origin?.stationName}</p>
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">{segmentRoute.origin?.stationCode}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Starting Station (Origin)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">-</td>
                  <td className="py-3 px-4 font-black text-emerald-800 text-sm">{formatTime(segmentRoute.origin?.departureTime)}</td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">-</td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">0 km</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{segmentRoute.origin?.platform || 'PF 1'}</td>
                </tr>

                {intermediateStops.length > 0 ? (
                  intermediateStops.map((stop, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] inline-flex items-center justify-center border border-slate-200">{i + 1}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{stop.stationName}</p>
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{stop.stationCode}</span>
                        </div>
                        {stop.city && <p className="text-[10px] text-slate-400">{stop.city}</p>}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{formatTime(stop.arrivalTime)}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{formatTime(stop.departureTime)}</td>
                      <td className="py-3 px-4">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <svg className="w-2.5 h-2.5 text-amber-700 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" /></svg><span>{stop.halt || '2 min'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{stop.distance} km</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-600">{stop.platform}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 font-medium">
                      Direct non-stop service between {segmentRoute.origin?.stationName} and {segmentRoute.destination?.stationName}.
                    </td>
                  </tr>
                )}

                <tr className="bg-teal-50/60 hover:bg-teal-50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs inline-flex items-center justify-center">D</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900 text-sm">{segmentRoute.destination?.stationName}</p>
                      <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200">{segmentRoute.destination?.stationCode}</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">Destination (Terminus)</span>
                  </td>
                  <td className="py-3 px-4 font-black text-teal-800 text-sm">{formatTime(segmentRoute.destination?.arrivalTime)}</td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">-</td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">-</td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">{segmentRoute.destination?.distance} km</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{segmentRoute.destination?.platform || 'PF 5'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

