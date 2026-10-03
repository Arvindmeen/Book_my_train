const { esClient, TRAIN_INDEX, STATION_INDEX } = require('../config/elasticsearch');
const logger = require('../config/logger');

// ═══════════════════════════════════════════════════
//  INDEX OPERATIONS (called by Kafka consumer)
// ═══════════════════════════════════════════════════

/**
 * When admin creates a station, index it for autocomplete.
 * Event shape: { eventType, data: { id, name, code, city, state }, timestamp }
 */
const indexStation = async (event) => {
     const station = event.data;
     if (!station) return;

     try {
          await esClient.index({
               index: STATION_INDEX,
               id: station.id,
               document: {
                    stationId: station.id,
                    name: station.name,
                    code: station.code,
                    city: station.city,
                    suggest: {
                         input: [station.name, station.code, station.city].filter(Boolean),
                         weight: 10,
                    },
               },
               refresh: true,
          });
          logger.info(`Indexed station ${station.name} (${station.code})`);
     } catch (err) {
          logger.error(`Failed to index station: ${err.message}`);
     }
};

/**
 * When admin creates a route, we get enriched payload with train+seats+routeStations.
 */
const indexTrainRoute = async (routeEvent) => {
     const { train, routeStations } = routeEvent;
     if (!train || !routeStations) return;

     const seatSummary = { total: 0, LOWER: 0, MIDDLE: 0, UPPER: 0, SIDE_LOWER: 0, SIDE_UPPER: 0 };
     (train.seats || []).forEach((s) => {
          seatSummary.total++;
          if (seatSummary[s.seatType] !== undefined) seatSummary[s.seatType]++;
     });

     const doc = {
          trainId: train.id,
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          runsOn: train.runsOn || 'Daily Service',
          runningDays: train.runningDays || [0, 1, 2, 3, 4, 5, 6],
          route: routeStations.map((rs) => ({
               stationId: rs.station.id,
               stationName: rs.station.name,
               stationCode: rs.station.code,
               sequenceNumber: rs.sequenceNumber,
               arrivalTime: rs.arrivalTime,
               departureTime: rs.departureTime,
               distanceFromOrigin: rs.distanceFromOrigin,
          })),
          schedules: [],
          seatSummary,
     };

     await esClient.index({
          index: TRAIN_INDEX,
          id: train.id,
          document: doc,
          refresh: true,
     });

     // Also index/update stations for autocomplete
     for (const rs of routeStations) {
          await esClient.index({
               index: STATION_INDEX,
               id: rs.station.id,
               document: {
                    stationId: rs.station.id,
                    name: rs.station.name,
                    code: rs.station.code,
                    city: rs.station.city,
                    suggest: {
                         input: [rs.station.name, rs.station.code, rs.station.city].filter(Boolean),
                         weight: 10,
                    },
               },
               refresh: true,
          });
     }

     logger.info(`Indexed train ${train.trainNumber} with ${routeStations.length} stations`);
};

/**
 * When admin creates a schedule, add it to the train's schedules array.
 */
const indexSchedule = async (scheduleEvent) => {
     const { scheduleId, trainId, departureDate, status, seats } = scheduleEvent;

     const totalSeats = seats ? seats.length : 0;

     try {
          await esClient.update({
               index: TRAIN_INDEX,
               id: trainId,
               script: {
                    source: `
            if (ctx._source.schedules == null) { ctx._source.schedules = []; }
            // Remove existing schedule with same id (idempotent)
            ctx._source.schedules.removeIf(s -> s.scheduleId == params.scheduleId);
            ctx._source.schedules.add(params.newSchedule);
          `,
                    params: {
                         scheduleId,
                         newSchedule: {
                              scheduleId,
                              departureDate,
                              status,
                              available: totalSeats,
                              locked: 0,
                              booked: 0,
                         },
                    },
               },
               refresh: true,
          });
          logger.info(`Indexed schedule ${scheduleId} for train ${trainId}`);
     } catch (err) {
          logger.warn(`Could not index schedule for train ${trainId}: ${err.message}`);
     }
};

/**
 * When admin cancels a schedule, update its status in ES.
 * Event shape: { eventType, data: { id, trainId, status: 'CANCELLED', ... }, timestamp }
 */
const cancelSchedule = async (event) => {
     const schedule = event.data;
     if (!schedule) return;

     try {
          await esClient.update({
               index: TRAIN_INDEX,
               id: schedule.trainId,
               script: {
                    source: `
            if (ctx._source.schedules != null) {
              for (def s : ctx._source.schedules) {
                if (s.scheduleId == params.scheduleId) {
                  s.status = 'CANCELLED';
                }
              }
            }
          `,
                    params: { scheduleId: schedule.id },
               },
               refresh: true,
          });
          logger.info(`Cancelled schedule ${schedule.id} for train ${schedule.trainId}`);
     } catch (err) {
          logger.warn(`Could not cancel schedule: ${err.message}`);
     }
};

/**
 * When inventory changes (seat booked/released), update availability counts.
 */
const updateSeatAvailability = async (event) => {
     const { scheduleId, trainId, available, locked, booked } = event;

     try {
          await esClient.update({
               index: TRAIN_INDEX,
               id: trainId,
               script: {
                    source: `
            if (ctx._source.schedules != null) {
              for (def s : ctx._source.schedules) {
                if (s.scheduleId == params.scheduleId) {
                  s.available = params.available;
                  s.locked    = params.locked;
                  s.booked    = params.booked;
                }
              }
            }
          `,
                    params: { scheduleId, available: available || 0, locked: locked || 0, booked: booked || 0 },
               },
               refresh: true,
          });
          logger.info(`Updated availability for schedule ${scheduleId}`);
     } catch (err) {
          logger.warn(`Could not update availability: ${err.message}`);
     }
};

// ═══════════════════════════════════════════════════
//  SEARCH OPERATIONS (called by API)
// ═══════════════════════════════════════════════════

/**
 * Search trains running between two stations on a given date.
 * Supports fuzzy matching on station names.
 */
const searchTrains = async (from, to, date) => {
     const fromStation = await resolveStation(from);
     const toStation = await resolveStation(to);

     if (!fromStation) return { trains: [], message: `Station "${from}" not found` };
     if (!toStation) return { trains: [], message: `Station "${to}" not found` };

     const query = {
          bool: {
               must: [
                    {
                         nested: {
                              path: 'route',
                              query: { term: { 'route.stationId': fromStation.stationId } },
                              inner_hits: { name: 'from_station' },
                         },
                    },
                    {
                         nested: {
                              path: 'route',
                              query: { term: { 'route.stationId': toStation.stationId } },
                              inner_hits: { name: 'to_station' },
                         },
                    },
               ],
          },
     };

     const result = await esClient.search({
          index: TRAIN_INDEX,
          query,
          size: 50,
     });

     const normalizeDateStr = (val) => {
          if (!val) return '';
          if (typeof val === 'string') {
               const match = val.match(/^\d{4}-\d{2}-\d{2}/);
               if (match) return match[0];
          }
          try {
               return new Date(val).toISOString().slice(0, 10);
          } catch {
               return String(val).slice(0, 10);
          }
     };

     const targetDate = date ? normalizeDateStr(date) : null;

     const trains = result.hits.hits
          .map((hit) => {
               const src = hit._source;
               const fromHit = hit.inner_hits.from_station.hits.hits[0]?._source;
               const toHit = hit.inner_hits.to_station.hits.hits[0]?._source;

               if (!fromHit || !toHit || fromHit.sequenceNumber >= toHit.sequenceNumber) {
                    return null;
               }

               let scheduleInfo = null;
               if (src.schedules && src.schedules.length > 0) {
                    if (targetDate) {
                         scheduleInfo = src.schedules.find(
                              (s) => s.status === 'ACTIVE' && normalizeDateStr(s.departureDate) === targetDate
                         ) || null;
                    } else {
                         const todayStr = normalizeDateStr(new Date());
                         scheduleInfo = src.schedules.find(
                              (s) => s.status === 'ACTIVE' && normalizeDateStr(s.departureDate) >= todayStr
                         ) || src.schedules[0] || null;
                    }
               }

               // If a specific date was requested and the train does NOT run on that date, exclude it
               if (targetDate && !scheduleInfo) {
                    return null;
               }

               return {
                    trainId: src.trainId,
                    trainNumber: src.trainNumber,
                    trainName: src.trainName,
                    runsOn: src.runsOn || 'Daily Service',
                    runningDays: src.runningDays || [0, 1, 2, 3, 4, 5, 6],
                    // --- SEGMENT BOOKING: Added stationId and sequenceNumber to from/to for segment-aware booking ---
                    from: { name: fromHit.stationName, code: fromHit.stationCode, departure: fromHit.departureTime, stationId: fromHit.stationId, sequenceNumber: fromHit.sequenceNumber },
                    to: { name: toHit.stationName, code: toHit.stationCode, arrival: toHit.arrivalTime, stationId: toHit.stationId, sequenceNumber: toHit.sequenceNumber },
                    seatSummary: src.seatSummary,
                    schedule: scheduleInfo,
               };
          })
          .filter(Boolean);

     return {
          from: { resolved: fromStation.name, code: fromStation.code },
          to: { resolved: toStation.name, code: toStation.code },
          date: date || 'any',
          count: trains.length,
          trains,
     };
};

/**
 * Fuzzy-resolve a station name/code to its ID.
 * Three strategies: exact code → completion suggester → fuzzy match
 */
const resolveStation = async (input) => {
     // 1. Try exact code match
     const exactResult = await esClient.search({
          index: STATION_INDEX,
          query: { term: { code: input.toUpperCase() } },
          size: 1,
     });
     if (exactResult.hits.hits.length > 0) return exactResult.hits.hits[0]._source;

     // 2. Try completion suggester (handles typos like "dehli" → "Delhi")
     try {
          const suggestResult = await esClient.search({
               index: STATION_INDEX,
               suggest: {
                    station_suggest: {
                         prefix: input,
                         completion: {
                              field: 'suggest',
                              fuzzy: { fuzziness: 'AUTO' },
                              size: 1,
                         },
                    },
               },
          });
          const options = suggestResult.suggest?.station_suggest?.[0]?.options || [];
          if (options.length > 0) return options[0]._source;
     } catch (err) {
          logger.warn(`Suggest fallback failed: ${err.message}`);
     }

     // 3. Fuzzy match on name
     const fuzzyResult = await esClient.search({
          index: STATION_INDEX,
          query: {
               multi_match: {
                    query: input,
                    fields: ['name', 'city'],
                    fuzziness: 'AUTO',
                    prefix_length: 1,
               },
          },
          size: 1,
     });

     return fuzzyResult.hits.hits.length > 0 ? fuzzyResult.hits.hits[0]._source : null;
};

/**
 * Autocomplete station names as user types.
 * Uses multi_match with fuzzy for case-insensitive matching (completion suggester is case-sensitive).
 */
const autocompleteStation = async (prefix) => {
     const result = await esClient.search({
          index: STATION_INDEX,
          query: {
               bool: {
                    should: [
                         // Exact prefix match on code (highest priority)
                         {
                              prefix: {
                                   code: { value: prefix.toUpperCase(), boost: 10 }
                              }
                         },
                         // Fuzzy match on name
                         {
                              match: {
                                   name: {
                                        query: prefix,
                                        fuzziness: 'AUTO',
                                        prefix_length: 1,
                                        boost: 5,
                                   }
                              }
                         },
                         // Fuzzy match on city
                         {
                              match: {
                                   city: {
                                        query: prefix,
                                        fuzziness: 'AUTO',
                                        prefix_length: 1,
                                        boost: 3,
                                   }
                              }
                         },
                    ],
               },
          },
          size: 10,
     });

     return result.hits.hits.map((h) => ({
          name: h._source.name,
          code: h._source.code,
          stationId: h._source.stationId,
     }));
};

/**
 * Debug: get all indexed stations
 */
const getAllStations = async () => {
     const result = await esClient.search({
          index: STATION_INDEX,
          query: { match_all: {} },
          size: 100,
     });
     return result.hits.hits.map((h) => h._source);
};

/**
 * Debug: get all indexed trains
 */
const getAllTrains = async () => {
     const result = await esClient.search({
          index: TRAIN_INDEX,
          query: { match_all: {} },
          size: 100,
     });
     return result.hits.hits.map((h) => h._source);
};

module.exports = {
     indexStation,
     indexTrainRoute,
     indexSchedule,
     cancelSchedule,
     updateSeatAvailability,
     searchTrains,
     autocompleteStation,
     getAllStations,
     getAllTrains,
};
