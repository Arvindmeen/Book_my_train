import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toast';

const SERVICES_CONFIG = {
  food: {
    id: 'food',
    title: 'Food on Track (IRCTC E-Catering)',
    badge: 'FSSAI Certified · Seat Delivery',
    icon: '🍴',
    tagline: 'Gourmet, piping-hot meals delivered directly to your train coach and berth.',
    color: 'from-orange-500 to-amber-600',
    accentColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    desc: 'Partnered with over 500+ top restaurant kitchens including Domino’s, Haldiram’s, Saravana Bhavan, and Bikanerwala across 350+ railway junctions in India.',
    highlights: [
      'Delivered hot at designated station stops',
      'Pay via Cash on Delivery or UPI at your seat',
      '100% refund guarantee if train delay causes miss',
      'Freshly prepared with strict FSSAI hygiene standards'
    ]
  },
  hotels: {
    id: 'hotels',
    title: 'Hotels & Executive Pod Lounges',
    badge: 'Station Concourse · 200+ Hubs',
    icon: '🏨',
    tagline: 'Soundproof sleeping pods and luxury retiring rooms located right on the platform.',
    color: 'from-blue-600 to-indigo-700',
    accentColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    desc: 'Need a rest during a long transit or layover? Reserve soundproof AC sleeping pods and verified railway executive retiring suites with 24x7 check-in.',
    highlights: [
      'Zero commute: Located right inside railway stations',
      'Flexible hourly packages (3h, 6h, 12h, or Nightly)',
      'High-speed 5G Wi-Fi, hot showers & baggage lockers',
      'Instant digital voucher with keycode entry'
    ]
  },
  cabs: {
    id: 'cabs',
    title: 'Platform Cabs & Auto (Ride Tracker)',
    badge: 'Zero Surge · Ride Tracker Live',
    icon: '🚖',
    tagline: 'Pre-book verified station taxis waiting at your platform exit gate.',
    color: 'from-amber-600 to-yellow-600',
    accentColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    desc: 'Avoid long platform taxi queues and aggressive bargaining. Powered by Ride Tracker with zero surge pricing, live GPS driver tracking, and verified station exit pickups.',
    externalUrl: 'https://ride-tracker-ruddy.vercel.app/',
    highlights: [
      'Verified platform exit gate pickup',
      'Zero surge guarantee during peak hours',
      'Driver assigned 30 minutes before train arrival',
      'Direct integration with UPI and cash payments'
    ]
  },
  flights: {
    id: 'flights',
    title: 'Connecting Flights (Rail-Air Combo)',
    badge: 'Multi-Modal · ₹800 Combo Off',
    icon: '✈️',
    tagline: 'Synchronized rail-to-flight ticketing with guaranteed layover buffers.',
    color: 'from-emerald-600 to-teal-700',
    accentColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    desc: 'Connecting tier-2 and tier-3 rail hubs with major international & domestic airport gateways. Automatically synchronizes train arrival with flight departures.',
    highlights: [
      'Guaranteed minimum 2.5-hour safe layover window',
      'Automatic ₹800 combo discount on flight fares',
      'Free miss-connection insurance included',
      'Instant digital boarding passes to your phone'
    ]
  },
  porter: {
    id: 'porter',
    title: 'Station Porter (Coolie) Booking',
    badge: 'Ministry of Railways · Fixed Tariff',
    icon: '🧳',
    tagline: 'Pre-book licensed railway porters at official government fixed tariffs.',
    color: 'from-purple-600 to-indigo-700',
    accentColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    desc: 'Never struggle with heavy luggage or aggressive station negotiations again. Pre-book an authorized, badge-verified railway coolie waiting right at your coach door.',
    highlights: [
      'Fixed transparent government tariff (₹100–₹320)',
      'Verified licensed porter with official Billa badge',
      'Porter meets you at coach door or station gate #1',
      'Zero bargaining guarantee · Pay after delivery'
    ]
  },
  wheelchair: {
    id: 'wheelchair',
    title: 'Wheelchair & Accessibility Assistance',
    badge: '100% Free · Sugamya Bharat',
    icon: '♿',
    tagline: 'Dedicated station attendants and electric buggies for seniors and Divyangjan.',
    color: 'from-teal-600 to-emerald-700',
    accentColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    desc: 'Under the official Sugamya Bharat Railway Accessible India initiative, BookMyTrain provides complimentary wheelchair escorts and battery-operated buggy escorts at all major stations.',
    highlights: [
      '100% Free of charge (Government sponsored)',
      'Dedicated station sahayak attendant assistance',
      'Battery-operated buggy cart across platforms',
      'Coach ramp board/deboard assistance'
    ]
  },
  insurance: {
    id: 'insurance',
    title: 'BMT Trip Shield & 100% Refund Guarantee',
    badge: '100% Refund · ₹10 Lakhs Cover',
    icon: '🛡️',
    tagline: 'Guaranteed 100% instant refund if your waitlist ticket fails to confirm.',
    color: 'from-rose-600 to-pink-700',
    accentColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    desc: 'Eliminate waitlist risk and travel stress. If your waitlist ticket is dropped at chart preparation or if you cancel, receive a 100% instant refund with zero clerkage fee.',
    highlights: [
      '100% instant refund to UPI with ₹0 deduction',
      'Free ₹10,00,000 accidental travel insurance coverage',
      'Meal reimbursement if train delayed by > 2 hours',
      'Hospital cash benefit at 300+ station cities'
    ]
  },
  radar: {
    id: 'radar',
    title: 'WhatsApp Live Train Radar',
    badge: 'Instant GPS · Zero App Needed',
    icon: '📱',
    tagline: 'Live GPS delay updates, platform changes, and wake-up alarms on WhatsApp.',
    color: 'from-green-600 to-emerald-700',
    accentColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    desc: 'Stay informed without opening an app. Get automated live station alerts, platform announcements, and 30-minute arrival wake-up calls directly on your WhatsApp.',
    highlights: [
      'No app install required: runs on standard WhatsApp',
      'Automated wake-up call 30 minutes before destination',
      'Real-time platform number change warnings',
      'One-tap live trip sharing with your family'
    ]
  }
};

const MOCK_FOOD_ITEMS = [
  { id: 1, name: 'Royal Maharaja Veg Thali', category: 'Thalis', desc: 'Basmati rice, 3 butter roti, paneer butter masala, dal makhani, boondi raita & gulab jamun', price: 220, type: 'veg', rating: '4.8', icon: '🍱' },
  { id: 2, name: 'Dum Hyderabadi Chicken Biryani', category: 'Biryani', desc: 'Slow-cooked fragrant biryani served with spicy mirchi ka salan and chilled raita', price: 260, type: 'nonveg', rating: '4.9', icon: '🍗' },
  { id: 3, name: 'Amritsari Chole Bhature Combo', category: 'Snacks', desc: '2 golden fluffy bhature served with spicy pindi chole, mint chutney & pickles', price: 140, type: 'veg', rating: '4.6', icon: '🫓' },
  { id: 4, name: 'Butter Chicken & Garlic Naan', category: 'North Indian', desc: 'Boneless tender chicken in rich tomato butter gravy with 2 crisp garlic naan', price: 240, type: 'nonveg', rating: '4.7', icon: '🥘' },
  { id: 5, name: 'South Indian Special Masala Dosa', category: 'Snacks', desc: 'Crispy golden dosa stuffed with potato masala, served with 2 chutneys & hot sambar', price: 110, type: 'veg', rating: '4.7', icon: '🥞' },
  { id: 6, name: 'Kesari Gulab Jamun (2 Pcs)', category: 'Desserts', desc: 'Soft khoya dumplings dipped in warm saffron-cardamom scented sugar syrup', price: 60, type: 'veg', rating: '4.9', icon: '🍮' }
];

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const service = SERVICES_CONFIG[serviceId] || SERVICES_CONFIG.food;

  // ─── 1. PORTER STATE ───
  const [porterStation, setPorterStation] = useState('New Delhi (NDLS)');
  const [porterPnr, setPorterPnr] = useState('2419821456');
  const [porterCoach, setPorterCoach] = useState('B3');
  const [porterBerth, setPorterBerth] = useState('24');
  const [porterBags, setPorterBags] = useState(2);
  const [porterPhone, setPorterPhone] = useState(user?.phone || '9876543210');
  const [porterPickup, setPorterPickup] = useState('Coach Door on Platform');
  const [porterConfirmed, setPorterConfirmed] = useState(null);

  // ─── 2. WHEELCHAIR STATE ───
  const [wheelchairStation, setWheelchairStation] = useState('New Delhi (NDLS)');
  const [wheelchairPnr, setWheelchairPnr] = useState('2419821456');
  const [wheelchairPassenger, setWheelchairPassenger] = useState(user?.name ? `${user.name} (Senior Citizen)` : 'Satish Sharma (Senior Citizen)');
  const [wheelchairType, setWheelchairType] = useState('Wheelchair with Dedicated Station Attendant');
  const [wheelchairPhone, setWheelchairPhone] = useState(user?.phone || '9876543210');
  const [wheelchairConfirmed, setWheelchairConfirmed] = useState(null);

  // ─── 3. TRIP SHIELD STATE ───
  const [insurancePnr, setInsurancePnr] = useState('2419821456');
  const [insurancePassenger, setInsurancePassenger] = useState(user?.name || 'Arvind Meena');
  const [insuranceUpi, setInsuranceUpi] = useState(user?.email ? `${user.email.split('@')[0]}@okaxis` : 'arvind@okhdfcbank');
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(null);

  // ─── 4. WHATSAPP RADAR STATE ───
  const [radarPhone, setRadarPhone] = useState(user?.phone || '9876543210');
  const [radarTrain, setRadarTrain] = useState('22436 Vande Bharat Express');
  const [radarPnr, setRadarPnr] = useState('2419821456');
  const [radarWakeup, setRadarWakeup] = useState(true);
  const [radarGps, setRadarGps] = useState(true);
  const [radarPlatform, setRadarPlatform] = useState(true);
  const [radarConfirmed, setRadarConfirmed] = useState(false);

  // ─── 5. FLIGHTS STATE ───
  const [flightFrom, setFlightFrom] = useState('New Delhi (DEL)');
  const [flightTo, setFlightTo] = useState('Mumbai (BOM)');
  const [flightDate, setFlightDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [flightSelected, setFlightSelected] = useState('indigo');
  const [flightConfirmed, setFlightConfirmed] = useState(null);

  // ─── 6. FOOD STATE ───
  const [foodPnr, setFoodPnr] = useState('2419821456');
  const [foodStation, setFoodStation] = useState('Kanpur Central (CNB)');
  const [foodCategory, setFoodCategory] = useState('All');
  const [foodCart, setFoodCart] = useState({ 1: 1, 6: 1 });
  const [foodConfirmed, setFoodConfirmed] = useState(null);

  // ─── 7. HOTELS STATE ───
  const [hotelStation, setHotelStation] = useState('New Delhi (NDLS) • Platform #1');
  const [hotelType, setHotelType] = useState('Executive Soundproof Pod • ₹899 (6 hrs)');
  const [hotelCheckIn, setHotelCheckIn] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [hotelGuests, setHotelGuests] = useState('1 Guest');
  const [hotelConfirmed, setHotelConfirmed] = useState(null);

  // Auto-fill user information when authenticated
  useEffect(() => {
    if (user) {
      if (user.name) {
        setInsurancePassenger(user.name);
      }
      if (user.phone) {
        setPorterPhone(user.phone);
        setWheelchairPhone(user.phone);
        setRadarPhone(user.phone);
      }
    }
  }, [user]);

  // Porter Tariff helper
  const calculatePorterTariff = (bags) => {
    if (bags <= 1) return 100;
    if (bags === 2) return 180;
    if (bags === 3) return 250;
    return 320;
  };

  // Food Cart total
  const calculateFoodTotal = () => {
    return Object.entries(foodCart).reduce((acc, [id, qty]) => {
      const item = MOCK_FOOD_ITEMS.find((f) => f.id === parseInt(id));
      return acc + (item ? item.price * qty : 0);
    }, 0);
  };

  const updateFoodCart = (id, delta) => {
    setFoodCart((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const updated = current + delta;
      if (updated <= 0) {
        delete next[id];
      } else {
        next[id] = updated;
      }
      return next;
    });
  };

  // Enforce auth requirement
  const requireAuth = (actionName) => {
    if (!isAuthenticated) {
      showToast(`Please sign in to book ${actionName}.`, 'warning');
      navigate(`/login?redirect=/services/${service.id}`);
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-6 sm:py-10 pb-24 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ─── BREADCRUMB & BACK NAVIGATION ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-emerald-700 transition-colors">Services</Link>
            <span>/</span>
            <span className="font-bold text-slate-900">{service.title}</span>
          </div>

          <Link
            to="/services"
            className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>&larr;</span> All Travel Services
          </Link>
        </div>

        {/* ─── HERO HEADER BANNER ─── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs">
                  {service.icon}
                </span>
                <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${service.bgColor} ${service.accentColor} ${service.borderColor}`}>
                  {service.badge}
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Official Rail Partner
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {service.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {service.tagline}
              </p>

              <p className="text-xs text-slate-500 leading-relaxed">
                {service.desc}
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-center min-w-[200px] shrink-0 space-y-2">
              <div className="text-2xl font-black text-emerald-700">4.9 / 5.0</div>
              <div className="text-[11px] font-bold text-slate-500">
                Verified Indian Railways Satisfaction
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-semibold">
                ✓ 24x7 CRIS / IRCTC Coordination
              </div>
            </div>
          </div>
        </div>

        {/* ─── AUTHENTICATION GUARD BANNER (IF LOGGED OUT) ─── */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  🔒
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Account Login Required to Book Services</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Protected</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    You can explore details, menus, and transparent tariff tables below. However, to confirm reservations, dispatch station coolies, or receive official digital railway vouchers, you must be signed in to your verified account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/login?redirect=/services/${service.id}`)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
                >
                  Sign In to Book &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/login?tab=register&redirect=/services/${service.id}`)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
                >
                  Register Free
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── AUTHENTICATED USER GREETING ─── */}
        {isAuthenticated && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>
                Logged in as <strong>{user?.name || user?.email}</strong>. Instant booking &amp; digital voucher generation enabled.
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              ✓ Verified Passenger
            </span>
          </div>
        )}

        {/* ─── MAIN TWO-COLUMN INTERACTIVE ENGINE ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: REALISTIC INTERACTIVE BOOKING ENGINE (7 COLS) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">

            {/* ════════════════════════════════════════════════════════════════════════
                1. STATION PORTER (COOLIE) ENGINE
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'porter' && (
              <div className="space-y-5">
                <div className="border-b border-slate-150 pb-3">
                  <h2 className="font-extrabold text-lg text-slate-900">
                    Official Railway Coolie Dispatch Engine
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-book licensed porters at fixed government tariffs. Zero bargaining guaranteed.
                  </p>
                </div>

                {!porterConfirmed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requireAuth('Station Porter')) return;

                      setPorterConfirmed({
                        passId: `BMT-PORTER-${Math.floor(100000 + Math.random() * 900000)}`,
                        porterName: 'Rameshwar Prasad',
                        badgeNo: 'Billa #402',
                        phone: '+91 98112 34567',
                        station: porterStation,
                        coach: porterCoach,
                        berth: porterBerth,
                        pnr: porterPnr,
                        bags: porterBags,
                        tariff: calculatePorterTariff(porterBags),
                        pickup: porterPickup,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      });
                      showToast('Porter booking confirmed! Your digital pass has been generated.', 'success');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl text-slate-700">
                      <p className="font-bold text-purple-950 flex items-center gap-1.5">
                        <span>🛡️</span> Ministry of Railways Fixed Tariff Schedule
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Tariffs are regulated by Indian Railways. 1 Bag: ₹100 · 2 Bags: ₹180 · 3 Bags: ₹250 · 4+ Bags: ₹320. No tipping or negotiation needed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Station Hub</label>
                        <select
                          value={porterStation}
                          onChange={(e) => setPorterStation(e.target.value)}
                          className="input-field text-xs font-semibold"
                        >
                          <option>New Delhi (NDLS)</option>
                          <option>Howrah Junction (HWH)</option>
                          <option>Mumbai CSMT (CSMT)</option>
                          <option>Varanasi Junction (BSB)</option>
                          <option>Kanpur Central (CNB)</option>
                          <option>KSR Bengaluru (SBC)</option>
                          <option>Patna Junction (PNBE)</option>
                          <option>Chennai Central (MAS)</option>
                          <option>Jaipur Junction (JP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Train PNR (10 Digits)</label>
                        <input
                          type="text"
                          value={porterPnr}
                          onChange={(e) => setPorterPnr(e.target.value)}
                          placeholder="e.g. 2419821456"
                          className="input-field text-xs font-mono font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Coach Number</label>
                        <input
                          type="text"
                          value={porterCoach}
                          onChange={(e) => setPorterCoach(e.target.value)}
                          placeholder="e.g. B3, A1, S4"
                          className="input-field text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Berth / Seat</label>
                        <input
                          type="text"
                          value={porterBerth}
                          onChange={(e) => setPorterBerth(e.target.value)}
                          placeholder="e.g. 24, 48"
                          className="input-field text-xs font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Passenger Contact Mobile</label>
                        <input
                          type="tel"
                          value={porterPhone}
                          onChange={(e) => setPorterPhone(e.target.value)}
                          placeholder="10-digit mobile"
                          className="input-field text-xs font-bold font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Meeting Point</label>
                        <select
                          value={porterPickup}
                          onChange={(e) => setPorterPickup(e.target.value)}
                          className="input-field text-xs font-semibold"
                        >
                          <option>Coach Door on Platform (Arrival)</option>
                          <option>Station Concourse Gate #1 (Departure)</option>
                          <option>Platform Buggy Stand / Escalator</option>
                        </select>
                      </div>
                    </div>

                    {/* Luggage Counter */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">Number of Luggage Bags / Trunks</span>
                        <span className="text-[11px] text-slate-500">Standard suitcases up to 40 kg each</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPorterBags((b) => Math.max(1, b - 1))}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-base text-slate-900 w-5 text-center">
                          {porterBags}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPorterBags((b) => Math.min(8, b + 1))}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Tariff Box */}
                    <div className="flex items-center justify-between p-3.5 bg-purple-50/50 border border-purple-200 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">Official Fixed Tariff</span>
                        <span className="text-xl font-black text-purple-950 font-mono">
                          ₹{calculatePorterTariff(porterBags)}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1.5">(Pay cash/UPI to porter at handoff)</span>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isAuthenticated ? 'Confirm Porter Booking &rarr;' : '🔒 Sign In to Book Porter'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Realistic Digital Porter Pass */
                  <div className="space-y-4 animate-scale-in">
                    <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/20 pb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                            Official Digital Porter Pass
                          </span>
                          <h3 className="text-xl font-black mt-1">{porterConfirmed.passId}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                          🧳
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 text-xs">
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Assigned Porter</span>
                          <strong className="text-sm">{porterConfirmed.porterName}</strong>
                          <span className="block text-[10px] text-amber-300 font-bold">{porterConfirmed.badgeNo}</span>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Porter Contact</span>
                          <strong className="text-sm font-mono">{porterConfirmed.phone}</strong>
                          <span className="block text-[10px] text-emerald-300 font-bold">SMS Sent</span>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Meeting Point</span>
                          <strong className="text-xs">{porterConfirmed.pickup}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Station</span>
                          <strong className="text-xs">{porterConfirmed.station}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Coach / Berth</span>
                          <strong className="text-xs">{porterConfirmed.coach} · Berth {porterConfirmed.berth}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Fixed Tariff</span>
                          <strong className="text-base font-black text-amber-300">₹{porterConfirmed.tariff}</strong>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/80">
                        <span>✓ Government regulated fixed tariff receipt</span>
                        <span>Issued at {porterConfirmed.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                      >
                        🖨️ Print / Save Porter Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => setPorterConfirmed(null)}
                        className="py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Book Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════
                2. WHEELCHAIR & ACCESSIBILITY (SUGAMYA BHARAT)
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'wheelchair' && (
              <div className="space-y-5">
                <div className="border-b border-slate-150 pb-3">
                  <h2 className="font-extrabold text-lg text-slate-900">
                    Sugamya Bharat Railway Accessibility Portal
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    100% Free assistance for senior citizens, expectant mothers &amp; Divyangjan.
                  </p>
                </div>

                {!wheelchairConfirmed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requireAuth('Wheelchair Assistance')) return;

                      setWheelchairConfirmed({
                        tokenId: `SAHAYAK-${Math.floor(1000 + Math.random() * 9000)}`,
                        passenger: wheelchairPassenger,
                        station: wheelchairStation,
                        type: wheelchairType,
                        pnr: wheelchairPnr,
                        phone: wheelchairPhone,
                        attendant: 'Vikram Singh (Station Sahayak Desk Pf #1)',
                        helpline: '139 (Option 4 - Divyangjan Assist)',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      });
                      showToast('Wheelchair assistance request confirmed! Free Sahayak assigned.', 'success');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-slate-700">
                      <p className="font-bold text-teal-950 flex items-center gap-1.5">
                        <span>♿</span> Official Free Government Assistance (₹0 Tariff)
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        No service charges apply. Dedicated station attendants will be stationed with wheelchair / electric buggy at your arrival coach gate.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Railway Station</label>
                        <select
                          value={wheelchairStation}
                          onChange={(e) => setWheelchairStation(e.target.value)}
                          className="input-field text-xs font-semibold"
                        >
                          <option>New Delhi (NDLS)</option>
                          <option>Howrah Junction (HWH)</option>
                          <option>Mumbai CSMT (CSMT)</option>
                          <option>Varanasi Junction (BSB)</option>
                          <option>KSR Bengaluru (SBC)</option>
                          <option>Chennai Central (MAS)</option>
                          <option>Jaipur Junction (JP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Train PNR (10 Digits)</label>
                        <input
                          type="text"
                          value={wheelchairPnr}
                          onChange={(e) => setWheelchairPnr(e.target.value)}
                          placeholder="e.g. 2419821456"
                          className="input-field text-xs font-mono font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Passenger Name &amp; Category</label>
                      <input
                        type="text"
                        value={wheelchairPassenger}
                        onChange={(e) => setWheelchairPassenger(e.target.value)}
                        placeholder="e.g. Satish Sharma (Senior Citizen / Mobility Impaired)"
                        className="input-field text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assistance Type</label>
                      <select
                        value={wheelchairType}
                        onChange={(e) => setWheelchairType(e.target.value)}
                        className="input-field text-xs font-semibold"
                      >
                        <option>Wheelchair with Dedicated Station Attendant</option>
                        <option>Battery-Operated Electric Buggy (Concourse to Platform)</option>
                        <option>Ramp Escort &amp; Coach Boarding Lift Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Attendant SMS Contact Mobile</label>
                      <input
                        type="tel"
                        value={wheelchairPhone}
                        onChange={(e) => setWheelchairPhone(e.target.value)}
                        className="input-field text-xs font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-teal-50/50 border border-teal-200 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block">Service Cost</span>
                        <span className="text-xl font-black text-teal-950 font-mono">₹0 (100% Free)</span>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isAuthenticated ? 'Dispatch Free Sahayak &rarr;' : '🔒 Sign In to Request Assist'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Realistic Sahayak Voucher */
                  <div className="space-y-4 animate-scale-in">
                    <div className="bg-gradient-to-br from-teal-700 to-emerald-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/20 pb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                            Sugamya Rail Sahayak Token
                          </span>
                          <h3 className="text-xl font-black mt-1">{wheelchairConfirmed.tokenId}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                          ♿
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-4 text-xs">
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Passenger</span>
                          <strong className="text-sm">{wheelchairConfirmed.passenger}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Station</span>
                          <strong className="text-sm">{wheelchairConfirmed.station}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Service Type</span>
                          <strong className="text-xs">{wheelchairConfirmed.type}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Attendant Desk</span>
                          <strong className="text-xs">{wheelchairConfirmed.attendant}</strong>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white/15 rounded-xl text-xs flex items-center justify-between">
                        <span>Emergency Assistance Helpline:</span>
                        <strong className="font-mono text-amber-300">{wheelchairConfirmed.helpline}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                      >
                        🖨️ Print Sahayak Token
                      </button>
                      <button
                        type="button"
                        onClick={() => setWheelchairConfirmed(null)}
                        className="py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Request Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════
                3. FOOD ON TRACK (IRCTC E-CATERING LIVE FOOD COURT)
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'food' && (
              <div className="space-y-5">
                <div className="border-b border-slate-150 pb-3">
                  <h2 className="font-extrabold text-lg text-slate-900">
                    Live Train E-Catering Food Court
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hygienic restaurant meals delivered hot to your seat at station stops.
                  </p>
                </div>

                {!foodConfirmed ? (
                  <div className="space-y-4">
                    {/* Delivery Train & Station info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Train PNR</label>
                        <input
                          type="text"
                          value={foodPnr}
                          onChange={(e) => setFoodPnr(e.target.value)}
                          placeholder="10-digit PNR"
                          className="input-field text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Station Junction</label>
                        <select
                          value={foodStation}
                          onChange={(e) => setFoodStation(e.target.value)}
                          className="input-field text-xs font-semibold"
                        >
                          <option>Kanpur Central (CNB) • Stop time: 10 mins</option>
                          <option>Prayagraj Junction (PRYJ) • Stop time: 15 mins</option>
                          <option>Mughal Sarai / DDU • Stop time: 10 mins</option>
                          <option>Nagpur Junction (NGP) • Stop time: 12 mins</option>
                          <option>Bhopal Junction (BPL) • Stop time: 8 mins</option>
                        </select>
                      </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                      {['All', 'Thalis', 'Biryani', 'North Indian', 'Snacks', 'Desserts'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFoodCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            foodCategory === cat
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Food Items List */}
                    <div className="space-y-3">
                      {MOCK_FOOD_ITEMS.filter((f) => foodCategory === 'All' || f.category === foodCategory).map((item) => {
                        const qty = foodCart[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-orange-300 transition-colors bg-white shadow-2xs"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl p-2 rounded-xl bg-orange-50 border border-orange-200">
                                {item.icon}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                  <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                                  <span className="text-[10px] text-amber-600 font-bold">★ {item.rating}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm line-clamp-1">{item.desc}</p>
                                <span className="font-mono font-black text-xs text-slate-900 mt-1 block">₹{item.price}</span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {qty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => updateFoodCart(item.id, 1)}
                                  className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                >
                                  + ADD
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                                  <button
                                    type="button"
                                    onClick={() => updateFoodCart(item.id, -1)}
                                    className="w-6 h-6 rounded-lg bg-white text-orange-700 font-bold hover:bg-orange-100 flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold text-xs text-orange-950 px-1">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateFoodCart(item.id, 1)}
                                    className="w-6 h-6 rounded-lg bg-white text-orange-700 font-bold hover:bg-orange-100 flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Cart Summary & Order Action */}
                    <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange-900">Total Meal Cart Amount</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-900 font-mono">₹{calculateFoodTotal()}</span>
                          <span className="text-[11px] text-slate-500 font-medium">(Free Delivery on Train)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (calculateFoodTotal() <= 0) {
                            showToast('Please add at least one meal to your cart.', 'warning');
                            return;
                          }
                          if (!requireAuth('Food on Track')) return;

                          setFoodConfirmed({
                            orderId: `BMT-FOOD-${Math.floor(100000 + Math.random() * 900000)}`,
                            pnr: foodPnr,
                            station: foodStation,
                            amount: calculateFoodTotal(),
                            payment: 'Cash on Delivery at Coach Seat'
                          });
                          showToast('Meal order confirmed! FSSAI restaurant notified.', 'success');
                        }}
                        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer text-center"
                      >
                        {isAuthenticated ? 'Confirm Seat Delivery &rarr;' : '🔒 Sign In to Order Food'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Realistic Food Voucher */
                  <div className="space-y-4 animate-scale-in">
                    <div className="bg-gradient-to-br from-orange-600 to-amber-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/20 pb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                            IRCTC E-Catering Order Confirmation
                          </span>
                          <h3 className="text-xl font-black mt-1">{foodConfirmed.orderId}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                          🍴
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-4 text-xs">
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Delivery Station</span>
                          <strong className="text-sm">{foodConfirmed.station}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Train PNR</span>
                          <strong className="text-sm font-mono">{foodConfirmed.pnr}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Total Bill</span>
                          <strong className="text-base font-black text-amber-200">₹{foodConfirmed.amount}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block text-[10px] uppercase font-bold">Payment Method</span>
                          <strong className="text-xs">{foodConfirmed.payment}</strong>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white/15 rounded-xl text-xs flex items-center justify-between">
                        <span>Delivery Status:</span>
                        <strong className="text-emerald-300 font-bold">✓ Confirmed with Station Kitchen</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFoodConfirmed(null)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Place Another Meal Order
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════
                4. HOTELS & POD LOUNGES
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'hotels' && (
              <div className="space-y-5">
                <div className="border-b border-slate-150 pb-3">
                  <h2 className="font-extrabold text-lg text-slate-900">
                    Station Retiring Rooms &amp; Pod Lounges
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hourly soundproof pods &amp; AC retiring rooms right on railway platforms.
                  </p>
                </div>

                {!hotelConfirmed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requireAuth('Station Pod Stay')) return;

                      setHotelConfirmed({
                        bookingId: `BMT-POD-${Math.floor(100000 + Math.random() * 900000)}`,
                        station: hotelStation,
                        room: hotelType,
                        date: hotelCheckIn,
                        guests: hotelGuests,
                        keyCode: `POD-${Math.floor(1000 + Math.random() * 9000)}`
                      });
                      showToast('Station pod reservation confirmed! Keycode generated.', 'success');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Station Junction</label>
                      <select
                        value={hotelStation}
                        onChange={(e) => setHotelStation(e.target.value)}
                        className="input-field text-xs font-semibold"
                      >
                        <option>New Delhi (NDLS) • Platform #1</option>
                        <option>Mumbai Central (MMCT) • Pod Lounge Gate 2</option>
                        <option>Varanasi Junction (BSB) • Heritage Suite</option>
                        <option>KSR Bengaluru (SBC) • Executive Wing</option>
                        <option>Howrah Junction (HWH) • Riverside Lounge</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Accommodation Tier</label>
                      <select
                        value={hotelType}
                        onChange={(e) => setHotelType(e.target.value)}
                        className="input-field text-xs font-semibold"
                      >
                        <option>Executive Soundproof Pod • ₹899 (6 hrs)</option>
                        <option>Rail Yatri Deluxe Room • ₹1,499 (Nightly)</option>
                        <option>Heritage Railway Retiring Suite • ₹1,199 (Nightly)</option>
                        <option>Hourly Transit Nap Pod • ₹499 (3 hrs)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Check-in Date</label>
                        <input
                          type="date"
                          value={hotelCheckIn}
                          onChange={(e) => setHotelCheckIn(e.target.value)}
                          className="input-field text-xs font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Guests</label>
                        <select
                          value={hotelGuests}
                          onChange={(e) => setHotelGuests(e.target.value)}
                          className="input-field text-xs font-semibold"
                        >
                          <option>1 Guest (Single Pod)</option>
                          <option>2 Guests (Double Room)</option>
                          <option>4 Guests (Family Suite)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-900">✓ Free cancellation up to 2 hours prior</span>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        {isAuthenticated ? 'Reserve Station Pod &rarr;' : '🔒 Sign In to Reserve'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 animate-scale-in text-center">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-3xl p-6 shadow-xl text-left">
                      <div className="flex items-center justify-between border-b border-white/20 pb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                            Station Pod Voucher
                          </span>
                          <h3 className="text-xl font-black mt-1">{hotelConfirmed.bookingId}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                          🏨
                        </div>
                      </div>

                      <div className="space-y-2.5 my-4 text-xs">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-white/70">Location:</span>
                          <strong className="text-white">{hotelConfirmed.station}</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-white/70">Accommodation:</span>
                          <strong className="text-white">{hotelConfirmed.room}</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-white/70">Check-In:</span>
                          <strong className="text-white">{hotelConfirmed.date} (24x7 desk open)</strong>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-white/70">Digital Entry Keycode:</span>
                          <strong className="text-lg font-mono font-black text-amber-300">{hotelConfirmed.keyCode}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setHotelConfirmed(null)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Reserve Another Stay
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════
                5. CONNECTING FLIGHTS (RAIL-AIR COMBO)
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'flights' && (
              <div className="space-y-5">
                <div className="border-b border-slate-150 pb-3">
                  <h2 className="font-extrabold text-lg text-slate-900">
                    Synchronized Rail-Air Combo Planner
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect rail hubs with domestic flights. Instant ₹800 combo discount.
                  </p>
                </div>

                {!flightConfirmed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requireAuth('Connecting Flights')) return;

                      setFlightConfirmed({
                        comboPnr: `RAIL-AIR-${Math.floor(100000 + Math.random() * 900000)}`,
                        flight: flightSelected === 'indigo' ? 'IndiGo 6E-204' : 'Air India AI-805',
                        route: `${flightFrom} → ${flightTo}`,
                        date: flightDate,
                        discount: '₹800 Combo Applied'
                      });
                      showToast('Connecting flight reserved! Combo discount applied.', 'success');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Departure Station / Airport</label>
                        <select
                          value={flightFrom}
                          onChange={(e) => setFlightFrom(e.target.value)}
                          className="input-field text-xs font-semibold"
                        >
                          <option>New Delhi (DEL)</option>
                          <option>Varanasi (VNS)</option>
                          <option>Patna (PAT)</option>
                          <option>Lucknow (LKO)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destination Airport</label>
                        <select
                          value={flightTo}
                          onChange={(e) => setFlightTo(e.target.value)}
                          className="input-field text-xs font-semibold"
                        >
                          <option>Mumbai (BOM)</option>
                          <option>Bengaluru (BLR)</option>
                          <option>Goa (GOI)</option>
                          <option>Hyderabad (HYD)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Journey Date</label>
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="input-field text-xs font-semibold"
                        required
                      />
                    </div>

                    {/* Airline Choice */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Synchronized Flights</label>
                      <div
                        onClick={() => setFlightSelected('indigo')}
                        className={`p-3 border rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                          flightSelected === 'indigo' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <strong className="text-xs text-slate-900 block">IndiGo 6E-204 · Non-stop (2h 10m)</strong>
                          <span className="text-[11px] text-slate-500">Departure: 18:30 (3h after train arrival)</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 text-xs">₹3,850 (₹800 OFF)</span>
                      </div>

                      <div
                        onClick={() => setFlightSelected('airindia')}
                        className={`p-3 border rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                          flightSelected === 'airindia' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <strong className="text-xs text-slate-900 block">Air India AI-805 · Free Meal Included</strong>
                          <span className="text-[11px] text-slate-500">Departure: 20:15 (4h after train arrival)</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 text-xs">₹4,420 (₹800 OFF)</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition-all cursor-pointer text-center"
                    >
                      {isAuthenticated ? 'Book Synchronized Flight &rarr;' : '🔒 Sign In to Book Flight'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 animate-scale-in">
                    <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                        Rail-Air Combo Ticket
                      </span>
                      <h3 className="text-xl font-black mt-2">{flightConfirmed.comboPnr}</h3>
                      <p className="text-xs text-white/80 mt-1">{flightConfirmed.route} · {flightConfirmed.flight}</p>
                      <div className="mt-4 pt-3 border-t border-white/20 flex justify-between text-xs">
                        <span>Date: {flightConfirmed.date}</span>
                        <strong className="text-amber-300 font-bold">{flightConfirmed.discount}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFlightConfirmed(null)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Search Another Combo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════
                6. BMT TRIP SHIELD & 100% REFUND GUARANTEE
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'insurance' && (
              <div className="space-y-5">
                <div className="border-b border-slate-150 pb-3">
                  <h2 className="font-extrabold text-lg text-slate-900">
                    BMT Trip Shield &amp; Instant UPI Payout
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    100% instant refund on waitlist drops with ₹0 clerkage deduction.
                  </p>
                </div>

                {!insuranceConfirmed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requireAuth('Trip Shield')) return;

                      setInsuranceConfirmed({
                        policyNo: `BMT-SHIELD-${Math.floor(10000000 + Math.random() * 90000000)}`,
                        passenger: insurancePassenger,
                        pnr: insurancePnr,
                        upi: insuranceUpi,
                        coverage: '₹10,00,000 Accidental Cover'
                      });
                      showToast('Trip Shield activated! Instant refund guarantee active.', 'success');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl text-slate-700">
                      <p className="font-bold text-rose-950 flex items-center gap-1.5">
                        <span>🛡️</span> Zero Clerkage Penalty Guarantee
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        If your ticket fails to confirm at chart preparation or if you cancel, the full fare is instantly credited to your UPI ID in under 60 seconds with zero deductions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Train PNR</label>
                        <input
                          type="text"
                          value={insurancePnr}
                          onChange={(e) => setInsurancePnr(e.target.value)}
                          placeholder="10-digit PNR"
                          className="input-field text-xs font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Traveler Name</label>
                        <input
                          type="text"
                          value={insurancePassenger}
                          onChange={(e) => setInsurancePassenger(e.target.value)}
                          className="input-field text-xs font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Direct UPI ID for Instant Rollback</label>
                      <input
                        type="text"
                        value={insuranceUpi}
                        onChange={(e) => setInsuranceUpi(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                        className="input-field text-xs font-mono font-bold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer text-center"
                    >
                      {isAuthenticated ? 'Activate 100% Refund Shield &rarr;' : '🔒 Sign In to Activate Shield'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 animate-scale-in">
                    <div className="bg-gradient-to-br from-rose-600 to-pink-800 text-white rounded-3xl p-6 shadow-xl">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                        Trip Shield Active Policy
                      </span>
                      <h3 className="text-xl font-black mt-2">{insuranceConfirmed.policyNo}</h3>
                      <p className="text-xs text-white/80 mt-1">Beneficiary: {insuranceConfirmed.passenger} · PNR: {insuranceConfirmed.pnr}</p>
                      <div className="mt-4 pt-3 border-t border-white/20 flex justify-between text-xs">
                        <span>UPI Destination: {insuranceConfirmed.upi}</span>
                        <strong className="text-amber-200 font-bold">{insuranceConfirmed.coverage}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInsuranceConfirmed(null)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Activate on Another PNR
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════
                7. WHATSAPP LIVE TRAIN RADAR
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'radar' && (
              <div className="space-y-5">
                <div className="border-b border-slate-150 pb-3">
                  <h2 className="font-extrabold text-lg text-slate-900">
                    WhatsApp Live Train Radar Activation
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated GPS delays, platform announcements &amp; wakeup alarms.
                  </p>
                </div>

                {!radarConfirmed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requireAuth('WhatsApp Train Radar')) return;

                      setRadarConfirmed(true);
                      showToast('WhatsApp Live Train Radar activated! Live updates initiated.', 'success');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp Mobile Number</label>
                        <input
                          type="tel"
                          value={radarPhone}
                          onChange={(e) => setRadarPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="input-field text-xs font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Train Number or PNR</label>
                        <input
                          type="text"
                          value={radarTrain}
                          onChange={(e) => setRadarTrain(e.target.value)}
                          className="input-field text-xs font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alert Preferences</label>
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={radarWakeup}
                          onChange={(e) => setRadarWakeup(e.target.checked)}
                          className="rounded text-green-600 focus:ring-0"
                        />
                        <span className="text-xs text-slate-700 font-medium">⏰ 30-minute automated arrival wake-up call</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={radarGps}
                          onChange={(e) => setRadarGps(e.target.checked)}
                          className="rounded text-green-600 focus:ring-0"
                        />
                        <span className="text-xs text-slate-700 font-medium">📍 Live GPS station delay notifications</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={radarPlatform}
                          onChange={(e) => setRadarPlatform(e.target.checked)}
                          className="rounded text-green-600 focus:ring-0"
                        />
                        <span className="text-xs text-slate-700 font-medium">🚉 Platform number &amp; coach position changes</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer text-center"
                    >
                      {isAuthenticated ? 'Enable WhatsApp Radar Stream &rarr;' : '🔒 Sign In to Enable Radar'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 animate-scale-in">
                    <div className="bg-[#0b141a] text-white rounded-3xl p-5 shadow-xl font-sans">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
                            🚆
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">BookMyTrain Live Radar</h4>
                            <span className="text-[10px] text-emerald-400">● Live GPS connected</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">18:14</span>
                      </div>

                      <div className="my-3 space-y-2 text-xs">
                        <div className="bg-[#202c33] p-3 rounded-2xl rounded-tl-xs max-w-sm space-y-1">
                          <p className="font-bold text-emerald-400">✓ Train 22436 Update</p>
                          <p className="text-[11px] text-slate-200">
                            Train is running ON TIME at 112 km/h. Next Station: <strong>Kanpur Central</strong>. Platform #1 confirmed.
                          </p>
                          <span className="text-[9px] text-slate-400 block text-right">18:14 ✓✓</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRadarConfirmed(false)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Change Preferences
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════
                8. PLATFORM CABS & AUTO (RIDE TRACKER PARTNERSHIP PORTAL)
                ════════════════════════════════════════════════════════════════════════ */}
            {service.id === 'cabs' && (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-md shadow-amber-500/20">
                  🚖
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3 py-1 rounded-full border border-amber-300">
                    Official Ride Partner Portal
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    Ride Tracker Station Cabs &amp; Auto
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                    Pre-book verified platform exit pickup with zero-surge fares on Ride Tracker. Driver details are delivered 30 minutes before your train pulls into the station.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-slate-700 max-w-md mx-auto text-left space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <span>⚡</span> Zero Surge &amp; Fixed Government Meter Rates
                  </div>
                  <p className="text-[11px] text-slate-600">
                    All rides booked via Ride Tracker adhere strictly to regional railway station transport tariffs with verified driver background checks.
                  </p>
                </div>

                <div className="pt-2 max-w-md mx-auto">
                  <a
                    href="https://ride-tracker-ruddy.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch Ride Tracker Web App ↗</span>
                  </a>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold">
                    Opens in a secure new tab (https://ride-tracker-ruddy.vercel.app/)
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: KEY HIGHLIGHTS, OFFICIAL ACCORDIONS & ALL SERVICES SWITCHER (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Official Railway Guidelines Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>🛡️</span> Indian Railways Standards &amp; Benefits
              </h3>

              <div className="space-y-2.5">
                {service.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span className="font-medium leading-relaxed">{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-150 text-[11px] text-slate-500 space-y-1.5">
                <p>
                  <strong>Rail Madad 24x7 Helpline:</strong> Dial <strong>139</strong> for instant assistance on train or station premises.
                </p>
                <p className="text-[10px] text-slate-400">
                  Operated in adherence to Ministry of Railways guidelines and partner SLAs.
                </p>
              </div>
            </div>

            {/* Explore All Other Services Switcher */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                Explore Other Travel Services
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {Object.values(SERVICES_CONFIG)
                  .filter((s) => s.id !== service.id)
                  .map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        if (s.id === 'cabs' || s.externalUrl) {
                          window.open(s.externalUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          navigate(`/services/${s.id}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <span className="text-lg p-1.5 rounded-lg bg-slate-50 border border-slate-150 group-hover:scale-105 transition-transform">
                        {s.icon}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block truncate">
                          {s.title.split('(')[0]}
                          {s.id === 'cabs' && <span className="text-amber-600 ml-1">↗</span>}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">{s.badge}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
