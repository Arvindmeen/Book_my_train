const { esClient, TRAIN_INDEX, STATION_INDEX } = require('../config/elasticsearch');
const logger = require('../config/logger');

const cleanTrainName = (name) => String(name || '').replace(/\s*\(Return(?:\s+via\s+[^)]+)?\)/gi, '').replace(/\s*\((?:Return|RETURN)\)/gi, '').trim();

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

     const seatSummary = { total: 0, LOWER: 0, MIDDLE: 0, UPPER: 0, SIDE_LOWER: 0, SIDE_UPPER: 0, classes: {} };
     (train.seats || []).forEach((s) => {
          seatSummary.total++;
          if (seatSummary[s.seatType] !== undefined) seatSummary[s.seatType]++;
          const cls = s.travelClass || 'SL';
          seatSummary.classes[cls] = (seatSummary.classes[cls] || 0) + 1;
     });

     const doc = {
          trainId: train.id,
          trainNumber: train.trainNumber,
          trainName: cleanTrainName(train.trainName || train.name),
          trainType: train.trainType || 'EXPRESS',
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
                         // Strictly match the requested targetDate
                         scheduleInfo = src.schedules.find(
                              (s) => s.status === 'ACTIVE' && normalizeDateStr(s.departureDate) === targetDate
                         ) || null;
                    } else {
                         // If no specific date was requested, find the earliest upcoming active schedule
                         const todayStr = normalizeDateStr(new Date());
                         scheduleInfo = src.schedules.find(
                              (s) => s.status === 'ACTIVE' && normalizeDateStr(s.departureDate) >= todayStr
                         ) || src.schedules.find((s) => s.status === 'ACTIVE') || null;
                    }
               }

               return {
                    trainId: src.trainId,
                    trainNumber: src.trainNumber,
                    trainName: cleanTrainName(src.trainName),
                    trainType: src.trainType || 'EXPRESS',
                    runsOn: src.runsOn || 'Daily Service',
                    runningDays,
                    runsOnSelectedDate: operatesOnTargetDay,
                    route: src.route || [],
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
     let trimmed = input.trim();

     // Strip any code in parenthesis if present, e.g. "Chandausi Junction (CH)" -> try code CH or name
     const parenMatch = trimmed.match(/^(.+?)\s*\(([A-Z0-9]+)\)$/i);
     if (parenMatch) {
          const namePart = parenMatch[1].trim();
          const codePart = parenMatch[2].trim().toUpperCase();
          const codeRes = await esClient.search({
               index: STATION_INDEX,
               query: { term: { code: codePart } },
               size: 1,
          });
          if (codeRes.hits.hits.length > 0) return codeRes.hits.hits[0]._source;
          trimmed = namePart;
     }

     // 1. Try exact name match first (always prioritize full station name)
     const exactNameResult = await esClient.search({
          index: STATION_INDEX,
          query: { match_phrase: { name: trimmed } },
          size: 1,
     });
     if (exactNameResult.hits.hits.length > 0) return exactNameResult.hits.hits[0]._source;

     // 2. Try exact code match (if user entered code or number)
     const exactResult = await esClient.search({
          index: STATION_INDEX,
          query: { term: { code: trimmed.toUpperCase() } },
          size: 1,
     });
     if (exactResult.hits.hits.length > 0) return exactResult.hits.hits[0]._source;

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

     // 4. Fuzzy match on name or city
     const fuzzyResult = await esClient.search({
          index: STATION_INDEX,
          query: {
               multi_match: {
                    query: trimmed,
                    fields: ['name^3', 'city^2'],
                    fuzziness: 'AUTO',
                    prefix_length: 1,
               },
          },
          size: 1,
     });

     if (fuzzyResult.hits.hits.length > 0) {
          return fuzzyResult.hits.hits[0]._source;
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

const formatTrainSchedule = (source) => {
     const rawRoute = Array.isArray(source.route) ? [...source.route] : [];
     rawRoute.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

     const firstStop = rawRoute[0] || null;
     const lastStop = rawRoute.length > 0 ? rawRoute[rawRoute.length - 1] : null;

     const origin = firstStop ? {
          stationId: firstStop.stationId,
          name: firstStop.stationName,
          code: firstStop.stationCode,
          departureTime: firstStop.departureTime || '--:--',
          arrivalTime: firstStop.arrivalTime || 'Starts Here',
     } : null;

     const destination = lastStop ? {
          stationId: lastStop.stationId,
          name: lastStop.stationName,
          code: lastStop.stationCode,
          arrivalTime: lastStop.arrivalTime || '--:--',
          departureTime: lastStop.departureTime || 'Terminates Here',
     } : null;

     const totalDistance = lastStop?.distanceFromOrigin || 0;

     const formattedRoute = rawRoute.map((stop, idx) => ({
          sequenceNumber: stop.sequenceNumber || (idx + 1),
          stationId: stop.stationId,
          stationName: stop.stationName,
          stationCode: stop.stationCode,
          arrivalTime: stop.arrivalTime || (idx === 0 ? 'Starts Here' : '--:--'),
          departureTime: stop.departureTime || (idx === rawRoute.length - 1 ? 'Terminates' : '--:--'),
          distanceFromOrigin: stop.distanceFromOrigin || 0,
     }));

     return {
          trainId: source.trainId,
          trainNumber: source.trainNumber,
          trainName: cleanTrainName(source.trainName),
          runsOn: source.runsOn || 'Daily Service',
          runningDays: source.runningDays || [0, 1, 2, 3, 4, 5, 6],
          totalStops: rawRoute.length,
          totalDistance,
          origin,
          destination,
          route: formattedRoute,
          seatSummary: source.seatSummary || {},
          schedulesCount: Array.isArray(source.schedules) ? source.schedules.length : 0,
     };
};

/**
 * Search trains by train number, train name, or station name/code on its route.
 * Returns when it starts (origin + dep time) and where it goes (destination + arr time).
 */
const searchByTrain = async (query) => {
     const q = String(query || '').trim();

     let esQuery;
     if (!q) {
          esQuery = { match_all: {} };
     } else {
          const isNum = /^\d+$/.test(q);
          const should = [
               { prefix: { trainNumber: { value: q, boost: 10 } } },
               { match: { trainName: { query: q, fuzziness: 'AUTO', boost: 8 } } },
               {
                    nested: {
                         path: 'route',
                         query: {
                              bool: {
                                   should: [
                                        { term: { 'route.stationCode': { value: q.toUpperCase(), boost: 6 } } },
                                        { match: { 'route.stationName': { query: q, fuzziness: 'AUTO', boost: 4 } } },
                                   ]
                              }
                         }
                    }
               }
          ];

          if (isNum) {
               should.unshift({ term: { trainNumber: { value: q, boost: 20 } } });
          }

          esQuery = {
               bool: {
                    should,
                    minimum_should_match: 1,
               }
          };
     }

     try {
          const result = await esClient.search({
               index: TRAIN_INDEX,
               query: esQuery,
               size: 50,
          });

          return (result.hits?.hits || []).map((h) => formatTrainSchedule(h._source));
     } catch (err) {
          logger.error(`searchByTrain error: ${err.message}`);
          return [];
     }
};

const parseTimeToMinutes = (timeStr) => {
     if (!timeStr) return null;
     const s = String(timeStr).trim();
     if (s.toLowerCase() === 'starts' || s.toLowerCase() === 'terminates' || s.includes('--')) return null;

     const ampmMatch = s.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
     if (ampmMatch) {
          let hours = parseInt(ampmMatch[1], 10);
          const minutes = parseInt(ampmMatch[2], 10);
          const modifier = ampmMatch[3]?.toUpperCase();
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
     }

     const parts = s.split(':');
     if (parts.length >= 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
     }
     return null;
};

const formatDurationText = (minutes) => {
     const absM = Math.max(0, Math.floor(Math.abs(minutes)));
     const hrs = Math.floor(absM / 60);
     const mins = absM % 60;
     if (hrs === 0) return `${mins}m`;
     if (mins === 0) return `${hrs}h`;
     return `${hrs}h ${mins}m`;
};

const formatTrainLiveTelemetry = (t, customTime = null) => {
     // 1. Current IST time (Indian Standard Time UTC+5:30)
     const now = customTime ? new Date(customTime) : new Date();
     let istDate = now;
     try {
          istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
     } catch (_) {}

     const currentHour = istDate.getHours();
     const currentMin = istDate.getMinutes();
     const currentClockMinutes = currentHour * 60 + currentMin;
     const currentDayOfWeek = istDate.getDay(); // 0 = Sun, 1 = Mon ...
     const currentTimeFormatted = istDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
     });

     // 2. Extract route stops
     let rawStops = [];
     if (Array.isArray(t.route) && t.route.length > 0) {
          rawStops = t.route.map((rs, idx) => ({
               name: rs.stationName ? `${rs.stationName} (${rs.stationCode || rs.code || ''})` : (rs.name || `Station #${idx + 1}`),
               code: (rs.stationCode || rs.code || '').toUpperCase(),
               arrivalTime: rs.arrivalTime || null,
               departureTime: rs.departureTime || null,
               platform: rs.platform || `Pf #${(idx % 4) + 1}`,
               distance: rs.distanceFromOrigin || rs.distance || idx * 120,
          }));
     } else if (Array.isArray(t.stops) && t.stops.length > 0) {
          rawStops = t.stops.map((s, idx) => ({
               name: s.name || s.stationName || `Station #${idx + 1}`,
               code: (s.code || s.stationCode || '').toUpperCase(),
               arrivalTime: s.arrivalTime || s.time || null,
               departureTime: s.departureTime || s.time || null,
               platform: s.platform || `Pf #${(idx % 4) + 1}`,
               distance: s.distance || idx * 120,
          }));
     }

     if (rawStops.length === 0) {
          rawStops = [
               { name: t.from?.name || 'Origin Station', code: t.from?.code || '', arrivalTime: null, departureTime: t.from?.departure || '06:00', platform: 'Pf #1', distance: 0 },
               { name: t.to?.name || 'Destination Station', code: t.to?.code || '', arrivalTime: t.to?.arrival || '14:00', departureTime: null, platform: 'Pf #2', distance: 750 }
          ];
     }

     const originStop = rawStops[0];
     const destStop = rawStops[rawStops.length - 1];
     const originDepMin = parseTimeToMinutes(originStop.departureTime || originStop.arrivalTime) ?? 360;

     // 3. Map cumulative minutes from trip departure (0 min at origin)
     let cumulativeDayOffset = 0;
     let prevMinute = originDepMin;

     const mappedStops = rawStops.map((s, idx) => {
          let arrM = parseTimeToMinutes(s.arrivalTime);
          let depM = parseTimeToMinutes(s.departureTime);

          if (idx === 0) {
               arrM = originDepMin;
               depM = originDepMin;
          } else if (idx === rawStops.length - 1) {
               if (arrM === null) arrM = prevMinute + 60;
               depM = arrM;
          } else {
               if (arrM === null && depM !== null) arrM = depM;
               if (depM === null && arrM !== null) depM = arrM;
               if (arrM === null && depM === null) {
                    arrM = prevMinute + 60;
                    depM = arrM + 5;
               }
          }

          if (arrM < prevMinute - 60) {
               cumulativeDayOffset += 1440;
          }
          prevMinute = depM || arrM;

          const cumArr = Math.max(0, (arrM + cumulativeDayOffset) - originDepMin);
          const cumDep = Math.max(cumArr, (depM + cumulativeDayOffset) - originDepMin);

          return {
               ...s,
               time: s.departureTime || s.arrivalTime || '--:--',
               cumArr,
               cumDep,
          };
     });

     const totalTripDuration = mappedStops[mappedStops.length - 1].cumArr;
     const runningDays = Array.isArray(t.runningDays) && t.runningDays.length > 0 ? t.runningDays : [0, 1, 2, 3, 4, 5, 6];

     // 4. Check whether a trip is currently active right now
     const maxDaysAgo = Math.min(3, Math.ceil(totalTripDuration / 1440));
     let activeRun = null;

     for (let dayAgo = 0; dayAgo <= maxDaysAgo; dayAgo++) {
          const depDayOfWeek = (currentDayOfWeek - dayAgo + 7) % 7;
          if (!runningDays.includes(depDayOfWeek)) continue;

          const elapsedSinceDep = (currentClockMinutes + dayAgo * 1440) - originDepMin;
          if (elapsedSinceDep >= 0 && elapsedSinceDep <= totalTripDuration) {
               activeRun = { dayAgo, elapsedSinceDep, depDayOfWeek };
               break;
          }
     }

     const isRunning = activeRun !== null;
     const delay = t.delay ?? (t.trainType === 'VANDE_BHARAT' ? 0 : t.trainType === 'RAJDHANI' ? 4 : 0);

     // Phase classification: RUNNING | YET_TO_RUN | COMPLETED | FUTURE_SCHEDULE
     let phase = 'RUNNING';
     let completionMinsAgo = 0;

     if (!isRunning) {
          const runsToday = runningDays.includes(currentDayOfWeek);
          if (runsToday && currentClockMinutes < originDepMin) {
               phase = 'YET_TO_RUN';
          } else if (runsToday && currentClockMinutes > (originDepMin + totalTripDuration)) {
               phase = 'COMPLETED';
               completionMinsAgo = Math.max(0, currentClockMinutes - (originDepMin + totalTripDuration));
          } else {
               // Check if yesterday's scheduled run completed earlier today
               const yesterdayDayOfWeek = (currentDayOfWeek - 1 + 7) % 7;
               const runsYesterday = runningDays.includes(yesterdayDayOfWeek);
               const elapsedSinceYesterdayDep = (currentClockMinutes + 1440) - originDepMin;
               const yesterdayArrClockMin = (originDepMin + totalTripDuration) - 1440;

               if (runsYesterday && elapsedSinceYesterdayDep > totalTripDuration && yesterdayArrClockMin >= 0 && currentClockMinutes >= yesterdayArrClockMin) {
                    phase = 'COMPLETED';
                    completionMinsAgo = Math.max(0, currentClockMinutes - yesterdayArrClockMin);
               } else {
                    phase = 'FUTURE_SCHEDULE';
               }
          }
     }

     let currentStation = '';
     let nextStation = '';
     let currentPlatform = '';
     let trainSpeed = '110 km/h';
     let liveStatus = 'Running On Time';
     let liveSummary = '';
     let enrichedStops = [];
     let isMovingBetweenStations = false;
     let inTransitSegment = null;

     if (phase === 'RUNNING') {
          const elapsed = activeRun.elapsedSinceDep;

          // Check if halted at platform
          let haltIdx = -1;
          for (let i = 0; i < mappedStops.length; i++) {
               if (elapsed >= mappedStops[i].cumArr && elapsed <= mappedStops[i].cumDep) {
                    haltIdx = i;
                    break;
               }
          }

          if (haltIdx !== -1) {
               const stop = mappedStops[haltIdx];
               const nextStop = mappedStops[haltIdx + 1] || stop;
               const haltRemain = Math.max(0, stop.cumDep - elapsed);
               currentStation = stop.name.split(' (')[0];
               nextStation = nextStop.name.split(' (')[0];
               currentPlatform = stop.platform || 'Pf #1';
               trainSpeed = '0 km/h (Platform Halt)';
               liveStatus = delay > 0 ? `Halted • Delayed ${delay}m` : 'Halted at Platform';
               liveSummary = `Currently standing at platform at ${currentStation} (${currentPlatform}). Scheduled departure in ${haltRemain}m towards ${nextStation}.`;

               enrichedStops = mappedStops.map((s, idx) => {
                    const isPast = idx < haltIdx;
                    const isCurrent = idx === haltIdx;
                    const isNext = idx === haltIdx + 1;
                    return {
                         ...s,
                         departed: isPast,
                         current: isCurrent,
                         upcoming: idx > haltIdx,
                         isNextHalt: isNext,
                         statusDetail: isCurrent
                              ? `Standing at Platform • Scheduled Departure ${s.time}`
                              : isPast
                              ? `Passed at ${s.time}`
                              : `Scheduled Arrival: ${s.time}`,
                    };
               });
          } else {
               let lastPassedIdx = 0;
               for (let i = 0; i < mappedStops.length; i++) {
                    if (elapsed >= mappedStops[i].cumDep) {
                         lastPassedIdx = i;
                    } else {
                         break;
                    }
               }

               const lastStop = mappedStops[lastPassedIdx];
               const nextStop = mappedStops[lastPassedIdx + 1] || mappedStops[mappedStops.length - 1];
               const minsSinceDep = Math.max(0, elapsed - lastStop.cumDep);
               const minsUntilNext = Math.max(1, nextStop.cumArr - elapsed);
               const segmentDuration = Math.max(1, nextStop.cumArr - lastStop.cumDep);
               const progressPct = Math.min(95, Math.max(5, Math.round((minsSinceDep / segmentDuration) * 100)));

               currentStation = lastStop.name.split(' (')[0];
               nextStation = nextStop.name.split(' (')[0];
               currentPlatform = nextStop.platform || 'Pf #1';
               trainSpeed = t.trainType === 'VANDE_BHARAT' ? '130 km/h' : t.trainType === 'RAJDHANI' ? '120 km/h' : '110 km/h';
               liveStatus = delay > 0 ? `Delayed by ${delay}m` : 'Running On Time';
               liveSummary = `Departed ${currentStation} ${formatDurationText(minsSinceDep)} ago. Currently in transit between ${currentStation} & ${nextStation} (Expected in ${formatDurationText(minsUntilNext)} at ${nextStop.time}).`;

               isMovingBetweenStations = true;
               inTransitSegment = {
                    fromIdx: lastPassedIdx,
                    toIdx: lastPassedIdx + 1,
                    fromStation: currentStation,
                    toStation: nextStation,
                    minsSinceDep,
                    minsUntilNext,
                    progressPct,
                    speed: trainSpeed,
               };

               enrichedStops = mappedStops.map((s, idx) => {
                    const isPast = idx <= lastPassedIdx;
                    const isNext = idx === lastPassedIdx + 1;
                    const inTransitAfter = idx === lastPassedIdx && lastPassedIdx < mappedStops.length - 1;
                    return {
                         ...s,
                         departed: isPast,
                         current: false,
                         upcoming: idx > lastPassedIdx,
                         isNextHalt: isNext,
                         inTransitAfter,
                         statusDetail: isNext
                              ? `Next Halt: Expected in ${formatDurationText(minsUntilNext)} (at ${s.time})`
                              : isPast
                              ? `Departed at ${s.time} (${formatDurationText(elapsed - s.cumDep)} ago)`
                              : `Scheduled Arrival: ${s.time}`,
                    };
               });
          }
     } else if (phase === 'YET_TO_RUN') {
          const timeUntilDep = originDepMin - currentClockMinutes;
          currentStation = originStop.name.split(' (')[0];
          nextStation = mappedStops[1]?.name ? mappedStops[1].name.split(' (')[0] : destStop.name.split(' (')[0];
          currentPlatform = originStop.platform || 'Pf #1';
          trainSpeed = '0 km/h (Platform / Yard)';
          liveStatus = `Yet to Start • Departs in ${formatDurationText(timeUntilDep)}`;
          liveSummary = `Train is scheduled to depart today from ${currentStation} (${currentPlatform}) in ${formatDurationText(timeUntilDep)} at ${originStop.time || originStop.departureTime} towards ${destStop.name.split(' (')[0]}.`;

          enrichedStops = mappedStops.map((s, idx) => ({
               ...s,
               departed: false,
               current: idx === 0,
               upcoming: idx > 0,
               isNextHalt: false,
               inTransitAfter: false,
               statusDetail: idx === 0
                    ? `Origin Station • Scheduled Departure at ${s.time} (in ${formatDurationText(timeUntilDep)})`
                    : `Scheduled Arrival: ${s.time}`,
          }));
     } else if (phase === 'COMPLETED') {
          currentStation = destStop.name.split(' (')[0];
          nextStation = 'Terminated';
          currentPlatform = destStop.platform || 'Pf #1';
          trainSpeed = '0 km/h (Journey Ended)';
          liveStatus = `Journey Completed at ${destStop.time || destStop.arrivalTime}`;
          liveSummary = `Train completed its journey today. Arrived at destination ${currentStation} (${currentPlatform}) at ${destStop.time || destStop.arrivalTime} (${formatDurationText(completionMinsAgo)} ago).`;

          enrichedStops = mappedStops.map((s, idx) => {
               const isDest = idx === mappedStops.length - 1;
               return {
                    ...s,
                    departed: !isDest,
                    current: isDest,
                    upcoming: false,
                    isNextHalt: false,
                    inTransitAfter: false,
                    statusDetail: isDest
                         ? `Destination Reached at ${s.time} (${formatDurationText(completionMinsAgo)} ago)`
                         : `Departed at ${s.time}`,
               };
          });
     } else {
          currentStation = originStop.name.split(' (')[0];
          nextStation = mappedStops[1]?.name ? mappedStops[1].name.split(' (')[0] : destStop.name.split(' (')[0];
          currentPlatform = originStop.platform || 'Pf #1';
          trainSpeed = '0 km/h (Not Operating Today)';
          liveStatus = `Runs on ${t.runsOn || 'Timetable Service'}`;
          liveSummary = `Train does not operate on track today. Runs on: ${t.runsOn || 'Scheduled Days'}. Next run according to timetable.`;

          enrichedStops = mappedStops.map((s, idx) => ({
               ...s,
               departed: false,
               current: false,
               upcoming: true,
               isNextHalt: idx === 0,
               inTransitAfter: false,
               statusDetail: `Scheduled Time: ${s.time}`,
          }));
     }

     return {
          id: t.trainId || t.id || t.trainNumber,
          trainId: t.trainId || t.id,
          number: t.trainNumber || t.number,
          name: t.trainName || t.name,
          trainType: t.trainType || 'EXPRESS',
          fromName: originStop.name,
          toName: destStop.name,
          departureTime: originStop.time || originStop.departureTime,
          arrivalTime: destStop.time || destStop.arrivalTime,
          runsOn: t.runsOn || 'Daily Service',
          runningDays,
          phase,
          isRunning: phase === 'RUNNING',
          isYetToRun: phase === 'YET_TO_RUN',
          isCompleted: phase === 'COMPLETED',
          inTransit: isMovingBetweenStations,
          inTransitSegment,
          status: liveStatus,
          liveSummary,
          currentTimeFormatted,
          currentStation,
          nextStation,
          platform: currentPlatform,
          delay,
          speed: trainSpeed,
          stops: enrichedStops,
     };
};

/**
 * Live status query: checks timetable against real-time IST clock.
 * Returns running trains, yet to run trains, completed trains, and full corridor schedule.
 */
const getLiveStatus = async ({ from, to, train, time }) => {
     let matchedTrains = [];

     if (from && to) {
          const searchRes = await searchTrains(from, to);
          matchedTrains = searchRes?.trains || [];
     } else if (train) {
          matchedTrains = await searchByTrain(train);
     }

     const evaluated = matchedTrains.map((t) => formatTrainLiveTelemetry(t, time));
     const activeTrains = evaluated.filter((t) => t.phase === 'RUNNING');
     const yetToRunTrains = evaluated.filter((t) => t.phase === 'YET_TO_RUN');
     const completedTrains = evaluated.filter((t) => t.phase === 'COMPLETED');
     const otherDayTrains = evaluated.filter((t) => t.phase === 'FUTURE_SCHEDULE');

     let now = time ? new Date(time) : new Date();
     try {
          now = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
     } catch (_) {}

     return {
          from,
          to,
          queryTrain: train,
          currentTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          activeCount: activeTrains.length,
          yetToRunCount: yetToRunTrains.length,
          completedCount: completedTrains.length,
          totalCount: evaluated.length,
          activeTrains,
          yetToRunTrains,
          completedTrains,
          otherDayTrains,
          allTrains: evaluated,
     };
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
     searchByTrain,
     formatTrainLiveTelemetry,
     getLiveStatus,
};
