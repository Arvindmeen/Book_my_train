/**
 * Comprehensive Indian Railways (IRCTC) Real Data Seeder
 * Populates 85+ authentic stations across all Indian States & UTs,
 * 30 directional flagship & daily express train pairs,
 * authentic multi-stop intermediate routes, seat layouts,
 * and realistic day-of-week operation schedules (e.g., Sun/Wed/Fri & alternate-day returns).
 */

const prisma = require('../config/prisma');
const adminProducer = require('../kafka/producer/admin.producer');

// ─── 1. REAL STATIONS ACROSS ALL INDIAN STATES & UTs ──────────────────────────

const STATIONS = [
  // Delhi NCR
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi Junction', city: 'Delhi', state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi' },
  { code: 'DEE', name: 'Delhi Sarai Rohilla', city: 'Delhi', state: 'Delhi' },

  // Uttar Pradesh
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh' },
  { code: 'MTJ', name: 'Mathura Junction', city: 'Mathura', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { code: 'AY', name: 'Ayodhya Dham Junction', city: 'Ayodhya', state: 'Uttar Pradesh' },
  { code: 'VGLJ', name: 'VGL Jhansi Junction', city: 'Jhansi', state: 'Uttar Pradesh' },
  { code: 'BE', name: 'Bareilly Junction', city: 'Bareilly', state: 'Uttar Pradesh' },
  { code: 'ALJN', name: 'Aligarh Junction', city: 'Aligarh', state: 'Uttar Pradesh' },
  { code: 'MTC', name: 'Meerut City', city: 'Meerut', state: 'Uttar Pradesh' },
  { code: 'MB', name: 'Moradabad Junction', city: 'Moradabad', state: 'Uttar Pradesh' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction', city: 'Mughalsarai', state: 'Uttar Pradesh' },
  { code: 'GZB', name: 'Ghaziabad Junction', city: 'Ghaziabad', state: 'Uttar Pradesh' },

  // Maharashtra
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra' },
  { code: 'NK', name: 'Nashik Road', city: 'Nashik', state: 'Maharashtra' },
  { code: 'SUR', name: 'Solapur Junction', city: 'Solapur', state: 'Maharashtra' },
  { code: 'AWB', name: 'Chhatrapati Sambhajinagar', city: 'Aurangabad', state: 'Maharashtra' },
  { code: 'KOP', name: 'Kolhapur CSMT', city: 'Kolhapur', state: 'Maharashtra' },
  { code: 'BSR', name: 'Vasai Road', city: 'Palghar', state: 'Maharashtra' },

  // Rajasthan
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'JU', name: 'Jodhpur Junction', city: 'Jodhpur', state: 'Rajasthan' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan' },
  { code: 'AII', name: 'Ajmer Junction', city: 'Ajmer', state: 'Rajasthan' },
  { code: 'UDZ', name: 'Udaipur City', city: 'Udaipur', state: 'Rajasthan' },
  { code: 'BKN', name: 'Bikaner Junction', city: 'Bikaner', state: 'Rajasthan' },
  { code: 'AWR', name: 'Alwar Junction', city: 'Alwar', state: 'Rajasthan' },
  { code: 'SWM', name: 'Sawai Madhopur Junction', city: 'Sawai Madhopur', state: 'Rajasthan' },

  // Gujarat
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat' },
  { code: 'RJT', name: 'Rajkot Junction', city: 'Rajkot', state: 'Gujarat' },
  { code: 'GNC', name: 'Gandhinagar Capital', city: 'Gandhinagar', state: 'Gujarat' },
  { code: 'BHUJ', name: 'Bhuj', city: 'Bhuj', state: 'Gujarat' },
  { code: 'JAM', name: 'Jamnagar', city: 'Jamnagar', state: 'Gujarat' },

  // West Bengal
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal' },
  { code: 'KOAA', name: 'Kolkata Chitpur', city: 'Kolkata', state: 'West Bengal' },
  { code: 'KGP', name: 'Kharagpur Junction', city: 'Kharagpur', state: 'West Bengal' },
  { code: 'ASN', name: 'Asansol Junction', city: 'Asansol', state: 'West Bengal' },
  { code: 'NJP', name: 'New Jalpaiguri', city: 'Siliguri', state: 'West Bengal' },
  { code: 'MLDT', name: 'Malda Town', city: 'Malda', state: 'West Bengal' },

  // Tamil Nadu
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu' },
  { code: 'MDU', name: 'Madurai Junction', city: 'Madurai', state: 'Tamil Nadu' },
  { code: 'TPJ', name: 'Tiruchirappalli Junction', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { code: 'SA', name: 'Salem Junction', city: 'Salem', state: 'Tamil Nadu' },
  { code: 'RMM', name: 'Rameswaram', city: 'Rameswaram', state: 'Tamil Nadu' },
  { code: 'KPD', name: 'Katpadi Junction', city: 'Vellore', state: 'Tamil Nadu' },

  // Karnataka
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'MYS', name: 'Mysuru Junction', city: 'Mysuru', state: 'Karnataka' },
  { code: 'UBL', name: 'SSS Hubballi Junction', city: 'Hubballi', state: 'Karnataka' },
  { code: 'MAQ', name: 'Mangaluru Central', city: 'Mangaluru', state: 'Karnataka' },
  { code: 'BGM', name: 'Belagavi', city: 'Belagavi', state: 'Karnataka' },

  // Telangana & Andhra Pradesh
  { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', state: 'Telangana' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { code: 'RU', name: 'Renigunta Junction', city: 'Tirupati', state: 'Andhra Pradesh' },
  { code: 'WL', name: 'Warangal', city: 'Warangal', state: 'Telangana' },

  // Punjab, Haryana & Jammu
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab' },
  { code: 'LDH', name: 'Ludhiana Junction', city: 'Ludhiana', state: 'Punjab' },
  { code: 'JUC', name: 'Jalandhar City', city: 'Jalandhar', state: 'Punjab' },
  { code: 'UMB', name: 'Ambala Cantt Junction', city: 'Ambala', state: 'Haryana' },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Chandigarh' },
  { code: 'HSR', name: 'Hisar Junction', city: 'Hisar', state: 'Haryana' },
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu & Kashmir' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', city: 'Katra', state: 'Jammu & Kashmir' },

  // Bihar & Jharkhand
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'GAYA', name: 'Gaya Junction', city: 'Gaya', state: 'Bihar' },
  { code: 'MFP', name: 'Muzaffarpur Junction', city: 'Muzaffarpur', state: 'Bihar' },
  { code: 'DBG', name: 'Darbhanga Junction', city: 'Darbhanga', state: 'Bihar' },
  { code: 'KIR', name: 'Katihar Junction', city: 'Katihar', state: 'Bihar' },
  { code: 'RNC', name: 'Ranchi Junction', city: 'Ranchi', state: 'Jharkhand' },
  { code: 'TATA', name: 'Tatanagar Junction', city: 'Jamshedpur', state: 'Jharkhand' },
  { code: 'DHN', name: 'Dhanbad Junction', city: 'Dhanbad', state: 'Jharkhand' },
  { code: 'BKSC', name: 'Bokaro Steel City', city: 'Bokaro', state: 'Jharkhand' },

  // Madhya Pradesh & Chhattisgarh
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamlapati', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'INDB', name: 'Indore Junction', city: 'Indore', state: 'Madhya Pradesh' },
  { code: 'JBP', name: 'Jabalpur Junction', city: 'Jabalpur', state: 'Madhya Pradesh' },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh' },
  { code: 'RTM', name: 'Ratlam Junction', city: 'Ratlam', state: 'Madhya Pradesh' },
  { code: 'UJN', name: 'Ujjain Junction', city: 'Ujjain', state: 'Madhya Pradesh' },
  { code: 'R', name: 'Raipur Junction', city: 'Raipur', state: 'Chhattisgarh' },
  { code: 'BSP', name: 'Bilaspur Junction', city: 'Bilaspur', state: 'Chhattisgarh' },

  // Uttarakhand
  { code: 'DDN', name: 'Dehradun', city: 'Dehradun', state: 'Uttarakhand' },
  { code: 'HW', name: 'Haridwar', city: 'Haridwar', state: 'Uttarakhand' },
  { code: 'YNRK', name: 'Yog Nagari Rishikesh', city: 'Rishikesh', state: 'Uttarakhand' },

  // Kerala & Goa
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala' },
  { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi', state: 'Kerala' },
  { code: 'CLT', name: 'Kozhikode Main', city: 'Kozhikode', state: 'Kerala' },
  { code: 'TCR', name: 'Thrissur', city: 'Thrissur', state: 'Kerala' },
  { code: 'MAO', name: 'Madgaon Junction', city: 'Madgaon', state: 'Goa' },

  // Odisha & Assam
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
  { code: 'CTC', name: 'Cuttack Junction', city: 'Cuttack', state: 'Odisha' },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha' },
  { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam' },
  { code: 'DBRG', name: 'Dibrugarh', city: 'Dibrugarh', state: 'Assam' },
];

// Helper: Generates realistic seat configurations
function generateSeats(basePrice, totalSeats = 60) {
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

// ─── 2. REALISTIC TRAIN SCHEDULES WITH RECIPROCAL RETURN PAIRS ────────────────
// Days of Week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

const TRAINS = [
  // ── CORRIDOR 1: Delhi ⇄ Varanasi Vande Bharat Express (Tri-Weekly & Alternate-Day Return) ──
  {
    trainNumber: '22436',
    trainName: 'Varanasi Vande Bharat Express',
    coachName: 'EC',
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
  {
    trainNumber: '22435',
    trainName: 'New Delhi Vande Bharat Express',
    coachName: 'EC',
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

  // ── CORRIDOR 2: Delhi ⇄ Kolkata Howrah Rajdhani Express (Tri-Weekly & Alternate Return) ──
  {
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani Express',
    coachName: '3A',
    basePrice: 2380,
    seatsCount: 64,
    runsOn: 'Sun, Wed, Fri',
    runningDays: [0, 3, 5],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:50', distance: 0 },
      { code: 'CNB', arrivalTime: '21:32', departureTime: '21:37', distance: 440 },
      { code: 'PRYJ', arrivalTime: '23:43', departureTime: '23:45', distance: 635 },
      { code: 'DDU', arrivalTime: '01:42', departureTime: '01:52', distance: 787 },
      { code: 'GAYA', arrivalTime: '03:55', departureTime: '03:58', distance: 992 },
      { code: 'ASN', arrivalTime: '06:54', departureTime: '06:58', distance: 1249 },
      { code: 'HWH', arrivalTime: '09:55', departureTime: null, distance: 1451 },
    ],
  },
  {
    trainNumber: '12301',
    trainName: 'New Delhi Rajdhani Express',
    coachName: '3A',
    basePrice: 2380,
    seatsCount: 64,
    runsOn: 'Mon, Thu, Sat',
    runningDays: [1, 4, 6],
    stops: [
      { code: 'HWH', arrivalTime: null, departureTime: '16:50', distance: 0 },
      { code: 'ASN', arrivalTime: '19:20', departureTime: '19:24', distance: 202 },
      { code: 'GAYA', arrivalTime: '22:15', departureTime: '22:18', distance: 459 },
      { code: 'DDU', arrivalTime: '00:45', departureTime: '00:55', distance: 664 },
      { code: 'PRYJ', arrivalTime: '02:45', departureTime: '02:47', distance: 816 },
      { code: 'CNB', arrivalTime: '04:50', departureTime: '04:55', distance: 1011 },
      { code: 'NDLS', arrivalTime: '10:05', departureTime: null, distance: 1451 },
    ],
  },

  // ── CORRIDOR 3: Delhi ⇄ Mumbai Tejas Rajdhani Express (Alternating Days) ──
  {
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    coachName: '3A',
    basePrice: 2450,
    seatsCount: 64,
    runsOn: 'Sun, Tue, Thu, Sat',
    runningDays: [0, 2, 4, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:55', distance: 0 },
      { code: 'KOTA', arrivalTime: '21:30', departureTime: '21:40', distance: 466 },
      { code: 'RTM', arrivalTime: '00:42', departureTime: '00:45', distance: 732 },
      { code: 'BRC', arrivalTime: '03:40', departureTime: '03:48', distance: 993 },
      { code: 'ST', arrivalTime: '05:13', departureTime: '05:18', distance: 1123 },
      { code: 'MMCT', arrivalTime: '08:35', departureTime: null, distance: 1386 },
    ],
  },
  {
    trainNumber: '12951',
    trainName: 'Delhi Tejas Rajdhani',
    coachName: '3A',
    basePrice: 2450,
    seatsCount: 64,
    runsOn: 'Mon, Wed, Fri',
    runningDays: [1, 3, 5],
    stops: [
      { code: 'MMCT', arrivalTime: null, departureTime: '17:00', distance: 0 },
      { code: 'ST', arrivalTime: '19:43', departureTime: '19:48', distance: 263 },
      { code: 'BRC', arrivalTime: '21:06', departureTime: '21:16', distance: 393 },
      { code: 'RTM', arrivalTime: '00:25', departureTime: '00:28', distance: 654 },
      { code: 'KOTA', arrivalTime: '03:15', departureTime: '03:25', distance: 920 },
      { code: 'NDLS', arrivalTime: '08:32', departureTime: null, distance: 1386 },
    ],
  },

  // ── CORRIDOR 4: Delhi ⇄ Bhopal Shatabdi Express (DAILY SERVICE) ──
  {
    trainNumber: '12002',
    trainName: 'Bhopal Shatabdi Express',
    coachName: 'CC',
    basePrice: 1285,
    seatsCount: 60,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '06:00', distance: 0 },
      { code: 'MTJ', arrivalTime: '07:19', departureTime: '07:20', distance: 141 },
      { code: 'AGC', arrivalTime: '07:50', departureTime: '07:55', distance: 195 },
      { code: 'GWL', arrivalTime: '09:23', departureTime: '09:28', distance: 313 },
      { code: 'VGLJ', arrivalTime: '10:45', departureTime: '10:50', distance: 410 },
      { code: 'BPL', arrivalTime: '14:40', departureTime: null, distance: 707 },
    ],
  },
  {
    trainNumber: '12001',
    trainName: 'New Delhi Shatabdi Express',
    coachName: 'CC',
    basePrice: 1285,
    seatsCount: 60,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'BPL', arrivalTime: null, departureTime: '15:15', distance: 0 },
      { code: 'VGLJ', arrivalTime: '18:40', departureTime: '18:45', distance: 297 },
      { code: 'GWL', arrivalTime: '19:45', departureTime: '19:50', distance: 394 },
      { code: 'AGC', arrivalTime: '21:15', departureTime: '21:20', distance: 512 },
      { code: 'MTJ', arrivalTime: '21:50', departureTime: '21:52', distance: 566 },
      { code: 'NDLS', arrivalTime: '23:45', departureTime: null, distance: 707 },
    ],
  },

  // ── CORRIDOR 5: Delhi ⇄ Lucknow Shatabdi Express (6 Days/Wk, Ex. Wed) ──
  {
    trainNumber: '12004',
    trainName: 'Lucknow Shatabdi Express',
    coachName: 'CC',
    basePrice: 1160,
    seatsCount: 60,
    runsOn: '6 Days/Wk (Ex. Wed)',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '06:10', distance: 0 },
      { code: 'GZB', arrivalTime: '06:48', departureTime: '06:50', distance: 26 },
      { code: 'ALJN', arrivalTime: '07:49', departureTime: '07:51', distance: 131 },
      { code: 'CNB', arrivalTime: '11:20', departureTime: '11:25', distance: 440 },
      { code: 'LKO', arrivalTime: '12:55', departureTime: null, distance: 512 },
    ],
  },
  {
    trainNumber: '12003',
    trainName: 'Delhi Shatabdi Express',
    coachName: 'CC',
    basePrice: 1160,
    seatsCount: 60,
    runsOn: '6 Days/Wk (Ex. Wed)',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'LKO', arrivalTime: null, departureTime: '15:35', distance: 0 },
      { code: 'CNB', arrivalTime: '16:50', departureTime: '16:55', distance: 72 },
      { code: 'ALJN', arrivalTime: '20:10', departureTime: '20:12', distance: 381 },
      { code: 'GZB', arrivalTime: '21:30', departureTime: '21:32', distance: 486 },
      { code: 'NDLS', arrivalTime: '22:20', departureTime: null, distance: 512 },
    ],
  },

  // ── CORRIDOR 6: Anand Vihar Terminal (ANVT) ⇄ Lucknow AC Double Decker ──
  {
    trainNumber: '12584',
    trainName: 'Lucknow AC Double Decker Express',
    coachName: 'CC',
    basePrice: 850,
    seatsCount: 72,
    runsOn: 'Sun, Tue, Thu, Fri',
    runningDays: [0, 2, 4, 5],
    stops: [
      { code: 'ANVT', arrivalTime: null, departureTime: '14:05', distance: 0 },
      { code: 'GZB', arrivalTime: '14:33', departureTime: '14:35', distance: 13 },
      { code: 'MB', arrivalTime: '16:50', departureTime: '16:58', distance: 153 },
      { code: 'BE', arrivalTime: '18:15', departureTime: '18:17', distance: 244 },
      { code: 'LKO', arrivalTime: '22:30', departureTime: null, distance: 479 },
    ],
  },
  {
    trainNumber: '12583',
    trainName: 'Anand Vihar AC Double Decker Express',
    coachName: 'CC',
    basePrice: 850,
    seatsCount: 72,
    runsOn: 'Mon, Wed, Fri, Sat',
    runningDays: [1, 3, 5, 6],
    stops: [
      { code: 'LKO', arrivalTime: null, departureTime: '04:55', distance: 0 },
      { code: 'BE', arrivalTime: '08:50', departureTime: '08:52', distance: 235 },
      { code: 'MB', arrivalTime: '10:25', departureTime: '10:33', distance: 326 },
      { code: 'GZB', arrivalTime: '12:20', departureTime: '12:22', distance: 466 },
      { code: 'ANVT', arrivalTime: '12:55', departureTime: null, distance: 479 },
    ],
  },

  // ── CORRIDOR 7: Mumbai ⇄ Gandhinagar Vande Bharat Express ──
  {
    trainNumber: '20901',
    trainName: 'Gandhinagar Capital Vande Bharat',
    coachName: 'CC',
    basePrice: 1420,
    seatsCount: 52,
    runsOn: 'Sun, Wed, Fri',
    runningDays: [0, 3, 5],
    stops: [
      { code: 'MMCT', arrivalTime: null, departureTime: '06:10', distance: 0 },
      { code: 'ST', arrivalTime: '08:58', departureTime: '09:01', distance: 263 },
      { code: 'BRC', arrivalTime: '10:19', departureTime: '10:22', distance: 392 },
      { code: 'ADI', arrivalTime: '11:25', departureTime: '11:30', distance: 491 },
      { code: 'GNC', arrivalTime: '12:25', departureTime: null, distance: 522 },
    ],
  },
  {
    trainNumber: '20902',
    trainName: 'Mumbai Vande Bharat Express',
    coachName: 'CC',
    basePrice: 1420,
    seatsCount: 52,
    runsOn: 'Mon, Thu, Sat',
    runningDays: [1, 4, 6],
    stops: [
      { code: 'GNC', arrivalTime: null, departureTime: '14:05', distance: 0 },
      { code: 'ADI', arrivalTime: '15:00', departureTime: '15:05', distance: 31 },
      { code: 'BRC', arrivalTime: '15:53', departureTime: '15:56', distance: 130 },
      { code: 'ST', arrivalTime: '17:10', departureTime: '17:13', distance: 259 },
      { code: 'MMCT', arrivalTime: '20:25', departureTime: null, distance: 522 },
    ],
  },

  // ── CORRIDOR 8: Chennai ⇄ Mysuru via Bengaluru Vande Bharat Express ──
  {
    trainNumber: '20607',
    trainName: 'Mysuru Vande Bharat Express',
    coachName: 'CC',
    basePrice: 1365,
    seatsCount: 52,
    runsOn: 'Sun, Wed, Fri',
    runningDays: [0, 3, 5],
    stops: [
      { code: 'MAS', arrivalTime: null, departureTime: '05:50', distance: 0 },
      { code: 'KPD', arrivalTime: '07:13', departureTime: '07:15', distance: 130 },
      { code: 'SBC', arrivalTime: '10:15', departureTime: '10:20', distance: 359 },
      { code: 'MYS', arrivalTime: '12:20', departureTime: null, distance: 496 },
    ],
  },
  {
    trainNumber: '20608',
    trainName: 'Chennai Vande Bharat Express',
    coachName: 'CC',
    basePrice: 1365,
    seatsCount: 52,
    runsOn: 'Mon, Thu, Sat',
    runningDays: [1, 4, 6],
    stops: [
      { code: 'MYS', arrivalTime: null, departureTime: '13:05', distance: 0 },
      { code: 'SBC', arrivalTime: '14:50', departureTime: '14:55', distance: 137 },
      { code: 'KPD', arrivalTime: '17:33', departureTime: '17:35', distance: 366 },
      { code: 'MAS', arrivalTime: '19:20', departureTime: null, distance: 496 },
    ],
  },

  // ── CORRIDOR 9: Delhi ⇄ Puri Purushottam Express (DAILY SERVICE) ──
  {
    trainNumber: '12802',
    trainName: 'Purushottam Express',
    coachName: '3A',
    basePrice: 1980,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '22:40', distance: 0 },
      { code: 'CNB', arrivalTime: '04:00', departureTime: '04:05', distance: 440 },
      { code: 'PRYJ', arrivalTime: '06:55', departureTime: '07:00', distance: 635 },
      { code: 'DDU', arrivalTime: '09:50', departureTime: '10:00', distance: 787 },
      { code: 'GAYA', arrivalTime: '12:35', departureTime: '12:40', distance: 992 },
      { code: 'BKSC', arrivalTime: '15:25', departureTime: '15:30', distance: 1143 },
      { code: 'TATA', arrivalTime: '19:55', departureTime: '20:05', distance: 1276 },
      { code: 'KGP', arrivalTime: '22:10', departureTime: '22:15', distance: 1410 },
      { code: 'BBS', arrivalTime: '03:35', departureTime: '03:40', distance: 1797 },
      { code: 'PURI', arrivalTime: '05:25', departureTime: null, distance: 1860 },
    ],
  },
  {
    trainNumber: '12801',
    trainName: 'New Delhi Purushottam Express',
    coachName: '3A',
    basePrice: 1980,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'PURI', arrivalTime: null, departureTime: '21:55', distance: 0 },
      { code: 'BBS', arrivalTime: '22:55', departureTime: '23:00', distance: 63 },
      { code: 'KGP', arrivalTime: '03:45', departureTime: '03:50', distance: 450 },
      { code: 'TATA', arrivalTime: '06:22', departureTime: '06:32', distance: 584 },
      { code: 'BKSC', arrivalTime: '09:40', departureTime: '09:45', distance: 717 },
      { code: 'GAYA', arrivalTime: '13:40', departureTime: '13:45', distance: 868 },
      { code: 'DDU', arrivalTime: '16:50', departureTime: '17:00', distance: 1073 },
      { code: 'PRYJ', arrivalTime: '19:20', departureTime: '19:25', distance: 1225 },
      { code: 'CNB', arrivalTime: '21:55', departureTime: '22:00', distance: 1420 },
      { code: 'NDLS', arrivalTime: '04:00', departureTime: null, distance: 1860 },
    ],
  },

  // ── CORRIDOR 10: Hisar/Delhi ⇄ Gorakhpur Gorakhdham Express (DAILY SERVICE) ──
  {
    trainNumber: '12556',
    trainName: 'Gorakhdham Express',
    coachName: 'SL',
    basePrice: 520,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'HSR', arrivalTime: null, departureTime: '17:00', distance: 0 },
      { code: 'DLI', arrivalTime: '21:10', departureTime: '21:25', distance: 180 },
      { code: 'NDLS', arrivalTime: '21:40', departureTime: '21:50', distance: 183 },
      { code: 'CNB', arrivalTime: '03:00', departureTime: '03:05', distance: 623 },
      { code: 'LKO', arrivalTime: '04:50', departureTime: '05:00', distance: 695 },
      { code: 'AY', arrivalTime: '07:25', departureTime: '07:30', distance: 823 },
      { code: 'GKP', arrivalTime: '09:45', departureTime: null, distance: 958 },
    ],
  },
  {
    trainNumber: '12555',
    trainName: 'Gorakhdham Express Return',
    coachName: 'SL',
    basePrice: 520,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'GKP', arrivalTime: null, departureTime: '16:35', distance: 0 },
      { code: 'AY', arrivalTime: '19:00', departureTime: '19:05', distance: 135 },
      { code: 'LKO', arrivalTime: '21:30', departureTime: '21:40', distance: 263 },
      { code: 'CNB', arrivalTime: '23:18', departureTime: '23:23', distance: 335 },
      { code: 'NDLS', arrivalTime: '05:15', departureTime: '05:30', distance: 775 },
      { code: 'DLI', arrivalTime: '05:40', departureTime: '05:55', distance: 778 },
      { code: 'HSR', arrivalTime: '10:00', departureTime: null, distance: 958 },
    ],
  },

  // ── CORRIDOR 11: Amritsar ⇄ Mumbai Central Golden Temple Mail (DAILY SERVICE) ──
  {
    trainNumber: '12904',
    trainName: 'Golden Temple Mail',
    coachName: 'SL',
    basePrice: 780,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'ASR', arrivalTime: null, departureTime: '18:55', distance: 0 },
      { code: 'JUC', arrivalTime: '20:00', departureTime: '20:05', distance: 79 },
      { code: 'LDH', arrivalTime: '21:05', departureTime: '21:15', distance: 136 },
      { code: 'UMB', arrivalTime: '22:50', departureTime: '22:55', distance: 249 },
      { code: 'NZM', arrivalTime: '03:45', departureTime: '04:00', distance: 448 },
      { code: 'MTJ', arrivalTime: '05:48', departureTime: '05:50', distance: 582 },
      { code: 'KOTA', arrivalTime: '10:10', departureTime: '10:20', distance: 906 },
      { code: 'RTM', arrivalTime: '14:25', departureTime: '14:35', distance: 1173 },
      { code: 'BRC', arrivalTime: '18:30', departureTime: '18:38', distance: 1434 },
      { code: 'ST', arrivalTime: '20:25', departureTime: '20:30', distance: 1563 },
      { code: 'MMCT', arrivalTime: '23:35', departureTime: null, distance: 1827 },
    ],
  },
  {
    trainNumber: '12903',
    trainName: 'Golden Temple Mail Up',
    coachName: 'SL',
    basePrice: 780,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'MMCT', arrivalTime: null, departureTime: '18:45', distance: 0 },
      { code: 'ST', arrivalTime: '22:00', departureTime: '22:05', distance: 264 },
      { code: 'BRC', arrivalTime: '23:45', departureTime: '23:53', distance: 393 },
      { code: 'RTM', arrivalTime: '04:00', departureTime: '04:10', distance: 654 },
      { code: 'KOTA', arrivalTime: '07:15', departureTime: '07:25', distance: 921 },
      { code: 'MTJ', arrivalTime: '11:40', departureTime: '11:42', distance: 1245 },
      { code: 'NZM', arrivalTime: '13:50', departureTime: '14:05', distance: 1379 },
      { code: 'UMB', arrivalTime: '19:00', departureTime: '19:05', distance: 1578 },
      { code: 'LDH', arrivalTime: '20:45', departureTime: '20:55', distance: 1691 },
      { code: 'JUC', arrivalTime: '21:55', departureTime: '22:00', distance: 1748 },
      { code: 'ASR', arrivalTime: '23:30', departureTime: null, distance: 1827 },
    ],
  },

  // ── CORRIDOR 12: Jammu ⇄ Ajmer Pooja Superfast Express (Tri-Weekly & Alternate Return) ──
  {
    trainNumber: '12414',
    trainName: 'Pooja Superfast Express',
    coachName: '3A',
    basePrice: 1450,
    seatsCount: 64,
    runsOn: 'Sun, Wed, Fri',
    runningDays: [0, 3, 5],
    stops: [
      { code: 'JAT', arrivalTime: null, departureTime: '18:15', distance: 0 },
      { code: 'JUC', arrivalTime: '21:55', departureTime: '22:00', distance: 212 },
      { code: 'LDH', arrivalTime: '22:55', departureTime: '23:05', distance: 269 },
      { code: 'DLI', arrivalTime: '03:50', departureTime: '04:15', distance: 577 },
      { code: 'AWR', arrivalTime: '06:55', departureTime: '06:58', distance: 728 },
      { code: 'JP', arrivalTime: '09:35', departureTime: '09:45', distance: 879 },
      { code: 'AII', arrivalTime: '12:10', departureTime: null, distance: 1014 },
    ],
  },
  {
    trainNumber: '12413',
    trainName: 'Pooja Superfast Express Return',
    coachName: '3A',
    basePrice: 1450,
    seatsCount: 64,
    runsOn: 'Mon, Thu, Sat',
    runningDays: [1, 4, 6],
    stops: [
      { code: 'AII', arrivalTime: null, departureTime: '14:15', distance: 0 },
      { code: 'JP', arrivalTime: '16:05', departureTime: '16:15', distance: 135 },
      { code: 'AWR', arrivalTime: '18:20', departureTime: '18:23', distance: 286 },
      { code: 'DLI', arrivalTime: '21:40', departureTime: '22:05', distance: 437 },
      { code: 'LDH', arrivalTime: '02:25', departureTime: '02:35', distance: 745 },
      { code: 'JUC', arrivalTime: '03:30', departureTime: '03:35', distance: 802 },
      { code: 'JAT', arrivalTime: '07:30', departureTime: null, distance: 1014 },
    ],
  },

  // ── CORRIDOR 13: Delhi ⇄ Kerala Express (DAILY SERVICE) ──
  {
    trainNumber: '12626',
    trainName: 'Kerala Express',
    coachName: 'SL',
    basePrice: 895,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '20:10', distance: 0 },
      { code: 'AGC', arrivalTime: '22:20', departureTime: '22:25', distance: 195 },
      { code: 'GWL', arrivalTime: '23:55', departureTime: '23:58', distance: 313 },
      { code: 'BPL', arrivalTime: '05:20', departureTime: '05:25', distance: 707 },
      { code: 'NGP', arrivalTime: '11:45', departureTime: '11:50', distance: 1097 },
      { code: 'BZA', arrivalTime: '21:10', departureTime: '21:20', distance: 1740 },
      { code: 'MAS', arrivalTime: '04:15', departureTime: '04:40', distance: 2171 },
      { code: 'TCR', arrivalTime: '15:17', departureTime: '15:20', distance: 2865 },
      { code: 'ERS', arrivalTime: '16:55', departureTime: '17:00', distance: 2939 },
      { code: 'TVC', arrivalTime: '21:50', departureTime: null, distance: 3026 },
    ],
  },
  {
    trainNumber: '12625',
    trainName: 'Kerala Express Return',
    coachName: 'SL',
    basePrice: 895,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'TVC', arrivalTime: null, departureTime: '12:30', distance: 0 },
      { code: 'ERS', arrivalTime: '16:25', departureTime: '16:30', distance: 87 },
      { code: 'TCR', arrivalTime: '17:40', departureTime: '17:43', distance: 161 },
      { code: 'MAS', arrivalTime: '05:00', departureTime: '05:25', distance: 855 },
      { code: 'BZA', arrivalTime: '11:40', departureTime: '11:50', distance: 1286 },
      { code: 'NGP', arrivalTime: '21:15', departureTime: '21:20', distance: 1929 },
      { code: 'BPL', arrivalTime: '03:45', departureTime: '03:50', distance: 2319 },
      { code: 'GWL', arrivalTime: '08:50', departureTime: '08:53', distance: 2713 },
      { code: 'AGC', arrivalTime: '10:15', departureTime: '10:20', distance: 2831 },
      { code: 'NDLS', arrivalTime: '13:15', departureTime: null, distance: 3026 },
    ],
  },

  // ── CORRIDOR 14: Delhi ⇄ Hyderabad Telangana Express (Alternating Days) ──
  {
    trainNumber: '12724',
    trainName: 'Telangana Express',
    coachName: '3A',
    basePrice: 2150,
    seatsCount: 64,
    runsOn: 'Sun, Tue, Thu, Sat',
    runningDays: [0, 2, 4, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:00', distance: 0 },
      { code: 'AGC', arrivalTime: '18:05', departureTime: '18:07', distance: 195 },
      { code: 'GWL', arrivalTime: '19:58', departureTime: '20:00', distance: 313 },
      { code: 'BPL', arrivalTime: '01:20', departureTime: '01:30', distance: 707 },
      { code: 'NGP', arrivalTime: '07:10', departureTime: '07:15', distance: 1097 },
      { code: 'WL', arrivalTime: '13:40', departureTime: '13:42', distance: 1547 },
      { code: 'SC', arrivalTime: '16:00', departureTime: '16:05', distance: 1689 },
      { code: 'HYB', arrivalTime: '17:10', departureTime: null, distance: 1700 },
    ],
  },
  {
    trainNumber: '12723',
    trainName: 'Telangana Express Return',
    coachName: '3A',
    basePrice: 2150,
    seatsCount: 64,
    runsOn: 'Mon, Wed, Fri',
    runningDays: [1, 3, 5],
    stops: [
      { code: 'HYB', arrivalTime: null, departureTime: '06:00', distance: 0 },
      { code: 'SC', arrivalTime: '06:20', departureTime: '06:25', distance: 11 },
      { code: 'WL', arrivalTime: '08:15', departureTime: '08:17', distance: 153 },
      { code: 'NGP', arrivalTime: '15:20', departureTime: '15:25', distance: 603 },
      { code: 'BPL', arrivalTime: '21:50', departureTime: '22:00', distance: 993 },
      { code: 'GWL', arrivalTime: '03:25', departureTime: '03:27', distance: 1387 },
      { code: 'AGC', arrivalTime: '05:05', departureTime: '05:07', distance: 1505 },
      { code: 'NDLS', arrivalTime: '07:40', departureTime: null, distance: 1700 },
    ],
  },

  // ── CORRIDOR 15: Delhi ⇄ Northeast Dibrugarh Rajdhani Express (DAILY SERVICE) ──
  {
    trainNumber: '12424',
    trainName: 'Dibrugarh Rajdhani Express',
    coachName: '3A',
    basePrice: 2890,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:20', distance: 0 },
      { code: 'CNB', arrivalTime: '21:02', departureTime: '21:07', distance: 440 },
      { code: 'PRYJ', arrivalTime: '23:08', departureTime: '23:10', distance: 635 },
      { code: 'DDU', arrivalTime: '01:23', departureTime: '01:33', distance: 787 },
      { code: 'PNBE', arrivalTime: '04:15', departureTime: '04:25', distance: 998 },
      { code: 'KIR', arrivalTime: '09:45', departureTime: '09:55', distance: 1287 },
      { code: 'NJP', arrivalTime: '13:05', departureTime: '13:15', distance: 1485 },
      { code: 'GHY', arrivalTime: '19:30', departureTime: '19:45', distance: 1914 },
      { code: 'DBRG', arrivalTime: '07:00', departureTime: null, distance: 2434 },
    ],
  },
  {
    trainNumber: '12423',
    trainName: 'Dibrugarh Rajdhani Express Return',
    coachName: '3A',
    basePrice: 2890,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'DBRG', arrivalTime: null, departureTime: '20:55', distance: 0 },
      { code: 'GHY', arrivalTime: '06:30', departureTime: '06:45', distance: 520 },
      { code: 'NJP', arrivalTime: '13:15', departureTime: '13:25', distance: 949 },
      { code: 'KIR', arrivalTime: '16:20', departureTime: '16:30', distance: 1147 },
      { code: 'PNBE', arrivalTime: '21:40', departureTime: '21:50', distance: 1436 },
      { code: 'DDU', arrivalTime: '01:10', departureTime: '01:20', distance: 1647 },
      { code: 'PRYJ', arrivalTime: '03:18', departureTime: '03:20', distance: 1799 },
      { code: 'CNB', arrivalTime: '05:30', departureTime: '05:35', distance: 1994 },
      { code: 'NDLS', arrivalTime: '10:30', departureTime: null, distance: 2434 },
    ],
  },
];

// ─── 3. SEEDING EXECUTION ───────────────────────────────────────────────────

async function seedRealIndianRailways() {
  console.log('🚀 Starting Realistic Indian Railways Database Seeding...');
  console.log('📅 Modeling: Specified operation days (Sun/Wed/Fri) with alternate-day return runs & daily passenger trains.\n');

  // Initialize Kafka producer
  let kafkaAvailable = false;
  try {
    await adminProducer.initialize();
    kafkaAvailable = true;
    console.log('✅ Kafka producer connected for cross-service publishing');
  } catch (err) {
    console.warn('⚠️ Kafka producer init warning (will proceed with DB seeding):', err.message);
  }

  // 1. Seed Stations
  console.log(`\n📍 Seeding ${STATIONS.length} Real Stations across India...`);
  const stationMap = new Map(); // code -> stationRecord

  for (const s of STATIONS) {
    try {
      const station = await prisma.station.upsert({
        where: { code: s.code },
        update: { name: s.name, city: s.city, state: s.state },
        create: { code: s.code, name: s.name, city: s.city, state: s.state },
      });
      stationMap.set(s.code, station);

      if (kafkaAvailable) {
        try {
          await adminProducer.publishStationCreated(station);
        } catch (_) {}
      }
    } catch (err) {
      console.error(`Error upserting station ${s.code}:`, err.message);
    }
  }
  console.log(`✅ ${stationMap.size} Stations upserted and mapped.`);

  // 2. Seed Trains, Routes, and Schedules
  console.log(`\n🚆 Seeding ${TRAINS.length} Directional Trains & Realistic Operation Schedules...`);

  const esUrl = process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200';
  const esAvailable = await checkElasticsearch(esUrl);
  if (esAvailable) {
    console.log(`✅ Direct Elasticsearch sync active at ${esUrl}`);
  }

  let totalSchedules = 0;

  for (const t of TRAINS) {
    try {
      // Create / Update Train
      const train = await prisma.train.upsert({
        where: { trainNumber: t.trainNumber },
        update: {
          trainName: t.trainName,
          coachName: t.coachName,
          totalSeats: t.seatsCount,
          runsOn: t.runsOn,
          runningDays: t.runningDays,
          trainType: t.trainType || 'EXPRESS',
        },
        create: {
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
      const existingSeats = await prisma.seat.count({ where: { trainId: train.id } });
      let seats = [];
      if (existingSeats === 0) {
        const seatsData = generateSeats(t.basePrice, t.seatsCount);
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
      } else {
        seats = await prisma.seat.findMany({
          where: { trainId: train.id },
          orderBy: { seatNumber: 'asc' },
        });
      }

      // Check / Create Route
      let route = await prisma.route.findUnique({
        where: { trainId: train.id },
      });

      if (!route) {
        route = await prisma.route.create({
          data: { trainId: train.id },
        });
      }

      // Recreate Route Stations
      await prisma.routeStation.deleteMany({
        where: { routeId: route.id },
      });

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

      // Publish Route Created to Kafka
      if (kafkaAvailable) {
        try {
          await adminProducer.publishRouteCreated({
            id: route.id,
            train: {
              ...train,
              runsOn: t.runsOn,
              runningDays: t.runningDays,
              seats,
            },
            routeStations: createdRouteStations,
          });
        } catch (_) {}
      }

      // ── Clean & Re-provision Schedules strictly matching runningDays ──
      // Wipe previous schedules for this train so non-running days are not retained
      await prisma.schedule.deleteMany({
        where: { trainId: train.id },
      });

      const today = new Date();
      let trainSchedulesCount = 0;
      const schedulesForEs = [];

      for (let dayOffset = 0; dayOffset < 35; dayOffset++) {
        const schedDate = new Date(today);
        schedDate.setDate(today.getDate() + dayOffset);
        schedDate.setHours(0, 0, 0, 0);

        const dayOfWeek = schedDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

        // STRICT SCHEDULE CHECK: Only create schedule if train runs on this day of the week!
        if (!t.runningDays.includes(dayOfWeek)) {
          continue;
        }

        const dateStr = schedDate.toISOString().split('T')[0];

        const schedule = await prisma.schedule.create({
          data: {
            trainId: train.id,
            departureDate: schedDate,
            status: 'ACTIVE',
          },
        });
        trainSchedulesCount++;
        totalSchedules++;

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

      // Direct Elasticsearch Indexing (if ES is reachable)
      if (esAvailable) {
        await directIndexTrainToEs(esUrl, train, t, createdRouteStations, schedulesForEs);
      }

      console.log(`  ✓ Train #${t.trainNumber} (${t.trainName})`);
      console.log(`    ↳ Route: ${t.stops[0].code} ➔ ${t.stops[t.stops.length - 1].code} (${createdRouteStations.length} stops)`);
      console.log(`    ↳ Runs: ${t.runsOn} | Provisioned ${trainSchedulesCount} departures for next 35 days.`);

    } catch (err) {
      console.error(`Error processing train ${t.trainNumber}:`, err.message);
    }
  }

  // Also sync all stations directly to Elasticsearch if available
  if (esAvailable) {
    console.log('\n🔍 Syncing all stations directly to Elasticsearch for instant autocomplete...');
    await directIndexStationsToEs(esUrl, Array.from(stationMap.values()));
  }

  console.log('\n🎉 ALL REALISTIC INDIAN RAILWAY DATA SUCCESSFULLY SEEDED!');
  console.log(`✅ Stations: ${STATIONS.length}`);
  console.log(`✅ Trains: ${TRAINS.length} Directional Expresses & Return Pairs`);
  console.log(`✅ Total Schedules Provisioned: ${totalSchedules}`);
  console.log('✅ Specific Day-of-Week Rules strictly applied (Sun/Wed/Fri, alternate returns, daily passengers).');
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
  // Refresh indices
  try {
    await fetch(`${esUrl}/stations/_refresh`, { method: 'POST' });
    await fetch(`${esUrl}/trains/_refresh`, { method: 'POST' });
  } catch (_) {}
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
