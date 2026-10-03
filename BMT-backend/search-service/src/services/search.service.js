const { esClient, TRAIN_INDEX, STATION_INDEX } = require('../config/elasticsearch');
const logger = require('../config/logger');

// ═══════════════════════════════════════════════════
//  INDEX OPERATIONS (called by Kafka consumer)
// ═══════════════════════════════════════════════════

/**
 * When admin creates a station, index it for autocomplete.
 * Event shape: { eventType, data: { id, name, code, city, state }, timestamp } or raw station
 */
const indexStation = async (event) => {
     const station = event?.data || event;
     if (!station || !station.id) return;

     try {
          await esClient.index({
               index: STATION_INDEX,
               id: station.id,
               document: {
                    stationId: station.id,
                    name: station.name,
                    code: (station.code || '').toUpperCase(),
                    city: station.city || '',
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
     const data = routeEvent?.data || routeEvent;
     const { train, routeStations } = data;
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
          route: (routeStations || []).map((rs) => {
               const st = rs.station || rs;
               return {
                    stationId: st.id || rs.stationId,
                    stationName: st.name || rs.stationName || 'Station',
                    stationCode: (st.code || rs.stationCode || '').toUpperCase(),
                    sequenceNumber: rs.sequenceNumber,
                    arrivalTime: rs.arrivalTime,
                    departureTime: rs.departureTime,
                    distanceFromOrigin: rs.distanceFromOrigin,
               };
          }),
          schedules: [],
          seatSummary,
     };

     await esClient.index({
          index: TRAIN_INDEX,
          id: train.id,
          document: doc,
          refresh: true,
     });

     // Also index/update ALL stations on this route for autocomplete and resolution
     for (const rs of (routeStations || [])) {
          const st = rs.station || rs;
          const stId = st.id || rs.stationId;
          if (!stId) continue;
          await esClient.index({
               index: STATION_INDEX,
               id: stId,
               document: {
                    stationId: stId,
                    name: st.name || rs.stationName || 'Station',
                    code: (st.code || rs.stationCode || '').toUpperCase(),
                    city: st.city || '',
                    suggest: {
                         input: [st.name || rs.stationName, st.code || rs.stationCode, st.city].filter(Boolean),
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

     if (!fromStation) return { trains: [], message: `Station "${from}" not found. Please select a valid station from the suggestions.` };
     if (!toStation) return { trains: [], message: `Station "${to}" not found. Please select a valid station from the suggestions.` };

     const fromStationId = fromStation.stationId || fromStation.id;
     const toStationId = toStation.stationId || toStation.id;
     const fromStationCode = fromStation.code ? fromStation.code.toUpperCase() : null;
     const toStationCode = toStation.code ? toStation.code.toUpperCase() : null;

     const fromQueries = [{ term: { 'route.stationId': fromStationId } }];
     if (fromStationCode) {
          fromQueries.push({ term: { 'route.stationCode': fromStationCode } });
     }
     if (fromStation.name) {
          fromQueries.push({ match_phrase: { 'route.stationName': fromStation.name } });
     }

     const toQueries = [{ term: { 'route.stationId': toStationId } }];
     if (toStationCode) {
          toQueries.push({ term: { 'route.stationCode': toStationCode } });
     }
     if (toStation.name) {
          toQueries.push({ match_phrase: { 'route.stationName': toStation.name } });
     }

     const query = {
          bool: {
               must: [
                    {
                         nested: {
                              path: 'route',
                              query: {
                                   bool: {
                                        should: fromQueries,
                                        minimum_should_match: 1,
                                   },
                              },
                              inner_hits: { name: 'from_station' },
                         },
                    },
                    {
                         nested: {
                              path: 'route',
                              query: {
                                   bool: {
                                        should: toQueries,
                                        minimum_should_match: 1,
                                   },
                              },
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

     const trains = (result.hits?.hits || [])
          .map((hit) => {
               const src = hit._source;
               const fromHit = hit.inner_hits?.from_station?.hits?.hits?.[0]?._source;
               const toHit = hit.inner_hits?.to_station?.hits?.hits?.[0]?._source;

               if (!fromHit || !toHit || fromHit.sequenceNumber >= toHit.sequenceNumber) {
                    return null;
               }

               const runningDays = Array.isArray(src.runningDays) && src.runningDays.length > 0 ? src.runningDays : [0, 1, 2, 3, 4, 5, 6];
               const searchDayOfWeek = targetDate ? new Date(targetDate + 'T00:00:00Z').getUTCDay() : null;
               const operatesOnTargetDay = searchDayOfWeek !== null ? runningDays.includes(searchDayOfWeek) : true;

               let scheduleInfo = null;
               if (src.schedules && src.schedules.length > 0) {
                    if (targetDate) {
                         scheduleInfo = src.schedules.find(
                              (s) => s.status === 'ACTIVE' && normalizeDateStr(s.departureDate) === targetDate
                         ) || null;
                    }
                    if (!scheduleInfo) {
                         const todayStr = normalizeDateStr(new Date());
                         scheduleInfo = src.schedules.find(
                              (s) => s.status === 'ACTIVE' && normalizeDateStr(s.departureDate) >= todayStr
                         ) || src.schedules[0] || null;
                    }
               }

               // Always ensure scheduleInfo exists so the user can see seats & availability
               if (!scheduleInfo) {
                    const fallbackDate = targetDate || normalizeDateStr(new Date());
                    scheduleInfo = {
                         scheduleId: `${src.trainId}-${fallbackDate}`,
                         departureDate: fallbackDate,
                         status: 'ACTIVE',
                         available: src.seatSummary?.total || 72,
                         locked: 0,
                         booked: 0,
                    };
               }

               return {
                    trainId: src.trainId,
                    trainNumber: src.trainNumber,
                    trainName: src.trainName,
                    runsOn: src.runsOn || 'Daily Service',
                    runningDays,
                    runsOnSelectedDate: operatesOnTargetDay,
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
 * Three strategies: exact code → exact name → completion suggester → fuzzy match
 */
const resolveStation = async (input) => {
     if (!input || typeof input !== 'string') return null;
     const trimmed = input.trim();

     // 1. Try exact code match
     const exactResult = await esClient.search({
          index: STATION_INDEX,
          query: { term: { code: trimmed.toUpperCase() } },
          size: 1,
     });
     if (exactResult.hits.hits.length > 0) return exactResult.hits.hits[0]._source;

     // 2. Try exact name match
     const exactNameResult = await esClient.search({
          index: STATION_INDEX,
          query: { match_phrase: { name: trimmed } },
          size: 1,
     });
     if (exactNameResult.hits.hits.length > 0) return exactNameResult.hits.hits[0]._source;

     // 3. Try completion suggester (handles typos like "dehli" → "Delhi")
     try {
          const suggestResult = await esClient.search({
               index: STATION_INDEX,
               suggest: {
                    station_suggest: {
                         prefix: trimmed,
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

     // 4. Fuzzy match on name (ONLY if NOT pure numbers)
     if (!/^\d+$/.test(trimmed)) {
          const fuzzyResult = await esClient.search({
               index: STATION_INDEX,
               query: {
                    multi_match: {
                         query: trimmed,
                         fields: ['name^2', 'city'],
                         fuzziness: 'AUTO',
                         prefix_length: 1,
                    },
               },
               size: 1,
          });

          if (fuzzyResult.hits.hits.length > 0 && fuzzyResult.hits.hits[0]._score >= 1.5) {
               return fuzzyResult.hits.hits[0]._source;
          }
     }

     return null;
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

     const seenCodes = new Set();
     const seenNames = new Set();
     const unique = [];

     for (const h of (result.hits?.hits || [])) {
          const s = h._source;
          if (!s || !s.name || !s.code) continue;
          const codeUpper = String(s.code).toUpperCase().trim();
          const nameNorm = String(s.name).toLowerCase().replace(/[^a-z0-9]/g, '');

          if (seenCodes.has(codeUpper) || seenNames.has(nameNorm)) {
               continue;
          }

          seenCodes.add(codeUpper);
          seenNames.add(nameNorm);
          unique.push({
               name: s.name,
               code: codeUpper,
               stationId: s.stationId || h._id,
          });

          if (unique.length >= 8) break;
     }

     return unique;
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
