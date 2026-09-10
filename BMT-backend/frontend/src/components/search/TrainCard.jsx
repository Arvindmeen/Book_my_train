import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/booking.store';
import { useSearchStore } from '../../store/search.store';
import { useAuthStore } from '../../store/auth.store';
import { formatSeatType } from '../../utils/format';
import { predictWaitlist } from '../../utils/aiPrediction';
import Button from '../ui/Button';

export default function TrainCard({ train }) {
  const navigate = useNavigate();
  const setSelectedTrain = useBookingStore((s) => s.setSelectedTrain);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const quota = useSearchStore((s) => s.quota);

  const [activePrediction, setActivePrediction] = useState(null);

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
            <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {train.trainName}
            </h3>
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
            <span className="text-xs text-slate-400 font-medium ml-auto lg:ml-0">
              Daily Service
            </span>
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
              <span className="text-[10px] font-bold text-slate-500 mb-1">
                Direct Express
              </span>
              <div className="w-full flex items-center">
                <div className="h-1 bg-slate-200 rounded-full flex-1" />
                <span className="px-2 animate-pulse">
                  <img src="/navbar-logo.jpg" alt="Train route" className="w-5 h-5 rounded-md object-contain" />
                </span>
                <div className="h-1 bg-slate-200 rounded-full flex-1" />
              </div>
              <span className="text-[10px] text-emerald-700 font-bold mt-1">
                On-Time Track
              </span>
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
    </div>
  );
}
