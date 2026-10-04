/**
 * Comprehensive Indian Railways (IRCTC) Realistic Data Seeder & Database Reset
 *
 * 1. Deep-cleans and resets all train-related databases:
 *    - admin_service_database (stations, trains, seats, routes, route_stations, schedules)
 *    - inventory_service_database (schedule_inventories, seat_inventories, route_stops, seat_segment_locks)
 *    - booking_service_database (bookings, booking_seats, passengers, saga_logs)
 *    - elasticsearch (recreates stations & trains indices with proper ngram mappings)
 *    - redis (flushes stale cache)
 *
 * 2. Seeds authentic stations across India:
 *    - Delhi Terminals (NDLS, NZM, ANVT, DLI)
 *    - Kharagpur & Hijli (HIJ, KGP)
 *    - Kolkata Terminals (HWH, SDAH)
 *    - Moradabad & Chandausi (MB, CH) - Clean single entry for Moradabad Junction!
 *    - All intermediate halts on Eastern/Southeastern & Central corridors
 *
 * 3. Seeds realistic trains with exact schedules, stops, timings, distances, and running days:
 *    - 22812 / 22824 BBS Tejas Rajdhani Express (Multi-day: Mon, Fri / Tue, Wed, Thu, Sat)
 *    - 12802 Purushottam Express (Daily)
 *    - 12816 Nandan Kanan Express (4 days/week: Mon, Wed, Thu, Sat)
 *    - 22858 ANVT-SRC Superfast Express (Weekly: Tue)
 *    - 18478 Kalinga Utkal Express (Daily)
 *    - 12876 Neelachal Express (3 days/week: Sun, Tue, Fri)
 *    - 12302 Howrah Rajdhani Express (via Gaya) (6 days/week)
 *    - 12306 Howrah Rajdhani Express (via Patna) (Weekly: Fri)
 *    - 12314 Sealdah Rajdhani Express (Daily)
 *    - 12304 Poorva Express (via Patna) (4 days/week: Sun, Wed, Thu, Sat)
 *    - 12382 Poorva Express (via Gaya) (3 days/week: Mon, Tue, Fri)
 *    - 12312 Netaji Express (Daily)
 *    - Reciprocal return trains for seamless two-way search & booking
 *    - Moradabad & Chandausi Passenger Specials & Intercity Express
 *    - Flagship Vande Bharat, Tejas Rajdhani & Shatabdi Express pairs
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const prisma = require('../config/prisma');
const adminProducer = require('../kafka/producer/admin.producer');

// ─── 1. AUTHENTIC STATIONS (No duplicates, proper IRCTC codes) ───────────────

const STATIONS = [
  // ── Key Delhi Originating Stations ──
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi Railway Station', city: 'Delhi', state: 'Delhi' },
  { code: 'DEE', name: 'Delhi Sarai Rohilla', city: 'Delhi', state: 'Delhi' },
  { code: 'GZB', name: 'Ghaziabad Junction', city: 'Ghaziabad', state: 'Uttar Pradesh' },

  // ── Kharagpur & Satellite Station ──
  { code: 'HIJ', name: 'Hijli Railway Station', city: 'Kharagpur', state: 'West Bengal' },
  { code: 'KGP', name: 'Kharagpur Junction', city: 'Kharagpur', state: 'West Bengal' },

  // ── Kolkata Terminals & West Bengal ──
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal' },
  { code: 'KOAA', name: 'Kolkata Chitpur', city: 'Kolkata', state: 'West Bengal' },
  { code: 'ASN', name: 'Asansol Junction', city: 'Asansol', state: 'West Bengal' },
  { code: 'DGR', name: 'Durgapur', city: 'Durgapur', state: 'West Bengal' },
  { code: 'BWN', name: 'Barddhaman Junction', city: 'Bardhaman', state: 'West Bengal' },
  { code: 'ADRA', name: 'Adra Junction', city: 'Adra', state: 'West Bengal' },
  { code: 'BQA', name: 'Bankura Junction', city: 'Bankura', state: 'West Bengal' },
  { code: 'MDN', name: 'Midnapore', city: 'Midnapore', state: 'West Bengal' },
  { code: 'PRR', name: 'Purulia Junction', city: 'Purulia', state: 'West Bengal' },

  // ── Uttar Pradesh ──
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction', city: 'Mughalsarai', state: 'Uttar Pradesh' },
  { code: 'ALJN', name: 'Aligarh Junction', city: 'Aligarh', state: 'Uttar Pradesh' },
  { code: 'TDL', name: 'Tundla Junction', city: 'Tundla', state: 'Uttar Pradesh' },
  { code: 'FTP', name: 'Fatehpur', city: 'Fatehpur', state: 'Uttar Pradesh' },
  { code: 'MZP', name: 'Mirzapur', city: 'Mirzapur', state: 'Uttar Pradesh' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh' },
  { code: 'MTJ', name: 'Mathura Junction', city: 'Mathura', state: 'Uttar Pradesh' },
  { code: 'VGLJ', name: 'VGL Jhansi Junction', city: 'Jhansi', state: 'Uttar Pradesh' },
  { code: 'MB', name: 'Moradabad Junction', city: 'Moradabad', state: 'Uttar Pradesh' }, // SINGLE, CLEAN Moradabad
  { code: 'CH', name: 'Chandausi Junction', city: 'Chandausi', state: 'Uttar Pradesh' },
  { code: 'BE', name: 'Bareilly Junction', city: 'Bareilly', state: 'Uttar Pradesh' },
  { code: 'MTC', name: 'Meerut City', city: 'Meerut', state: 'Uttar Pradesh' },
  { code: 'AY', name: 'Ayodhya Dham Junction', city: 'Ayodhya', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh' },

  // ── Bihar ──
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'GAYA', name: 'Gaya Junction', city: 'Gaya', state: 'Bihar' },
  { code: 'SSM', name: 'Sasaram Junction', city: 'Sasaram', state: 'Bihar' },
  { code: 'BXR', name: 'Buxar', city: 'Buxar', state: 'Bihar' },
  { code: 'ARA', name: 'Ara Junction', city: 'Ara', state: 'Bihar' },
  { code: 'MKA', name: 'Mokama', city: 'Mokama', state: 'Bihar' },
  { code: 'KIUL', name: 'Kiul Junction', city: 'Kiul', state: 'Bihar' },

  // ── Jharkhand ──
  { code: 'BKSC', name: 'Bokaro Steel City', city: 'Bokaro', state: 'Jharkhand' },
  { code: 'DHN', name: 'Dhanbad Junction', city: 'Dhanbad', state: 'Jharkhand' },
  { code: 'KQR', name: 'Koderma Junction', city: 'Koderma', state: 'Jharkhand' },
  { code: 'TATA', name: 'Tatanagar Junction', city: 'Jamshedpur', state: 'Jharkhand' },
  { code: 'GTS', name: 'Ghatsila', city: 'Ghatsila', state: 'Jharkhand' },
  { code: 'CKP', name: 'Chakradharpur', city: 'Chakradharpur', state: 'Jharkhand' },
  { code: 'JSME', name: 'Jasidih Junction', city: 'Jasidih', state: 'Jharkhand' },
  { code: 'MDP', name: 'Madhupur Junction', city: 'Madhupur', state: 'Jharkhand' },
  { code: 'PNME', name: 'Parasnath', city: 'Parasnath', state: 'Jharkhand' },
  { code: 'RNC', name: 'Ranchi Junction', city: 'Ranchi', state: 'Jharkhand' },

  // ── Odisha & Central India ──
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
  { code: 'CTC', name: 'Cuttack Junction', city: 'Cuttack', state: 'Odisha' },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha' },
  { code: 'ROU', name: 'Rourkela Junction', city: 'Rourkela', state: 'Odisha' },
  { code: 'BSP', name: 'Bilaspur Junction', city: 'Bilaspur', state: 'Chhattisgarh' },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },

  // ── Western & Southern Hubs ──
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab' },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Punjab' },
];

// Helper: Generates realistic seat configurations
function generateSeats(basePrice, totalSeats = 64) {
  const seatTypes = ['LOWER', 'MIDDLE', 'UPPER', 'LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'];
  const seats = [];

  for (let i = 1; i <= totalSeats; i++) {
    const seatType = seatTypes[(i - 1) % seatTypes.length];
    let priceMultiplier = 1.0;
    if (seatType === 'LOWER' || seatType === 'SIDE_LOWER') priceMultiplier = 1.08;
    if (seatType === 'MIDDLE') priceMultiplier = 0.95;
    if (seatType === 'UPPER' || seatType === 'SIDE_UPPER') priceMultiplier = 0.98;

    seats.push({
      seatNumber: i,
      seatType,
      price: Math.round(basePrice * priceMultiplier),
    });
  }
  return seats;
}

// ─── 2. REALISTIC TRAIN SCHEDULES WITH AUTHENTIC ROUTES & TIMINGS ────────────
// Days of Week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

const TRAINS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ── TRAINS CONNECTING DELHI TO HIJLI & KHARAGPUR (User's Exact Specification)
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. 22812 BBS Tejas Rajdhani Express (via Adra)
  {
    trainNumber: '22812',
    trainName: 'BBS Tejas Rajdhani Express (via Adra)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2450,
    seatsCount: 64,
    runsOn: 'Mon, Fri',
    runningDays: [1, 5],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '17:00', distance: 0 },
      { code: 'CNB', arrivalTime: '21:40', departureTime: '21:45', distance: 440 },
      { code: 'PRYJ', arrivalTime: '23:53', departureTime: '23:55', distance: 635 },
      { code: 'DDU', arrivalTime: '01:47', departureTime: '01:57', distance: 787 },
      { code: 'GAYA', arrivalTime: '04:10', departureTime: '04:13', distance: 992 },
      { code: 'BKSC', arrivalTime: '06:40', departureTime: '06:45', distance: 1195 },
      { code: 'ADRA', arrivalTime: '07:55', departureTime: '08:00', distance: 1248 },
      { code: 'BQA', arrivalTime: '08:42', departureTime: '08:44', distance: 1301 },
      { code: 'HIJ', arrivalTime: '11:05', departureTime: null, distance: 1435 },
    ],
  },
  // Reciprocal return: 22811 BBS Tejas Rajdhani Express (via Adra)
  {
    trainNumber: '22811',
    trainName: 'BBS Tejas Rajdhani Express (via Adra)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2450,
    seatsCount: 64,
    runsOn: 'Sun, Wed',
    runningDays: [0, 3],
    stops: [
      { code: 'HIJ', arrivalTime: null, departureTime: '15:20', distance: 0 },
      { code: 'BQA', arrivalTime: '16:48', departureTime: '16:50', distance: 134 },
      { code: 'ADRA', arrivalTime: '17:35', departureTime: '17:40', distance: 187 },
      { code: 'BKSC', arrivalTime: '18:45', departureTime: '18:50', distance: 240 },
      { code: 'GAYA', arrivalTime: '22:15', departureTime: '22:18', distance: 443 },
      { code: 'DDU', arrivalTime: '00:45', departureTime: '00:55', distance: 648 },
      { code: 'PRYJ', arrivalTime: '02:45', departureTime: '02:47', distance: 800 },
      { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 995 },
      { code: 'NDLS', arrivalTime: '09:55', departureTime: null, distance: 1435 },
    ],
  },

  // 2. 22824 BBS Tejas Rajdhani Express (via Tatanagar)
  {
    trainNumber: '22824',
    trainName: 'BBS Tejas Rajdhani Express (via Tatanagar)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2480,
    seatsCount: 64,
    runsOn: 'Tue, Wed, Thu, Sat',
    runningDays: [2, 3, 4, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '17:00', distance: 0 },
      { code: 'CNB', arrivalTime: '21:40', departureTime: '21:45', distance: 440 },
      { code: 'PRYJ', arrivalTime: '23:53', departureTime: '23:55', distance: 635 },
      { code: 'DDU', arrivalTime: '01:47', departureTime: '01:57', distance: 787 },
      { code: 'GAYA', arrivalTime: '04:10', departureTime: '04:13', distance: 992 },
      { code: 'BKSC', arrivalTime: '06:40', departureTime: '06:45', distance: 1195 },
      { code: 'PRR', arrivalTime: '07:50', departureTime: '07:52', distance: 1256 },
      { code: 'TATA', arrivalTime: '09:40', departureTime: '09:45', distance: 1345 },
      { code: 'HIJ', arrivalTime: '12:40', departureTime: null, distance: 1479 },
    ],
  },
  // Reciprocal return: 22823 BBS Tejas Rajdhani Express (via Tatanagar)
  {
    trainNumber: '22823',
    trainName: 'BBS Tejas Rajdhani Express (via Tatanagar)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2480,
    seatsCount: 64,
    runsOn: 'Mon, Tue, Thu, Fri',
    runningDays: [1, 2, 4, 5],
    stops: [
      { code: 'HIJ', arrivalTime: null, departureTime: '14:05', distance: 0 },
      { code: 'TATA', arrivalTime: '15:47', departureTime: '15:52', distance: 134 },
      { code: 'PRR', arrivalTime: '17:18', departureTime: '17:20', distance: 223 },
      { code: 'BKSC', arrivalTime: '18:45', departureTime: '18:50', distance: 284 },
      { code: 'GAYA', arrivalTime: '22:15', departureTime: '22:18', distance: 487 },
      { code: 'DDU', arrivalTime: '00:45', departureTime: '00:55', distance: 692 },
      { code: 'PRYJ', arrivalTime: '02:45', departureTime: '02:47', distance: 844 },
      { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 1039 },
      { code: 'NDLS', arrivalTime: '09:55', departureTime: null, distance: 1479 },
    ],
  },

  // 3. 12802 Purushottam Express (Daily)
  {
    trainNumber: '12802',
    trainName: 'Purushottam Express',
    coachName: 'SL',
    trainType: 'EXPRESS',
    basePrice: 680,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'ANVT', arrivalTime: null, departureTime: '22:45', distance: 0 },
      { code: 'ALJN', arrivalTime: '00:03', departureTime: '00:05', distance: 126 },
      { code: 'CNB', arrivalTime: '04:00', departureTime: '04:05', distance: 435 },
      { code: 'PRYJ', arrivalTime: '06:55', departureTime: '07:00', distance: 630 },
      { code: 'DDU', arrivalTime: '09:50', departureTime: '10:00', distance: 782 },
      { code: 'SSM', arrivalTime: '11:00', departureTime: '11:02', distance: 884 },
      { code: 'GAYA', arrivalTime: '12:30', departureTime: '12:35', distance: 987 },
      { code: 'BKSC', arrivalTime: '15:25', departureTime: '15:30', distance: 1190 },
      { code: 'PRR', arrivalTime: '16:35', departureTime: '16:40', distance: 1251 },
      { code: 'TATA', arrivalTime: '18:35', departureTime: '18:45', distance: 1340 },
      { code: 'GTS', arrivalTime: '19:25', departureTime: '19:27', distance: 1376 },
      { code: 'HIJ', arrivalTime: '22:35', departureTime: null, distance: 1475 },
    ],
  },
  // Reciprocal return: 12801 Purushottam Express
  {
    trainNumber: '12801',
    trainName: 'Purushottam Express',
    coachName: 'SL',
    trainType: 'EXPRESS',
    basePrice: 680,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'HIJ', arrivalTime: null, departureTime: '06:05', distance: 0 },
      { code: 'GTS', arrivalTime: '07:18', departureTime: '07:20', distance: 99 },
      { code: 'TATA', arrivalTime: '08:05', departureTime: '08:15', distance: 135 },
      { code: 'PRR', arrivalTime: '09:48', departureTime: '09:50', distance: 224 },
      { code: 'BKSC', arrivalTime: '11:00', departureTime: '11:05', distance: 285 },
      { code: 'GAYA', arrivalTime: '13:43', departureTime: '13:48', distance: 488 },
      { code: 'SSM', arrivalTime: '14:58', departureTime: '15:00', distance: 591 },
      { code: 'DDU', arrivalTime: '16:50', departureTime: '17:00', distance: 693 },
      { code: 'PRYJ', arrivalTime: '19:20', departureTime: '19:30', distance: 845 },
      { code: 'CNB', arrivalTime: '21:55', departureTime: '22:00', distance: 1040 },
      { code: 'ALJN', arrivalTime: '01:38', departureTime: '01:40', distance: 1349 },
      { code: 'ANVT', arrivalTime: '04:00', departureTime: null, distance: 1475 },
    ],
  },

  // 4. 12816 Nandan Kanan Express (4 days/week)
  {
    trainNumber: '12816',
    trainName: 'Nandan Kanan Express',
    coachName: '3A',
    trainType: 'EXPRESS',
    basePrice: 1550,
    seatsCount: 64,
    runsOn: 'Mon, Wed, Thu, Sat',
    runningDays: [1, 3, 4, 6],
    stops: [
      { code: 'ANVT', arrivalTime: null, departureTime: '07:30', distance: 0 },
      { code: 'ALJN', arrivalTime: '09:05', departureTime: '09:07', distance: 126 },
      { code: 'CNB', arrivalTime: '13:15', departureTime: '13:20', distance: 435 },
      { code: 'FTP', arrivalTime: '14:15', departureTime: '14:17', distance: 513 },
      { code: 'PRYJ', arrivalTime: '15:55', departureTime: '16:05', distance: 630 },
      { code: 'MZP', arrivalTime: '17:08', departureTime: '17:10', distance: 719 },
      { code: 'DDU', arrivalTime: '18:30', departureTime: '18:40', distance: 782 },
      { code: 'SSM', arrivalTime: '19:40', departureTime: '19:42', distance: 884 },
      { code: 'GAYA', arrivalTime: '21:10', departureTime: '21:15', distance: 987 },
      { code: 'KQR', arrivalTime: '22:20', departureTime: '22:22', distance: 1064 },
      { code: 'BKSC', arrivalTime: '00:30', departureTime: '00:35', distance: 1190 },
      { code: 'PRR', arrivalTime: '01:45', departureTime: '01:50', distance: 1251 },
      { code: 'ADRA', arrivalTime: '02:40', departureTime: '02:45', distance: 1290 },
      { code: 'MDN', arrivalTime: '05:05', departureTime: '05:07', distance: 1420 },
      { code: 'HIJ', arrivalTime: '06:15', departureTime: null, distance: 1445 },
    ],
  },

  // 5. 22858 ANVT-SRC Superfast Express (Weekly: Tue)
  {
    trainNumber: '22858',
    trainName: 'ANVT-SRC Superfast Express',
    coachName: '3A',
    trainType: 'EXPRESS',
    basePrice: 1580,
    seatsCount: 64,
    runsOn: 'Tue',
    runningDays: [2],
    stops: [
      { code: 'ANVT', arrivalTime: null, departureTime: '13:25', distance: 0 },
      { code: 'CNB', arrivalTime: '19:25', departureTime: '19:30', distance: 435 },
      { code: 'PRYJ', arrivalTime: '21:35', departureTime: '21:40', distance: 630 },
      { code: 'DDU', arrivalTime: '00:15', departureTime: '00:25', distance: 782 },
      { code: 'GAYA', arrivalTime: '03:00', departureTime: '03:05', distance: 987 },
      { code: 'DHN', arrivalTime: '06:20', departureTime: '06:25', distance: 1188 },
      { code: 'PRR', arrivalTime: '07:55', departureTime: '08:00', distance: 1251 },
      { code: 'TATA', arrivalTime: '09:50', departureTime: '10:00', distance: 1340 },
      { code: 'KGP', arrivalTime: '14:20', departureTime: null, distance: 1475 },
    ],
  },

  // 6. 18478 Kalinga Utkal Express (Daily)
  {
    trainNumber: '18478',
    trainName: 'Kalinga Utkal Express',
    coachName: 'SL',
    trainType: 'EXPRESS',
    basePrice: 690,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NZM', arrivalTime: null, departureTime: '12:00', distance: 0 },
      { code: 'MTJ', arrivalTime: '13:45', departureTime: '13:50', distance: 134 },
      { code: 'AGC', arrivalTime: '14:45', departureTime: '14:50', distance: 188 },
      { code: 'GWL', arrivalTime: '16:38', departureTime: '16:40', distance: 306 },
      { code: 'VGLJ', arrivalTime: '18:20', departureTime: '18:28', distance: 403 },
      { code: 'BSP', arrivalTime: '06:10', departureTime: '06:25', distance: 1115 },
      { code: 'ROU', arrivalTime: '11:45', departureTime: '11:53', distance: 1420 },
      { code: 'CKP', arrivalTime: '13:20', departureTime: '13:25', distance: 1521 },
      { code: 'TATA', arrivalTime: '14:35', departureTime: '14:45', distance: 1583 },
      { code: 'HIJ', arrivalTime: '20:27', departureTime: null, distance: 1718 },
    ],
  },

  // 7. 12876 Neelachal Express (3 days/week: Sun, Tue, Fri)
  {
    trainNumber: '12876',
    trainName: 'Neelachal Express',
    coachName: '3A',
    trainType: 'EXPRESS',
    basePrice: 1620,
    seatsCount: 64,
    runsOn: 'Sun, Tue, Fri',
    runningDays: [0, 2, 5],
    stops: [
      { code: 'ANVT', arrivalTime: null, departureTime: '07:30', distance: 0 },
      { code: 'ALJN', arrivalTime: '09:05', departureTime: '09:07', distance: 126 },
      { code: 'CNB', arrivalTime: '13:25', departureTime: '13:35', distance: 435 },
      { code: 'LKO', arrivalTime: '15:00', departureTime: '15:10', distance: 512 },
      { code: 'BSB', arrivalTime: '20:30', departureTime: '20:40', distance: 813 },
      { code: 'DDU', arrivalTime: '21:50', departureTime: '22:00', distance: 831 },
      { code: 'GAYA', arrivalTime: '00:30', departureTime: '00:35', distance: 1036 },
      { code: 'BKSC', arrivalTime: '03:50', departureTime: '03:55', distance: 1239 },
      { code: 'TATA', arrivalTime: '06:45', departureTime: '06:55', distance: 1389 },
      { code: 'HIJ', arrivalTime: '11:15', departureTime: null, distance: 1524 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TRAINS CONNECTING DELHI TO KOLKATA (Howrah & Sealdah)
  // ═══════════════════════════════════════════════════════════════════════════

  // 8. 12302 Howrah Rajdhani Express (via Gaya) (6 days/week)
  {
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani Express (via Gaya)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2380,
    seatsCount: 64,
    runsOn: 'Sun, Mon, Tue, Wed, Thu, Sat',
    runningDays: [0, 1, 2, 3, 4, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:50', distance: 0 },
      { code: 'CNB', arrivalTime: '21:30', departureTime: '21:35', distance: 440 },
      { code: 'PRYJ', arrivalTime: '23:41', departureTime: '23:43', distance: 635 },
      { code: 'DDU', arrivalTime: '01:33', departureTime: '01:43', distance: 787 },
      { code: 'GAYA', arrivalTime: '03:57', departureTime: '04:00', distance: 992 },
      { code: 'DHN', arrivalTime: '06:33', departureTime: '06:38', distance: 1192 },
      { code: 'ASN', arrivalTime: '07:18', departureTime: '07:20', distance: 1251 },
      { code: 'HWH', arrivalTime: '09:55', departureTime: null, distance: 1451 },
    ],
  },
  // Reciprocal return: 12301 New Delhi Rajdhani Express (via Gaya)
  {
    trainNumber: '12301',
    trainName: 'New Delhi Rajdhani Express (via Gaya)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2380,
    seatsCount: 64,
    runsOn: 'Sun, Mon, Tue, Wed, Thu, Fri',
    runningDays: [0, 1, 2, 3, 4, 5],
    stops: [
      { code: 'HWH', arrivalTime: null, departureTime: '16:50', distance: 0 },
      { code: 'ASN', arrivalTime: '19:20', departureTime: '19:24', distance: 200 },
      { code: 'DHN', arrivalTime: '20:00', departureTime: '20:05', distance: 259 },
      { code: 'GAYA', arrivalTime: '22:15', departureTime: '22:18', distance: 459 },
      { code: 'DDU', arrivalTime: '00:45', departureTime: '00:55', distance: 664 },
      { code: 'PRYJ', arrivalTime: '02:45', departureTime: '02:47', distance: 816 },
      { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 1011 },
      { code: 'NDLS', arrivalTime: '09:55', departureTime: null, distance: 1451 },
    ],
  },

  // 9. 12306 Howrah Rajdhani Express (via Patna) (Weekly: Fri)
  {
    trainNumber: '12306',
    trainName: 'Howrah Rajdhani Express (via Patna)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2420,
    seatsCount: 64,
    runsOn: 'Fri',
    runningDays: [5],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:50', distance: 0 },
      { code: 'CNB', arrivalTime: '21:30', departureTime: '21:35', distance: 440 },
      { code: 'PRYJ', arrivalTime: '23:41', departureTime: '23:43', distance: 635 },
      { code: 'DDU', arrivalTime: '01:33', departureTime: '01:43', distance: 787 },
      { code: 'PNBE', arrivalTime: '04:20', departureTime: '04:30', distance: 998 },
      { code: 'MKA', arrivalTime: '05:40', departureTime: '05:42', distance: 1087 },
      { code: 'JSME', arrivalTime: '08:00', departureTime: '08:05', distance: 1219 },
      { code: 'MDP', arrivalTime: '08:30', departureTime: '08:32', distance: 1248 },
      { code: 'ASN', arrivalTime: '09:40', departureTime: '09:45', distance: 1330 },
      { code: 'HWH', arrivalTime: '12:40', departureTime: null, distance: 1530 },
    ],
  },
  // Reciprocal return: 12305 New Delhi Rajdhani Express (via Patna) (Weekly: Sun)
  {
    trainNumber: '12305',
    trainName: 'New Delhi Rajdhani Express (via Patna)',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2420,
    seatsCount: 64,
    runsOn: 'Sun',
    runningDays: [0],
    stops: [
      { code: 'HWH', arrivalTime: null, departureTime: '14:05', distance: 0 },
      { code: 'ASN', arrivalTime: '16:05', departureTime: '16:07', distance: 200 },
      { code: 'MDP', arrivalTime: '17:09', departureTime: '17:11', distance: 282 },
      { code: 'JSME', arrivalTime: '17:40', departureTime: '17:42', distance: 311 },
      { code: 'PNBE', arrivalTime: '21:00', departureTime: '21:10', distance: 532 },
      { code: 'DDU', arrivalTime: '00:50', departureTime: '01:00', distance: 743 },
      { code: 'PRYJ', arrivalTime: '02:43', departureTime: '02:45', distance: 895 },
      { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 1090 },
      { code: 'NDLS', arrivalTime: '10:05', departureTime: null, distance: 1530 },
    ],
  },

  // 10. 12314 Sealdah Rajdhani Express (Daily)
  {
    trainNumber: '12314',
    trainName: 'Sealdah Rajdhani Express',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2390,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:30', distance: 0 },
      { code: 'CNB', arrivalTime: '21:12', departureTime: '21:17', distance: 440 },
      { code: 'DDU', arrivalTime: '01:25', departureTime: '01:35', distance: 787 },
      { code: 'GAYA', arrivalTime: '03:45', departureTime: '03:48', distance: 992 },
      { code: 'DHN', arrivalTime: '06:18', departureTime: '06:23', distance: 1192 },
      { code: 'ASN', arrivalTime: '07:09', departureTime: '07:11', distance: 1251 },
      { code: 'DGR', arrivalTime: '07:41', departureTime: '07:43', distance: 1293 },
      { code: 'SDAH', arrivalTime: '10:10', departureTime: null, distance: 1458 },
    ],
  },
  // Reciprocal return: 12313 Sealdah - New Delhi Rajdhani Express (Daily)
  {
    trainNumber: '12313',
    trainName: 'Sealdah - New Delhi Rajdhani Express',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2390,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'SDAH', arrivalTime: null, departureTime: '16:50', distance: 0 },
      { code: 'DGR', arrivalTime: '18:48', departureTime: '18:50', distance: 165 },
      { code: 'ASN', arrivalTime: '19:16', departureTime: '19:20', distance: 207 },
      { code: 'DHN', arrivalTime: '20:20', departureTime: '20:25', distance: 266 },
      { code: 'GAYA', arrivalTime: '22:57', departureTime: '23:00', distance: 466 },
      { code: 'DDU', arrivalTime: '01:15', departureTime: '01:25', distance: 671 },
      { code: 'CNB', arrivalTime: '05:20', departureTime: '05:25', distance: 1018 },
      { code: 'NDLS', arrivalTime: '10:25', departureTime: null, distance: 1458 },
    ],
  },

  // 11. 12304 Poorva Express (via Patna) (4 days/week)
  {
    trainNumber: '12304',
    trainName: 'Poorva Express (via Patna)',
    coachName: 'SL',
    trainType: 'EXPRESS',
    basePrice: 640,
    seatsCount: 72,
    runsOn: 'Sun, Wed, Thu, Sat',
    runningDays: [0, 3, 4, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '17:40', distance: 0 },
      { code: 'ALJN', arrivalTime: '19:13', departureTime: '19:15', distance: 131 },
      { code: 'TDL', arrivalTime: '20:13', departureTime: '20:15', distance: 209 },
      { code: 'CNB', arrivalTime: '23:05', departureTime: '23:10', distance: 440 },
      { code: 'PRYJ', arrivalTime: '01:45', departureTime: '01:50', distance: 635 },
      { code: 'DDU', arrivalTime: '04:20', departureTime: '04:30', distance: 787 },
      { code: 'BXR', arrivalTime: '05:40', departureTime: '05:42', distance: 881 },
      { code: 'ARA', arrivalTime: '06:30', departureTime: '06:32', distance: 950 },
      { code: 'PNBE', arrivalTime: '07:55', departureTime: '08:05', distance: 999 },
      { code: 'KIUL', arrivalTime: '10:43', departureTime: '10:45', distance: 1122 },
      { code: 'JSME', arrivalTime: '12:28', departureTime: '12:30', distance: 1249 },
      { code: 'ASN', arrivalTime: '14:15', departureTime: '14:20', distance: 1360 },
      { code: 'BWN', arrivalTime: '15:40', departureTime: '15:42', distance: 1466 },
      { code: 'HWH', arrivalTime: '17:00', departureTime: null, distance: 1531 },
    ],
  },

  // 12. 12382 Poorva Express (via Gaya) (3 days/week)
  {
    trainNumber: '12382',
    trainName: 'Poorva Express (via Gaya)',
    coachName: 'SL',
    trainType: 'EXPRESS',
    basePrice: 630,
    seatsCount: 72,
    runsOn: 'Mon, Tue, Fri',
    runningDays: [1, 2, 5],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '17:40', distance: 0 },
      { code: 'ALJN', arrivalTime: '19:13', departureTime: '19:15', distance: 131 },
      { code: 'CNB', arrivalTime: '23:05', departureTime: '23:10', distance: 440 },
      { code: 'PRYJ', arrivalTime: '01:45', departureTime: '01:50', distance: 635 },
      { code: 'BSB', arrivalTime: '04:00', departureTime: '04:10', distance: 760 },
      { code: 'DDU', arrivalTime: '05:05', departureTime: '05:15', distance: 778 },
      { code: 'GAYA', arrivalTime: '07:45', departureTime: '07:50', distance: 983 },
      { code: 'PNME', arrivalTime: '09:40', departureTime: '09:42', distance: 1136 },
      { code: 'DHN', arrivalTime: '10:40', departureTime: '10:45', distance: 1184 },
      { code: 'ASN', arrivalTime: '12:00', departureTime: '12:05', distance: 1242 },
      { code: 'BWN', arrivalTime: '14:35', departureTime: '14:37', distance: 1348 },
      { code: 'HWH', arrivalTime: '17:00', departureTime: null, distance: 1454 },
    ],
  },

  // 13. 12312 Netaji Express (Daily)
  {
    trainNumber: '12312',
    trainName: 'Netaji Express',
    coachName: 'SL',
    trainType: 'EXPRESS',
    basePrice: 610,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'DLI', arrivalTime: null, departureTime: '06:15', distance: 0 },
      { code: 'GZB', arrivalTime: '06:58', departureTime: '07:00', distance: 20 },
      { code: 'ALJN', arrivalTime: '08:30', departureTime: '08:35', distance: 126 },
      { code: 'CNB', arrivalTime: '13:45', departureTime: '13:55', distance: 435 },
      { code: 'PRYJ', arrivalTime: '17:05', departureTime: '17:10', distance: 630 },
      { code: 'DDU', arrivalTime: '20:38', departureTime: '20:48', distance: 783 },
      { code: 'SSM', arrivalTime: '21:58', departureTime: '22:00', distance: 885 },
      { code: 'GAYA', arrivalTime: '23:35', departureTime: '23:40', distance: 988 },
      { code: 'KQR', arrivalTime: '00:55', departureTime: '00:57', distance: 1065 },
      { code: 'DHN', arrivalTime: '03:17', departureTime: '03:22', distance: 1188 },
      { code: 'ASN', arrivalTime: '04:35', departureTime: '04:40', distance: 1247 },
      { code: 'BWN', arrivalTime: '06:21', departureTime: '06:23', distance: 1353 },
      { code: 'HWH', arrivalTime: '08:05', departureTime: null, distance: 1448 },
    ],
  },
  // Reciprocal return: 12311 Netaji Express (Daily)
  {
    trainNumber: '12311',
    trainName: 'Netaji Express',
    coachName: 'SL',
    trainType: 'EXPRESS',
    basePrice: 610,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'HWH', arrivalTime: null, departureTime: '21:55', distance: 0 },
      { code: 'BWN', arrivalTime: '23:03', departureTime: '23:08', distance: 95 },
      { code: 'ASN', arrivalTime: '00:41', departureTime: '00:46', distance: 201 },
      { code: 'DHN', arrivalTime: '01:45', departureTime: '01:50', distance: 260 },
      { code: 'KQR', arrivalTime: '03:18', departureTime: '03:20', distance: 383 },
      { code: 'GAYA', arrivalTime: '05:05', departureTime: '05:10', distance: 460 },
      { code: 'SSM', arrivalTime: '06:33', departureTime: '06:35', distance: 563 },
      { code: 'DDU', arrivalTime: '08:05', departureTime: '08:15', distance: 665 },
      { code: 'PRYJ', arrivalTime: '10:40', departureTime: '10:50', distance: 818 },
      { code: 'CNB', arrivalTime: '13:30', departureTime: '13:40', distance: 1013 },
      { code: 'ALJN', arrivalTime: '18:05', departureTime: '18:10', distance: 1322 },
      { code: 'GZB', arrivalTime: '20:00', departureTime: '20:02', distance: 1428 },
      { code: 'DLI', arrivalTime: '20:55', departureTime: null, distance: 1448 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── MORADABAD & CHANDAUSI AUTHENTIC PASSENGER & INTERCITY CORRIDOR
  // ═══════════════════════════════════════════════════════════════════════════

  // 14. 04366 Moradabad - Chandausi Passenger Special (Daily)
  {
    trainNumber: '04366',
    trainName: 'Moradabad - Chandausi Passenger Special',
    coachName: '2S',
    trainType: 'PASSENGER',
    basePrice: 50,
    seatsCount: 60,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'MB', arrivalTime: null, departureTime: '08:00', distance: 0 },
      { code: 'CH', arrivalTime: '09:15', departureTime: null, distance: 44 },
    ],
  },
  // 15. 04365 Chandausi - Moradabad Passenger Special (Daily)
  {
    trainNumber: '04365',
    trainName: 'Chandausi - Moradabad Passenger Special',
    coachName: '2S',
    trainType: 'PASSENGER',
    basePrice: 50,
    seatsCount: 60,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'CH', arrivalTime: null, departureTime: '17:30', distance: 0 },
      { code: 'MB', arrivalTime: '18:45', departureTime: null, distance: 44 },
    ],
  },
  // 16. 14316 New Delhi - Moradabad Intercity Express (Daily)
  {
    trainNumber: '14316',
    trainName: 'New Delhi - Moradabad Intercity Express',
    coachName: 'CC',
    trainType: 'EXPRESS',
    basePrice: 195,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:35', distance: 0 },
      { code: 'GZB', arrivalTime: '17:21', departureTime: '17:23', distance: 26 },
      { code: 'ALJN', arrivalTime: '18:35', departureTime: '18:40', distance: 131 },
      { code: 'MB', arrivalTime: '20:30', departureTime: null, distance: 202 },
    ],
  },
  // 17. 14315 Moradabad - New Delhi Intercity Express (Daily)
  {
    trainNumber: '14315',
    trainName: 'Moradabad - New Delhi Intercity Express',
    coachName: 'CC',
    trainType: 'EXPRESS',
    basePrice: 195,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'MB', arrivalTime: null, departureTime: '05:45', distance: 0 },
      { code: 'ALJN', arrivalTime: '07:35', departureTime: '07:40', distance: 71 },
      { code: 'GZB', arrivalTime: '09:20', departureTime: '09:22', distance: 176 },
      { code: 'NDLS', arrivalTime: '10:20', departureTime: null, distance: 202 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── KEY NATIONAL FLAGSHIP PAIRS (Vande Bharat, Shatabdi & Rajdhani)
  // ═══════════════════════════════════════════════════════════════════════════

  // 18. 22436 New Delhi - Varanasi Vande Bharat Express (Tri-Weekly: Sun, Wed, Fri)
  {
    trainNumber: '22436',
    trainName: 'Varanasi Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1750,
    seatsCount: 52,
    runsOn: 'Sun, Wed, Fri',
    runningDays: [0, 3, 5],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '06:00', distance: 0 },
      { code: 'CNB', arrivalTime: '10:08', departureTime: '10:10', distance: 440 },
      { code: 'PRYJ', arrivalTime: '12:08', departureTime: '12:10', distance: 635 },
      { code: 'BSB', arrivalTime: '14:00', departureTime: null, distance: 759 },
    ],
  },
  // 19. 22435 Varanasi - New Delhi Vande Bharat Express (Tri-Weekly: Mon, Thu, Sat)
  {
    trainNumber: '22435',
    trainName: 'New Delhi Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1750,
    seatsCount: 52,
    runsOn: 'Mon, Thu, Sat',
    runningDays: [1, 4, 6],
    stops: [
      { code: 'BSB', arrivalTime: null, departureTime: '15:00', distance: 0 },
      { code: 'PRYJ', arrivalTime: '16:30', departureTime: '16:32', distance: 124 },
      { code: 'CNB', arrivalTime: '18:30', departureTime: '18:32', distance: 319 },
      { code: 'NDLS', arrivalTime: '23:00', departureTime: null, distance: 759 },
    ],
  },

  // 20. 12952 New Delhi - Mumbai Central Tejas Rajdhani Express (Daily)
  {
    trainNumber: '12952',
    trainName: 'Mumbai Tejas Rajdhani Express',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2280,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:55', distance: 0 },
      { code: 'MTJ', arrivalTime: '18:53', departureTime: '18:55', distance: 141 },
      { code: 'KOTA', arrivalTime: '21:30', departureTime: '21:40', distance: 465 },
      { code: 'BRC', arrivalTime: '03:50', departureTime: '04:00', distance: 993 },
      { code: 'ST', arrivalTime: '05:13', departureTime: '05:18', distance: 1122 },
      { code: 'MMCT', arrivalTime: '08:35', departureTime: null, distance: 1384 },
    ],
  },
  // 21. 12951 Mumbai Central - New Delhi Tejas Rajdhani Express (Daily)
  {
    trainNumber: '12951',
    trainName: 'New Delhi Tejas Rajdhani Express',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2280,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'MMCT', arrivalTime: null, departureTime: '17:00', distance: 0 },
      { code: 'ST', arrivalTime: '19:43', departureTime: '19:48', distance: 263 },
      { code: 'BRC', arrivalTime: '21:06', departureTime: '21:16', distance: 392 },
      { code: 'KOTA', arrivalTime: '03:15', departureTime: '03:25', distance: 919 },
      { code: 'MTJ', arrivalTime: '06:33', departureTime: '06:35', distance: 1243 },
      { code: 'NDLS', arrivalTime: '08:32', departureTime: null, distance: 1384 },
    ],
  },

  // 22. 12004 New Delhi - Lucknow Swarna Shatabdi Express (Daily)
  {
    trainNumber: '12004',
    trainName: 'Lucknow Swarna Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 1165,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '06:10', distance: 0 },
      { code: 'GZB', arrivalTime: '06:48', departureTime: '06:50', distance: 26 },
      { code: 'ALJN', arrivalTime: '07:49', departureTime: '07:51', distance: 131 },
      { code: 'TDL', arrivalTime: '08:45', departureTime: '08:47', distance: 209 },
      { code: 'CNB', arrivalTime: '11:20', departureTime: '11:25', distance: 440 },
      { code: 'LKO', arrivalTime: '12:40', departureTime: null, distance: 512 },
    ],
  },
  // 23. 12003 Lucknow - New Delhi Swarna Shatabdi Express (Daily)
  {
    trainNumber: '12003',
    trainName: 'New Delhi Swarna Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 1165,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'LKO', arrivalTime: null, departureTime: '15:30', distance: 0 },
      { code: 'CNB', arrivalTime: '16:50', departureTime: '16:55', distance: 72 },
      { code: 'TDL', arrivalTime: '19:26', departureTime: '19:28', distance: 303 },
      { code: 'ALJN', arrivalTime: '20:10', departureTime: '20:12', distance: 381 },
      { code: 'GZB', arrivalTime: '21:33', departureTime: '21:35', distance: 486 },
      { code: 'NDLS', arrivalTime: '22:25', departureTime: null, distance: 512 },
    ],
  },
];

// ─── 3. SEEDING & RESET EXECUTION ─────────────────────────────────────────────

async function seedRealIndianRailways() {
  console.log('===============================================================');
  console.log('🇮🇳 SEEDING AUTHENTIC INDIAN RAILWAYS (IRCTC) DATABASE');
  console.log('   Strict Running Days, Realistic Timings & Complete Reset');
  console.log('===============================================================\n');

  const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
  const adminDbUrl = process.env.DATABASE_URL || 'postgresql://admin:BMTpass@localhost:5432/admin_service_database';
  const inventoryDbUrl = adminDbUrl.replace('admin_service_database', 'inventory_service_database');
  const bookingDbUrl = adminDbUrl.replace('admin_service_database', 'booking_service_database');

  // Step 1: Deep Reset & Truncate All Databases
  console.log('🧹 [1/5] Truncating all train, station, route, and schedule tables...');

  const invPool = new Pool({ connectionString: inventoryDbUrl });
  const bookPool = new Pool({ connectionString: bookingDbUrl });

  try {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE route_stations, routes, seats, schedules, trains, stations CASCADE;');
    console.log('  ✓ admin_service_database cleaned (stations, trains, seats, routes, schedules)');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE trains ADD COLUMN IF NOT EXISTS "runsOn" text NOT NULL DEFAULT 'Daily Service';
      ALTER TABLE trains ADD COLUMN IF NOT EXISTS "runningDays" integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}';
      ALTER TABLE trains ADD COLUMN IF NOT EXISTS "trainType" text NOT NULL DEFAULT 'EXPRESS';
    `);
    console.log('  ✓ Verified trains table schema columns (runsOn, runningDays, trainType)');
  } catch (err) {
    console.warn(`  ⚠️ admin_service_database truncate/schema warning: ${err.message}`);
  }

  try {
    await invPool.query('TRUNCATE TABLE seat_segment_locks, route_stops, seat_inventories, schedule_inventories, idempotency_records CASCADE;');
    console.log('  ✓ inventory_service_database cleaned (inventories, seats, route stops, locks)');
  } catch (err) {
    console.warn(`  ⚠️ inventory_service_database truncate warning: ${err.message}`);
  }

  try {
    await bookPool.query('TRUNCATE TABLE saga_logs, passengers, booking_seats, bookings, idempotency_records CASCADE;');
    console.log('  ✓ booking_service_database cleaned (bookings, seats, passengers, saga logs)');
  } catch (err) {
    console.warn(`  ⚠️ booking_service_database truncate warning: ${err.message}`);
  }

  // Step 2: Clean and Recreate Elasticsearch Indices
  console.log('\n🧹 [2/5] Resetting Elasticsearch indices with proper autocomplete analyzers...');
  const esAvailable = await checkElasticsearch(esUrl);
  if (esAvailable) {
    await recreateEsIndices(esUrl);
    console.log('  ✓ Elasticsearch stations and trains indices cleanly recreated');
  } else {
    console.warn(`  ⚠️ Elasticsearch not reachable at ${esUrl}`);
  }

  // Optional Kafka Init
  let kafkaAvailable = false;
  try {
    await adminProducer.initialize();
    kafkaAvailable = true;
    console.log('  ✓ Kafka producer connected');
  } catch (err) {
    console.warn('  ⚠️ Kafka producer warning (proceeding with direct DB/ES sync):', err.message);
  }

  // Step 3: Insert Stations
  console.log(`\n📍 [3/5] Seeding ${STATIONS.length} Authentic Stations...`);
  const stationMap = new Map();

  for (const s of STATIONS) {
    const station = await prisma.station.create({
      data: {
        code: s.code,
        name: s.name,
        city: s.city,
        state: s.state,
      },
    });
    stationMap.set(s.code, station);

    if (kafkaAvailable) {
      try {
        await adminProducer.publishStationCreated(station);
      } catch (_) {}
    }
  }
  console.log(`  ✓ ${stationMap.size} unique stations created in PostgreSQL.`);

  if (esAvailable) {
    const allDbStations = await prisma.station.findMany();
    await directIndexStationsToEs(esUrl, allDbStations);
    console.log(`  ✓ ${allDbStations.length} stations indexed to Elasticsearch for instant autocomplete.`);
  }

  // Step 4: Seed Trains, Routes, Schedules & Inventories
  console.log(`\n🚆 [4/5] Seeding ${TRAINS.length} Realistic Trains & Provisioning Specific Schedules...`);

  let totalSchedules = 0;
  let totalSeatInventories = 0;

  for (const t of TRAINS) {
    try {
      // Create Train
      const train = await prisma.train.create({
        data: {
          trainNumber: t.trainNumber,
          trainName: t.trainName,
          coachName: t.coachName,
          totalSeats: t.seatsCount,
          runsOn: t.runsOn,
          runningDays: t.runningDays,
          trainType: t.trainType || 'EXPRESS',
        },
      });

      // Generate Seats
      const seatsData = generateSeats(t.basePrice, t.seatsCount);
      const seats = [];
      for (const s of seatsData) {
        const createdSeat = await prisma.seat.create({
          data: {
            trainId: train.id,
            seatNumber: s.seatNumber,
            seatType: s.seatType,
            price: s.price,
          },
        });
        seats.push(createdSeat);
      }

      // Create Route
      const route = await prisma.route.create({
        data: { trainId: train.id },
      });

      // Create Route Stations
      let seq = 1;
      const createdRouteStations = [];
      for (const stop of t.stops) {
        const station = stationMap.get(stop.code);
        if (!station) {
          console.warn(`Station code ${stop.code} not found in map, skipping stop.`);
          continue;
        }

        const rs = await prisma.routeStation.create({
          data: {
            routeId: route.id,
            stationId: station.id,
            sequenceNumber: seq++,
            arrivalTime: stop.arrivalTime,
            departureTime: stop.departureTime,
            distanceFromOrigin: stop.distance,
          },
          include: { station: true },
        });
        createdRouteStations.push(rs);
      }

      // Publish Route to Kafka
      if (kafkaAvailable) {
        try {
          await adminProducer.publishRouteCreated({
            id: route.id,
            train: { ...train, runsOn: t.runsOn, runningDays: t.runningDays, seats },
            routeStations: createdRouteStations,
          });
        } catch (_) {}
      }

      // Provision Schedules strictly for operating days for next 35 days
      const today = new Date();
      let trainSchedulesCount = 0;
      const schedulesForEs = [];

      for (let dayOffset = 0; dayOffset < 35; dayOffset++) {
        const schedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
        schedDate.setHours(0, 0, 0, 0);

        const dayOfWeek = schedDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

        // STRICT CHECK: Train only runs on its designated runningDays!
        if (!t.runningDays.includes(dayOfWeek)) {
          continue;
        }

        const year = schedDate.getFullYear();
        const month = String(schedDate.getMonth() + 1).padStart(2, '0');
        const day = String(schedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // 1. Create in Admin Service DB
        const schedule = await prisma.schedule.create({
          data: {
            trainId: train.id,
            departureDate: schedDate,
            status: 'ACTIVE',
          },
        });
        trainSchedulesCount++;
        totalSchedules++;

        // 2. Direct Sync into Inventory Service DB
        try {
          const invRes = await invPool.query(
            `INSERT INTO schedule_inventories (id, "scheduleId", "trainId", "trainNumber", "trainName", "departureDate", "totalSeats", available, locked, booked, status, version, "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 0, 0, 'ACTIVE', 0, NOW(), NOW())
             RETURNING id;`,
            [schedule.id, train.id, train.trainNumber, train.trainName, dateStr, t.seatsCount, t.seatsCount]
          );
          const scheduleInventoryId = invRes.rows[0].id;

          // Insert Seat Inventories
          for (const s of seats) {
            await invPool.query(
              `INSERT INTO seat_inventories (id, "scheduleInventoryId", "scheduleId", "seatId", "seatNumber", "seatType", price, status, version, "createdAt", "updatedAt")
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'AVAILABLE', 0, NOW(), NOW());`,
              [scheduleInventoryId, schedule.id, s.id, s.seatNumber, s.seatType, s.price]
            );
            totalSeatInventories++;
          }

          // Insert Route Stops for Segment Booking
          for (const rs of createdRouteStations) {
            await invPool.query(
              `INSERT INTO route_stops (id, "scheduleId", "stationId", "stationName", "stationCode", "sequenceNumber")
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5);`,
              [schedule.id, rs.station.id, rs.station.name, rs.station.code, rs.sequenceNumber]
            );
          }
        } catch (invErr) {
          // Ignore unique collision or duplicate
        }

        schedulesForEs.push({
          scheduleId: schedule.id,
          departureDate: dateStr,
          status: 'ACTIVE',
          available: t.seatsCount,
          locked: 0,
          booked: 0,
        });

        // Publish to Kafka
        if (kafkaAvailable) {
          try {
            await adminProducer.publishScheduleCreated({
              scheduleId: schedule.id,
              trainId: train.id,
              trainNumber: train.trainNumber,
              trainName: train.trainName,
              coachName: train.coachName,
              totalSeats: train.totalSeats,
              departureDate: dateStr,
              status: schedule.status,
              seats: seats.map((s) => ({
                seatId: s.id,
                seatNumber: s.seatNumber,
                seatType: s.seatType,
                price: s.price,
              })),
              route: createdRouteStations.map((rs) => ({
                stationId: rs.station.id,
                stationName: rs.station.name,
                stationCode: rs.station.code,
                sequenceNumber: rs.sequenceNumber,
                arrivalTime: rs.arrivalTime,
                departureTime: rs.departureTime,
                distanceFromOrigin: rs.distanceFromOrigin,
              })),
            });
          } catch (_) {}
        }
      }

      // Index Train to Elasticsearch
      if (esAvailable) {
        await directIndexTrainToEs(esUrl, train, t, createdRouteStations, schedulesForEs);
      }

      console.log(`  ✓ Train #${t.trainNumber} - ${t.trainName}`);
      console.log(`    Route: ${t.stops[0].code} ➔ ${t.stops[t.stops.length - 1].code} (${createdRouteStations.length} halts) | Frequency: ${t.runsOn} (${trainSchedulesCount} departures)`);

    } catch (err) {
      console.error(`  ❌ Error processing train ${t.trainNumber}:`, err.message);
    }
  }

  // Close direct pg pools
  await invPool.end();
  await bookPool.end();

  // Step 5: Refresh Elasticsearch
  if (esAvailable) {
    console.log('\n🔍 [5/5] Refreshing Elasticsearch search indices...');
    try {
      await fetch(`${esUrl}/stations/_refresh`, { method: 'POST' });
      await fetch(`${esUrl}/trains/_refresh`, { method: 'POST' });
      console.log('  ✓ Elasticsearch refresh complete');
    } catch (_) {}
  }

  console.log('\n===============================================================');
  console.log('🎉 REALISTIC DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`✅ Stations Seeded: ${stationMap.size}`);
  console.log(`✅ Directional Trains Seeded: ${TRAINS.length}`);
  console.log(`✅ Total Schedules Provisioned: ${totalSchedules}`);
  console.log(`✅ Total Seat Inventories Created: ${totalSeatInventories}`);
  console.log('✅ Realistic operation days strictly active (e.g. Mon/Fri, Tue/Wed/Thu/Sat, Daily)');
  console.log('===============================================================\n');
}

// ─── ELASTICSEARCH DIRECT SYNC HELPERS ───────────────────────────────────────

async function checkElasticsearch(url) {
  try {
    const res = await fetch(`${url}/_cluster/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function recreateEsIndices(esUrl) {
  for (const index of ['stations', 'trains']) {
    try {
      await fetch(`${esUrl}/${index}`, { method: 'DELETE' });
    } catch (_) {}
  }

  // 1. Create Station index with autocomplete analyzer
  await fetch(`${esUrl}/stations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      settings: {
        analysis: {
          analyzer: {
            autocomplete_analyzer: {
              type: 'custom',
              tokenizer: 'autocomplete_tokenizer',
              filter: ['lowercase'],
            },
            search_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase'],
            },
          },
          tokenizer: {
            autocomplete_tokenizer: {
              type: 'edge_ngram',
              min_gram: 2,
              max_gram: 20,
              token_chars: ['letter', 'digit'],
            },
          },
        },
      },
      mappings: {
        properties: {
          stationId: { type: 'keyword' },
          name: { type: 'text', analyzer: 'autocomplete_analyzer', search_analyzer: 'search_analyzer' },
          code: { type: 'keyword' },
          city: { type: 'text', analyzer: 'autocomplete_analyzer', search_analyzer: 'search_analyzer' },
          suggest: { type: 'completion' },
        },
      },
    }),
  });

  // 2. Create Train index
  await fetch(`${esUrl}/trains`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mappings: {
        properties: {
          trainId: { type: 'keyword' },
          trainNumber: { type: 'keyword' },
          trainName: { type: 'text' },
          runsOn: { type: 'keyword' },
          runningDays: { type: 'integer' },
          route: {
            type: 'nested',
            properties: {
              stationId: { type: 'keyword' },
              stationName: { type: 'text' },
              stationCode: { type: 'keyword' },
              sequenceNumber: { type: 'integer' },
              arrivalTime: { type: 'keyword' },
              departureTime: { type: 'keyword' },
              distanceFromOrigin: { type: 'float' },
            },
          },
          schedules: {
            type: 'nested',
            properties: {
              scheduleId: { type: 'keyword' },
              departureDate: { type: 'date' },
              status: { type: 'keyword' },
              available: { type: 'integer' },
              locked: { type: 'integer' },
              booked: { type: 'integer' },
            },
          },
          seatSummary: {
            properties: {
              total: { type: 'integer' },
              LOWER: { type: 'integer' },
              MIDDLE: { type: 'integer' },
              UPPER: { type: 'integer' },
              SIDE_LOWER: { type: 'integer' },
              SIDE_UPPER: { type: 'integer' },
            },
          },
        },
      },
    }),
  });
}

async function directIndexTrainToEs(esUrl, train, config, routeStations, schedules) {
  try {
    const seatSummary = { total: config.seatsCount, LOWER: 16, MIDDLE: 16, UPPER: 16, SIDE_LOWER: 8, SIDE_UPPER: 8 };
    const doc = {
      trainId: train.id,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      runsOn: config.runsOn,
      runningDays: config.runningDays,
      route: routeStations.map((rs) => ({
        stationId: rs.station.id,
        stationName: rs.station.name,
        stationCode: rs.station.code,
        sequenceNumber: rs.sequenceNumber,
        arrivalTime: rs.arrivalTime,
        departureTime: rs.departureTime,
        distanceFromOrigin: rs.distanceFromOrigin,
      })),
      schedules,
      seatSummary,
    };

    await fetch(`${esUrl}/trains/_doc/${train.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
  } catch (err) {
    console.warn(`Direct ES train indexing skipped: ${err.message}`);
  }
}

async function directIndexStationsToEs(esUrl, stations) {
  for (const s of stations) {
    try {
      const doc = {
        stationId: s.id,
        name: s.name,
        code: s.code,
        city: s.city,
        suggest: {
          input: [s.name, s.code, s.city].filter(Boolean),
          weight: 10,
        },
      };
      await fetch(`${esUrl}/stations/_doc/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
    } catch (_) {}
  }
}

seedRealIndianRailways()
  .catch((e) => {
    console.error('Fatal Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
