import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/booking.store';
import { useSearchStore } from '../../store/search.store';
import { useAuthStore } from '../../store/auth.store';
import { formatSeatType, formatTrainName } from '../../utils/format';
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
    <div className="card p-5 md:p-6 border border-slate-200/90 hover:border-emerald-300 hover:shadow-card-hover rounded-2xl bg-white transition-all duration-200 group relative">
      
      {/* Active AI Prediction Tooltip / Modal */}
      {activePrediction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in-up"
          onClick={() => setActivePrediction(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in text-slate-800 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center">
                  <img src="/ai_predictor.jpg" alt="AI" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    AI Waitlist Forecast
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 mt-0.5">
                    {activePrediction.className} &middot; {activePrediction.statusText}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePrediction(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                &times;
              </button>
            </div>

            {/* Probability Score Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500 uppercase">Clearance Probability</span>
                <span className={`text-2xl font-black ${
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
              <p className="text-[11px] font-semibold text-slate-600 mt-1">
                {activePrediction.clearanceTrend}
              </p>
            </div>

            {/* Factors */}
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Clearance Indicators:</p>
              <ul className="space-y-1 text-slate-600">
                {activePrediction.factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advisory */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-slate-700">
              <p className="font-bold text-emerald-950 mb-0.5">Traveler Advisory:</p>
              <p className="text-[11px] leading-relaxed text-slate-600">{activePrediction.recommendation}</p>
            </div>

            <Button
              onClick={() => {
                setActivePrediction(null);
                handleCheckAvailability();
              }}
              className="w-full py-2.5 font-bold shadow-md shadow-emerald-500/20"
            >
              Proceed to Seat Selection &rarr;
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Section: Train Identity & Route Timeline */}
        <div className="flex-1 space-y-4">
          
          {/* Train Title & Category Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRoute(!showRoute)}
              className="text-left text-lg font-extrabold text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-2 cursor-pointer group/title"
              title="Click to view intermediate stops where train stops"
            >
              <span>{cleanName}</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 group-hover/title:bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                <span>📍</span>
                <span>{showRoute ? 'Hide Route' : `${stopCount} Stops`}</span>
                <span>{showRoute ? '▲' : '▼'}</span>
              </span>
            </button>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              #{train.trainNumber}
            </span>

            {/* Quota Indicator */}
            {quota && quota !== 'GN' && (
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <span>⚡</span>
                <span>{quota === 'TQ' ? 'Tatkal Quota' : quota === 'PT' ? 'Premium Tatkal' : quota === 'LD' ? 'Ladies Quota' : 'Senior Quota'}</span>
              </span>
            )}

            {isVandeBharat && (
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                ⚡ Vande Bharat
              </span>
            )}
            {isRajdhani && (
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase">
                👑 Rajdhani Exp
              </span>
            )}
            {isShatabdi && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                ⭐ Shatabdi Exp
              </span>
            )}
            {train.runsOnSelectedDate === false ? (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full ml-auto lg:ml-0 flex items-center gap-1 shadow-xs">
                <span>⚠️</span>
                <span>Not running on selected date (Runs: {train.runsOn})</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full ml-auto lg:ml-0 flex items-center gap-1 shadow-xs">
                <span className="text-xs">📅</span>
                <span>Runs: {train.runsOn || 'Daily Service'}</span>
              </span>
            )}
          </div>

          {/* Route Departure / Arrival Timeline */}
          <div className="flex items-center gap-3 sm:gap-6 bg-slate-50/70 rounded-xl p-3 sm:p-4 border border-slate-150">
            {/* Origin */}
            <div className="min-w-[90px]">
              <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {train.from?.departure || '06:00'}
              </p>
              <p className="text-xs font-bold text-slate-700 mt-1 truncate">
                {train.from?.name || 'Origin Station'}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Departure</span>
            </div>

            {/* Visual Route Track */}
            <div className="flex-1 flex flex-col items-center px-2">
              <button
                type="button"
                onClick={() => setShowRoute(!showRoute)}
                className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full mb-1 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                title="Click to view intermediate stopping stations"
              >
                <span>📍</span>
                <span>{stopCount > 0 ? `${stopCount} Intermediate Stops` : 'Direct Service'}</span>
                <span>{showRoute ? '▲' : '▼'}</span>
              </button>
              <div
                onClick={() => setShowRoute(!showRoute)}
                className="w-full flex items-center cursor-pointer group/track py-1"
                title="Click to view intermediate stations"
              >
                <div className="h-1 bg-slate-200 group-hover/track:bg-emerald-400 rounded-full flex-1 transition-colors" />
                <span className="px-2 transform group-hover/track:scale-110 transition-transform">
                  <img src="/navbar-logo.jpg" alt="Train route" className="w-5 h-5 rounded-md object-contain" />
                </span>
                <div className="h-1 bg-slate-200 group-hover/track:bg-emerald-400 rounded-full flex-1 transition-colors" />
              </div>
              <button
                type="button"
                onClick={() => setShowRoute(!showRoute)}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold mt-0.5 cursor-pointer underline decoration-dotted"
              >
                {showRoute ? 'Hide Intermediate Stops ▲' : 'View Intermediate Stops ▼'}
              </button>
            </div>

            {/* Destination */}
            <div className="min-w-[90px] text-right">
              <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {train.to?.arrival || '14:00'}
              </p>
              <p className="text-xs font-bold text-slate-700 mt-1 truncate">
                {train.to?.name || 'Destination'}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Arrival</span>
            </div>
          </div>

        </div>

        {/* Right Section: Available Classes with AI Prediction Badges */}
        <div className="lg:w-80 flex flex-col justify-between space-y-4 lg:border-l lg:border-slate-150 lg:pl-6">
          
          {/* Seat Class Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Coach Classes &amp; AI Forecast
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                ✨ AI Predictor
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
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
                      title="Click to view AI Confirmation Forecast"
                      className="flex flex-col items-center bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs rounded-xl px-2.5 py-1.5 transition-all text-left group/pill cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-800">
                          {formatSeatType(type)}
                        </span>
                        <span className={`text-[11px] font-black ${count > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {statusStr}
                        </span>
                      </div>

                      {/* AI Confirmation Probability Tag */}
                      <span className={`text-[9px] font-black mt-0.5 px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                        pred.probability >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        pred.probability >= 55 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        <span>✨</span>
                        <span>{pred.probability}% {pred.level === 'CONFIRMED' ? 'CNF' : 'Chance'}</span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1">
                  General / Chair Car Available
                </span>
              )}
            </div>
          </div>

          {/* Availability Button */}
          <div>
            {schedule && schedule.status !== 'CANCELLED' ? (
              <Button
                onClick={handleCheckAvailability}
                className="w-full py-2.5 shadow-md shadow-emerald-500/20 font-bold"
              >
                Select Seats &rarr;
              </Button>
            ) : (
              <span className="inline-block text-center w-full py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl">
                {schedule?.status === 'CANCELLED' ? 'Train Cancelled' : 'No Active Schedule'}
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Expanded Intermediate Stations & Route Halts */}
      {showRoute && (
        <div className="mt-5 pt-5 border-t border-slate-200/90 space-y-4 animate-scale-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-teal-50/80 border border-emerald-200/80 p-4 rounded-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white px-2.5 py-0.5 rounded-full">
                  Intermediate Halts &amp; Stops
                </span>
                <span className="text-sm font-black text-slate-900">
                  {segmentRoute.origin?.stationName} &rarr; {segmentRoute.destination?.stationName}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Train #{train.trainNumber} stops at <strong>{stopCount} intermediate station{stopCount !== 1 ? 's' : ''}</strong> between origin and destination.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRoute(false)}
              className="self-end sm:self-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>✕</span>
              <span>Hide Stops</span>
            </button>
          </div>

          {/* Route Halts Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4 text-center w-12">#</th>
                  <th className="py-2.5 px-4">Station &amp; Code</th>
                  <th className="py-2.5 px-4">Arrival</th>
                  <th className="py-2.5 px-4">Departure</th>
                  <th className="py-2.5 px-4">Halt Duration</th>
                  <th className="py-2.5 px-4">Distance</th>
                  <th className="py-2.5 px-4 text-center">Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {/* Starting Station */}
                <tr className="bg-emerald-50/60 hover:bg-emerald-50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs inline-flex items-center justify-center">
                      S
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900 text-sm">{segmentRoute.origin?.stationName}</p>
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                        {segmentRoute.origin?.stationCode}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                      Starting Station (Origin)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">— (Source)</td>
                  <td className="py-3 px-4 font-black text-emerald-800 text-sm">{segmentRoute.origin?.departureTime}</td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">—</td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">0 km</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{segmentRoute.origin?.platform || 'PF 1'}</td>
                </tr>

                {/* Intermediate Stations where train stops */}
                {intermediateStops.length > 0 ? (
                  intermediateStops.map((stop, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] inline-flex items-center justify-center border border-slate-200">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{stop.stationName}</p>
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {stop.stationCode}
                          </span>
                        </div>
                        {stop.city && <p className="text-[10px] text-slate-400">{stop.city}</p>}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{stop.arrivalTime}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{stop.departureTime}</td>
                      <td className="py-3 px-4">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span>⏱</span>
                          <span>{stop.halt || '2 mins'}</span>
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

                {/* Destination Station */}
                <tr className="bg-teal-50/60 hover:bg-teal-50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs inline-flex items-center justify-center">
                      D
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900 text-sm">{segmentRoute.destination?.stationName}</p>
                      <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200">
                        {segmentRoute.destination?.stationCode}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">
                      Destination Station (Terminus)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-teal-800 text-sm">{segmentRoute.destination?.arrivalTime}</td>
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
