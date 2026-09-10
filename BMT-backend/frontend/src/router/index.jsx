import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import SearchPage from '../pages/SearchPage';
import PnrPage from '../pages/PnrPage';
import ServicesPage from '../pages/ServicesPage';
import SeatSelectionPage from '../pages/SeatSelectionPage';
import BookingPage from '../pages/BookingPage';
import BookingDetailPage from '../pages/BookingDetailPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPage from '../pages/AdminPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/pnr" element={<PnrPage />} />
        <Route path="/services" element={<ServicesPage />} />

        {/* Regular Authenticated User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/seats/:scheduleId" element={<SeatSelectionPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
        </Route>

        {/* Strictly Protected Administrator Route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
