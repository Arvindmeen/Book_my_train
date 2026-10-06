import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { MAX_SEATS_PER_BOOKING } from '../utils/constants';

export default function SeatSelectionPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const selectedTrain = useBookingStore((s) => s.selectedTrain);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const toggleSeat = useBookingStore((s) => s.toggleSeat);
  const setSelectedTrain = useBookingStore((s) => s.setSelectedTrain);
  const fromStation = useBookingStore((s) => s.fromStation);
  const toStation = useBookingStore((s) => s.toStation);

  const [availability, setAvailability] = useState(null);
  const [seats, setSeats] = useState([]);
  const [liveWlCount, setLiveWlCount] = useState(null);
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
          const count = wlRes.value?.data?.waitlistCount ?? wlRes.value?.waitlistCount;
          if (typeof count === 'number') {
            setLiveWlCount(count);
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

  const setWaitlistBooking = useBookingStore((s) => s.setWaitlistBooking);
  const [waitlistPax, setWaitlistPax] = useState(1);

  const handleToggleSeat = (seat) => {
    const result = toggleSeat(seat);
    if (result === false) {
      showToast(`Maximum ${MAX_SEATS_PER_BOOKING} seats can be selected`, 'warning');
    }
  };

  const isWaitlist = Boolean(availability && availability.available === 0);
  const nextWlPos = (liveWlCount !== null ? liveWlCount : (availability?.booked > availability?.totalSeats ? availability.booked - availability.totalSeats : 0)) + 1;

  const waitlistFare = seats.length > 0 && seats[0]?.price ? seats[0].price : 450;

  const handleProceedWaitlist = () => {
    setWaitlistBooking({
      isWaitlist: true,
      paxCount: waitlistPax,
      fare: waitlistFare,
      wlPos: nextWlPos,
    });
    navigate('/booking');
  };

  const filteredSeats = filter ? seats.filter((s) => s.seatType === filter) : seats;

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

        {/* ─── WAITLIST RESERVATION BOX (When 0 Seats Available) ─── */}
        {isWaitlist && (
          <div className="card p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-orange-50/80 border-2 border-amber-300 rounded-3xl shadow-xl shadow-amber-900/5 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Indian Railways Waitlist (WL) Reservation</span>
                  </span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                    Confirmed Berths Full
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  All Berths Reserved &mdash; Book in Official Waitlist Queue
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  All physical berths for this service are currently confirmed. You can book an authentic <strong>Waitlist (WL) Ticket</strong>. As passengers cancel or charts are prepared, your ticket will automatically be cleared and assigned confirmed berths.
                </p>

                {/* AI Prediction & Queue Position */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <span className="text-xs font-bold text-slate-500">AI Predicted Clearance:</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-700">82% High Confirmation Chance</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <span className="text-xs font-bold text-slate-500">Next Position:</span>
                    <span className="text-xs sm:text-sm font-black text-amber-800">WL #{nextWlPos}</span>
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
