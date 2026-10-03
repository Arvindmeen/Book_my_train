const prisma = require("../config/prisma");
const { ConflictError, NotFoundError } = require("../utils/error");
const logger = require('../config/logger');
const adminProducer = require('../kafka/producer/admin.producer');

const createStation = async (data) => {
     const existing = await prisma.station.findUnique({
          where: { code: data.code }
     });

     if (existing) {
          throw new ConflictError('Station code already exists');
     }

     const station = await prisma.station.create({
          data
     });

     logger.info('Station Created', { id: station.id, code: station.code });

     // Publish event - fire and forget (non-critical)
     await adminProducer.publishStationCreated(station).catch((err) => {
          logger.error('Failed to publish station created event', { error: err.message });
     });

     // Direct ES index for instant availability across search & autocomplete
     const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
     try {
          await fetch(`${esUrl}/stations/_doc/${station.id}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                    stationId: station.id,
                    name: station.name,
                    code: (station.code || '').toUpperCase(),
                    city: station.city || '',
                    suggest: {
                         input: [station.name, station.code, station.city].filter(Boolean),
                         weight: 10,
                    },
               }),
               signal: AbortSignal.timeout(2000),
          });
          await fetch(`${esUrl}/stations/_refresh`, { method: 'POST', signal: AbortSignal.timeout(2000) });
     } catch (_) {}

     return station;
};

const getAllStations = async (page, limit, search) => {
     const skip = (page - 1) * limit;

     const where = search ? {
          OR: [
               { code: { contains: search, mode: 'insensitive' } },
               { name: { contains: search, mode: 'insensitive' } },
               { city: { contains: search, mode: 'insensitive' } }
          ]
     } : {};

     const [stations, total] = await Promise.all([
          prisma.station.findMany({
               where,
               skip,
               take: limit,
               orderBy: {
                    name: 'asc'
               }
          }),
          prisma.station.count({ where })
     ]);

     return { stations, total };
};

const getStationById = async (stationId) => {
     const station = await prisma.station.findUnique({
          where: { id: stationId }
     });

     if (!station) {
          throw new NotFoundError('Station not found');
     }

     return station;
};


module.exports = { createStation, getAllStations, getStationById };