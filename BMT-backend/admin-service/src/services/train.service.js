const prisma = require("../config/prisma");
const { BadRequestError, ConflictError, NotFoundError } = require("../utils/error");

const adminProducer = require('../kafka/producer/admin.producer');
const logger = require("../config/logger");

const getSeatClassAndCoach = (seatNumber, totalSeats, trainType, trainName) => {
     const tName = (trainName || '').toLowerCase();
     const isVandeBharat = tName.includes('vande bharat') || tName.includes('shatabdi');
     const isRajdhani = tName.includes('rajdhani');

     if (isVandeBharat) {
          const ecCutoff = Math.max(1, Math.round(totalSeats * 0.20));
          if (seatNumber <= ecCutoff) {
               return { travelClass: 'EC', coach: 'E1' };
          }
          return { travelClass: 'CC', coach: 'C1' };
     }

     if (isRajdhani) {
          const c1AC = Math.max(1, Math.round(totalSeats * 0.15));
          const c2AC = c1AC + Math.max(1, Math.round(totalSeats * 0.30));
          if (seatNumber <= c1AC) return { travelClass: '1A', coach: 'H1' };
          if (seatNumber <= c2AC) return { travelClass: '2A', coach: 'A1' };
          return { travelClass: '3A', coach: 'B1' };
     }

     // Express / Mail standard roster
     const c1AC = Math.max(1, Math.round(totalSeats * 0.06));
     const c2AC = c1AC + Math.max(1, Math.round(totalSeats * 0.12));
     const c3AC = c2AC + Math.max(1, Math.round(totalSeats * 0.32));
     const cSL = c3AC + Math.max(1, Math.round(totalSeats * 0.32));

     if (seatNumber <= c1AC) return { travelClass: '1A', coach: 'H1' };
     if (seatNumber <= c2AC) return { travelClass: '2A', coach: 'A1' };
     if (seatNumber <= c3AC) return { travelClass: '3A', coach: 'B1' };
     if (seatNumber <= cSL) return { travelClass: 'SL', coach: 'S1' };
     return { travelClass: '2S', coach: 'D1' };
};

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
                    create: seats.map((seat) => {
                         const info = getSeatClassAndCoach(seat.seatNumber, seats.length, trainType, trainName);
                         return {
                              seatNumber: seat.seatNumber,
                              seatType: seat.seatType,
                              price: seat.price,
                              travelClass: seat.travelClass || info.travelClass || 'SL',
                              coach: seat.coach || info.coach || null
                         };
                    })
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
     const provisionedSchedules = [];
     try {
          const runningDays = Array.isArray(trainWithSeats.runningDays) && trainWithSeats.runningDays.length > 0
               ? trainWithSeats.runningDays
               : [0, 1, 2, 3, 4, 5, 6];

          const today = new Date();
          for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
               const schedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
               if (!runningDays.includes(schedDate.getDay())) continue;

               const year = schedDate.getFullYear();
               const month = String(schedDate.getMonth() + 1).padStart(2, '0');
               const day = String(schedDate.getDate()).padStart(2, '0');
               const dateStr = `${year}-${month}-${day}`;
               const departureDateUtc = new Date(`${dateStr}T00:00:00.000Z`);

               // Find or create schedule
               let schedule = await prisma.schedule.findUnique({
                    where: { trainId_departureDate: { trainId, departureDate: departureDateUtc } },
               });

               if (!schedule) {
                    schedule = await prisma.schedule.create({
                         data: {
                              trainId,
                              departureDate: departureDateUtc,
                              status: 'ACTIVE',
                         },
                    });
               }

               const classSummary = {};
               (trainWithSeats.seats || []).forEach((s) => {
                    const cls = s.travelClass || 'SL';
                    classSummary[cls] = (classSummary[cls] || 0) + 1;
               });

               const scheduleClasses = {};
               for (const [cls, count] of Object.entries(classSummary)) {
                    scheduleClasses[cls] = { totalSeats: count, available: count, locked: 0, booked: 0 };
               }

               provisionedSchedules.push({
                    scheduleId: schedule.id,
                    departureDate: dateStr,
                    status: schedule.status,
                    available: (trainWithSeats.seats || []).length,
                    locked: 0,
                    booked: 0,
                    classes: scheduleClasses,
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
                         travelClass: s.travelClass || 'SL',
                         coach: s.coach || null,
                    })),
                    route: route.routeStations.map((rs) => ({
                         stationId: rs.station.id,
                         stationName: rs.station.name,
                         stationCode: (rs.station.code || '').toUpperCase(),
                         city: rs.station.city || '',
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

     // Direct ES indexing for instant searchability across all stops
     const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
     try {
          const classSummary = {};
          const seatSummary = { total: (trainWithSeats.seats || []).length, LOWER: 0, MIDDLE: 0, UPPER: 0, SIDE_LOWER: 0, SIDE_UPPER: 0, classes: classSummary };
          (trainWithSeats.seats || []).forEach((s) => {
               if (seatSummary[s.seatType] !== undefined) seatSummary[s.seatType]++;
               const cls = s.travelClass || 'SL';
               classSummary[cls] = (classSummary[cls] || 0) + 1;
          });

          const runningDays = Array.isArray(trainWithSeats.runningDays) && trainWithSeats.runningDays.length > 0
               ? trainWithSeats.runningDays
               : [0, 1, 2, 3, 4, 5, 6];

          const doc = {
               trainId: trainWithSeats.id,
               trainNumber: trainWithSeats.trainNumber,
               trainName: trainWithSeats.trainName,
               runsOn: trainWithSeats.runsOn || 'Daily Service',
               runningDays,
               route: route.routeStations.map((rs) => ({
                    stationId: rs.station.id,
                    stationName: rs.station.name,
                    stationCode: (rs.station.code || '').toUpperCase(),
                    city: rs.station.city || '',
                    sequenceNumber: rs.sequenceNumber,
                    arrivalTime: rs.arrivalTime,
                    departureTime: rs.departureTime,
                    distanceFromOrigin: rs.distanceFromOrigin,
               })),
               schedules: provisionedSchedules,
               seatSummary,
          };

          await fetch(`${esUrl}/trains/_doc/${trainWithSeats.id}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(doc),
               signal: AbortSignal.timeout(3000),
          });

          // Also index intermediate stations for autocomplete & resolution
          for (const rs of route.routeStations) {
               await fetch(`${esUrl}/stations/_doc/${rs.station.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         stationId: rs.station.id,
                         name: rs.station.name,
                         code: (rs.station.code || '').toUpperCase(),
                         city: rs.station.city || '',
                         suggest: {
                              input: [rs.station.name, rs.station.code, rs.station.city].filter(Boolean),
                              weight: 10,
                         },
                    }),
                    signal: AbortSignal.timeout(2000),
               });
          }
          await fetch(`${esUrl}/trains/_refresh`, { method: 'POST', signal: AbortSignal.timeout(2000) });
          await fetch(`${esUrl}/stations/_refresh`, { method: 'POST', signal: AbortSignal.timeout(2000) });
          logger.info(`Directly indexed train ${trainWithSeats.trainNumber} and ${route.routeStations.length} stops to Elasticsearch`);
     } catch (_) {}

     return route;
};

const getAllTrains = async (search) => {
     const trimmed = String(search || '').trim();
     const where = trimmed ? {
          OR: [
               { trainNumber: { contains: trimmed, mode: 'insensitive' } },
               { trainName: { contains: trimmed, mode: 'insensitive' } },
               {
                    route: {
                         routeStations: {
                              some: {
                                   station: {
                                        OR: [
                                             { name: { contains: trimmed, mode: 'insensitive' } },
                                             { code: { contains: trimmed, mode: 'insensitive' } },
                                             { city: { contains: trimmed, mode: 'insensitive' } },
                                        ]
                                   }
                              }
                         }
                    }
               }
          ]
     } : {};

     return prisma.train.findMany({
          where,
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