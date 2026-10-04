import { useState } from 'react';
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
  const departureFormatted = formatTime(departureRaw) || '—';
  const arrivalFormatted = formatTime(arrivalRaw) || '—';

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
                    {activePrediction.className} · {activePrediction.statusText}
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
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
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
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase shrink-0">
                ? Vande Bharat
              </span>
            )}
            {isRajdhani && (
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase shrink-0">
                ?? Rajdhani
              </span>
            )}
            {isShatabdi && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase shrink-0">
                ? Shatabdi
              </span>
            )}
            {quota && quota !== 'GN' && (
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shrink-0">
                <span>?</span>
                <span>{quota === 'TQ' ? 'Tatkal' : quota === 'PT' ? 'Prem. Tatkal' : quota === 'LD' ? 'Ladies' : 'Senior'}</span>
              </span>
            )}
          </div>

          <div className="mt-1.5">
            {train.runsOnSelectedDate === false ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                <span>??</span>
                <span>Not on date · Runs: {train.runsOn}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                <span>??</span>
                <span>Runs: {train.runsOn || 'Daily'}</span>
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
              className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full mb-1 transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
              title="View stops"
            >
              <span>?</span>
              <span>{tripDuration || (stopCount > 0 ? `${stopCount} Stops` : 'Direct')}</span>
              <span>{showRoute ? '?' : '?'}</span>
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
              className="text-[9px] sm:text-[10px] text-emerald-700 hover:text-emerald-800 font-bold mt-0.5 cursor-pointer underline decoration-dotted whitespace-nowrap"
            >
              {showRoute ? 'Hide ?' : 'Stops ?'}
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

        {/* ROW 3: Coach Classes + Button */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 pt-3 border-t border-slate-100">

          {/* Classes */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Coach Classes &amp; AI Forecast
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                ? AI
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {Object.entries(seatSummary).filter(([k]) => k !== 'total').length > 0 ? (
                Object.entries(seatSummary).filter(([k]) => k !== 'total').map(([type, count]) => {
                  const wlSeed = ((parseInt(train.trainNumber || '12001', 10) + type.charCodeAt(0)) % 25) + 1;
                  const statusStr = count > 0 ? `AVL ${count}` : `WL ${wlSeed}`;
                  const pred = predictWaitlist(train.trainNumber, type, statusStr);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivePrediction({ ...pred, className: formatSeatType(type) })}
                      title="Click for AI Forecast"
                      className="flex flex-col items-center bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm rounded-xl px-2 py-1.5 transition-all cursor-pointer w-full"
                    >
                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        <span className="text-xs font-extrabold text-slate-800 leading-tight">
                          {formatSeatType(type)}
                        </span>
                        <span className={`text-[11px] font-black leading-tight ${count > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {statusStr}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black mt-0.5 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${
                        pred.probability >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        pred.probability >= 55 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        <span>?</span>
                        <span>{pred.probability}% {pred.level === 'CONFIRMED' ? 'CNF' : 'Chance'}</span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <span className="col-span-2 text-xs text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1">
                  General / Chair Car Available
                </span>
              )}
            </div>
          </div>

          {/* Button */}
          <div className="sm:w-36 md:w-40 shrink-0">
            {schedule && schedule.status !== 'CANCELLED' ? (
              <Button
                onClick={handleCheckAvailability}
                className="w-full py-3 sm:py-2.5 shadow-md shadow-emerald-500/20 font-bold"
              >
                Select Seats &rarr;
              </Button>
            ) : (
              <span className="inline-block text-center w-full py-2.5 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl">
                {schedule?.status === 'CANCELLED' ? 'Train Cancelled' : 'No Schedule'}
              </span>
            )}
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
                  {segmentRoute.origin?.stationName} ? {segmentRoute.destination?.stationName}
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
              <span>?</span>
              <span className="hidden xs:inline">Hide</span>
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
                    <span>?</span><span>Halt: {stop.halt || '2 min'}</span>
                  </span>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">{formatTime(stop.arrivalTime)}</p>
                  <p className="text-xs font-bold text-slate-600">{formatTime(stop.departureTime)}</p>
                  <p className="text-[10px] text-slate-400">{stop.platform} · {stop.distance}km</p>
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
                  <td className="py-3 px-4 text-slate-400 font-semibold">— (Source)</td>
                  <td className="py-3 px-4 font-black text-emerald-800 text-sm">{formatTime(segmentRoute.origin?.departureTime)}</td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">—</td>
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
                          <span>?</span><span>{stop.halt || '2 min'}</span>
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
                  <td className="py-3 px-4 text-slate-400 font-semibold">— (Terminates)</td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">—</td>
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

