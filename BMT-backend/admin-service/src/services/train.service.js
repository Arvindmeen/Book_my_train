const prisma = require("../config/prisma");
const { BadRequestError, ConflictError, NotFoundError } = require("../utils/error");

const adminProducer = require('../kafka/producer/admin.producer');
const logger = require("../config/logger");

const createTrain = async (data) => {
     const { trainNumber, trainName, coachName, seats, runsOn, runningDays, trainType } = data;
     const existing = await prisma.train.findUnique(
          { where: { trainNumber } }
     )
     if (existing) {
          throw new ConflictError("Train with this number already exists");
     }

     const seatNumbers = seats.map((s) => s.seatNumber);

     if (new Set(seatNumbers).size !== seatNumbers.length) {
          throw new BadRequestError('Duplicate seat numbers found');
     }

     const train = await prisma.train.create({
          data: {
               trainNumber,
               trainName,
               coachName: coachName || 'AC',
               totalSeats: seats.length,
               runsOn: runsOn || 'Daily Service',
               runningDays: runningDays || [0, 1, 2, 3, 4, 5, 6],
               trainType: trainType || 'EXPRESS',
               seats: {
                    create: seats.map((seat) => ({
                         seatNumber: seat.seatNumber,
                         seatType: seat.seatType,
                         price: seat.price
                    }))
               }
          },
          include: { seats: { orderBy: { seatNumber: 'asc' } } }
     })

     await adminProducer.publishTrainCreated(train).catch((err) => {
          logger.error('Failed to publish train created event', { error: err.message });
     });

     return train;
}

const createRoute = async (data) => {
     const { trainId, stations } = data;

     const train = await prisma.train.findUnique({
          where: { id: trainId }
     });

     if (!train) {
          throw new NotFoundError('Train not found');
     }

     const existingRoute = await prisma.route.findUnique({
          where: { trainId }
     })

     if (existingRoute) {
          throw new ConflictError("Route already exists for this train")
     }

     const stationIds = stations.map((station) => station.stationId);
     const existingStations = await prisma.station.findMany({
          where: { id: { in: stationIds } }
     })
     if (existingStations.length !== stationIds.length) {
          throw new BadRequestError('One or more station IDs are invalid');
     }

     const sorted = [...stations].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
     for (let i = 0; i < sorted.length; i++) {
          if (sorted[i].sequenceNumber !== i + 1) {
               throw new BadRequestError('Sequence numbers must be continuous starting from 1');
          }
     }
     const route = await prisma.route.create({
          data: {
               trainId,
               routeStations: {
                    create: stations.map((s) => ({
                         stationId: s.stationId,
                         sequenceNumber: s.sequenceNumber,
                         arrivalTime: s.arrivalTime || null,
                         departureTime: s.departureTime || null,
                         distanceFromOrigin: s.distanceFromOrigin || 0,
                    }))
               }
          },
          include: {
               routeStations: {
                    include: { station: true },
                    orderBy: { sequenceNumber: 'asc' },
               },
          },
     });

     const trainWithSeats = await prisma.train.findUnique({
          where: { id: trainId },
          include: { seats: { orderBy: { seatNumber: 'asc' } } },
     });

     await adminProducer.publishRouteCreated({ ...route, train: trainWithSeats });

     // Auto-provision next 30 days of schedules for this route based on train's runningDays
     try {
          const runningDays = Array.isArray(trainWithSeats.runningDays) && trainWithSeats.runningDays.length > 0
               ? trainWithSeats.runningDays
               : [0, 1, 2, 3, 4, 5, 6];

          const today = new Date();
          for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
               const schedDate = new Date(today);
               schedDate.setDate(today.getDate() + dayOffset);
               schedDate.setHours(0, 0, 0, 0);

               if (!runningDays.includes(schedDate.getDay())) continue;

               const dateStr = schedDate.toISOString().split('T')[0];

               const schedule = await prisma.schedule.create({
                    data: {
                         trainId,
                         departureDate: schedDate,
                         status: 'ACTIVE',
                    },
               });

               await adminProducer.publishScheduleCreated({
                    scheduleId: schedule.id,
                    trainId: trainWithSeats.id,
                    trainNumber: trainWithSeats.trainNumber,
                    trainName: trainWithSeats.trainName,
                    coachName: trainWithSeats.coachName,
                    totalSeats: trainWithSeats.totalSeats,
                    departureDate: dateStr,
                    status: schedule.status,
                    seats: (trainWithSeats.seats || []).map((s) => ({
                         seatId: s.id,
                         seatNumber: s.seatNumber,
                         seatType: s.seatType,
                         price: s.price,
                    })),
                    route: route.routeStations.map((rs) => ({
                         stationId: rs.station.id,
                         stationName: rs.station.name,
                         stationCode: rs.station.code,
                         sequenceNumber: rs.sequenceNumber,
                         arrivalTime: rs.arrivalTime,
                         departureTime: rs.departureTime,
                         distanceFromOrigin: rs.distanceFromOrigin,
                    })),
               });
          }
          logger.info(`Auto-provisioned 30-day schedules for train ${trainWithSeats.trainNumber}`);
     } catch (schedErr) {
          logger.warn(`Could not auto-provision schedules for route: ${schedErr.message}`);
     }

     return route;
};

const getAllTrains = async () => {
     return prisma.train.findMany({
          include: {
               seats: { orderBy: { seatNumber: 'asc' } },
               route: {
                    include: {
                         routeStations: {
                              include: { station: true },
                              orderBy: { sequenceNumber: 'asc' },
                         },
                    },
               },
          },
          orderBy: { trainNumber: 'asc' },
     });
};

const getTrainById = async (id) => {
     const train = await prisma.train.findUnique({
          where: { id },
          include: {
               seats: { orderBy: { seatNumber: 'asc' } },
               route: {
                    include: {
                         routeStations: {
                              include: { station: true },
                              orderBy: { sequenceNumber: 'asc' },
                         },
                    },
               },
          },
     });
     if (!train) throw new NotFoundError('Train not found');
     return train;
};
module.exports = { createTrain, createRoute, getAllTrains, getTrainById };