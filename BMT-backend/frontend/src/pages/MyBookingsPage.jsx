import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../api/booking.api';
import BookingCard from '../components/bookings/BookingCard';
import BookingFilters from '../components/bookings/BookingFilters';
import CancellationModal from '../components/bookings/CancellationModal';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCancelBooking, setActiveCancelBooking] = useState(null);
  const showToast = useToast();

  const fetchBookings = async (status, page) => {
    setLoading(true);
    try {
      const res = await bookingApi.list(status || undefined, page, 10);
      const data = res.data || res;
      setBookings(data.bookings || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      showToast(err.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(statusFilter, 1);
  }, [statusFilter]);

  const handlePageChange = (page) => {
    fetchBookings(statusFilter, page);
  };

  const handleCancellationSuccess = (bookingId, netRefund, refundRef) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CANCELLED',
              refundAmount: netRefund,
              refundRef: refundRef,
            }
          : b
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Train Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review active itineraries, check instant refund status, or cancel tickets with 1 click.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all"
          >
            <span>+</span> Book New Ticket
          </Link>
        </div>

        {/* Filter Pills */}
        <BookingFilters active={statusFilter} onChange={(v) => setStatusFilter(v)} />

        {/* Cancellation Modal */}
        {activeCancelBooking && (
          <CancellationModal
            booking={activeCancelBooking}
            onClose={() => setActiveCancelBooking(null)}
            onSuccess={handleCancellationSuccess}
          />
        )}

        {/* Content Listing */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-400 font-semibold">Loading your travel history...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center shadow-card space-y-4">
            <span className="text-4xl inline-block">🎫</span>
            <EmptyState
              title="No bookings found"
              message={statusFilter ? 'No bookings match this filter criteria.' : 'You have not booked any train tickets yet. Start exploring express routes today!'}
            />
            <div className="pt-2">
              <Link
                to="/search"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors inline-block"
              >
                Search Trains &amp; Fares
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            <div className="space-y-3">
              {bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancel={(bookingToCancel) => setActiveCancelBooking(bookingToCancel)}
                />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      </div>
    </div>
  );
}
