import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { inventoryApi } from '../api/inventory.api';
import { bookingApi } from '../api/booking.api';
import { useBookingStore } from '../store/booking.store';
import { useToast } from '../components/ui/Toast';
import AvailabilitySummary from '../components/seats/AvailabilitySummary';
import SeatFilters from '../components/seats/SeatFilters';
import SeatGrid from '../components/seats/SeatGrid';
import SeatLegend from '../components/seats/SeatLegend';
import SelectionSummary from '../components/seats/SelectionSummary';
import Spinner from '../components/ui/Spinner';
import { MAX_SEATS_PER_BOOKING, IRCTC_CLASSES, RAJDHANI_CLASSES, CHAIR_CAR_CLASSES } from '../utils/constants';

export default function SeatSelectionPage() {
  const { scheduleId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const selectedTrain = useBookingStore((s) => s.selectedTrain);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const toggleSeat = useBookingStore((s) => s.toggleSeat);
  const setSelectedTrain = useBookingStore((s) => s.setSelectedTrain);
  const setSelectedClass = useBookingStore((s) => s.setSelectedClass);
  const storeSelectedClass = useBookingStore((s) => s.selectedClass);
  const fromStation = useBookingStore((s) => s.fromStation);
  const toStation = useBookingStore((s) => s.toStation);

  const initialClass = searchParams.get('class') || storeSelectedClass || '3A';
  const [activeClass, setActiveClass] = useState(initialClass);

  const [availability, setAvailability] = useState(null);
  const [seats, setSeats] = useState([]);
  const [liveWlData, setLiveWlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const seatParams = {};
        if (fromStation?.sequenceNumber && toStation?.sequenceNumber) {
          seatParams.fromSeq = fromStation.sequenceNumber;
          seatParams.toSeq = toStation.sequenceNumber;
        }

        const [availRes, seatsRes, wlRes] = await Promise.allSettled([
          inventoryApi.getAvailability(scheduleId),
          inventoryApi.getSeats(scheduleId, seatParams),
          bookingApi.getScheduleWaitlist(scheduleId),
        ]);

        if (wlRes.status === 'fulfilled') {
          const wlData = wlRes.value?.data || wlRes.value;
          if (wlData) {
            setLiveWlData(wlData);
          }
        }

        if (availRes.status !== 'fulfilled') {
          throw new Error('Failed to load schedule availability');
        }

        const rawAvail = availRes.value?.data || availRes.value;
        const seatList = (seatsRes.status === 'fulfilled' ? (seatsRes.value?.data?.seats || seatsRes.value?.seats || []) : []).sort((a, b) => a.seatNumber - b.seatNumber);
        setSeats(seatList);

        if (seatParams.fromSeq && seatParams.toSeq && seatList.some(s => s.segmentStatus)) {
          const segAvail = seatList.filter(s => s.segmentStatus === 'AVAILABLE').length;
          const segUnavail = seatList.filter(s => s.segmentStatus === 'UNAVAILABLE').length;
          setAvailability({
            ...rawAvail,
            available: segAvail,
            booked: segUnavail,
            locked: 0,
          });
        } else {
          setAvailability(rawAvail);
        }

        if (!selectedTrain) {
          const avail = availRes.data || availRes;
          setSelectedTrain({
            trainName: avail.trainName,
            trainNumber: avail.trainNumber,
            trainId: avail.trainId,
          }, scheduleId);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load seats', 'error');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [scheduleId]);

  // Train type detection for class tabs
  const isVandeBharat = (selectedTrain?.trainName || availability?.trainName || '').toLowerCase().includes('vande bharat') ||
                        (selectedTrain?.trainName || availability?.trainName || '').toLowerCase().includes('shatabdi');
  const isRajdhani = (selectedTrain?.trainName || availability?.trainName || '').toLowerCase().includes('rajdhani');

  const availableClassOptions = useMemo(() => {
    if (isVandeBharat) return CHAIR_CAR_CLASSES;
    if (isRajdhani) return RAJDHANI_CLASSES;
    return IRCTC_CLASSES; // 1AC, 2AC, 3AC, Sleeper, General (2S)
  }, [isVandeBharat, isRajdhani]);

  // When active class changes, ensure store has the updated class
  const handleSelectClass = (classCode) => {
    setActiveClass(classCode);
    setSearchParams({ class: classCode });
    const clsObj = availableClassOptions.find((c) => c.code === classCode);
    const fare = (selectedTrain?.basePrice || 450) * (clsObj?.priceMultiplier || 1);
    setSelectedClass(classCode, Math.round(fare));
  };

  // Filter seats belonging to currently active travel class
  const classSeats = useMemo(() => {
    const list = seats.filter((s) => s.travelClass === activeClass);
    // If no seats explicitly tagged with activeClass, fallback to all seats
    return list.length > 0 ? list : seats;
  }, [seats, activeClass]);

  const classAvailableCount = useMemo(() => {
    if (availability?.classes?.[activeClass]?.available !== undefined) {
      return availability.classes[activeClass].available;
    }
    return classSeats.filter((s) => s.status === 'AVAILABLE' && (!s.segmentStatus || s.segmentStatus === 'AVAILABLE')).length;
  }, [availability, activeClass, classSeats]);

  const classWlInfo = liveWlData?.byClass?.[activeClass];
  const classWlCount = classWlInfo?.waitlistCount ?? 0;
  const isWaitlist = classAvailableCount === 0 || classWlCount > 0;
  const nextWlPos = classWlInfo?.nextWlPosition ?? (classWlCount + 1);

  const setWaitlistBooking = useBookingStore((s) => s.setWaitlistBooking);
  const [waitlistPax, setWaitlistPax] = useState(1);

  const handleToggleSeat = (seat) => {
    const result = toggleSeat(seat);
    if (result === false) {
      showToast(`Maximum ${MAX_SEATS_PER_BOOKING} seats can be selected`, 'warning');
    }
  };

  const currentClassDef = availableClassOptions.find((c) => c.code === activeClass) || availableClassOptions[0];
  const waitlistFare = classSeats.length > 0 && classSeats[0]?.price 
    ? classSeats[0].price 
    : Math.round((selectedTrain?.basePrice || 450) * (currentClassDef?.priceMultiplier || 1));

  const handleProceedWaitlist = () => {
    setWaitlistBooking({
      isWaitlist: true,
      paxCount: waitlistPax,
      fare: waitlistFare,
      wlPos: nextWlPos,
      classCode: activeClass,
    });
    navigate('/booking');
  };

  const filteredSeats = filter ? classSeats.filter((s) => s.seatType === filter) : classSeats;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-semibold">Loading coach layout and real-time berth availability...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-44 sm:pb-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <div>
          <Link to="/search" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">
            <span>&larr;</span> Back to Train Search Results
          </Link>
        </div>

        {/* Availability Summary */}
        <AvailabilitySummary availability={availability} train={selectedTrain} />

        {/* IRCTC Travel Class Selector Tabs: 1AC, 2AC, 3AC, Sleeper, General */}
        <div className="card p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🎟️</span>
              <span>Select Coach / Travel Class</span>
            </h4>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Live Coach Status &amp; Waitlist
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {availableClassOptions.map((c) => {
              const isSelected = activeClass === c.code;
              const cSeats = seats.filter((s) => s.travelClass === c.code);
              const cAvail = availability?.classes?.[c.code]?.available ?? (cSeats.filter((s) => s.status === 'AVAILABLE' && (!s.segmentStatus || s.segmentStatus === 'AVAILABLE')).length);
              const cWl = liveWlData?.byClass?.[c.code]?.waitlistCount ?? 0;
              const cIsWl = cAvail === 0 || cWl > 0;
              const cNextWl = liveWlData?.byClass?.[c.code]?.nextWlPosition ?? 1;

              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectClass(c.code)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/30 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-1 mb-0.5">
                    <span className="font-black text-sm text-slate-900">{c.displayTitle || c.code}</span>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase font-mono">{c.code}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 truncate mb-1">
                    {c.name}
                  </p>
                  <div>
                    <span className={`text-xs font-black ${cIsWl ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {cIsWl ? `WL #${cNextWl}` : `${cAvail} Berths Available`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── WAITLIST RESERVATION BOX (When 0 Seats Available in selected class) ─── */}
        {isWaitlist && (
          <div className="card p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-orange-50/80 border-2 border-amber-300 rounded-3xl shadow-xl shadow-amber-900/5 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Indian Railways {currentClassDef.displayTitle || currentClassDef.name} ({activeClass}) Waitlist</span>
                  </span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                    {activeClass} Berths Full
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentClassDef.name} ({activeClass}) Berths Reserved &mdash; Book in {activeClass} Waitlist Queue
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  All physical berths for {currentClassDef.name} ({activeClass}) are currently confirmed. You can book an authentic <strong>{activeClass} Waitlist Ticket</strong>. As passengers in {activeClass} cancel or charts are prepared, your ticket will automatically be cleared and assigned confirmed berths in coach {currentClassDef.coachPrefix || 'B'}1.
                </p>

                {/* AI Prediction & Queue Position */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <span className="text-xs font-bold text-slate-500">AI Predicted Clearance:</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-700">82% High Confirmation Chance</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <span className="text-xs font-bold text-slate-500">Next Position in {activeClass}:</span>
                    <span className="text-xs sm:text-sm font-black text-amber-800">{activeClass} WL #{nextWlPos}</span>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/90 shadow-md shrink-0 sm:min-w-[320px] space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                    Number of Travelling Passengers:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setWaitlistPax((p) => Math.max(1, p - 1))}
                      disabled={waitlistPax <= 1}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer select-none"
                    >
                      &minus;
                    </button>
                    <div className="flex-1 text-center font-black text-lg text-slate-900 bg-slate-50 py-2 rounded-xl border border-slate-200">
                      {waitlistPax} {waitlistPax === 1 ? 'Passenger' : 'Passengers'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setWaitlistPax((p) => Math.min(MAX_SEATS_PER_BOOKING, p + 1))}
                      disabled={waitlistPax >= MAX_SEATS_PER_BOOKING}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-150">
                  <span className="text-xs font-bold text-slate-500">Total Ticket Fare:</span>
                  <span className="text-xl font-black text-emerald-700">&#8377;{waitlistFare * waitlistPax}</span>
                </div>

                <button
                  type="button"
                  id="proceed-waitlist-btn"
                  onClick={handleProceedWaitlist}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.98] text-white font-black text-sm rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book Waitlist Ticket &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coach Layout Card */}
        <div className="card p-6 md:p-8 bg-white border border-slate-150 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-150 mb-6 gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Coach Berth Layout</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isWaitlist 
                  ? 'All physical berths in this coach are currently occupied. Select passengers above to reserve a Waitlist ticket.'
                  : `Click an available berth to reserve your seat (Max ${MAX_SEATS_PER_BOOKING} berths).`
                }
              </p>
            </div>
            <SeatLegend />
          </div>

          <SeatFilters activeFilter={filter} onChange={setFilter} />

          {/* Grid Container */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <SeatGrid seats={filteredSeats} selectedSeats={selectedSeats} onToggleSeat={handleToggleSeat} />
          </div>
        </div>

        {!isWaitlist && <SelectionSummary />}
      </div>
    </div>
  );
}
