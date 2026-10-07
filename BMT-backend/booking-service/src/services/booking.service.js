const prisma = require('../config/prisma');
const logger = require('../config/logger');

const cleanTrainName = (name) => String(name || '').replace(/\s*\(Return(?:\s+via\s+[^)]+)?\)/gi, '').replace(/\s*\((?:Return|RETURN)\)/gi, '').trim();
const { config } = require('../config');
const { inventoryClient, extractError: extractInventoryError } = require('./inventoryClient');
const { paymentClient, extractError: extractPaymentError } = require('./paymentClient');
const { userClient } = require('./userClient');
const { stationClient } = require('./stationClient');
const { acquireSeatLocks, releaseSeatLocks, forceReleaseSeatLocks } = require('../utils/distributedLock');
const saga = require('./saga.service');
const bookingProducer = require('../kafka/producer/booking.producer');
const { BadRequestError, NotFoundError, ConflictError, StaleStateError } = require('../utils/error');

// ─── Optimistic Lock Helper (CAS — Compare-And-Swap) ────────────────────────
// Atomically updates booking status ONLY IF the version hasn't changed since read.
// Returns the updated booking or throws StaleStateError if another process got there first.

const casUpdateBooking = async (bookingId, expectedVersion, data) => {
     const result = await prisma.booking.updateMany({
          where: { id: bookingId, version: expectedVersion },
          data: { ...data, version: { increment: 1 } },
     });

     if (result.count === 0) {
          throw new StaleStateError(
               `Booking ${bookingId} was modified by another process (expected version ${expectedVersion})`
          );
     }
};

// ─── Notification Enrichment Helpers ─────────────────────────────────────────
// Looks up user (and optionally stations) so booking events can carry email/firstName
// directly. Failures here must never break the booking workflow — log and return null.

const fetchUserForNotification = async (userId) => {
     try {
          const user = await userClient.getUserById(userId);
          return user ? { email: user.email, firstName: user.firstName } : {};
     } catch (err) {
          logger.warn('Failed to enrich booking event with user details', {
               userId,
               error: err.message,
          });
          return {};
     }
};

const fetchStationName = async (stationId) => {
     if (!stationId) return null;
     try {
          const station = await stationClient.getStationById(stationId);
          return station ? station.name : null;
     } catch (err) {
          logger.warn('Failed to enrich booking event with station name', {
               stationId,
               error: err.message,
          });
          return null;
     }
};

// ─── Idempotency Helper ──────────────────────────────────────────────────────

const checkIdempotency = async (key) => {
     const existing = await prisma.idempotencyRecord.findUnique({ where: { eventKey: key } });
     if (existing) {
          logger.info(`Idempotent request: ${key}`);
          return existing.response;
     }
     return null;
};

const saveIdempotency = async (key, response) => {
     await prisma.idempotencyRecord.create({
          data: { eventKey: key, response },
     });
};

// ─── PNR Generator ──────────────────────────────────────────────────────────
const generatePNR = () => {
     // Authentic Indian Railways 10-digit PNR format (Zone prefix + 7 random digits)
     const zonePrefixes = ['211', '224', '241', '258', '431', '442', '621', '638', '821', '842'];
     const prefix = zonePrefixes[Math.floor(Math.random() * zonePrefixes.length)];
     let suffix = '';
     for (let i = 0; i < 7; i++) {
          suffix += Math.floor(Math.random() * 10).toString();
     }
     return `${prefix}${suffix}`;
};

// ─── Create Booking ──────────────────────────────────────────────────────────

// --- SEGMENT BOOKING: Added fromStationId, toStationId, fromSeq, toSeq, tripShield params ---
const createBooking = async (userId, scheduleId, seatIds = [], passengers, idempotencyKey, fromStationId, toStationId, fromSeq, toSeq, tripShield = false, travelClass = 'SL') => {
     // 1. Validate input
     if (!scheduleId) {
          throw new BadRequestError('scheduleId is required');
     }
     if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
          throw new BadRequestError('passengers (non-empty array) is required');
     }
     if (!idempotencyKey) {
          throw new BadRequestError('idempotencyKey is required');
     }

     const hasPhysicalSeats = Array.isArray(seatIds) && seatIds.length > 0;
     const isWaitlist = !hasPhysicalSeats;

     if (hasPhysicalSeats && seatIds.length > passengers.length) {
          throw new BadRequestError('Number of seats cannot exceed number of passengers');
     }

     // --- SEGMENT BOOKING: Validate segment params if provided ---
     if (fromSeq && toSeq && fromSeq >= toSeq) {
          throw new BadRequestError('fromStation must come before toStation in route');
     }

     // 2. Check idempotency
     const cached = await checkIdempotency(`booking:${idempotencyKey}`);
     if (cached) return cached;

     // 3. Fetch schedule availability and seat details from inventory
     const availability = await inventoryClient.getAvailability(scheduleId);
     if (availability.status !== 'ACTIVE') {
          throw new BadRequestError('Schedule is not active');
     }

     // Prevent booking trains that have already departed
     if (new Date(availability.departureDate) < new Date()) {
          throw new BadRequestError('Cannot book a train that has already departed');
     }

     let bookingSeats = [];
     let totalAmount = 0;

     const CLASS_PRICE_MULTIPLIERS = {
          '1A': 2.2,
          '2A': 1.45,
          '3A': 1.0,
          'SL': 0.65,
          '2S': 0.35,
          'EC': 1.85,
          'CC': 1.0,
     };
     const mult = CLASS_PRICE_MULTIPLIERS[travelClass] || 1.0;

     if (hasPhysicalSeats) {
          // --- SEGMENT BOOKING: Pass segment params to get segment-aware seat availability ---
          const seatData = await inventoryClient.getSeats(scheduleId, {
               fromSeq: fromSeq || undefined,
               toSeq: toSeq || undefined,
          });
          const seatMap = new Map(seatData.seats.map(s => [s.seatId, s]));

          // Verify all requested seats exist and are available
          for (const seatId of seatIds) {
               const seat = seatMap.get(seatId);
               if (!seat) {
                    throw new NotFoundError(`Seat ${seatId} not found in schedule`);
               }
               // --- SEGMENT BOOKING: Use segmentStatus when available for segment-aware validation ---
               const isAvailable = (fromSeq && toSeq && seat.segmentStatus !== undefined)
                    ? seat.segmentStatus === 'AVAILABLE'
                    : seat.status === 'AVAILABLE';
               if (!isAvailable) {
                    throw new ConflictError(`Seat #${seat.seatNumber} is not available for this segment`, 'SEATS_UNAVAILABLE');
               }
               bookingSeats.push(seat);
               totalAmount += seat.price;
          }

          // Partial / Split Allocation: If more passengers than physical seats, add waitlist fare for unseated passengers
          const wlPaxCount = passengers.length - seatIds.length;
          if (wlPaxCount > 0) {
               const baseFare = bookingSeats[0]?.price ? Math.round(bookingSeats[0].price / mult) : 450;
               totalAmount += wlPaxCount * Math.round(baseFare * mult);
          }
     } else {
          // Waitlist booking: calculate fare from base ticket price and class multiplier
          let basePrice = 450;
          try {
               const seatData = await inventoryClient.getSeats(scheduleId, {});
               if (seatData?.seats?.length > 0 && seatData.seats[0]?.price) {
                    basePrice = seatData.seats[0].price;
               }
          } catch (_) {}
          totalAmount = passengers.length * Math.round(basePrice * mult);
     }

     // Add Trip Shield fee if passenger opted in (Rs 49 per passenger, matching BookingSummary.jsx)
     const hasTripShield = Boolean(tripShield);
     if (hasTripShield) {
          totalAmount += passengers.length * 49;
     }

     // 4. Sort seatIds (deadlock prevention for distributed locks)
     const sortedSeatIds = isWaitlist ? [] : [...seatIds].sort();

     if (!isWaitlist) {
          // 5. Acquire Redis distributed locks (segment-aware keys for segment bookings)
          const { acquired } = await acquireSeatLocks(
               scheduleId,
               sortedSeatIds,
               `pre-${Date.now()}`, // temporary ID before booking is created
               config.BOOKING_TTL_SECONDS,
               fromSeq,  // --- SEGMENT BOOKING: include in lock key
               toSeq     // --- SEGMENT BOOKING: include in lock key
          );

          if (!acquired) {
               throw new ConflictError(
                    'One or more seats are being booked by another user. Please try again.',
                    'SEATS_LOCKED'
               );
          }
     }

     let booking;
     try {
          // 6. Create booking record in DB
          const lockExpiresAt = isWaitlist ? null : new Date(Date.now() + config.BOOKING_TTL_SECONDS * 1000);
          const pnr = generatePNR();

          booking = await prisma.booking.create({
               data: {
                    pnr,
                    userId,
                    scheduleId,
                    trainId: availability.trainId,
                    trainNumber: availability.trainNumber,
                    trainName: cleanTrainName(availability.trainName),
                    departureDate: new Date(availability.departureDate),
                    status: 'PENDING',
                    totalAmount,
                    seatCount: passengers.length,
                    travelClass: travelClass || 'SL',
                    fromStationId: fromStationId || null,  // --- SEGMENT BOOKING
                    toStationId: toStationId || null,      // --- SEGMENT BOOKING
                    fromSeq: fromSeq || null,              // --- SEGMENT BOOKING
                    toSeq: toSeq || null,                  // --- SEGMENT BOOKING
                    idempotencyKey,
                    lockExpiresAt,
                    seats: {
                         create: bookingSeats.map((seat) => ({
                              seatId: seat.seatId,
                              seatNumber: seat.seatNumber,
                              seatType: seat.seatType,
                              price: seat.price,
                         })),
                    },
                    passengers: {
                         create: passengers.map((p, index) => ({
                              name: p.name,
                              age: p.age,
                              gender: p.gender,
                              seatId: (hasPhysicalSeats && index < seatIds.length) ? seatIds[index] : null,
                         })),
                    },
               },
               include: { seats: true, passengers: true },
          });

          // 7. Execute saga Step 1: Hold seats in inventory (only if physical seats exist)
          if (hasPhysicalSeats) {
               await saga.executeHoldSeats(booking, sortedSeatIds, config.LOCK_TTL_SECONDS, fromSeq, toSeq);
          } else {
               await prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: 'SEATS_HELD' },
               });
          }

          // 8. Execute saga Step 2: Create payment order
          const paymentOrder = await saga.executeCreatePayment(booking);

          // Refresh booking after updates
          booking = await prisma.booking.findUnique({
               where: { id: booking.id },
               include: { seats: true, passengers: true },
          });

          // Calculate prior waitlist passengers strictly for this specific class on this schedule
          let priorWlCount = 0;
          const hasWaitlistedPax = !hasPhysicalSeats || passengers.length > seatIds.length;
          if (hasWaitlistedPax) {
               try {
                    const priorWlBookings = await prisma.booking.findMany({
                         where: {
                              scheduleId,
                              travelClass: booking.travelClass,
                              id: { not: booking.id },
                              status: { in: ['WAITLISTED', 'CONFIRMING', 'PAYMENT_PENDING', 'SEATS_HELD', 'CONFIRMED'] },
                              passengers: { some: { seatId: null } },
                         },
                         include: { passengers: true },
                    });
                    priorWlCount = priorWlBookings.reduce((sum, b) => {
                         const unassigned = b.passengers.filter(p => !p.seatId).length;
                         return sum + unassigned;
                    }, 0);
               } catch (_) {}
          }

          // 9. Save idempotency
          const response = {
               bookingId: booking.id,
               pnr: booking.pnr,
               status: isWaitlist ? 'WAITLISTED' : booking.status,
               isWaitlist,
               travelClass: booking.travelClass,
               totalAmount: booking.totalAmount,
               tripShield: hasTripShield,
               lockExpiresAt: booking.lockExpiresAt,
               seats: booking.seats.map(s => ({
                    seatId: s.seatId,
                    seatNumber: s.seatNumber,
                    seatType: s.seatType,
                    price: s.price,
               })),
               passengers: booking.passengers.map((p, idx) => {
                    const seat = p.seatId ? booking.seats.find(s => s.seatId === p.seatId) : null;
                    const isPaxWl = !seat;
                    const tc = booking.travelClass || 'SL';
                    const defaultCoach = tc === '1A' ? 'H1' : tc === '2A' ? 'A1' : tc === '3A' ? 'B1' : tc === '2S' ? 'D1' : tc === 'EC' ? 'E1' : tc === 'CC' ? 'C1' : 'S1';
                    const wlPosNumber = priorWlCount + (idx - booking.seats.length) + 1;
                    return {
                         name: p.name,
                         age: p.age,
                         gender: p.gender,
                         status: isPaxWl ? `WL #${Math.max(1, wlPosNumber)}` : 'CNF',
                         seatNumber: seat?.seatNumber || `WL #${Math.max(1, wlPosNumber)}`,
                         seatType: seat?.seatType || `${tc} Waitlist Queue`,
                         coach: seat ? defaultCoach : `WL (${tc})`,
                    };
               }),
               paymentOrder: {
                    paymentOrderId: paymentOrder.paymentOrderId,
                    gatewayOrderId: paymentOrder.gatewayOrderId,
                    amount: paymentOrder.amount,
                    currency: paymentOrder.currency,
                    keyId: paymentOrder.keyId,
               },
          };

          await saveIdempotency(`booking:${idempotencyKey}`, response);

          return response;

     } catch (error) {
          // Compensate on failure
          logger.error(`Booking creation failed for user ${userId}`, { error: error.message });

          if (booking) {
               await saga.compensateAll(booking, sortedSeatIds);
               await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                         status: 'FAILED',
                         failureReason: error.response?.data?.message || error.message,
                    },
               });
          }

          // Release Redis locks (segment-aware)
          await releaseSeatLocks(scheduleId, sortedSeatIds, lockValue, fromSeq, toSeq);

          throw error;
     }
};

// ─── Handle Payment Success (Kafka consumer) ─────────────────────────────────

const handlePaymentSuccess = async (paymentOrderId, gatewayPaymentId, amount) => {
     const booking = await prisma.booking.findUnique({
          where: { paymentOrderId },
          include: { seats: true, passengers: true },
     });

     if (!booking) {
          logger.warn(`No booking found for paymentOrderId: ${paymentOrderId}`);
          return;
     }

     // Idempotent: already confirmed
     if (booking.status === 'CONFIRMED') {
          logger.info(`Booking ${booking.id} already confirmed`);
          return;
     }

     // If booking was cancelled while payment was pending, initiate refund immediately
     if (booking.status === 'CANCELLED') {
          logger.warn(`Booking ${booking.id} was already CANCELLED when payment captured event arrived. Initiating full refund.`);
          if (booking.paymentOrderId) {
               try {
                    const idempotencyKey = `${booking.id}-post-cancel-refund`;
                    await paymentClient.initiateRefund(
                         booking.paymentOrderId,
                         booking.totalAmount,
                         'cancelled_before_payment_capture',
                         idempotencyKey
                    );
                    logger.info(`Refund successfully initiated for post-cancel payment on booking ${booking.id}`);
               } catch (refundErr) {
                    logger.error(`Failed to initiate refund for post-cancel payment on booking ${booking.id}`, {
                         error: refundErr.message,
                    });
               }
          }
          return;
     }

     if (booking.status !== 'PAYMENT_PENDING') {
          logger.warn(`Booking ${booking.id} in unexpected status: ${booking.status}`);
          return;
     }

     const seatIds = (booking.seats || []).map(s => s.seatId).sort();

     try {
          // Atomically claim this booking — if expiry job or cancel already changed it, bail out
          await casUpdateBooking(booking.id, booking.version, { status: 'CONFIRMING' });

          // Execute saga Step 3: Confirm seats in inventory (only if physical seats exist)
          if (seatIds.length > 0) {
               await saga.executeConfirmSeats(booking, seatIds, booking.fromSeq, booking.toSeq); // --- SEGMENT BOOKING
          }

          // Final status update: Confirmed if physical seats were held, Waitlisted if queue booking
          const isWaitlist = seatIds.length === 0;
          const finalStatus = isWaitlist ? 'WAITLISTED' : 'CONFIRMED';

          await prisma.booking.updateMany({
               where: { id: booking.id, status: 'CONFIRMING' },
               data: { status: finalStatus, version: { increment: 1 } },
          });

          // Release Redis locks (segment-aware) if physical seats were locked
          if (seatIds.length > 0) {
               await forceReleaseSeatLocks(booking.scheduleId, seatIds, booking.fromSeq, booking.toSeq);
          }

          // Publish BOOKING_CONFIRMED (retried by producer — log but don't fail the booking)
          try {
               const [userInfo, fromStationName, toStationName] = await Promise.all([
                    fetchUserForNotification(booking.userId),
                    fetchStationName(booking.fromStationId),
                    fetchStationName(booking.toStationId),
               ]);

               await bookingProducer.publishBookingConfirmed({
                    bookingId: booking.id,
                    pnr: booking.pnr,
                    userId: booking.userId,
                    email: userInfo.email,
                    firstName: userInfo.firstName,
                    scheduleId: booking.scheduleId,
                    trainNumber: booking.trainNumber,
                    trainName: cleanTrainName(booking.trainName),
                    fromStationName,
                    toStationName,
                    departureDate: booking.departureDate,
                    seats: booking.seats.map(s => ({
                         seatNumber: s.seatNumber,
                         seatType: s.seatType,
                         price: s.price,
                    })),
                    passengers: booking.passengers.map(p => ({
                         name: p.name,
                         age: p.age,
                         gender: p.gender,
                    })),
                    totalAmount: booking.totalAmount,
               });
          } catch (err) {
               logger.error('CRITICAL: Failed to publish BOOKING_CONFIRMED after retries — notification/search may be stale', {
                    bookingId: booking.id,
                    error: err.message,
               });
          }

          logger.info(`Booking ${booking.id} confirmed successfully`);

     } catch (error) {
          // If StaleStateError, another process already handled this booking — do nothing
          if (error.code === 'STALE_STATE') {
               logger.info(`Booking ${booking.id} already handled by another process, skipping`);
               return;
          }

          logger.error(`Failed to confirm booking ${booking.id}`, { error: error.message });

          // Compensate: refund payment and release seats
          await saga.compensateAll(booking, seatIds);

          await prisma.booking.updateMany({
               where: { id: booking.id, status: { in: ['PAYMENT_PENDING', 'CONFIRMING'] } },
               data: {
                    status: 'FAILED',
                    failureReason: `confirm_failed: ${error.message}`,
                    version: { increment: 1 },
               },
          });

          await forceReleaseSeatLocks(booking.scheduleId, seatIds, booking.fromSeq, booking.toSeq);

          try {
               const userInfo = await fetchUserForNotification(booking.userId);
               await bookingProducer.publishBookingFailed({
                    bookingId: booking.id,
                    userId: booking.userId,
                    email: userInfo.email,
                    firstName: userInfo.firstName,
                    scheduleId: booking.scheduleId,
                    reason: 'confirm_seats_failed',
               });
          } catch (err) {
               logger.error('Failed to publish BOOKING_FAILED after retries', { bookingId: booking.id, error: err.message });
          }
     }
};

// ─── Handle Payment Failure (Kafka consumer) ─────────────────────────────────

const handlePaymentFailure = async (paymentOrderId, reason) => {
     const booking = await prisma.booking.findUnique({
          where: { paymentOrderId },
          include: { seats: true },
     });

     if (!booking) {
          logger.warn(`No booking found for paymentOrderId: ${paymentOrderId}`);
          return;
     }

     // Idempotent
     if (booking.status === 'FAILED' || booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
          logger.info(`Booking ${booking.id} already in terminal state: ${booking.status}`);
          return;
     }

     if (booking.status !== 'PAYMENT_PENDING') {
          logger.warn(`Booking ${booking.id} in unexpected status: ${booking.status}`);
          return;
     }

     const seatIds = booking.seats.map(s => s.seatId).sort();

     // Atomically claim this booking before compensating
     try {
          await casUpdateBooking(booking.id, booking.version, {
               status: 'FAILED',
               failureReason: reason || 'payment_failed',
          });
     } catch (error) {
          if (error.code === 'STALE_STATE') {
               logger.info(`Booking ${booking.id} already handled by another process, skipping`);
               return;
          }
          throw error;
     }

     // Compensate: release held seats
     await saga.compensateHoldSeats(booking, seatIds);

     // Release Redis locks (segment-aware)
     await forceReleaseSeatLocks(booking.scheduleId, seatIds, booking.fromSeq, booking.toSeq);

     // Publish BOOKING_FAILED
     try {
          const userInfo = await fetchUserForNotification(booking.userId);
          await bookingProducer.publishBookingFailed({
               bookingId: booking.id,
               userId: booking.userId,
               email: userInfo.email,
               firstName: userInfo.firstName,
               scheduleId: booking.scheduleId,
               reason: reason || 'payment_failed',
          });
     } catch (err) {
          logger.error('Failed to publish BOOKING_FAILED after retries', { bookingId: booking.id, error: err.message });
     }

     logger.info(`Booking ${booking.id} failed: ${reason}`);
};

// ─── Cancel Booking ──────────────────────────────────────────────────────────

const cancelBooking = async (bookingId, userId) => {
     const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { seats: true },
     });

     if (!booking) {
          throw new NotFoundError('Booking not found');
     }

     if (booking.userId !== userId) {
          throw new NotFoundError('Booking not found');
     }

     if (['CANCELLED', 'CANCELLING', 'FAILED', 'EXPIRED', 'CONFIRMING'].includes(booking.status)) {
          throw new ConflictError(`Booking is already ${booking.status}`);
     }

     const seatIds = booking.seats.map(s => s.seatId).sort();
     let refundInitiated = false;

     // Atomically claim this booking — prevents race with payment webhook or expiry job
     try {
          await casUpdateBooking(booking.id, booking.version, {
               status: 'CANCELLING',
               failureReason: 'user_cancelled',
          });
     } catch (error) {
          if (error.code === 'STALE_STATE') {
               // Re-read to give user accurate error
               const fresh = await prisma.booking.findUnique({ where: { id: bookingId } });
               throw new ConflictError(
                    `Booking status changed to ${fresh?.status || 'unknown'} while cancelling. Please refresh.`
               );
          }
          throw error;
     }

     if (booking.status === 'CONFIRMED' || booking.status === 'WAITLISTED') {
          // Cancel confirmed or waitlisted booking: release seats in inventory only if physical seats were allocated
          if (booking.seats && booking.seats.length > 0) {
               try {
                    await inventoryClient.cancelBooking(booking.scheduleId, booking.id, booking.userId);
               } catch (error) {
                    logger.error(`Failed to release seats in inventory for booking ${booking.id}`, {
                         error: error.message,
                    });
                    // Roll back from CANCELLING to previous status so the user can retry
                    await prisma.booking.updateMany({
                         where: { id: booking.id, status: 'CANCELLING' },
                         data: {
                              status: booking.status,
                              failureReason: null,
                              version: { increment: 1 },
                         },
                    });
                    throw error;
               }
          }

          if (booking.paymentOrderId) {
               try {
                    const idempotencyKey = `${booking.id}-cancel-refund`;
                    await paymentClient.initiateRefund(
                         booking.paymentOrderId,
                         booking.totalAmount,
                         'user_cancelled',
                         idempotencyKey
                    );
                    refundInitiated = true;
               } catch (error) {
                    logger.error(`Failed to initiate refund for booking ${booking.id}`, {
                         error: error.message,
                    });
               }
          }
     } else if (['PAYMENT_PENDING', 'SEATS_HELD'].includes(booking.status)) {
          // Release held seats
          try {
               // --- SEGMENT BOOKING: Pass segment params for accurate release ---
               await inventoryClient.releaseSeats(booking.scheduleId, seatIds, booking.userId, booking.fromSeq, booking.toSeq);
          } catch (error) {
               logger.error(`Failed to release seats during cancel`, { error: error.message });
          }

          // If a payment order exists and was captured, initiate refund
          if (booking.paymentOrderId) {
               try {
                    const idempotencyKey = `${booking.id}-cancel-pending-refund`;
                    await paymentClient.initiateRefund(
                         booking.paymentOrderId,
                         booking.totalAmount,
                         'user_cancelled_pending',
                         idempotencyKey
                    );
                    refundInitiated = true;
               } catch (error) {
                    // Gateway will throw if payment wasn't captured yet; post-cancel handler will catch it if it captures later
                    logger.info(`No immediate refund required for pending booking ${booking.id}: ${error.message}`);
               }
          }
     }

     // Final status (CANCELLING → CANCELLED)
     await prisma.booking.updateMany({
          where: { id: booking.id, status: 'CANCELLING' },
          data: {
               status: 'CANCELLED',
               version: { increment: 1 },
          },
     });

     // Release Redis locks (segment-aware)
     await forceReleaseSeatLocks(booking.scheduleId, seatIds, booking.fromSeq, booking.toSeq);

     // Publish BOOKING_CANCELLED
     try {
          const userInfo = await fetchUserForNotification(booking.userId);
          await bookingProducer.publishBookingCancelled({
               bookingId: booking.id,
               userId: booking.userId,
               email: userInfo.email,
               firstName: userInfo.firstName,
               scheduleId: booking.scheduleId,
               reason: 'user_cancelled',
               refundAmount: refundInitiated ? booking.totalAmount : 0,
          });
     } catch (err) {
          logger.error('Failed to publish BOOKING_CANCELLED after retries', { bookingId: booking.id, error: err.message });
     }

     // Automatic IRCTC Waitlist Promotion Engine:
     // If physical seats were freed by this cancellation, immediately promote
     // the earliest waiting list passengers on this schedule in FIFO order.
     if (booking.seats && booking.seats.length > 0) {
          try {
               await promoteNextWaitlistedBookings(booking.scheduleId, booking.seats);
          } catch (promoteErr) {
               logger.error(`Error promoting waitlist after cancellation of booking ${booking.id}`, {
                    error: promoteErr.message,
               });
          }
     }

     logger.info(`Booking ${booking.id} cancelled by user ${userId}`);

     return {
          bookingId: booking.id,
          status: 'CANCELLED',
          refundInitiated,
     };
};

// ─── Auto-Promote Waitlist Bookings (IRCTC FIFO Clearance) ───────────────────
const promoteNextWaitlistedBookings = async (scheduleId, releasedSeats) => {
     if (!scheduleId || !releasedSeats || releasedSeats.length === 0) return;

     let seatsPool = [...releasedSeats];

     try {
          // Find active bookings with passengers waiting for seats (seatId: null) in FIFO order
          const eligibleBookings = await prisma.booking.findMany({
               where: {
                    scheduleId,
                    status: { in: ['WAITLISTED', 'CONFIRMING', 'PAYMENT_PENDING', 'SEATS_HELD', 'CONFIRMED'] },
                    passengers: { some: { seatId: null } },
               },
               include: {
                    passengers: { orderBy: { createdAt: 'asc' } },
                    seats: true,
               },
               orderBy: { createdAt: 'asc' }, // Strict FIFO: earliest reservation first
          });

          for (const wlBooking of eligibleBookings) {
               if (seatsPool.length === 0) break;

               const bookingClass = wlBooking.travelClass || 'SL';
               const unassignedPassengers = wlBooking.passengers.filter(p => !p.seatId);
               const newlyAssignedSeats = [];

               for (const pax of unassignedPassengers) {
                    if (seatsPool.length === 0) break;

                    const matchIdx = seatsPool.findIndex(s => !s.travelClass || s.travelClass === bookingClass);
                    if (matchIdx === -1) continue;

                    const seat = seatsPool.splice(matchIdx, 1)[0];

                    // 1. Assign seat in inventory
                    try {
                         await inventoryClient.assignPromotedSeats(
                              scheduleId,
                              [seat.seatId],
                              wlBooking.userId,
                              wlBooking.id
                         );
                    } catch (invErr) {
                         logger.error(`Failed to assign promoted seat in inventory for booking ${wlBooking.id}`, { error: invErr.message });
                         continue;
                    }

                    // 2. Create bookingSeat row in Prisma for wlBooking
                    await prisma.bookingSeat.create({
                         data: {
                              bookingId: wlBooking.id,
                              seatId: seat.seatId,
                              seatNumber: seat.seatNumber,
                              seatType: seat.seatType,
                              price: seat.price,
                         },
                    });

                    // 3. Update passenger's seatId
                    await prisma.passenger.update({
                         where: { id: pax.id },
                         data: { seatId: seat.seatId },
                    });

                    newlyAssignedSeats.push(seat);
                    logger.info(`[Waitlist Promotion] Passenger ${pax.name} (PNR: ${wlBooking.pnr}) successfully promoted from WAITLISTED to CONFIRMED with seat ${seat.seatNumber}`);
               }

               // 4. If all passengers in this booking now have seats, update booking status to CONFIRMED
               const remainingUnassigned = await prisma.passenger.count({
                    where: { bookingId: wlBooking.id, seatId: null },
               });
               if (remainingUnassigned === 0 && wlBooking.status !== 'CONFIRMED') {
                    await prisma.booking.update({
                         where: { id: wlBooking.id },
                         data: {
                              status: 'CONFIRMED',
                              version: { increment: 1 },
                         },
                    });
               }

               // 5. Notify user of confirmation via booking producer
               if (newlyAssignedSeats.length > 0) {
                    try {
                         const userInfo = await fetchUserForNotification(wlBooking.userId);
                         await bookingProducer.publishBookingConfirmed({
                              bookingId: wlBooking.id,
                              userId: wlBooking.userId,
                              pnr: wlBooking.pnr,
                              scheduleId: wlBooking.scheduleId,
                              trainNumber: wlBooking.trainNumber,
                              trainName: wlBooking.trainName,
                              departureDate: wlBooking.departureDate,
                              seats: newlyAssignedSeats.map(s => ({
                                   seatNumber: s.seatNumber,
                                   seatType: s.seatType,
                              })),
                              totalAmount: wlBooking.totalAmount,
                              email: userInfo.email,
                              firstName: userInfo.firstName,
                         });
                    } catch (pubErr) {
                         logger.warn(`Could not publish confirmation notification for promoted booking ${wlBooking.id}`, { error: pubErr.message });
                    }
               }
          }
     } catch (error) {
          logger.error(`Error during waitlist promotion for schedule ${scheduleId}`, { error: error.message });
     }
};

// ─── Get Booking ─────────────────────────────────────────────────────────────

const getBooking = async (bookingId, userId) => {
     const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
               seats: { orderBy: { seatNumber: 'asc' } },
               passengers: true,
          },
     });

     if (!booking || booking.userId !== userId) {
          throw new NotFoundError('Booking not found');
     }

     if (!booking.pnr) {
          const generatedPnr = generatePNR();
          await prisma.booking.update({
               where: { id: booking.id },
               data: { pnr: generatedPnr },
          }).catch(() => {});
          booking.pnr = generatedPnr;
     }

     const isWaitlist = (booking.seats || []).length === 0 || booking.status === 'WAITLISTED';
     const effectiveStatus = isWaitlist
          ? (['CANCELLED', 'CANCELLING', 'FAILED', 'EXPIRED'].includes(booking.status) ? booking.status : 'WAITLISTED')
          : booking.status;

     const tc = booking.travelClass || 'SL';
     let priorWlCount = 0;
     if (isWaitlist) {
          try {
               const priorWlBookings = await prisma.booking.findMany({
                    where: {
                         scheduleId: booking.scheduleId,
                         travelClass: tc,
                         id: { not: booking.id },
                         status: { in: ['WAITLISTED', 'CONFIRMING', 'PAYMENT_PENDING', 'SEATS_HELD', 'CONFIRMED'] },
                         seats: { none: {} },
                         createdAt: { lt: booking.createdAt },
                    },
                    select: { seatCount: true },
               });
               priorWlCount = priorWlBookings.reduce((sum, b) => sum + (b.seatCount || 0), 0);
          } catch (_) {}
     }

     return {
          id: booking.id,
          pnr: booking.pnr,
          status: effectiveStatus,
          isWaitlist,
          travelClass: tc,
          scheduleId: booking.scheduleId,
          trainId: booking.trainId,
          trainNumber: booking.trainNumber,
          trainName: cleanTrainName(booking.trainName),
          departureDate: booking.departureDate,
          totalAmount: booking.totalAmount,
          tripShield: booking.totalAmount > booking.seats.reduce((sum, s) => sum + s.price, 0),
          seatCount: booking.seatCount,
          fromStationId: booking.fromStationId,  // --- SEGMENT BOOKING
          toStationId: booking.toStationId,      // --- SEGMENT BOOKING
          fromSeq: booking.fromSeq,              // --- SEGMENT BOOKING
          toSeq: booking.toSeq,                  // --- SEGMENT BOOKING
          paymentOrderId: booking.paymentOrderId,
          lockExpiresAt: booking.lockExpiresAt,
          failureReason: booking.failureReason,
          seats: booking.seats.map(s => ({
               seatId: s.seatId,
               seatNumber: s.seatNumber,
               seatType: s.seatType,
               price: s.price,
          })),
          passengers: booking.passengers.map((p, idx) => {
               const seat = p.seatId ? booking.seats.find(s => s.seatId === p.seatId) : null;
               const isPaxWl = !seat;
               const defaultCoach = tc === '1A' ? 'H1' : tc === '2A' ? 'A1' : tc === '3A' ? 'B1' : tc === '2S' ? 'D1' : tc === 'EC' ? 'E1' : tc === 'CC' ? 'C1' : 'S1';
               const wlPosNumber = priorWlCount + (idx - (booking.seats || []).length) + 1;
               return {
                    id: p.id,
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    seatId: p.seatId,
                    status: isPaxWl ? `WL #${Math.max(1, wlPosNumber)} (${tc})` : 'CNF',
                    coach: seat ? defaultCoach : `WL (${tc})`,
                    seat: isPaxWl ? `WL #${Math.max(1, wlPosNumber)}` : `${seat.seatNumber} (${seat.seatType})`,
                    berth: isPaxWl ? `${tc} Waitlist Queue` : seat.seatType,
               };
          }),
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
     };
};

// ─── Get User Bookings ───────────────────────────────────────────────────────

const getUserBookings = async (userId, { status, page = 1, limit = 10, all = false, search = '' } = {}) => {
     const skip = (page - 1) * limit;
     const andConditions = [];

     if (!all) {
          andConditions.push({ userId });
     }

     if (status && status !== 'ALL') {
          const upperStatus = status.toUpperCase();
          if (upperStatus === 'WAITLISTED') {
               andConditions.push({
                    OR: [
                         { status: 'WAITLISTED' },
                         { status: 'CONFIRMED', seats: { none: {} } },
                    ],
               });
          } else if (upperStatus === 'CONFIRMED') {
               andConditions.push({
                    status: 'CONFIRMED',
                    seats: { some: {} },
               });
          } else {
               andConditions.push({ status: upperStatus });
          }
     }

     if (search && search.trim()) {
          const q = search.trim();
          andConditions.push({
               OR: [
                    { id: { contains: q, mode: 'insensitive' } },
                    { pnr: { contains: q, mode: 'insensitive' } },
                    { trainNumber: { contains: q, mode: 'insensitive' } },
                    { trainName: { contains: q, mode: 'insensitive' } },
                    { passengers: { some: { name: { contains: q, mode: 'insensitive' } } } },
               ],
          });
     }

     const where = andConditions.length > 0 ? { AND: andConditions } : {};

     const [bookings, total] = await Promise.all([
          prisma.booking.findMany({
               where,
               include: {
                    seats: { orderBy: { seatNumber: 'asc' } },
                    passengers: true,
               },
               orderBy: { createdAt: 'desc' },
               skip,
               take: limit,
          }),
          prisma.booking.count({ where }),
     ]);

     for (const b of bookings) {
          if (!b.pnr) {
               const generatedPnr = generatePNR();
               await prisma.booking.update({
                    where: { id: b.id },
                    data: { pnr: generatedPnr },
               }).catch(() => {});
               b.pnr = generatedPnr;
          }
     }

     // Precompute sequential waitlist positions across schedules & classes for all waitlisted bookings
     const wlBookings = bookings.filter(b => (b.seats || []).length === 0 || b.status === 'WAITLISTED');
     const scheduleIdsForWl = [...new Set(wlBookings.map(b => b.scheduleId))];
     const scheduleWlQueueMap = new Map();

     if (scheduleIdsForWl.length > 0) {
          try {
               const queueBookings = await prisma.booking.findMany({
                    where: {
                         scheduleId: { in: scheduleIdsForWl },
                         status: { in: ['WAITLISTED', 'CONFIRMING', 'PAYMENT_PENDING', 'SEATS_HELD', 'CONFIRMED'] },
                         seats: { none: {} },
                    },
                    select: {
                         id: true,
                         scheduleId: true,
                         travelClass: true,
                         seatCount: true,
                         createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
               });
               for (const qb of queueBookings) {
                    const queueKey = `${qb.scheduleId}:${qb.travelClass || 'SL'}`;
                    if (!scheduleWlQueueMap.has(queueKey)) {
                         scheduleWlQueueMap.set(queueKey, []);
                    }
                    scheduleWlQueueMap.get(queueKey).push(qb);
               }
          } catch (_) {}
     }

     return {
          bookings: bookings.map(b => {
               const isWaitlist = (b.seats || []).length === 0 || b.status === 'WAITLISTED';
               const effectiveStatus = isWaitlist
                    ? (['CANCELLED', 'CANCELLING', 'FAILED', 'EXPIRED'].includes(b.status) ? b.status : 'WAITLISTED')
                    : b.status;

               const tc = b.travelClass || 'SL';
               const queueKey = `${b.scheduleId}:${tc}`;
               let priorWlCount = 0;
               if (isWaitlist && scheduleWlQueueMap.has(queueKey)) {
                    const queue = scheduleWlQueueMap.get(queueKey);
                    for (const qb of queue) {
                         if (qb.id !== b.id && new Date(qb.createdAt) < new Date(b.createdAt)) {
                              priorWlCount += (qb.seatCount || 0);
                         }
                    }
               }

               return {
                    id: b.id,
                    pnr: b.pnr,
                    status: effectiveStatus,
                    isWaitlist,
                    travelClass: tc,
                    scheduleId: b.scheduleId,
                    trainNumber: b.trainNumber,
                    trainName: cleanTrainName(b.trainName),
                    departureDate: b.departureDate,
                    totalAmount: b.totalAmount,
                    tripShield: b.totalAmount > b.seats.reduce((sum, s) => sum + s.price, 0),
                    seatCount: b.seatCount,
                    fromStationId: b.fromStationId,  // --- SEGMENT BOOKING
                    toStationId: b.toStationId,      // --- SEGMENT BOOKING
                    fromSeq: b.fromSeq,              // --- SEGMENT BOOKING
                    toSeq: b.toSeq,                  // --- SEGMENT BOOKING
                    seats: b.seats.map(s => ({
                         seatId: s.seatId,
                         seatNumber: s.seatNumber,
                         seatType: s.seatType,
                         price: s.price,
                    })),
                    passengers: b.passengers.map((p, idx) => {
                         const seat = b.seats[idx] || b.seats.find(s => s.seatId === p.seatId);
                         const coach = isWaitlist
                              ? `WL (${tc})`
                              : (tc === '1A' ? 'H1' : tc === '2A' ? 'A1' : tc === '3A' ? 'B1' : tc === '2S' ? 'D1' : tc === 'EC' ? 'E1' : tc === 'CC' ? 'C1' : 'S1');
                         const wlPosNumber = priorWlCount + idx + 1;
                         return {
                              name: p.name,
                              age: p.age,
                              gender: p.gender,
                              seatNumber: seat?.seatNumber || (isWaitlist ? `WL #${wlPosNumber}` : null),
                              status: isWaitlist ? `WL #${wlPosNumber} (${tc})` : (b.status === 'CONFIRMED' ? 'CNF' : b.status),
                              coach,
                              seat: isWaitlist ? `WL #${wlPosNumber}` : (seat ? `${seat.seatNumber} (${seat.seatType})` : 'To be assigned'),
                              berth: isWaitlist ? `${tc} Waitlist Queue` : (seat ? seat.seatType : 'Waitlist Queue'),
                         };
                    }),
                    createdAt: b.createdAt,
               };
          }),
          pagination: {
               page,
               limit,
               total,
               totalPages: Math.ceil(total / limit),
          },
     };
};

// ─── Verify Payment (client-side verification after Razorpay checkout) ───────

const verifyPayment = async (bookingId, userId, razorpayPaymentId, razorpaySignature) => {
     const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
     });

     if (!booking || booking.userId !== userId) {
          throw new NotFoundError('Booking not found');
     }

     if (!booking.paymentOrderId) {
          throw new BadRequestError('Booking has no payment order');
     }

     if (booking.status === 'CONFIRMED' || booking.status === 'WAITLISTED') {
          return { bookingId: booking.id, status: booking.status, message: 'Already confirmed' };
     }

     if (booking.status !== 'PAYMENT_PENDING') {
          throw new ConflictError(`Booking is in ${booking.status} status, cannot verify payment`);
     }

     // Call payment service to verify and capture
     const result = await paymentClient.verifyPayment(
          booking.paymentOrderId,
          razorpayPaymentId,
          razorpaySignature
     );

     logger.info(`Payment verified for booking ${bookingId}`, { result });

     return {
          bookingId: booking.id,
          paymentStatus: result.status,
     };
};

// ─── Handle Schedule Cancelled (Kafka consumer) ─────────────────────────────
// When a schedule is cancelled, all active bookings on that schedule must be
// failed/cancelled so users aren't left with stranded tickets.

const handleScheduleCancelled = async (scheduleId) => {
     if (!scheduleId) {
          logger.warn('handleScheduleCancelled called without scheduleId');
          return;
     }

     const activeBookings = await prisma.booking.findMany({
          where: {
               scheduleId,
               status: { in: ['PENDING', 'SEATS_HELD', 'PAYMENT_PENDING', 'CONFIRMED', 'WAITLISTED'] },
          },
          include: { seats: true },
     });

     if (activeBookings.length === 0) {
          logger.info(`No active bookings to cancel for schedule ${scheduleId}`);
          return;
     }

     logger.info(`Cancelling ${activeBookings.length} active booking(s) due to schedule cancellation`, { scheduleId });

     for (const booking of activeBookings) {
          try {
               // CAS: claim ownership of this booking transition
               const claimed = await prisma.booking.updateMany({
                    where: {
                         id: booking.id,
                         version: booking.version,
                         status: { in: ['PENDING', 'SEATS_HELD', 'PAYMENT_PENDING', 'CONFIRMED', 'WAITLISTED'] },
                    },
                    data: {
                         status: 'CANCELLED',
                         failureReason: 'schedule_cancelled',
                         version: { increment: 1 },
                    },
               });

               if (claimed.count === 0) {
                    logger.info(`Booking ${booking.id} already handled, skipping schedule-cancel`);
                    continue;
               }

               const seatIds = booking.seats.map(s => s.seatId).sort();

               // Release Redis locks if any are still held
               await forceReleaseSeatLocks(booking.scheduleId, seatIds, booking.fromSeq, booking.toSeq);

               // Initiate refund for confirmed or waitlisted bookings that had payment
               if (['CONFIRMED', 'WAITLISTED'].includes(booking.status) && booking.paymentOrderId) {
                    try {
                         const idempotencyKey = `${booking.id}-schedule-cancel-refund`;
                         await paymentClient.initiateRefund(
                              booking.paymentOrderId,
                              booking.totalAmount,
                              'schedule_cancelled',
                              idempotencyKey
                         );
                    } catch (refundErr) {
                         logger.error(`Failed to initiate refund for booking ${booking.id} during schedule cancellation`, {
                              error: refundErr.message,
                         });
                    }
               }

               // Publish BOOKING_CANCELLED event
               try {
                    const userInfo = await fetchUserForNotification(booking.userId);
                    await bookingProducer.publishBookingCancelled({
                         bookingId: booking.id,
                         userId: booking.userId,
                         email: userInfo.email,
                         firstName: userInfo.firstName,
                         scheduleId: booking.scheduleId,
                         reason: 'schedule_cancelled',
                         refundAmount: ['CONFIRMED', 'WAITLISTED'].includes(booking.status) ? booking.totalAmount : 0,
                    });
               } catch (err) {
                    logger.error('Failed to publish BOOKING_CANCELLED for schedule cancellation', {
                         bookingId: booking.id,
                         error: err.message,
                    });
               }

               logger.info(`Booking ${booking.id} cancelled due to schedule cancellation`);
          } catch (error) {
               logger.error(`Failed to cancel booking ${booking.id} during schedule cancellation`, {
                    error: error.message,
               });
          }
     }
};

// ─── Get PNR Status (Public / Universal Ticket Tracking) ──────────────────────
const getPnrStatus = async (pnr) => {
     const cleanPnr = String(pnr || '').trim().replace(/\D/g, '');
     if (!cleanPnr || cleanPnr.length !== 10) {
          throw new BadRequestError('Invalid PNR number. Please enter a valid 10-digit numeric PNR.');
     }

     const booking = await prisma.booking.findFirst({
          where: {
               OR: [
                    { pnr: cleanPnr },
                    { id: cleanPnr },
               ],
          },
          include: {
               seats: { orderBy: { seatNumber: 'asc' } },
               passengers: true,
          },
     });

     if (!booking) {
          throw new NotFoundError(`No ticket reservation record found for PNR: ${cleanPnr}`);
     }

     let fromStationName = null;
     let toStationName = null;
     try {
          if (booking.fromStationId) fromStationName = await fetchStationName(booking.fromStationId);
          if (booking.toStationId) toStationName = await fetchStationName(booking.toStationId);
     } catch (_) {}

     const depDate = new Date(booking.departureDate);
     const now = new Date();
     const isChartPrepared = depDate <= now || (depDate.getTime() - now.getTime()) < 4 * 3600 * 1000;

     const isWaitlist = (booking.seats || []).length === 0 || booking.status === 'WAITLISTED';
     const effectiveStatus = isWaitlist
          ? (['CANCELLED', 'CANCELLING', 'FAILED', 'EXPIRED'].includes(booking.status) ? booking.status : 'WAITLISTED')
          : booking.status;

     const tc = booking.travelClass || 'SL';
     let priorWlCount = 0;
     if (isWaitlist) {
          try {
               const priorWlBookings = await prisma.booking.findMany({
                    where: {
                         scheduleId: booking.scheduleId,
                         travelClass: tc,
                         id: { not: booking.id },
                         status: { in: ['WAITLISTED', 'CONFIRMING', 'PAYMENT_PENDING', 'SEATS_HELD', 'CONFIRMED'] },
                         seats: { none: {} },
                         createdAt: { lt: booking.createdAt },
                    },
                    select: { seatCount: true },
               });
               priorWlCount = priorWlBookings.reduce((sum, b) => sum + (b.seatCount || 0), 0);
          } catch (_) {}
     }

     return {
          pnr: booking.pnr || cleanPnr,
          bookingId: booking.id,
          trainNumber: booking.trainNumber,
          trainName: cleanTrainName(booking.trainName),
          departureDate: booking.departureDate,
          status: effectiveStatus,
          isWaitlist,
          travelClass: tc,
          chartStatus: isChartPrepared ? 'CHART PREPARED' : 'CHART NOT PREPARED',
          from: fromStationName || 'Origin Station',
          to: toStationName || 'Destination Station',
          fromStationId: booking.fromStationId,
          toStationId: booking.toStationId,
          seatCount: booking.seatCount,
          totalAmount: booking.totalAmount,
          passengers: booking.passengers.map((p, idx) => {
               const seat = booking.seats[idx] || booking.seats.find(s => s.seatId === p.seatId);
               const coach = isWaitlist
                    ? `WL (${tc})`
                    : (tc === '1A' ? 'H1' : tc === '2A' ? 'A1' : tc === '3A' ? 'B1' : tc === '2S' ? 'D1' : tc === 'EC' ? 'E1' : tc === 'CC' ? 'C1' : 'S1');
               const wlPosNumber = priorWlCount + idx + 1;
               return {
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    status: isWaitlist
                         ? `WL #${wlPosNumber} (${tc}) (Waitlist)`
                         : (booking.status === 'CONFIRMED' ? 'CNF (Confirmed)' : booking.status === 'CANCELLED' ? 'CAN (Cancelled)' : `WL (${tc})`),
                    coach,
                    seat: isWaitlist ? `WL #${wlPosNumber}` : (seat ? `${seat.seatNumber} (${seat.seatType})` : 'To be assigned'),
                    berth: isWaitlist ? `${tc} Waitlist Queue` : (seat ? seat.seatType : 'Waitlist Queue'),
               };
          }),
          seats: booking.seats.map(s => ({
               seatNumber: s.seatNumber,
               seatType: s.seatType,
               price: s.price,
          })),
          createdAt: booking.createdAt,
     };
};

// ─── Live Schedule Waitlist Status ──────────────────────────────────────────
const getScheduleWaitlist = async (scheduleId, travelClass) => {
     if (!scheduleId) throw new BadRequestError('scheduleId is required');

     const waitlistBookings = await prisma.booking.findMany({
          where: {
               scheduleId,
               status: { in: ['WAITLISTED', 'CONFIRMING', 'PAYMENT_PENDING', 'SEATS_HELD', 'CONFIRMED'] },
               passengers: { some: { seatId: null } },
          },
          include: { passengers: true },
     });

     const byClass = {
          '1A': { waitlistCount: 0, nextWlPosition: 1 },
          '2A': { waitlistCount: 0, nextWlPosition: 1 },
          '3A': { waitlistCount: 0, nextWlPosition: 1 },
          'SL': { waitlistCount: 0, nextWlPosition: 1 },
          '2S': { waitlistCount: 0, nextWlPosition: 1 },
          'EC': { waitlistCount: 0, nextWlPosition: 1 },
          'CC': { waitlistCount: 0, nextWlPosition: 1 },
     };

     let totalWaitlist = 0;
     for (const b of waitlistBookings) {
          const cls = b.travelClass || 'SL';
          const cnt = (b.passengers || []).filter(p => !p.seatId).length;
          totalWaitlist += cnt;
          if (!byClass[cls]) {
               byClass[cls] = { waitlistCount: 0, nextWlPosition: 1 };
          }
          byClass[cls].waitlistCount += cnt;
          byClass[cls].nextWlPosition = byClass[cls].waitlistCount + 1;
     }

     // Also count confirmed physical seats booked per class
     let bookedByClass = {
          '1A': 0, '2A': 0, '3A': 0, 'SL': 0, '2S': 0, 'EC': 0, 'CC': 0,
     };
     try {
          const confirmedBookings = await prisma.booking.findMany({
               where: {
                    scheduleId,
                    status: { in: ['CONFIRMED', 'SEATS_HELD', 'PAYMENT_PENDING'] },
                    seats: { some: {} },
               },
               select: { travelClass: true, seats: true },
          });
          for (const b of confirmedBookings) {
               const cls = b.travelClass || 'SL';
               bookedByClass[cls] = (bookedByClass[cls] || 0) + (b.seats ? b.seats.length : 0);
          }
     } catch (_) {}

     return {
          scheduleId,
          waitlistCount: totalWaitlist,
          nextWlPosition: totalWaitlist + 1,
          byClass,
          bookedByClass,
          classWaitlistCount: travelClass ? (byClass[travelClass]?.waitlistCount || 0) : totalWaitlist,
          nextClassWlPosition: travelClass ? (byClass[travelClass]?.nextWlPosition || 1) : (totalWaitlist + 1),
     };
};

module.exports = {
     createBooking,
     handlePaymentSuccess,
     handlePaymentFailure,
     handleScheduleCancelled,
     cancelBooking,
     getBooking,
     getUserBookings,
     verifyPayment,
     getPnrStatus,
     getScheduleWaitlist,
};
