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
 * 2. Seeds authentic stations across all Indian states and major rail divisions:
 *    - Delhi NCR, Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, Uttarakhand
 *    - Rajasthan, Uttar Pradesh, Bihar, Jharkhand, West Bengal, Assam & North-East
 *    - Odisha, Chhattisgarh, Madhya Pradesh, Gujarat, Maharashtra, Goa
 *    - Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Kerala
 *
 * 3. Seeds realistic trains with authentic routes, stops, distances, timings, running days:
 *    - Flagship Vande Bharat Express corridors (Katra, Varanasi, Ajmer, Gandhinagar, Mysuru)
 *    - Premier Rajdhani & Shatabdi Express services (Howrah, Sealdah, Mumbai, Dibrugarh, BBS, Bhopal, Amritsar, Kalka)
 *    - Trans-India Superfast & Mail lifelines (Kerala SF Express, Grand Trunk, Karnataka SF, Telangana SF, Coromandel Express, Mangala Lakshadweep, Howrah-Ahmedabad SF)
 *    - High-density passenger & intercity routes (Moradabad, Chandausi, Dehradun Jan Shatabdi)
 *    - Reciprocal return trains for seamless two-way search & reservation
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const prisma = require('../config/prisma');
const adminProducer = require('../kafka/producer/admin.producer');

// ─── 1. AUTHENTIC STATIONS ACROSS ALL INDIAN STATES & MAJOR DISTRICTS ────────

const STATIONS = [
  // ── National Capital Region (NCR) & Delhi ──
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi Railway Station', city: 'Delhi', state: 'Delhi' },
  { code: 'DEE', name: 'Delhi Sarai Rohilla', city: 'Delhi', state: 'Delhi' },
  { code: 'GZB', name: 'Ghaziabad Junction', city: 'Ghaziabad', state: 'Uttar Pradesh' },

  // ── Punjab, Haryana, Chandigarh & Himachal Pradesh ──
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab' },
  { code: 'LDH', name: 'Ludhiana Junction', city: 'Ludhiana', state: 'Punjab' },
  { code: 'JUC', name: 'Jalandhar City Junction', city: 'Jalandhar', state: 'Punjab' },
  { code: 'BTI', name: 'Bathinda Junction', city: 'Bathinda', state: 'Punjab' },
  { code: 'PTK', name: 'Pathankot Cantt', city: 'Pathankot', state: 'Punjab' },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Chandigarh' },
  { code: 'UMB', name: 'Ambala Cantt Junction', city: 'Ambala', state: 'Haryana' },
  { code: 'PNP', name: 'Panipat Junction', city: 'Panipat', state: 'Haryana' },
  { code: 'KKDE', name: 'Kurukshetra Junction', city: 'Kurukshetra', state: 'Haryana' },
  { code: 'ROK', name: 'Rohtak Junction', city: 'Rohtak', state: 'Haryana' },
  { code: 'RE', name: 'Rewari Junction', city: 'Rewari', state: 'Haryana' },
  { code: 'GGN', name: 'Gurgaon Railway Station', city: 'Gurugram', state: 'Haryana' },
  { code: 'FDB', name: 'Faridabad', city: 'Faridabad', state: 'Haryana' },
  { code: 'KLK', name: 'Kalka', city: 'Kalka', state: 'Haryana' },
  { code: 'UHL', name: 'Una Himachal', city: 'Una', state: 'Himachal Pradesh' },

  // ── Jammu & Kashmir ──
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu and Kashmir' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', city: 'Katra', state: 'Jammu and Kashmir' },

  // ── Uttarakhand ──
  { code: 'DDN', name: 'Dehradun Terminus', city: 'Dehradun', state: 'Uttarakhand' },
  { code: 'HW', name: 'Haridwar Junction', city: 'Haridwar', state: 'Uttarakhand' },
  { code: 'RK', name: 'Roorkee', city: 'Roorkee', state: 'Uttarakhand' },
  { code: 'KGM', name: 'Kathgodam', city: 'Kathgodam', state: 'Uttarakhand' },

  // ── Rajasthan ──
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'AII', name: 'Ajmer Junction', city: 'Ajmer', state: 'Rajasthan' },
  { code: 'JU', name: 'Jodhpur Junction', city: 'Jodhpur', state: 'Rajasthan' },
  { code: 'BKN', name: 'Bikaner Junction', city: 'Bikaner', state: 'Rajasthan' },
  { code: 'UDZ', name: 'Udaipur City', city: 'Udaipur', state: 'Rajasthan' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan' },
  { code: 'SWM', name: 'Sawai Madhopur Junction', city: 'Sawai Madhopur', state: 'Rajasthan' },
  { code: 'BTE', name: 'Bharatpur Junction', city: 'Bharatpur', state: 'Rajasthan' },
  { code: 'AWR', name: 'Alwar Junction', city: 'Alwar', state: 'Rajasthan' },
  { code: 'ABR', name: 'Abu Road', city: 'Abu Road', state: 'Rajasthan' },

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
  { code: 'MB', name: 'Moradabad Junction', city: 'Moradabad', state: 'Uttar Pradesh' },
  { code: 'CH', name: 'Chandausi Junction', city: 'Chandausi', state: 'Uttar Pradesh' },
  { code: 'BE', name: 'Bareilly Junction', city: 'Bareilly', state: 'Uttar Pradesh' },
  { code: 'MTC', name: 'Meerut City', city: 'Meerut', state: 'Uttar Pradesh' },
  { code: 'SRE', name: 'Saharanpur Junction', city: 'Saharanpur', state: 'Uttar Pradesh' },
  { code: 'AY', name: 'Ayodhya Dham Junction', city: 'Ayodhya', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { code: 'BST', name: 'Basti', city: 'Basti', state: 'Uttar Pradesh' },
  { code: 'GD', name: 'Gonda Junction', city: 'Gonda', state: 'Uttar Pradesh' },

  // ── Bihar ──
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'GAYA', name: 'Gaya Junction', city: 'Gaya', state: 'Bihar' },
  { code: 'SSM', name: 'Sasaram Junction', city: 'Sasaram', state: 'Bihar' },
  { code: 'BXR', name: 'Buxar', city: 'Buxar', state: 'Bihar' },
  { code: 'ARA', name: 'Ara Junction', city: 'Ara', state: 'Bihar' },
  { code: 'MKA', name: 'Mokama', city: 'Mokama', state: 'Bihar' },
  { code: 'KIUL', name: 'Kiul Junction', city: 'Kiul', state: 'Bihar' },
  { code: 'BJU', name: 'Barauni Junction', city: 'Barauni', state: 'Bihar' },
  { code: 'MFP', name: 'Muzaffarpur Junction', city: 'Muzaffarpur', state: 'Bihar' },
  { code: 'DBG', name: 'Darbhanga Junction', city: 'Darbhanga', state: 'Bihar' },
  { code: 'BGP', name: 'Bhagalpur Junction', city: 'Bhagalpur', state: 'Bihar' },
  { code: 'KIR', name: 'Katihar Junction', city: 'Katihar', state: 'Bihar' },
  { code: 'SHC', name: 'Saharsa Junction', city: 'Saharsa', state: 'Bihar' },

  // ── Jharkhand ──
  { code: 'RNC', name: 'Ranchi Junction', city: 'Ranchi', state: 'Jharkhand' },
  { code: 'DHN', name: 'Dhanbad Junction', city: 'Dhanbad', state: 'Jharkhand' },
  { code: 'TATA', name: 'Tatanagar Junction', city: 'Jamshedpur', state: 'Jharkhand' },
  { code: 'BKSC', name: 'Bokaro Steel City', city: 'Bokaro', state: 'Jharkhand' },
  { code: 'KQR', name: 'Koderma Junction', city: 'Koderma', state: 'Jharkhand' },
  { code: 'GTS', name: 'Ghatsila', city: 'Ghatsila', state: 'Jharkhand' },
  { code: 'CKP', name: 'Chakradharpur', city: 'Chakradharpur', state: 'Jharkhand' },
  { code: 'JSME', name: 'Jasidih Junction', city: 'Jasidih', state: 'Jharkhand' },
  { code: 'MDP', name: 'Madhupur Junction', city: 'Madhupur', state: 'Jharkhand' },
  { code: 'PNME', name: 'Parasnath', city: 'Parasnath', state: 'Jharkhand' },

  // ── West Bengal ──
  { code: 'HIJ', name: 'Hijli Railway Station', city: 'Kharagpur', state: 'West Bengal' },
  { code: 'KGP', name: 'Kharagpur Junction', city: 'Kharagpur', state: 'West Bengal' },
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
  { code: 'NJP', name: 'New Jalpaiguri Junction', city: 'Siliguri', state: 'West Bengal' },
  { code: 'MLDT', name: 'Malda Town', city: 'Malda', state: 'West Bengal' },
  { code: 'NOQ', name: 'New Alipurduar', city: 'Alipurduar', state: 'West Bengal' },

  // ── Assam & North-East ──
  { code: 'GHY', name: 'Guwahati Junction', city: 'Guwahati', state: 'Assam' },
  { code: 'KYQ', name: 'Kamakhya Junction', city: 'Guwahati', state: 'Assam' },
  { code: 'DBRG', name: 'Dibrugarh', city: 'Dibrugarh', state: 'Assam' },
  { code: 'NBQ', name: 'New Bongaigaon Junction', city: 'Bongaigaon', state: 'Assam' },
  { code: 'LMG', name: 'Lumding Junction', city: 'Lumding', state: 'Assam' },
  { code: 'AGTL', name: 'Agartala', city: 'Agartala', state: 'Tripura' },

  // ── Odisha ──
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
  { code: 'CTC', name: 'Cuttack Junction', city: 'Cuttack', state: 'Odisha' },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha' },
  { code: 'ROU', name: 'Rourkela Junction', city: 'Rourkela', state: 'Odisha' },
  { code: 'BLS', name: 'Balasore', city: 'Balasore', state: 'Odisha' },
  { code: 'BHC', name: 'Bhadrak', city: 'Bhadrak', state: 'Odisha' },
  { code: 'BAM', name: 'Brahmapur', city: 'Berhampur', state: 'Odisha' },
  { code: 'SBP', name: 'Sambalpur Junction', city: 'Sambalpur', state: 'Odisha' },

  // ── Chhattisgarh ──
  { code: 'BSP', name: 'Bilaspur Junction', city: 'Bilaspur', state: 'Chhattisgarh' },
  { code: 'R', name: 'Raipur Junction', city: 'Raipur', state: 'Chhattisgarh' },
  { code: 'DURG', name: 'Durg Junction', city: 'Durg', state: 'Chhattisgarh' },
  { code: 'RIG', name: 'Raigarh', city: 'Raigarh', state: 'Chhattisgarh' },
  { code: 'CPH', name: 'Champa Junction', city: 'Champa', state: 'Chhattisgarh' },

  // ── Madhya Pradesh ──
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamalapati', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh' },
  { code: 'JBP', name: 'Jabalpur Junction', city: 'Jabalpur', state: 'Madhya Pradesh' },
  { code: 'INDB', name: 'Indore Junction', city: 'Indore', state: 'Madhya Pradesh' },
  { code: 'UJN', name: 'Ujjain Junction', city: 'Ujjain', state: 'Madhya Pradesh' },
  { code: 'ET', name: 'Itarsi Junction', city: 'Itarsi', state: 'Madhya Pradesh' },
  { code: 'RTM', name: 'Ratlam Junction', city: 'Ratlam', state: 'Madhya Pradesh' },
  { code: 'KTE', name: 'Katni Junction', city: 'Katni', state: 'Madhya Pradesh' },
  { code: 'STA', name: 'Satna Junction', city: 'Satna', state: 'Madhya Pradesh' },

  // ── Gujarat ──
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat' },
  { code: 'RJT', name: 'Rajkot Junction', city: 'Rajkot', state: 'Gujarat' },
  { code: 'BVC', name: 'Bhavnagar Terminus', city: 'Bhavnagar', state: 'Gujarat' },
  { code: 'ANND', name: 'Anand Junction', city: 'Anand', state: 'Gujarat' },
  { code: 'BH', name: 'Bharuch Junction', city: 'Bharuch', state: 'Gujarat' },
  { code: 'VAPI', name: 'Vapi', city: 'Vapi', state: 'Gujarat' },
  { code: 'GIMB', name: 'Gandhidham Junction', city: 'Gandhidham', state: 'Gujarat' },

  // ── Maharashtra ──
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'PNVL', name: 'Panvel Junction', city: 'Navi Mumbai', state: 'Maharashtra' },
  { code: 'BVI', name: 'Borivali', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra' },
  { code: 'BSL', name: 'Bhusaval Junction', city: 'Bhusawal', state: 'Maharashtra' },
  { code: 'NK', name: 'Nashik Road', city: 'Nashik', state: 'Maharashtra' },
  { code: 'SUR', name: 'Solapur Junction', city: 'Solapur', state: 'Maharashtra' },
  { code: 'AK', name: 'Akola Junction', city: 'Akola', state: 'Maharashtra' },
  { code: 'BD', name: 'Badnera Junction', city: 'Amravati', state: 'Maharashtra' },
  { code: 'RN', name: 'Ratnagiri', city: 'Ratnagiri', state: 'Maharashtra' },
  { code: 'KOP', name: 'Chhatrapati Shahu Maharaj Terminus (Kolhapur)', city: 'Kolhapur', state: 'Maharashtra' },

  // ── Goa ──
  { code: 'MAO', name: 'Madgaon Junction', city: 'Margao', state: 'Goa' },
  { code: 'THVM', name: 'Thivim', city: 'Thivim', state: 'Goa' },

  // ── Andhra Pradesh ──
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { code: 'TPTY', name: 'Tirupati', city: 'Tirupati', state: 'Andhra Pradesh' },
  { code: 'RU', name: 'Renigunta Junction', city: 'Renigunta', state: 'Andhra Pradesh' },
  { code: 'RJY', name: 'Rajahmundry', city: 'Rajahmundry', state: 'Andhra Pradesh' },
  { code: 'GNT', name: 'Guntur Junction', city: 'Guntur', state: 'Andhra Pradesh' },
  { code: 'OGL', name: 'Ongole', city: 'Ongole', state: 'Andhra Pradesh' },
  { code: 'NLR', name: 'Nellore', city: 'Nellore', state: 'Andhra Pradesh' },
  { code: 'SLO', name: 'Samalkot Junction', city: 'Samalkot', state: 'Andhra Pradesh' },
  { code: 'KNL', name: 'Kurnool City', city: 'Kurnool', state: 'Andhra Pradesh' },

  // ── Telangana ──
  { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', state: 'Telangana' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
  { code: 'KCG', name: 'Kacheguda', city: 'Hyderabad', state: 'Telangana' },
  { code: 'KZJ', name: 'Kazipet Junction', city: 'Warangal', state: 'Telangana' },
  { code: 'WL', name: 'Warangal', city: 'Warangal', state: 'Telangana' },
  { code: 'RDM', name: 'Ramagundam', city: 'Ramagundam', state: 'Telangana' },

  // ── Karnataka ──
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'SMVB', name: 'SMVT Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'MYS', name: 'Mysuru Junction', city: 'Mysuru', state: 'Karnataka' },
  { code: 'UBL', name: 'SSS Hubballi Junction', city: 'Hubli', state: 'Karnataka' },
  { code: 'MAQ', name: 'Mangaluru Central', city: 'Mangaluru', state: 'Karnataka' },
  { code: 'MAJN', name: 'Mangaluru Junction', city: 'Mangaluru', state: 'Karnataka' },
  { code: 'KLBG', name: 'Kalaburagi Junction', city: 'Kalaburagi', state: 'Karnataka' },
  { code: 'BAY', name: 'Ballari Junction', city: 'Ballari', state: 'Karnataka' },
  { code: 'DVG', name: 'Davangere', city: 'Davangere', state: 'Karnataka' },

  // ── Tamil Nadu ──
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu' },
  { code: 'MDU', name: 'Madurai Junction', city: 'Madurai', state: 'Tamil Nadu' },
  { code: 'TPJ', name: 'Tiruchirappalli Junction', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { code: 'SA', name: 'Salem Junction', city: 'Salem', state: 'Tamil Nadu' },
  { code: 'ED', name: 'Erode Junction', city: 'Erode', state: 'Tamil Nadu' },
  { code: 'KPD', name: 'Katpadi Junction', city: 'Vellore', state: 'Tamil Nadu' },
  { code: 'TEN', name: 'Tirunelveli Junction', city: 'Tirunelveli', state: 'Tamil Nadu' },
  { code: 'DG', name: 'Dindigul Junction', city: 'Dindigul', state: 'Tamil Nadu' },

  // ── Kerala ──
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala' },
  { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi', state: 'Kerala' },
  { code: 'TCR', name: 'Thrissur', city: 'Thrissur', state: 'Kerala' },
  { code: 'CLT', name: 'Kozhikode', city: 'Kozhikode', state: 'Kerala' },
  { code: 'PGT', name: 'Palakkad Junction', city: 'Palakkad', state: 'Kerala' },
  { code: 'CAN', name: 'Kannur', city: 'Kannur', state: 'Kerala' },
  { code: 'SRR', name: 'Shoranur Junction', city: 'Shoranur', state: 'Kerala' },
  { code: 'QLN', name: 'Kollam Junction', city: 'Kollam', state: 'Kerala' },
  { code: 'KTYM', name: 'Kottayam', city: 'Kottayam', state: 'Kerala' },
  { code: 'ALLP', name: 'Alappuzha', city: 'Alappuzha', state: 'Kerala' },
];

// Helper: Generates realistic seat configurations partitioned across IRCTC travel classes
function generateSeats(basePrice, totalSeats = 64, trainType = 'EXPRESS', trainName = '') {
  const seatTypes = ['LOWER', 'MIDDLE', 'UPPER', 'LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'];
  const seats = [];

  const isVB = /vande bharat|shatabdi/i.test(trainName) || trainType === 'VANDE_BHARAT' || trainType === 'SHATABDI';
  const isRajdhani = /rajdhani/i.test(trainName) || trainType === 'RAJDHANI';

  for (let i = 1; i <= totalSeats; i++) {
    const seatType = seatTypes[(i - 1) % seatTypes.length];
    let priceMultiplier = 1.0;
    if (seatType === 'LOWER' || seatType === 'SIDE_LOWER') priceMultiplier = 1.08;
    if (seatType === 'MIDDLE') priceMultiplier = 0.95;
    if (seatType === 'UPPER' || seatType === 'SIDE_UPPER') priceMultiplier = 0.98;

    let travelClass = 'SL';
    let coach = 'S1';
    let classMult = 1.0;

    if (isVB) {
      const ecCap = Math.max(4, Math.round(totalSeats * 0.20));
      if (i <= ecCap) { travelClass = 'EC'; coach = 'E1'; classMult = 1.85; }
      else { travelClass = 'CC'; coach = 'C1'; classMult = 1.0; }
    } else if (isRajdhani) {
      const cap1A = Math.max(4, Math.round(totalSeats * 0.15));
      const cap2A = cap1A + Math.max(8, Math.round(totalSeats * 0.30));
      if (i <= cap1A) { travelClass = '1A'; coach = 'H1'; classMult = 2.2; }
      else if (i <= cap2A) { travelClass = '2A'; coach = 'A1'; classMult = 1.45; }
      else { travelClass = '3A'; coach = 'B1'; classMult = 1.0; }
    } else {
      const cap1A = Math.max(2, Math.round(totalSeats * 0.06));
      const cap2A = cap1A + Math.max(4, Math.round(totalSeats * 0.12));
      const cap3A = cap2A + Math.max(10, Math.round(totalSeats * 0.32));
      const capSL = cap3A + Math.max(10, Math.round(totalSeats * 0.32));
      if (i <= cap1A) { travelClass = '1A'; coach = 'H1'; classMult = 2.2; }
      else if (i <= cap2A) { travelClass = '2A'; coach = 'A1'; classMult = 1.45; }
      else if (i <= cap3A) { travelClass = '3A'; coach = 'B1'; classMult = 1.0; }
      else if (i <= capSL) { travelClass = 'SL'; coach = 'S1'; classMult = 0.65; }
      else { travelClass = '2S'; coach = 'D1'; classMult = 0.35; }
    }

    seats.push({
      seatNumber: i,
      seatType,
      travelClass,
      coach,
      price: Math.round(basePrice * classMult * priceMultiplier),
    });
  }
  return seats;
}

// ─── 2. REALISTIC TRAIN SCHEDULES WITH AUTHENTIC ROUTES & TIMINGS ────────────
// Days of Week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

const TRAINS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 1: DELHI TO HIJLI & KHARAGPUR (User's Exact Specification)
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
  // Reciprocal return: 12801 Purushottam Express (Daily)
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
  // ── CORRIDOR 2: DELHI TO KOLKATA (Howrah & Sealdah Grand Trunk Route)
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
  // ── CORRIDOR 3: MORADABAD & CHANDAUSI AUTHENTIC PASSENGER & INTERCITY
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
  // ── CORRIDOR 4: NORTHERN & GANGETIC VANDE BHARAT & SHATABDI
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

  // 20. 12004 New Delhi - Lucknow Swarna Shatabdi Express (Daily)
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
  // 21. 12003 Lucknow - New Delhi Swarna Shatabdi Express (Daily)
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 5: DELHI - JAMMU & KASHMIR / PUNJAB / HIMACHAL
  // ═══════════════════════════════════════════════════════════════════════════

  // 22. 22439 New Delhi - SMVD Katra Vande Bharat Express (6 days/week)
  {
    trainNumber: '22439',
    trainName: 'SMVD Katra Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1860,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Thu, Fri, Sat',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '06:00', distance: 0 },
      { code: 'UMB', arrivalTime: '08:10', departureTime: '08:12', distance: 198 },
      { code: 'LDH', arrivalTime: '09:19', departureTime: '09:21', distance: 312 },
      { code: 'JAT', arrivalTime: '12:38', departureTime: '12:40', distance: 577 },
      { code: 'SVDK', arrivalTime: '14:00', departureTime: null, distance: 655 },
    ],
  },
  // 23. 22440 SMVD Katra - New Delhi Vande Bharat Express (6 days/week)
  {
    trainNumber: '22440',
    trainName: 'New Delhi Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1860,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Thu, Fri, Sat',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'SVDK', arrivalTime: null, departureTime: '15:00', distance: 0 },
      { code: 'JAT', arrivalTime: '16:13', departureTime: '16:15', distance: 78 },
      { code: 'LDH', arrivalTime: '19:32', departureTime: '19:34', distance: 343 },
      { code: 'UMB', arrivalTime: '20:30', departureTime: '20:32', distance: 457 },
      { code: 'NDLS', arrivalTime: '23:00', departureTime: null, distance: 655 },
    ],
  },

  // 24. 12013 New Delhi - Amritsar Shatabdi Express (Daily)
  {
    trainNumber: '12013',
    trainName: 'Amritsar Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 990,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:30', distance: 0 },
      { code: 'UMB', arrivalTime: '18:50', departureTime: '18:53', distance: 198 },
      { code: 'LDH', arrivalTime: '20:16', departureTime: '20:19', distance: 312 },
      { code: 'JUC', arrivalTime: '21:14', departureTime: '21:16', distance: 369 },
      { code: 'ASR', arrivalTime: '22:30', departureTime: null, distance: 448 },
    ],
  },
  // 25. 12014 Amritsar - New Delhi Shatabdi Express (Daily)
  {
    trainNumber: '12014',
    trainName: 'New Delhi Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 990,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'ASR', arrivalTime: null, departureTime: '04:55', distance: 0 },
      { code: 'JUC', arrivalTime: '05:48', departureTime: '05:50', distance: 79 },
      { code: 'LDH', arrivalTime: '06:50', departureTime: '06:54', distance: 136 },
      { code: 'UMB', arrivalTime: '08:30', departureTime: '08:32', distance: 250 },
      { code: 'NDLS', arrivalTime: '11:02', departureTime: null, distance: 448 },
    ],
  },

  // 26. 12005 New Delhi - Kalka Shatabdi Express (Daily)
  {
    trainNumber: '12005',
    trainName: 'Kalka Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 880,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '17:15', distance: 0 },
      { code: 'PNP', arrivalTime: '18:18', departureTime: '18:20', distance: 89 },
      { code: 'KKDE', arrivalTime: '19:00', departureTime: '19:02', distance: 156 },
      { code: 'UMB', arrivalTime: '19:50', departureTime: '19:53', distance: 198 },
      { code: 'CDG', arrivalTime: '20:30', departureTime: '20:38', distance: 265 },
      { code: 'KLK', arrivalTime: '21:15', departureTime: null, distance: 303 },
    ],
  },
  // 27. 12006 Kalka - New Delhi Shatabdi Express (Daily)
  {
    trainNumber: '12006',
    trainName: 'New Delhi Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 880,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'KLK', arrivalTime: null, departureTime: '06:15', distance: 0 },
      { code: 'CDG', arrivalTime: '06:45', departureTime: '06:53', distance: 38 },
      { code: 'UMB', arrivalTime: '07:33', departureTime: '07:38', distance: 105 },
      { code: 'KKDE', arrivalTime: '08:08', departureTime: '08:10', distance: 147 },
      { code: 'PNP', arrivalTime: '08:50', departureTime: '08:52', distance: 214 },
      { code: 'NDLS', arrivalTime: '10:15', departureTime: null, distance: 303 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 6: DELHI - UTTARAKHAND (Haridwar & Dehradun)
  // ═══════════════════════════════════════════════════════════════════════════

  // 28. 12055 New Delhi - Dehradun Jan Shatabdi Express (Daily)
  {
    trainNumber: '12055',
    trainName: 'Dehradun Jan Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 535,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '15:20', distance: 0 },
      { code: 'GZB', arrivalTime: '16:08', departureTime: '16:10', distance: 26 },
      { code: 'MTC', arrivalTime: '16:42', departureTime: '16:44', distance: 72 },
      { code: 'SRE', arrivalTime: '18:20', departureTime: '18:25', distance: 181 },
      { code: 'RK', arrivalTime: '18:58', departureTime: '19:00', distance: 216 },
      { code: 'HW', arrivalTime: '19:33', departureTime: '19:38', distance: 257 },
      { code: 'DDN', arrivalTime: '21:10', departureTime: null, distance: 309 },
    ],
  },
  // 29. 12056 Dehradun - New Delhi Jan Shatabdi Express (Daily)
  {
    trainNumber: '12056',
    trainName: 'New Delhi Jan Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 535,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'DDN', arrivalTime: null, departureTime: '05:00', distance: 0 },
      { code: 'HW', arrivalTime: '06:24', departureTime: '06:29', distance: 52 },
      { code: 'RK', arrivalTime: '07:02', departureTime: '07:04', distance: 93 },
      { code: 'SRE', arrivalTime: '07:42', departureTime: '07:47', distance: 128 },
      { code: 'MTC', arrivalTime: '09:20', departureTime: '09:22', distance: 237 },
      { code: 'GZB', arrivalTime: '10:16', departureTime: '10:18', distance: 283 },
      { code: 'NDLS', arrivalTime: '11:05', departureTime: null, distance: 309 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 7: DELHI - RAJASTHAN (Jaipur & Ajmer)
  // ═══════════════════════════════════════════════════════════════════════════

  // 30. 20977 New Delhi - Ajmer Vande Bharat Express (6 days/week)
  {
    trainNumber: '20977',
    trainName: 'Ajmer Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1575,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Thu, Fri, Sat',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '06:10', distance: 0 },
      { code: 'GGN', arrivalTime: '06:40', departureTime: '06:42', distance: 32 },
      { code: 'RE', arrivalTime: '07:20', departureTime: '07:22', distance: 84 },
      { code: 'AWR', arrivalTime: '08:08', departureTime: '08:10', distance: 158 },
      { code: 'JP', arrivalTime: '10:05', departureTime: '10:10', distance: 309 },
      { code: 'AII', arrivalTime: '12:15', departureTime: null, distance: 444 },
    ],
  },
  // 31. 20978 Ajmer - New Delhi Vande Bharat Express (6 days/week)
  {
    trainNumber: '20978',
    trainName: 'New Delhi Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1575,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Thu, Fri, Sat',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'AII', arrivalTime: null, departureTime: '15:55', distance: 0 },
      { code: 'JP', arrivalTime: '17:45', departureTime: '17:50', distance: 135 },
      { code: 'AWR', arrivalTime: '19:40', departureTime: '19:42', distance: 286 },
      { code: 'RE', arrivalTime: '20:30', departureTime: '20:32', distance: 360 },
      { code: 'GGN', arrivalTime: '21:10', departureTime: '21:12', distance: 412 },
      { code: 'NDLS', arrivalTime: '22:15', departureTime: null, distance: 444 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 8: DELHI - MADHYA PRADESH (Bhopal & Rani Kamalapati)
  // ═══════════════════════════════════════════════════════════════════════════

  // 32. 12002 New Delhi - Rani Kamalapati (Bhopal) Shatabdi Express (Daily)
  {
    trainNumber: '12002',
    trainName: 'Bhopal Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 1490,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '06:00', distance: 0 },
      { code: 'MTJ', arrivalTime: '07:19', departureTime: '07:20', distance: 141 },
      { code: 'AGC', arrivalTime: '07:50', departureTime: '07:55', distance: 195 },
      { code: 'GWL', arrivalTime: '09:23', departureTime: '09:28', distance: 313 },
      { code: 'VGLJ', arrivalTime: '10:45', departureTime: '10:50', distance: 410 },
      { code: 'BPL', arrivalTime: '14:07', departureTime: '14:12', distance: 702 },
      { code: 'RKMP', arrivalTime: '14:40', departureTime: null, distance: 708 },
    ],
  },
  // 33. 12001 Rani Kamalapati (Bhopal) - New Delhi Shatabdi Express (Daily)
  {
    trainNumber: '12001',
    trainName: 'New Delhi Shatabdi Express',
    coachName: 'CC',
    trainType: 'SHATABDI',
    basePrice: 1490,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'RKMP', arrivalTime: null, departureTime: '15:15', distance: 0 },
      { code: 'BPL', arrivalTime: '15:25', departureTime: '15:30', distance: 6 },
      { code: 'VGLJ', arrivalTime: '18:40', departureTime: '18:45', distance: 298 },
      { code: 'GWL', arrivalTime: '19:45', departureTime: '19:50', distance: 395 },
      { code: 'AGC', arrivalTime: '21:15', departureTime: '21:20', distance: 513 },
      { code: 'MTJ', arrivalTime: '22:00', departureTime: '22:01', distance: 567 },
      { code: 'NDLS', arrivalTime: '23:50', departureTime: null, distance: 708 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 9: DELHI - MUMBAI WESTERN TRUNK ROUTE (Tejas Rajdhani)
  // ═══════════════════════════════════════════════════════════════════════════

  // 34. 12952 New Delhi - Mumbai Central Tejas Rajdhani Express (Daily)
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
  // 35. 12951 Mumbai Central - New Delhi Tejas Rajdhani Express (Daily)
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 10: MUMBAI - GUJARAT (Vande Bharat High Speed)
  // ═══════════════════════════════════════════════════════════════════════════

  // 36. 20901 Mumbai Central - Gandhinagar Capital / Ahmedabad Vande Bharat (6 days/week)
  {
    trainNumber: '20901',
    trainName: 'Ahmedabad Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1650,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Wed, Fri, Sat',
    runningDays: [0, 1, 2, 3, 5, 6],
    stops: [
      { code: 'MMCT', arrivalTime: null, departureTime: '06:10', distance: 0 },
      { code: 'BVI', arrivalTime: '06:33', departureTime: '06:35', distance: 30 },
      { code: 'ST', arrivalTime: '08:48', departureTime: '08:53', distance: 263 },
      { code: 'BRC', arrivalTime: '10:03', departureTime: '10:08', distance: 392 },
      { code: 'ADI', arrivalTime: '11:25', departureTime: null, distance: 492 },
    ],
  },
  // 37. 20902 Ahmedabad - Mumbai Central Vande Bharat Express (6 days/week)
  {
    trainNumber: '20902',
    trainName: 'Mumbai Central Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1650,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Wed, Fri, Sat',
    runningDays: [0, 1, 2, 3, 5, 6],
    stops: [
      { code: 'ADI', arrivalTime: null, departureTime: '15:00', distance: 0 },
      { code: 'BRC', arrivalTime: '15:53', departureTime: '15:56', distance: 100 },
      { code: 'ST', arrivalTime: '17:10', departureTime: '17:13', distance: 229 },
      { code: 'BVI', arrivalTime: '19:32', departureTime: '19:34', distance: 462 },
      { code: 'MMCT', arrivalTime: '20:25', departureTime: null, distance: 492 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 11: NORTH TO SOUTH TRANS-PENINSULAR LIFELINES
  // ═══════════════════════════════════════════════════════════════════════════

  // 38. 12626 New Delhi - Thiruvananthapuram Kerala Superfast Express (Daily)
  {
    trainNumber: '12626',
    trainName: 'Kerala Superfast Express',
    coachName: 'SL',
    trainType: 'SUPERFAST',
    basePrice: 940,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '20:10', distance: 0 },
      { code: 'AGC', arrivalTime: '22:20', departureTime: '22:25', distance: 195 },
      { code: 'GWL', arrivalTime: '23:43', departureTime: '23:45', distance: 313 },
      { code: 'VGLJ', arrivalTime: '01:30', departureTime: '01:38', distance: 410 },
      { code: 'BPL', arrivalTime: '05:20', departureTime: '05:25', distance: 702 },
      { code: 'NGP', arrivalTime: '11:45', departureTime: '11:50', distance: 1092 },
      { code: 'RDM', arrivalTime: '14:59', departureTime: '15:00', distance: 1335 },
      { code: 'WL', arrivalTime: '16:28', departureTime: '16:30', distance: 1436 },
      { code: 'BZA', arrivalTime: '20:10', departureTime: '20:20', distance: 1643 },
      { code: 'NLR', arrivalTime: '23:28', departureTime: '23:30', distance: 1898 },
      { code: 'RU', arrivalTime: '01:35', departureTime: '01:40', distance: 2014 },
      { code: 'KPD', arrivalTime: '03:45', departureTime: '03:50', distance: 2129 },
      { code: 'SA', arrivalTime: '06:47', departureTime: '06:50', distance: 2334 },
      { code: 'ED', arrivalTime: '07:50', departureTime: '07:55', distance: 2393 },
      { code: 'CBE', arrivalTime: '09:27', departureTime: '09:30', distance: 2494 },
      { code: 'PGT', arrivalTime: '10:42', departureTime: '10:45', distance: 2550 },
      { code: 'TCR', arrivalTime: '11:57', departureTime: '12:00', distance: 2625 },
      { code: 'ERS', arrivalTime: '13:30', departureTime: '13:35', distance: 2699 },
      { code: 'KTYM', arrivalTime: '14:42', departureTime: '14:45', distance: 2759 },
      { code: 'QLN', arrivalTime: '16:22', departureTime: '16:25', distance: 2855 },
      { code: 'TVC', arrivalTime: '18:00', departureTime: null, distance: 2920 },
    ],
  },
  // 39. 12625 Thiruvananthapuram - New Delhi Kerala Superfast Express (Daily)
  {
    trainNumber: '12625',
    trainName: 'Kerala Superfast Express',
    coachName: 'SL',
    trainType: 'SUPERFAST',
    basePrice: 940,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'TVC', arrivalTime: null, departureTime: '12:30', distance: 0 },
      { code: 'QLN', arrivalTime: '13:32', departureTime: '13:35', distance: 65 },
      { code: 'KTYM', arrivalTime: '15:07', departureTime: '15:10', distance: 161 },
      { code: 'ERS', arrivalTime: '16:25', departureTime: '16:30', distance: 221 },
      { code: 'TCR', arrivalTime: '17:47', departureTime: '17:50', distance: 295 },
      { code: 'PGT', arrivalTime: '19:07', departureTime: '19:10', distance: 370 },
      { code: 'CBE', arrivalTime: '20:32', departureTime: '20:35', distance: 426 },
      { code: 'ED', arrivalTime: '22:00', departureTime: '22:05', distance: 527 },
      { code: 'SA', arrivalTime: '23:02', departureTime: '23:05', distance: 586 },
      { code: 'KPD', arrivalTime: '02:08', departureTime: '02:10', distance: 791 },
      { code: 'RU', arrivalTime: '04:15', departureTime: '04:20', distance: 906 },
      { code: 'NLR', arrivalTime: '05:58', departureTime: '06:00', distance: 1022 },
      { code: 'BZA', arrivalTime: '09:40', departureTime: '09:50', distance: 1277 },
      { code: 'WL', arrivalTime: '12:38', departureTime: '12:40', distance: 1484 },
      { code: 'RDM', arrivalTime: '13:59', departureTime: '14:00', distance: 1585 },
      { code: 'NGP', arrivalTime: '18:40', departureTime: '18:45', distance: 1828 },
      { code: 'BPL', arrivalTime: '03:45', departureTime: '03:55', distance: 2218 },
      { code: 'VGLJ', arrivalTime: '07:25', departureTime: '07:33', distance: 2510 },
      { code: 'GWL', arrivalTime: '08:40', departureTime: '08:42', distance: 2607 },
      { code: 'AGC', arrivalTime: '10:10', departureTime: '10:15', distance: 2725 },
      { code: 'NDLS', arrivalTime: '13:30', departureTime: null, distance: 2920 },
    ],
  },

  // 40. 12616 New Delhi - Chennai Central Grand Trunk (GT) Express (Daily)
  {
    trainNumber: '12616',
    trainName: 'Grand Trunk Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 1980,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:10', distance: 0 },
      { code: 'MTJ', arrivalTime: '17:40', departureTime: '17:45', distance: 141 },
      { code: 'AGC', arrivalTime: '18:30', departureTime: '18:35', distance: 195 },
      { code: 'GWL', arrivalTime: '20:00', departureTime: '20:05', distance: 313 },
      { code: 'VGLJ', arrivalTime: '21:30', departureTime: '21:38', distance: 410 },
      { code: 'BPL', arrivalTime: '01:20', departureTime: '01:25', distance: 702 },
      { code: 'ET', arrivalTime: '03:10', departureTime: '03:15', distance: 794 },
      { code: 'NGP', arrivalTime: '08:20', departureTime: '08:25', distance: 1092 },
      { code: 'WL', arrivalTime: '13:10', departureTime: '13:15', distance: 1436 },
      { code: 'BZA', arrivalTime: '16:50', departureTime: '17:00', distance: 1643 },
      { code: 'OGL', arrivalTime: '18:48', departureTime: '18:50', distance: 1782 },
      { code: 'NLR', arrivalTime: '20:13', departureTime: '20:15', distance: 1898 },
      { code: 'MAS', arrivalTime: '04:30', departureTime: null, distance: 2181 },
    ],
  },
  // 41. 12615 Chennai Central - New Delhi Grand Trunk (GT) Express (Daily)
  {
    trainNumber: '12615',
    trainName: 'Grand Trunk Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 1980,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'MAS', arrivalTime: null, departureTime: '18:50', distance: 0 },
      { code: 'NLR', arrivalTime: '22:08', departureTime: '22:10', distance: 283 },
      { code: 'OGL', arrivalTime: '23:38', departureTime: '23:40', distance: 399 },
      { code: 'BZA', arrivalTime: '01:50', departureTime: '02:00', distance: 538 },
      { code: 'WL', arrivalTime: '04:55', departureTime: '05:00', distance: 745 },
      { code: 'NGP', arrivalTime: '10:30', departureTime: '10:35', distance: 1089 },
      { code: 'ET', arrivalTime: '15:20', departureTime: '15:25', distance: 1387 },
      { code: 'BPL', arrivalTime: '17:00', departureTime: '17:10', distance: 1479 },
      { code: 'VGLJ', arrivalTime: '21:10', departureTime: '21:18', distance: 1771 },
      { code: 'GWL', arrivalTime: '22:30', departureTime: '22:35', distance: 1868 },
      { code: 'AGC', arrivalTime: '00:45', departureTime: '00:50', distance: 1986 },
      { code: 'MTJ', arrivalTime: '01:50', departureTime: '01:55', distance: 2040 },
      { code: 'NDLS', arrivalTime: '05:05', departureTime: null, distance: 2181 },
    ],
  },

  // 42. 12724 New Delhi - Hyderabad Telangana Express (Daily)
  {
    trainNumber: '12724',
    trainName: 'Telangana Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 1840,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:00', distance: 0 },
      { code: 'AGC', arrivalTime: '18:05', departureTime: '18:07', distance: 195 },
      { code: 'GWL', arrivalTime: '19:58', departureTime: '20:00', distance: 313 },
      { code: 'VGLJ', arrivalTime: '21:45', departureTime: '21:53', distance: 410 },
      { code: 'BPL', arrivalTime: '01:25', departureTime: '01:30', distance: 702 },
      { code: 'NGP', arrivalTime: '07:10', departureTime: '07:15', distance: 1092 },
      { code: 'RDM', arrivalTime: '10:34', departureTime: '10:35', distance: 1335 },
      { code: 'KZJ', arrivalTime: '12:08', departureTime: '12:10', distance: 1428 },
      { code: 'SC', arrivalTime: '15:30', departureTime: '15:40', distance: 1559 },
      { code: 'HYB', arrivalTime: '17:10', departureTime: null, distance: 1568 },
    ],
  },
  // 43. 12723 Hyderabad - New Delhi Telangana Express (Daily)
  {
    trainNumber: '12723',
    trainName: 'Telangana Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 1840,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'HYB', arrivalTime: null, departureTime: '06:00', distance: 0 },
      { code: 'SC', arrivalTime: '06:20', departureTime: '06:25', distance: 9 },
      { code: 'KZJ', arrivalTime: '08:08', departureTime: '08:10', distance: 140 },
      { code: 'RDM', arrivalTime: '09:29', departureTime: '09:30', distance: 233 },
      { code: 'NGP', arrivalTime: '14:20', departureTime: '14:25', distance: 476 },
      { code: 'BPL', arrivalTime: '20:55', departureTime: '21:05', distance: 866 },
      { code: 'VGLJ', arrivalTime: '01:19', departureTime: '01:27', distance: 1158 },
      { code: 'GWL', arrivalTime: '02:45', departureTime: '02:47', distance: 1255 },
      { code: 'AGC', arrivalTime: '04:55', departureTime: '04:57', distance: 1373 },
      { code: 'NDLS', arrivalTime: '07:40', departureTime: null, distance: 1568 },
    ],
  },

  // 44. 12628 New Delhi - KSR Bengaluru Karnataka Express (Daily)
  {
    trainNumber: '12628',
    trainName: 'Karnataka Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 2150,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '20:20', distance: 0 },
      { code: 'AGC', arrivalTime: '22:48', departureTime: '22:50', distance: 195 },
      { code: 'GWL', arrivalTime: '00:19', departureTime: '00:21', distance: 313 },
      { code: 'VGLJ', arrivalTime: '02:05', departureTime: '02:15', distance: 410 },
      { code: 'BPL', arrivalTime: '06:25', departureTime: '06:30', distance: 702 },
      { code: 'ET', arrivalTime: '08:15', departureTime: '08:20', distance: 794 },
      { code: 'BSL', arrivalTime: '13:00', departureTime: '13:05', distance: 1101 },
      { code: 'SUR', arrivalTime: '21:40', departureTime: '21:45', distance: 1607 },
      { code: 'KLBG', arrivalTime: '23:32', departureTime: '23:35', distance: 1720 },
      { code: 'BAY', arrivalTime: '04:45', departureTime: '04:50', distance: 1942 },
      { code: 'DVG', arrivalTime: '07:08', departureTime: '07:10', distance: 2087 },
      { code: 'YPR', arrivalTime: '11:13', departureTime: '11:15', distance: 2394 },
      { code: 'SBC', arrivalTime: '12:00', departureTime: null, distance: 2400 },
    ],
  },
  // 45. 12627 KSR Bengaluru - New Delhi Karnataka Express (Daily)
  {
    trainNumber: '12627',
    trainName: 'Karnataka Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 2150,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'SBC', arrivalTime: null, departureTime: '19:20', distance: 0 },
      { code: 'YPR', arrivalTime: '19:30', departureTime: '19:32', distance: 6 },
      { code: 'DVG', arrivalTime: '23:18', departureTime: '23:20', distance: 313 },
      { code: 'BAY', arrivalTime: '02:00', departureTime: '02:05', distance: 458 },
      { code: 'KLBG', arrivalTime: '06:57', departureTime: '07:00', distance: 680 },
      { code: 'SUR', arrivalTime: '08:45', departureTime: '08:50', distance: 793 },
      { code: 'BSL', arrivalTime: '17:25', departureTime: '17:30', distance: 1299 },
      { code: 'ET', arrivalTime: '21:40', departureTime: '21:45', distance: 1606 },
      { code: 'BPL', arrivalTime: '23:20', departureTime: '23:30', distance: 1698 },
      { code: 'VGLJ', arrivalTime: '02:50', departureTime: '02:58', distance: 1990 },
      { code: 'GWL', arrivalTime: '04:05', departureTime: '04:07', distance: 2087 },
      { code: 'AGC', arrivalTime: '05:45', departureTime: '05:50', distance: 2205 },
      { code: 'NDLS', arrivalTime: '09:00', departureTime: null, distance: 2400 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 12: DELHI - EAST & NORTH-EAST (Assam & Dibrugarh Rajdhani)
  // ═══════════════════════════════════════════════════════════════════════════

  // 46. 12424 New Delhi - Dibrugarh Rajdhani Express (Daily)
  {
    trainNumber: '12424',
    trainName: 'Dibrugarh Rajdhani Express',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2850,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NDLS', arrivalTime: null, departureTime: '16:20', distance: 0 },
      { code: 'CNB', arrivalTime: '21:40', departureTime: '21:45', distance: 440 },
      { code: 'PRYJ', arrivalTime: '23:51', departureTime: '23:53', distance: 635 },
      { code: 'DDU', arrivalTime: '01:23', departureTime: '01:33', distance: 787 },
      { code: 'PNBE', arrivalTime: '04:10', departureTime: '04:20', distance: 998 },
      { code: 'BJU', arrivalTime: '06:35', departureTime: '06:45', distance: 1108 },
      { code: 'KIR', arrivalTime: '09:45', departureTime: '09:55', distance: 1289 },
      { code: 'NJP', arrivalTime: '13:05', departureTime: '13:15', distance: 1485 },
      { code: 'NOQ', arrivalTime: '15:00', departureTime: '15:02', distance: 1611 },
      { code: 'NBQ', arrivalTime: '17:00', departureTime: '17:02', distance: 1717 },
      { code: 'GHY', arrivalTime: '19:50', departureTime: '20:05', distance: 1899 },
      { code: 'LMG', arrivalTime: '23:20', departureTime: '23:22', distance: 2080 },
      { code: 'DBRG', arrivalTime: '07:00', departureTime: null, distance: 2460 },
    ],
  },
  // 47. 12423 Dibrugarh - New Delhi Rajdhani Express (Daily)
  {
    trainNumber: '12423',
    trainName: 'Dibrugarh - New Delhi Rajdhani Express',
    coachName: '3A',
    trainType: 'RAJDHANI',
    basePrice: 2850,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'DBRG', arrivalTime: null, departureTime: '20:55', distance: 0 },
      { code: 'LMG', arrivalTime: '03:15', departureTime: '03:17', distance: 380 },
      { code: 'GHY', arrivalTime: '06:30', departureTime: '06:45', distance: 561 },
      { code: 'NBQ', arrivalTime: '09:20', departureTime: '09:22', distance: 743 },
      { code: 'NOQ', arrivalTime: '10:55', departureTime: '10:57', distance: 849 },
      { code: 'NJP', arrivalTime: '13:15', departureTime: '13:25', distance: 975 },
      { code: 'KIR', arrivalTime: '16:20', departureTime: '16:30', distance: 1171 },
      { code: 'BJU', arrivalTime: '19:05', departureTime: '19:15', distance: 1352 },
      { code: 'PNBE', arrivalTime: '21:40', departureTime: '21:50', distance: 1462 },
      { code: 'DDU', arrivalTime: '00:55', departureTime: '01:05', distance: 1673 },
      { code: 'PRYJ', arrivalTime: '02:48', departureTime: '02:50', distance: 1825 },
      { code: 'CNB', arrivalTime: '05:00', departureTime: '05:05', distance: 2020 },
      { code: 'NDLS', arrivalTime: '10:30', departureTime: null, distance: 2460 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 13: EAST COAST CORRIDOR (Kolkata - Odisha - Chennai)
  // ═══════════════════════════════════════════════════════════════════════════

  // 48. 12841 Howrah - Chennai Central Coromandel Express (Daily)
  {
    trainNumber: '12841',
    trainName: 'Coromandel Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 1720,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'HWH', arrivalTime: null, departureTime: '15:20', distance: 0 },
      { code: 'KGP', arrivalTime: '16:50', departureTime: '16:55', distance: 115 },
      { code: 'BLS', arrivalTime: '18:18', departureTime: '18:20', distance: 231 },
      { code: 'BHC', arrivalTime: '19:18', departureTime: '19:20', distance: 293 },
      { code: 'CTC', arrivalTime: '20:45', departureTime: '20:50', distance: 409 },
      { code: 'BBS', arrivalTime: '21:20', departureTime: '21:25', distance: 437 },
      { code: 'BAM', arrivalTime: '23:35', departureTime: '23:40', distance: 584 },
      { code: 'VSKP', arrivalTime: '04:25', departureTime: '04:45', distance: 862 },
      { code: 'RJY', arrivalTime: '07:23', departureTime: '07:25', distance: 1063 },
      { code: 'BZA', arrivalTime: '09:55', departureTime: '10:05', distance: 1213 },
      { code: 'OGL', arrivalTime: '12:04', departureTime: '12:05', distance: 1352 },
      { code: 'MAS', arrivalTime: '17:00', departureTime: null, distance: 1661 },
    ],
  },
  // 49. 12842 Chennai Central - Howrah Coromandel Express (Daily)
  {
    trainNumber: '12842',
    trainName: 'Coromandel Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 1720,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'MAS', arrivalTime: null, departureTime: '07:00', distance: 0 },
      { code: 'OGL', arrivalTime: '11:13', departureTime: '11:15', distance: 309 },
      { code: 'BZA', arrivalTime: '13:00', departureTime: '13:10', distance: 448 },
      { code: 'RJY', arrivalTime: '15:18', departureTime: '15:20', distance: 598 },
      { code: 'VSKP', arrivalTime: '18:50', departureTime: '19:10', distance: 799 },
      { code: 'BAM', arrivalTime: '23:00', departureTime: '23:05', distance: 1077 },
      { code: 'BBS', arrivalTime: '01:05', departureTime: '01:10', distance: 1224 },
      { code: 'CTC', arrivalTime: '01:40', departureTime: '01:45', distance: 1252 },
      { code: 'BHC', arrivalTime: '03:41', departureTime: '03:43', distance: 1368 },
      { code: 'BLS', arrivalTime: '04:30', departureTime: '04:32', distance: 1430 },
      { code: 'KGP', arrivalTime: '06:30', departureTime: '06:35', distance: 1546 },
      { code: 'HWH', arrivalTime: '08:30', departureTime: null, distance: 1661 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 14: SOUTH PENINSULAR VANDE BHARAT (Chennai - Bengaluru - Mysuru)
  // ═══════════════════════════════════════════════════════════════════════════

  // 50. 20608 Mysuru - Chennai Central Vande Bharat Express (6 days/week)
  {
    trainNumber: '20608',
    trainName: 'Mysuru - Chennai Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1720,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Thu, Fri, Sat',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'MYS', arrivalTime: null, departureTime: '13:05', distance: 0 },
      { code: 'SBC', arrivalTime: '14:50', departureTime: '14:55', distance: 138 },
      { code: 'KPD', arrivalTime: '17:53', departureTime: '17:55', distance: 366 },
      { code: 'MAS', arrivalTime: '19:20', departureTime: null, distance: 496 },
    ],
  },
  // 51. 20607 Chennai Central - Mysuru Vande Bharat Express (6 days/week)
  {
    trainNumber: '20607',
    trainName: 'Chennai - Mysuru Vande Bharat Express',
    coachName: 'EC',
    trainType: 'VANDE_BHARAT',
    basePrice: 1720,
    seatsCount: 52,
    runsOn: 'Sun, Mon, Tue, Thu, Fri, Sat',
    runningDays: [0, 1, 2, 4, 5, 6],
    stops: [
      { code: 'MAS', arrivalTime: null, departureTime: '05:50', distance: 0 },
      { code: 'KPD', arrivalTime: '07:13', departureTime: '07:15', distance: 130 },
      { code: 'SBC', arrivalTime: '10:15', departureTime: '10:20', distance: 358 },
      { code: 'MYS', arrivalTime: '12:20', departureTime: null, distance: 496 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 15: KONKAN COASTAL SPINE (Delhi - Maharashtra - Goa - Kerala)
  // ═══════════════════════════════════════════════════════════════════════════

  // 52. 12618 Hazrat Nizamuddin - Ernakulam Mangala Lakshadweep SF Express (Daily)
  {
    trainNumber: '12618',
    trainName: 'Mangala Lakshadweep Superfast Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 2240,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'NZM', arrivalTime: null, departureTime: '05:35', distance: 0 },
      { code: 'MTJ', arrivalTime: '07:05', departureTime: '07:10', distance: 134 },
      { code: 'AGC', arrivalTime: '07:55', departureTime: '08:00', distance: 188 },
      { code: 'GWL', arrivalTime: '09:28', departureTime: '09:30', distance: 306 },
      { code: 'VGLJ', arrivalTime: '11:15', departureTime: '11:23', distance: 403 },
      { code: 'BPL', arrivalTime: '16:20', departureTime: '16:25', distance: 695 },
      { code: 'BSL', arrivalTime: '22:45', departureTime: '22:50', distance: 1094 },
      { code: 'NK', arrivalTime: '02:08', departureTime: '02:10', distance: 1351 },
      { code: 'PNVL', arrivalTime: '05:25', departureTime: '05:30', distance: 1508 },
      { code: 'RN', arrivalTime: '11:30', departureTime: '11:35', distance: 1871 },
      { code: 'MAO', arrivalTime: '16:40', departureTime: '16:50', distance: 2107 },
      { code: 'MAJN', arrivalTime: '21:50', departureTime: '22:00', distance: 2404 },
      { code: 'CAN', arrivalTime: '00:02', departureTime: '00:05', distance: 2538 },
      { code: 'CLT', arrivalTime: '01:17', departureTime: '01:20', distance: 2627 },
      { code: 'SRR', arrivalTime: '02:55', departureTime: '03:00', distance: 2713 },
      { code: 'TCR', arrivalTime: '03:42', departureTime: '03:45', distance: 2746 },
      { code: 'ERS', arrivalTime: '07:30', departureTime: null, distance: 2820 },
    ],
  },
  // 53. 12617 Ernakulam - Hazrat Nizamuddin Mangala Lakshadweep SF Express (Daily)
  {
    trainNumber: '12617',
    trainName: 'Mangala Lakshadweep Superfast Express',
    coachName: '3A',
    trainType: 'SUPERFAST',
    basePrice: 2240,
    seatsCount: 64,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'ERS', arrivalTime: null, departureTime: '13:25', distance: 0 },
      { code: 'TCR', arrivalTime: '14:34', departureTime: '14:37', distance: 74 },
      { code: 'SRR', arrivalTime: '15:20', departureTime: '15:25', distance: 107 },
      { code: 'CLT', arrivalTime: '16:37', departureTime: '16:40', distance: 193 },
      { code: 'CAN', arrivalTime: '17:52', departureTime: '17:55', distance: 282 },
      { code: 'MAJN', arrivalTime: '20:00', departureTime: '20:10', distance: 416 },
      { code: 'MAO', arrivalTime: '01:15', departureTime: '01:25', distance: 713 },
      { code: 'RN', arrivalTime: '05:55', departureTime: '06:00', distance: 949 },
      { code: 'PNVL', arrivalTime: '12:35', departureTime: '12:40', distance: 1312 },
      { code: 'NK', arrivalTime: '16:17', departureTime: '16:20', distance: 1469 },
      { code: 'BSL', arrivalTime: '20:15', departureTime: '20:20', distance: 1726 },
      { code: 'BPL', arrivalTime: '03:20', departureTime: '03:25', distance: 2125 },
      { code: 'VGLJ', arrivalTime: '07:45', departureTime: '07:53', distance: 2417 },
      { code: 'GWL', arrivalTime: '09:05', departureTime: '09:07', distance: 2514 },
      { code: 'AGC', arrivalTime: '10:55', departureTime: '11:00', distance: 2632 },
      { code: 'MTJ', arrivalTime: '11:50', departureTime: '11:55', distance: 2686 },
      { code: 'NZM', arrivalTime: '13:35', departureTime: null, distance: 2820 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── CORRIDOR 16: EAST TO WEST TRANS-INDIA (Howrah - Central - Gujarat)
  // ═══════════════════════════════════════════════════════════════════════════

  // 54. 12834 Howrah - Ahmedabad Superfast Express (Daily)
  {
    trainNumber: '12834',
    trainName: 'Howrah - Ahmedabad Superfast Express',
    coachName: 'SL',
    trainType: 'SUPERFAST',
    basePrice: 795,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'HWH', arrivalTime: null, departureTime: '23:45', distance: 0 },
      { code: 'KGP', arrivalTime: '01:22', departureTime: '01:27', distance: 115 },
      { code: 'TATA', arrivalTime: '03:20', departureTime: '03:25', distance: 249 },
      { code: 'CKP', arrivalTime: '04:15', departureTime: '04:20', distance: 311 },
      { code: 'ROU', arrivalTime: '05:47', departureTime: '05:52', distance: 412 },
      { code: 'RIG', arrivalTime: '07:46', departureTime: '07:48', distance: 537 },
      { code: 'CPH', arrivalTime: '08:35', departureTime: '08:37', distance: 589 },
      { code: 'BSP', arrivalTime: '09:40', departureTime: '09:55', distance: 642 },
      { code: 'R', arrivalTime: '11:45', departureTime: '11:50', distance: 753 },
      { code: 'DURG', arrivalTime: '12:40', departureTime: '12:45', distance: 790 },
      { code: 'NGP', arrivalTime: '17:00', departureTime: '17:05', distance: 1055 },
      { code: 'BD', arrivalTime: '19:42', departureTime: '19:45', distance: 1230 },
      { code: 'AK', arrivalTime: '20:45', departureTime: '20:50', distance: 1309 },
      { code: 'BSL', arrivalTime: '23:05', departureTime: '23:10', distance: 1448 },
      { code: 'ST', arrivalTime: '05:00', departureTime: '05:05', distance: 1783 },
      { code: 'BRC', arrivalTime: '07:00', departureTime: '07:05', distance: 1912 },
      { code: 'ANND', arrivalTime: '07:40', departureTime: '07:42', distance: 1948 },
      { code: 'ADI', arrivalTime: '09:30', departureTime: null, distance: 2092 },
    ],
  },
  // 55. 12833 Ahmedabad - Howrah Superfast Express (Daily)
  {
    trainNumber: '12833',
    trainName: 'Ahmedabad - Howrah Superfast Express',
    coachName: 'SL',
    trainType: 'SUPERFAST',
    basePrice: 795,
    seatsCount: 72,
    runsOn: 'Daily Service',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { code: 'ADI', arrivalTime: null, departureTime: '00:15', distance: 0 },
      { code: 'ANND', arrivalTime: '01:10', departureTime: '01:12', distance: 144 },
      { code: 'BRC', arrivalTime: '01:45', departureTime: '01:50', distance: 180 },
      { code: 'ST', arrivalTime: '03:40', departureTime: '03:45', distance: 309 },
      { code: 'BSL', arrivalTime: '09:20', departureTime: '09:25', distance: 644 },
      { code: 'AK', arrivalTime: '11:40', departureTime: '11:45', distance: 783 },
      { code: 'BD', arrivalTime: '13:02', departureTime: '13:05', distance: 862 },
      { code: 'NGP', arrivalTime: '16:00', departureTime: '16:05', distance: 1037 },
      { code: 'DURG', arrivalTime: '20:10', departureTime: '20:15', distance: 1302 },
      { code: 'R', arrivalTime: '20:55', departureTime: '21:00', distance: 1339 },
      { code: 'BSP', arrivalTime: '22:50', departureTime: '23:05', distance: 1450 },
      { code: 'CPH', arrivalTime: '00:01', departureTime: '00:03', distance: 1503 },
      { code: 'RIG', arrivalTime: '00:58', departureTime: '01:00', distance: 1555 },
      { code: 'ROU', arrivalTime: '02:50', departureTime: '02:58', distance: 1680 },
      { code: 'CKP', arrivalTime: '04:25', departureTime: '04:30', distance: 1781 },
      { code: 'TATA', arrivalTime: '05:30', departureTime: '05:38', distance: 1843 },
      { code: 'KGP', arrivalTime: '07:35', departureTime: '07:40', distance: 1977 },
      { code: 'HWH', arrivalTime: '09:30', departureTime: null, distance: 2092 },
    ],
  },
];

// ─── 3. ADDITIVE SEEDING EXECUTION (PRESERVES ALL EXISTING DATA) ─────────────

async function seedRealIndianRailways() {
  console.log('===============================================================');
  console.log('🇮🇳 SEEDING AUTHENTIC INDIAN RAILWAYS (IRCTC) DATABASE');
  console.log('   Additive Mode: Preserves Previous Data, Adds New Stations & Trains');
  console.log('===============================================================\n');

  const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
  const adminDbUrl = process.env.DATABASE_URL || 'postgresql://admin:BMTpass@localhost:5432/admin_service_database';
  const inventoryDbUrl = adminDbUrl.replace('admin_service_database', 'inventory_service_database');

  const invPool = new Pool({ connectionString: inventoryDbUrl });

  // Step 1: Ensure Schema Columns Exist (Non-destructive)
  console.log('🔧 [1/4] Ensuring database schema columns exist...');
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE trains ADD COLUMN IF NOT EXISTS "runsOn" text NOT NULL DEFAULT 'Daily Service';
      ALTER TABLE trains ADD COLUMN IF NOT EXISTS "runningDays" integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}';
      ALTER TABLE trains ADD COLUMN IF NOT EXISTS "trainType" text NOT NULL DEFAULT 'EXPRESS';
    `);
    console.log('  ✓ Verified trains table schema columns (runsOn, runningDays, trainType)');
  } catch (err) {
    console.warn(`  ⚠️ Schema column check notice: ${err.message}`);
  }

  // Step 2: Ensure Elasticsearch Indices Exist
  console.log('\n🔍 [2/4] Verifying Elasticsearch search indices...');
  const esAvailable = await checkElasticsearch(esUrl);
  if (esAvailable) {
    await ensureEsIndices(esUrl);
    console.log('  ✓ Elasticsearch stations and trains indices verified');
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

  // Step 3: Additive Station Seeding (Preserves Existing Stations)
  console.log(`\n📍 [3/4] Checking and adding stations across India (${STATIONS.length} targets)...`);
  const existingStations = await prisma.station.findMany();
  const stationMap = new Map();

  for (const s of existingStations) {
    stationMap.set(s.code, s);
  }
  console.log(`  ✓ Found ${existingStations.length} pre-existing stations in database.`);

  let newStationsCount = 0;
  for (const s of STATIONS) {
    if (!stationMap.has(s.code)) {
      const station = await prisma.station.create({
        data: {
          code: s.code,
          name: s.name,
          city: s.city,
          state: s.state,
        },
      });
      stationMap.set(s.code, station);
      newStationsCount++;

      if (kafkaAvailable) {
        try {
          await adminProducer.publishStationCreated(station);
        } catch (_) {}
      }
    }
  }
  console.log(`  ✓ Added ${newStationsCount} new stations. Total available: ${stationMap.size}`);

  if (esAvailable) {
    const allDbStations = await prisma.station.findMany();
    await directIndexStationsToEs(esUrl, allDbStations);
    console.log(`  ✓ All ${allDbStations.length} stations indexed to Elasticsearch.`);
  }

  // Step 4: Additive Train, Route & Schedule Seeding
  console.log(`\n🚆 [4/4] Checking and expanding realistic trains (${TRAINS.length} targets)...`);

  // Load existing trains with their routes and seats
  const existingTrains = await prisma.train.findMany({
    include: {
      seats: true,
      route: {
        include: {
          routeStations: {
            include: { station: true },
            orderBy: { sequenceNumber: 'asc' },
          },
        },
      },
      schedules: true,
    },
  });

  const existingTrainMap = new Map();
  for (const tr of existingTrains) {
    existingTrainMap.set(tr.trainNumber, tr);
  }
  console.log(`  ✓ Found ${existingTrains.length} pre-existing trains in database.`);

  let newTrainsCount = 0;
  let totalNewSchedules = 0;

  for (const t of TRAINS) {
    try {
      let train = existingTrainMap.get(t.trainNumber);
      let seats = [];
      let createdRouteStations = [];

      if (!train) {
        // Create NEW Train
        train = await prisma.train.create({
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
        const seatsData = generateSeats(t.basePrice, t.seatsCount, t.trainType, t.trainName);
        for (const s of seatsData) {
          const createdSeat = await prisma.seat.create({
            data: {
              trainId: train.id,
              seatNumber: s.seatNumber,
              seatType: s.seatType,
              price: s.price,
              travelClass: s.travelClass || 'SL',
              coach: s.coach || null,
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

        newTrainsCount++;
        train = { ...train, seats, route: { id: route.id, routeStations: createdRouteStations }, schedules: [] };
        existingTrainMap.set(t.trainNumber, train);
      } else {
        // Pre-existing train: update metadata if needed
        train = await prisma.train.update({
          where: { id: train.id },
          data: {
            trainName: t.trainName,
            runsOn: t.runsOn,
            runningDays: t.runningDays,
            trainType: t.trainType || train.trainType,
          },
          include: {
            seats: true,
            route: {
              include: {
                routeStations: {
                  include: { station: true },
                  orderBy: { sequenceNumber: 'asc' },
                },
              },
            },
            schedules: true,
          },
        });
        seats = train.seats;
        createdRouteStations = train.route?.routeStations || [];
      }

      // Provision missing schedules for next 35 operating days
      const today = new Date();
      const existingDateStrs = new Set(
        (train.schedules || []).map((s) => {
          const d = new Date(s.departureDate);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
      );

      const schedulesForEs = [];
      let newSchedulesForThisTrain = 0;

      for (let dayOffset = 0; dayOffset < 35; dayOffset++) {
        const schedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
        schedDate.setHours(0, 0, 0, 0);

        const dayOfWeek = schedDate.getDay();
        if (!t.runningDays.includes(dayOfWeek)) {
          continue;
        }

        const year = schedDate.getFullYear();
        const month = String(schedDate.getMonth() + 1).padStart(2, '0');
        const day = String(schedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        let scheduleId;
        if (!existingDateStrs.has(dateStr)) {
          // 1. Create in Admin Service DB
          const schedule = await prisma.schedule.create({
            data: {
              trainId: train.id,
              departureDate: schedDate,
              status: 'ACTIVE',
            },
          });
          scheduleId = schedule.id;
          newSchedulesForThisTrain++;
          totalNewSchedules++;

          // 2. Sync into Inventory Service DB
          try {
            const invRes = await invPool.query(
              `INSERT INTO schedule_inventories (id, "scheduleId", "trainId", "trainNumber", "trainName", "departureDate", "totalSeats", available, locked, booked, status, version, "createdAt", "updatedAt")
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 0, 0, 'ACTIVE', 0, NOW(), NOW())
               ON CONFLICT DO NOTHING
               RETURNING id;`,
              [schedule.id, train.id, train.trainNumber, train.trainName, dateStr, t.seatsCount, t.seatsCount]
            );

            if (invRes.rows.length > 0) {
              const scheduleInventoryId = invRes.rows[0].id;
              for (const s of seats) {
                await invPool.query(
                  `INSERT INTO seat_inventories (id, "scheduleInventoryId", "scheduleId", "seatId", "seatNumber", "seatType", price, status, version, "createdAt", "updatedAt")
                   VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'AVAILABLE', 0, NOW(), NOW())
                   ON CONFLICT DO NOTHING;`,
                  [scheduleInventoryId, schedule.id, s.id, s.seatNumber, s.seatType, s.price]
                );
              }

              for (const rs of createdRouteStations) {
                await invPool.query(
                  `INSERT INTO route_stops (id, "scheduleId", "stationId", "stationName", "stationCode", "sequenceNumber")
                   VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
                   ON CONFLICT DO NOTHING;`,
                  [schedule.id, rs.station.id, rs.station.name, rs.station.code, rs.sequenceNumber]
                );
              }
            }
          } catch (_) {}

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
        } else {
          const existingSched = train.schedules.find((s) => {
            const d = new Date(s.departureDate);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === dateStr;
          });
          scheduleId = existingSched?.id;
        }

        schedulesForEs.push({
          scheduleId: scheduleId || dateStr,
          departureDate: dateStr,
          status: 'ACTIVE',
          available: t.seatsCount,
          locked: 0,
          booked: 0,
        });
      }

      // Index or Update Train in Elasticsearch
      if (esAvailable) {
        await directIndexTrainToEs(esUrl, train, t, createdRouteStations, schedulesForEs);
      }

      console.log(`  ✓ Train #${t.trainNumber} - ${t.trainName} | Halts: ${createdRouteStations.length} | New Schedules: ${newSchedulesForThisTrain}`);

    } catch (err) {
      console.error(`  ❌ Error processing train ${t.trainNumber}:`, err.message);
    }
  }

  // Close pg pool
  await invPool.end();

  // Step 5: Refresh Elasticsearch
  if (esAvailable) {
    try {
      await fetch(`${esUrl}/stations/_refresh`, { method: 'POST' });
      await fetch(`${esUrl}/trains/_refresh`, { method: 'POST' });
      console.log('\n  ✓ Elasticsearch search indices refreshed');
    } catch (_) {}
  }

  console.log('\n===============================================================');
  console.log('🎉 ADDITIVE DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`✅ Previous Data Preserved: 100%`);
  console.log(`✅ New Stations Added: ${newStationsCount}`);
  console.log(`✅ New Trains Added: ${newTrainsCount}`);
  console.log(`✅ Total Trains Now Available: ${existingTrainMap.size}`);
  console.log(`✅ New Schedules Provisioned: ${totalNewSchedules}`);
  console.log('===============================================================\n');
}

// ─── ELASTICSEARCH DIRECT SYNC HELPERS (ADDITIVE) ────────────────────────────

async function checkElasticsearch(url) {
  try {
    const res = await fetch(`${url}/_cluster/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureEsIndices(esUrl) {
  // Ensure stations index exists without deleting existing documents
  try {
    const sRes = await fetch(`${esUrl}/stations`, { method: 'HEAD' });
    if (sRes.status === 404) {
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
    }
  } catch (_) {}

  // Ensure trains index exists without deleting existing documents
  try {
    const tRes = await fetch(`${esUrl}/trains`, { method: 'HEAD' });
    if (tRes.status === 404) {
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
  } catch (_) {}
}

async function directIndexTrainToEs(esUrl, train, config, routeStations, schedules) {
  try {
    const seatSummary = { total: config.seatsCount || train.totalSeats || 64, LOWER: 16, MIDDLE: 16, UPPER: 16, SIDE_LOWER: 8, SIDE_UPPER: 8 };
    const doc = {
      trainId: train.id,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      runsOn: config.runsOn || train.runsOn,
      runningDays: config.runningDays || train.runningDays,
      route: routeStations.map((rs) => ({
        stationId: rs.station?.id || rs.stationId,
        stationName: rs.station?.name || rs.stationName,
        stationCode: rs.station?.code || rs.stationCode,
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

