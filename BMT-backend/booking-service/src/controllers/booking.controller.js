const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/error');
const bookingService = require('../services/booking.service');

exports.createBooking = asyncHandler(async (req, res) => {
     const userId = req.user.id;
     const { scheduleId, seatIds = [], passengers, idempotencyKey, fromStationId, toStationId, fromSeq, toSeq, tripShield } = req.body; // --- SEGMENT BOOKING: added segment params

     if (!scheduleId || !passengers || !Array.isArray(passengers) || passengers.length === 0 || !idempotencyKey) {
          throw new BadRequestError('scheduleId, passengers (non-empty array), and idempotencyKey are required');
     }

     // --- SEGMENT BOOKING: Pass segment params & tripShield to service ---
     const result = await bookingService.createBooking(
          userId, scheduleId, seatIds, passengers, idempotencyKey,
          fromStationId, toStationId, fromSeq, toSeq, tripShield
     );

     res.status(201).json({ success: true, data: result });
});

exports.getBooking = asyncHandler(async (req, res) => {
     const userId = req.user.id;
     const { bookingId } = req.params;

     const result = await bookingService.getBooking(bookingId, userId);

     res.status(200).json({ success: true, data: result });
});

exports.getUserBookings = asyncHandler(async (req, res) => {
     const userId = req.user.id;
     const userRole = req.user.role;
     const { status, page, limit, all, search } = req.query;

     const isAdminAll = (all === 'true' || all === true) || userRole === 'ADMIN';

     const result = await bookingService.getUserBookings(userId, {
          status,
          page: page ? parseInt(page, 10) : 1,
          limit: limit ? parseInt(limit, 10) : 50,
          all: isAdminAll,
          search,
     });

     res.status(200).json({ success: true, data: result });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
     const userId = req.user.id;
     const { bookingId } = req.params;
     const { razorpayPaymentId, razorpaySignature } = req.body;

     if (!razorpayPaymentId || !razorpaySignature) {
          throw new BadRequestError('razorpayPaymentId and razorpaySignature are required');
     }

     const result = await bookingService.verifyPayment(bookingId, userId, razorpayPaymentId, razorpaySignature);

     res.status(200).json({ success: true, data: result });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
     const userId = req.user.id;
     const { bookingId } = req.params;

     const result = await bookingService.cancelBooking(bookingId, userId);

     res.status(200).json({
          success: true,
          message: 'Booking cancelled successfully',
          data: result,
     });
});

exports.getPnrStatus = asyncHandler(async (req, res) => {
     const { pnr } = req.params;
     const result = await bookingService.getPnrStatus(pnr);
     res.status(200).json({ success: true, data: result });
});

exports.getScheduleWaitlist = asyncHandler(async (req, res) => {
     const { scheduleId } = req.params;
     const result = await bookingService.getScheduleWaitlist(scheduleId);
     res.status(200).json({ success: true, data: result });
});


