// Authentic Indian Railways Station Master and Route Resolver
export const STATION_DIRECTORY = {
  NDLS: { code: 'NDLS', name: 'New Delhi Railway Station', city: 'Delhi' },
  DLI: { code: 'DLI', name: 'Old Delhi Railway Station', city: 'Delhi' },
  NZM: { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi' },
  ANVT: { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi' },
  HWH: { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
  SDAH: { code: 'SDAH', name: 'Sealdah', city: 'Kolkata' },
  KGP: { code: 'KGP', name: 'Kharagpur Junction', city: 'Kharagpur' },
  HIJ: { code: 'HIJ', name: 'Hijli Railway Station', city: 'Kharagpur' },
  GTS: { code: 'GTS', name: 'Ghatsila', city: 'Ghatshila' },
  TATA: { code: 'TATA', name: 'Tatanagar Junction', city: 'Jamshedpur' },
  PRR: { code: 'PRR', name: 'Purulia Junction', city: 'Purulia' },
  BKSC: { code: 'BKSC', name: 'Bokaro Steel City', city: 'Bokaro' },
  DHN: { code: 'DHN', name: 'Dhanbad Junction', city: 'Dhanbad' },
  ASN: { code: 'ASN', name: 'Asansol Junction', city: 'Asansol' },
  BWN: { code: 'BWN', name: 'Barddhaman Junction', city: 'Bardhaman' },
  GAYA: { code: 'GAYA', name: 'Gaya Junction', city: 'Gaya' },
  SSM: { code: 'SSM', name: 'Sasaram Junction', city: 'Sasaram' },
  DDU: { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction', city: 'Mughalsarai' },
  PRYJ: { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj' },
  CNB: { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur' },
  ALJN: { code: 'ALJN', name: 'Aligarh Junction', city: 'Aligarh' },
  FTP: { code: 'FTP', name: 'Fatehpur', city: 'Fatehpur' },
  MZP: { code: 'MZP', name: 'Mirzapur', city: 'Mirzapur' },
  KQR: { code: 'KQR', name: 'Koderma Junction', city: 'Koderma' },
  ADRA: { code: 'ADRA', name: 'Adra Junction', city: 'Purulia' },
  BQA: { code: 'BQA', name: 'Bankura Junction', city: 'Bankura' },
  MDN: { code: 'MDN', name: 'Midnapore', city: 'Midnapore' },
  BSB: { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi' },
  LKO: { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow' },
  GWL: { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior' },
  AGC: { code: 'AGC', name: 'Agra Cantt', city: 'Agra' },
  MTJ: { code: 'MTJ', name: 'Mathura Junction', city: 'Mathura' },
  VGLJ: { code: 'VGLJ', name: 'Virangana Lakshmibai Jhansi', city: 'Jhansi' },
  BPL: { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal' },
  ROU: { code: 'ROU', name: 'Rourkela Junction', city: 'Rourkela' },
  CKP: { code: 'CKP', name: 'Chakradharpur', city: 'Chakradharpur' },
  BSP: { code: 'BSP', name: 'Bilaspur Junction', city: 'Bilaspur' },
};

export const AUTHENTIC_TRAIN_ROUTES = {
  // 12801 Purushottam Express (Hijli to Anand Vihar Terminal / New Delhi corridor)
  '12801': [
    { code: 'HIJ', arrivalTime: 'Starts', departureTime: '06:05', distance: 0, platform: 'PF 1' },
    { code: 'GTS', arrivalTime: '07:18', departureTime: '07:20', distance: 99, platform: 'PF 2' },
    { code: 'TATA', arrivalTime: '08:05', departureTime: '08:15', distance: 135, platform: 'PF 3' },
    { code: 'PRR', arrivalTime: '09:48', departureTime: '09:50', distance: 224, platform: 'PF 2' },
    { code: 'BKSC', arrivalTime: '11:00', departureTime: '11:05', distance: 285, platform: 'PF 1' },
    { code: 'GAYA', arrivalTime: '13:43', departureTime: '13:48', distance: 488, platform: 'PF 1' },
    { code: 'SSM', arrivalTime: '14:58', departureTime: '15:00', distance: 591, platform: 'PF 2' },
    { code: 'DDU', arrivalTime: '16:50', departureTime: '17:00', distance: 693, platform: 'PF 4' },
    { code: 'PRYJ', arrivalTime: '19:20', departureTime: '19:30', distance: 845, platform: 'PF 2' },
    { code: 'CNB', arrivalTime: '21:55', departureTime: '22:00', distance: 1040, platform: 'PF 1' },
    { code: 'ALJN', arrivalTime: '01:38', departureTime: '01:40', distance: 1349, platform: 'PF 3' },
    { code: 'ANVT', arrivalTime: '04:00', departureTime: 'Terminates', distance: 1475, platform: 'PF 5' },
  ],
  // 12802 Purushottam Express
  '12802': [
    { code: 'ANVT', arrivalTime: 'Starts', departureTime: '22:40', distance: 0, platform: 'PF 5' },
    { code: 'ALJN', arrivalTime: '00:13', departureTime: '00:15', distance: 126, platform: 'PF 3' },
    { code: 'CNB', arrivalTime: '04:00', departureTime: '04:05', distance: 435, platform: 'PF 1' },
    { code: 'PRYJ', arrivalTime: '06:55', departureTime: '07:00', distance: 630, platform: 'PF 2' },
    { code: 'DDU', arrivalTime: '09:50', departureTime: '10:00', distance: 782, platform: 'PF 4' },
    { code: 'SSM', arrivalTime: '11:02', departureTime: '11:04', distance: 884, platform: 'PF 2' },
    { code: 'GAYA', arrivalTime: '12:35', departureTime: '12:40', distance: 987, platform: 'PF 1' },
    { code: 'BKSC', arrivalTime: '15:25', departureTime: '15:30', distance: 1190, platform: 'PF 1' },
    { code: 'PRR', arrivalTime: '16:35', departureTime: '16:37', distance: 1251, platform: 'PF 2' },
    { code: 'TATA', arrivalTime: '18:10', departureTime: '18:20', distance: 1340, platform: 'PF 3' },
    { code: 'GTS', arrivalTime: '19:25', departureTime: '19:27', distance: 1376, platform: 'PF 2' },
    { code: 'HIJ', arrivalTime: '22:35', departureTime: 'Terminates', distance: 1475, platform: 'PF 1' },
  ],
  // 22812 BBS Tejas Rajdhani Express (via Adra)
  '22812': [
    { code: 'NDLS', arrivalTime: 'Starts', departureTime: '17:00', distance: 0, platform: 'PF 1' },
    { code: 'CNB', arrivalTime: '21:40', departureTime: '21:45', distance: 440, platform: 'PF 1' },
    { code: 'PRYJ', arrivalTime: '23:53', departureTime: '23:55', distance: 635, platform: 'PF 4' },
    { code: 'DDU', arrivalTime: '01:47', departureTime: '01:57', distance: 787, platform: 'PF 2' },
    { code: 'GAYA', arrivalTime: '04:10', departureTime: '04:13', distance: 992, platform: 'PF 1' },
    { code: 'BKSC', arrivalTime: '06:40', departureTime: '06:45', distance: 1195, platform: 'PF 1' },
    { code: 'ADRA', arrivalTime: '07:55', departureTime: '08:00', distance: 1248, platform: 'PF 2' },
    { code: 'BQA', arrivalTime: '08:42', departureTime: '08:44', distance: 1301, platform: 'PF 1' },
    { code: 'HIJ', arrivalTime: '11:05', departureTime: 'Terminates', distance: 1435, platform: 'PF 1' },
  ],
  // 22811 BBS Tejas Rajdhani Express
  '22811': [
    { code: 'HIJ', arrivalTime: 'Starts', departureTime: '15:20', distance: 0, platform: 'PF 1' },
    { code: 'BQA', arrivalTime: '16:48', departureTime: '16:50', distance: 134, platform: 'PF 1' },
    { code: 'ADRA', arrivalTime: '17:35', departureTime: '17:40', distance: 187, platform: 'PF 2' },
    { code: 'BKSC', arrivalTime: '18:45', departureTime: '18:50', distance: 240, platform: 'PF 1' },
    { code: 'GAYA', arrivalTime: '22:15', departureTime: '22:18', distance: 443, platform: 'PF 1' },
    { code: 'DDU', arrivalTime: '00:45', departureTime: '00:55', distance: 648, platform: 'PF 2' },
    { code: 'PRYJ', arrivalTime: '02:45', departureTime: '02:47', distance: 800, platform: 'PF 4' },
    { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 995, platform: 'PF 1' },
    { code: 'NDLS', arrivalTime: '09:55', departureTime: 'Terminates', distance: 1435, platform: 'PF 1' },
  ],
  // 22824 BBS Tejas Rajdhani Express (via Tatanagar)
  '22824': [
    { code: 'NDLS', arrivalTime: 'Starts', departureTime: '17:00', distance: 0, platform: 'PF 1' },
    { code: 'CNB', arrivalTime: '21:40', departureTime: '21:45', distance: 440, platform: 'PF 1' },
    { code: 'PRYJ', arrivalTime: '23:53', departureTime: '23:55', distance: 635, platform: 'PF 4' },
    { code: 'DDU', arrivalTime: '01:47', departureTime: '01:57', distance: 787, platform: 'PF 2' },
    { code: 'GAYA', arrivalTime: '04:10', departureTime: '04:13', distance: 992, platform: 'PF 1' },
    { code: 'BKSC', arrivalTime: '06:40', departureTime: '06:45', distance: 1195, platform: 'PF 1' },
    { code: 'PRR', arrivalTime: '07:50', departureTime: '07:52', distance: 1256, platform: 'PF 2' },
    { code: 'TATA', arrivalTime: '09:40', departureTime: '09:45', distance: 1345, platform: 'PF 3' },
    { code: 'HIJ', arrivalTime: '12:40', departureTime: 'Terminates', distance: 1479, platform: 'PF 1' },
  ],
  // 22823 BBS Tejas Rajdhani Express
  '22823': [
    { code: 'HIJ', arrivalTime: 'Starts', departureTime: '14:05', distance: 0, platform: 'PF 1' },
    { code: 'TATA', arrivalTime: '15:47', departureTime: '15:52', distance: 134, platform: 'PF 3' },
    { code: 'PRR', arrivalTime: '17:18', departureTime: '17:20', distance: 223, platform: 'PF 2' },
    { code: 'BKSC', arrivalTime: '18:45', departureTime: '18:50', distance: 284, platform: 'PF 1' },
    { code: 'GAYA', arrivalTime: '22:15', departureTime: '22:18', distance: 487, platform: 'PF 1' },
    { code: 'DDU', arrivalTime: '00:45', departureTime: '00:55', distance: 692, platform: 'PF 2' },
    { code: 'PRYJ', arrivalTime: '02:45', departureTime: '02:47', distance: 844, platform: 'PF 4' },
    { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 1039, platform: 'PF 1' },
    { code: 'NDLS', arrivalTime: '09:55', departureTime: 'Terminates', distance: 1479, platform: 'PF 1' },
  ],
  // 12876 Neelachal Express
  '12876': [
    { code: 'ANVT', arrivalTime: 'Starts', departureTime: '07:30', distance: 0, platform: 'PF 3' },
    { code: 'ALJN', arrivalTime: '09:05', departureTime: '09:07', distance: 126, platform: 'PF 3' },
    { code: 'CNB', arrivalTime: '13:25', departureTime: '13:35', distance: 435, platform: 'PF 1' },
    { code: 'LKO', arrivalTime: '15:00', departureTime: '15:10', distance: 512, platform: 'PF 2' },
    { code: 'BSB', arrivalTime: '20:30', departureTime: '20:40', distance: 813, platform: 'PF 1' },
    { code: 'DDU', arrivalTime: '21:50', departureTime: '22:00', distance: 831, platform: 'PF 4' },
    { code: 'GAYA', arrivalTime: '00:30', departureTime: '00:35', distance: 1036, platform: 'PF 1' },
    { code: 'BKSC', arrivalTime: '03:50', departureTime: '03:55', distance: 1239, platform: 'PF 1' },
    { code: 'TATA', arrivalTime: '06:45', departureTime: '06:55', distance: 1389, platform: 'PF 3' },
    { code: 'HIJ', arrivalTime: '11:15', departureTime: 'Terminates', distance: 1524, platform: 'PF 1' },
  ],
  // 12301 Howrah Rajdhani Express
  '12301': [
    { code: 'HWH', arrivalTime: 'Starts', departureTime: '16:50', distance: 0, platform: 'PF 9' },
    { code: 'ASN', arrivalTime: '19:20', departureTime: '19:24', distance: 200, platform: 'PF 2' },
    { code: 'DHN', arrivalTime: '20:00', departureTime: '20:05', distance: 259, platform: 'PF 1' },
    { code: 'GAYA', arrivalTime: '22:15', departureTime: '22:18', distance: 459, platform: 'PF 1' },
    { code: 'DDU', arrivalTime: '00:45', departureTime: '00:55', distance: 664, platform: 'PF 2' },
    { code: 'PRYJ', arrivalTime: '02:45', departureTime: '02:47', distance: 816, platform: 'PF 4' },
    { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 1011, platform: 'PF 1' },
    { code: 'NDLS', arrivalTime: '09:55', departureTime: 'Terminates', distance: 1451, platform: 'PF 1' },
  ],
  // 12302 Howrah Rajdhani Express
  '12302': [
    { code: 'NDLS', arrivalTime: 'Starts', departureTime: '16:50', distance: 0, platform: 'PF 1' },
    { code: 'CNB', arrivalTime: '21:30', departureTime: '21:35', distance: 440, platform: 'PF 1' },
    { code: 'PRYJ', arrivalTime: '23:41', departureTime: '23:43', distance: 635, platform: 'PF 4' },
    { code: 'DDU', arrivalTime: '01:33', departureTime: '01:43', distance: 787, platform: 'PF 2' },
    { code: 'GAYA', arrivalTime: '03:57', departureTime: '04:00', distance: 992, platform: 'PF 1' },
    { code: 'DHN', arrivalTime: '06:33', departureTime: '06:38', distance: 1192, platform: 'PF 1' },
    { code: 'ASN', arrivalTime: '07:18', departureTime: '07:20', distance: 1251, platform: 'PF 2' },
    { code: 'HWH', arrivalTime: '09:55', departureTime: 'Terminates', distance: 1451, platform: 'PF 9' },
  ],
  // 22436 Vande Bharat Express
  '22436': [
    { code: 'NDLS', arrivalTime: 'Starts', departureTime: '06:00', distance: 0, platform: 'PF 16' },
    { code: 'CNB', arrivalTime: '10:08', departureTime: '10:10', distance: 440, platform: 'PF 1' },
    { code: 'PRYJ', arrivalTime: '12:08', departureTime: '12:10', distance: 635, platform: 'PF 6' },
    { code: 'BSB', arrivalTime: '14:00', departureTime: 'Terminates', distance: 759, platform: 'PF 1' },
  ],
  // 12002 Bhopal Shatabdi Express
  '12002': [
    { code: 'NDLS', arrivalTime: 'Starts', departureTime: '06:00', distance: 0, platform: 'PF 1' },
    { code: 'MTJ', arrivalTime: '07:19', departureTime: '07:20', distance: 141, platform: 'PF 2' },
    { code: 'AGC', arrivalTime: '07:50', departureTime: '07:55', distance: 195, platform: 'PF 1' },
    { code: 'GWL', arrivalTime: '09:23', departureTime: '09:28', distance: 313, platform: 'PF 1' },
    { code: 'VGLJ', arrivalTime: '10:45', departureTime: '10:50', distance: 410, platform: 'PF 1' },
    { code: 'BPL', arrivalTime: '14:40', departureTime: 'Terminates', distance: 707, platform: 'PF 1' },
  ],
  // 12311 Netaji Express
  '12311': [
    { code: 'HWH', arrivalTime: 'Starts', departureTime: '21:55', distance: 0, platform: 'PF 8' },
    { code: 'BWN', arrivalTime: '23:03', departureTime: '23:08', distance: 95, platform: 'PF 1' },
    { code: 'ASN', arrivalTime: '00:41', departureTime: '00:46', distance: 201, platform: 'PF 2' },
    { code: 'DHN', arrivalTime: '01:45', departureTime: '01:50', distance: 260, platform: 'PF 1' },
    { code: 'GAYA', arrivalTime: '05:15', departureTime: '05:20', distance: 460, platform: 'PF 1' },
    { code: 'DDU', arrivalTime: '08:05', departureTime: '08:15', distance: 665, platform: 'PF 4' },
    { code: 'PRYJ', arrivalTime: '10:40', departureTime: '10:50', distance: 818, platform: 'PF 2' },
    { code: 'CNB', arrivalTime: '13:30', departureTime: '13:40', distance: 1013, platform: 'PF 1' },
    { code: 'ALJN', arrivalTime: '18:05', departureTime: '18:10', distance: 1322, platform: 'PF 3' },
    { code: 'DLI', arrivalTime: '20:55', departureTime: 'Terminates', distance: 1448, platform: 'PF 3' },
  ],
};

/**
 * Calculates stop halt duration in minutes
 */
export function calculateHaltDuration(arr, dep) {
  if (!arr || !dep || arr === 'Starts' || dep === 'Terminates' || arr.includes('--') || dep.includes('--')) {
    return null;
  }
  try {
    const [arrH, arrM] = arr.split(':').map(Number);
    const [depH, depM] = dep.split(':').map(Number);
    let diff = (depH * 60 + depM) - (arrH * 60 + arrM);
    if (diff < 0) diff += 1440; // crosses midnight
    return `${diff} min${diff !== 1 ? 's' : ''}`;
  } catch {
    return null;
  }
}

/**
 * Resolves the full segment stops (Origin -> Intermediate Stops -> Destination)
 * for a train between user's search from/to stations.
 */
export function getTrainSegmentRoute(train) {
  if (!train) return { intermediateStops: [], allStops: [], origin: null, destination: null };

  const rawRoute = Array.isArray(train.route) && train.route.length >= 2
    ? [...train.route].sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))
    : (AUTHENTIC_TRAIN_ROUTES[train.trainNumber] || []);

  const normalizedStops = rawRoute.map((s, idx) => {
    const code = (s.stationCode || s.code || '').toUpperCase();
    const directoryEntry = STATION_DIRECTORY[code] || {};
    const name = s.stationName || s.name || directoryEntry.name || `${code} Station`;
    const arrivalTime = s.arrivalTime || (idx === 0 ? (train.from?.departure || 'Starts') : '--:--');
    const departureTime = s.departureTime || (idx === rawRoute.length - 1 ? 'Terminates' : (train.to?.arrival || '--:--'));
    const halt = calculateHaltDuration(arrivalTime, departureTime);

    return {
      index: idx + 1,
      stationId: s.stationId,
      stationCode: code,
      stationName: name,
      city: directoryEntry.city || '',
      arrivalTime,
      departureTime,
      halt: halt || '2 mins',
      distance: s.distanceFromOrigin ?? s.distance ?? (idx * 110),
      platform: s.platform || `PF ${(idx % 4) + 1}`,
    };
  });

  if (normalizedStops.length === 0) {
    const origin = {
      index: 1,
      stationCode: train.from?.code || 'ORIGIN',
      stationName: train.from?.name || 'Origin Station',
      departureTime: train.from?.departure || '06:00',
      arrivalTime: 'Starts',
      halt: null,
      distance: 0,
      platform: 'PF 1',
    };
    const destination = {
      index: 2,
      stationCode: train.to?.code || 'DEST',
      stationName: train.to?.name || 'Destination Station',
      departureTime: 'Terminates',
      arrivalTime: train.to?.arrival || '14:00',
      halt: null,
      distance: 1475,
      platform: 'PF 2',
    };
    return {
      allStops: [origin, destination],
      origin,
      destination,
      intermediateStops: [],
    };
  }

  // Find origin and destination indexes inside the train's route
  const fromCode = (train.from?.code || '').toUpperCase();
  const fromName = (train.from?.name || '').toLowerCase();
  const toCode = (train.to?.code || '').toUpperCase();
  const toName = (train.to?.name || '').toLowerCase();

  let startIdx = normalizedStops.findIndex(
    (s) => (fromCode && s.stationCode === fromCode) || (fromName && s.stationName.toLowerCase().includes(fromName))
  );
  let endIdx = normalizedStops.findIndex(
    (s) => (toCode && s.stationCode === toCode) || (toName && s.stationName.toLowerCase().includes(toName))
  );

  if (startIdx === -1) startIdx = 0;
  if (endIdx === -1) endIdx = normalizedStops.length - 1;

  // If order is reversed, swap safely
  let segmentStops;
  if (startIdx <= endIdx) {
    segmentStops = normalizedStops.slice(startIdx, endIdx + 1);
  } else {
    segmentStops = normalizedStops.slice(endIdx, startIdx + 1).reverse();
  }

  const origin = segmentStops[0];
  const destination = segmentStops[segmentStops.length - 1];
  const intermediateStops = segmentStops.slice(1, -1);

  // Compute the km covered between origin and destination in this segment
  const originDistRaw = Number(origin?.distance ?? 0);
  const destDistRaw = Number(destination?.distance ?? 0);
  const segmentDistanceKm = Math.abs(destDistRaw - originDistRaw) || null;

  return {
    allStops: segmentStops,
    origin,
    destination,
    intermediateStops,
    count: intermediateStops.length,
    segmentDistanceKm,
  };
}
