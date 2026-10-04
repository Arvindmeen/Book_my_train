const express = require('express');
const { getUserContext } = require('../middlewares/getUserContext.middleware');
const {
     createBooking,
     getBooking,
     getUserBookings,
     cancelBooking,
     verifyPayment,
     getPnrStatus,
} = require('../controllers/booking.controller');

const router = express.Router();

// Public PNR verification & status tracking
router.get('/bookings/pnr/:pnr', getPnrStatus);

// All other booking routes require authentication (user context from gateway)
router.post('/bookings', getUserContext, createBooking);
router.get('/bookings', getUserContext, getUserBookings);
router.get('/bookings/:bookingId', getUserContext, getBooking);
router.post('/bookings/:bookingId/verify-payment', getUserContext, verifyPayment);
router.post('/bookings/:bookingId/cancel', getUserContext, cancelBooking);

module.exports = router;
