import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryApi } from '../api/inventory.api';
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

        const [availRes, seatsRes] = await Promise.all([
          inventoryApi.getAvailability(scheduleId),
          inventoryApi.getSeats(scheduleId, seatParams),
        ]);
        const rawAvail = availRes.data || availRes;
        const seatList = (seatsRes.data?.seats || seatsRes.seats || []).sort((a, b) => a.seatNumber - b.seatNumber);
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

  const handleToggleSeat = (seat) => {
    const result = toggleSeat(seat);
    if (result === false) {
      showToast(`Maximum ${MAX_SEATS_PER_BOOKING} seats can be selected`, 'warning');
    }
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
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <div>
          <Link to="/search" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">
            <span>&larr;</span> Back to Train Search Results
          </Link>
        </div>

        {/* Availability Summary */}
        <AvailabilitySummary availability={availability} train={selectedTrain} />

        {/* Coach Layout Card */}
        <div className="card p-6 md:p-8 bg-white border border-slate-150 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-150 mb-6 gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Coach Berth Layout</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click an available berth to reserve your seat (Max {MAX_SEATS_PER_BOOKING} berths).</p>
            </div>
            <SeatLegend />
          </div>

          <SeatFilters activeFilter={filter} onChange={setFilter} />

          {/* Grid Container */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <SeatGrid seats={filteredSeats} selectedSeats={selectedSeats} onToggleSeat={handleToggleSeat} />
          </div>
        </div>

        <SelectionSummary />
      </div>
    </div>
  );
}
