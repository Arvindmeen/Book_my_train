import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';
import StationAutocomplete from '../components/search/StationAutocomplete';
import BookingCard from '../components/bookings/BookingCard';
import { useAuthStore } from '../store/auth.store';
import { useSearchStore } from '../store/search.store';
import { bookingApi } from '../api/booking.api';
import { useToast } from '../components/ui/Toast';
import PwaInstallModal from '../components/common/PwaInstallModal';
import { predictWaitlist, predictPnr } from '../utils/aiPrediction';

// Express trains roster with real-time GPS telemetry
const LIVE_TRAINS_DATA = [
  {
    id: '22436',
    number: '22436',
    name: 'Varanasi Vande Bharat Express',
    fromCode: 'NDLS',
    toCode: 'BSB',
    fromName: 'New Delhi (NDLS)',
    toName: 'Varanasi Jn (BSB)',
    route: 'NDLS - BSB',
    departureTime: '06:00 AM',
    arrivalTime: '02:00 PM',
    status: 'On Time',
    currentStation: 'Kanpur Central',
    nextStation: 'Prayagraj Jn',
    platform: 'Platform #1',
    delay: 0,
    speed: '130 km/h',
    stops: [
      { name: 'New Delhi (NDLS)', time: '06:00 AM', departed: true, platform: 'Pf 16' },
      { name: 'Kanpur Central (CNB)', time: '10:08 AM', current: true, platform: 'Pf 1' },
      { name: 'Prayagraj Jn (PRYJ)', time: '12:08 PM', upcoming: true, platform: 'Pf 6' },
      { name: 'Varanasi Jn (BSB)', time: '02:00 PM', upcoming: true, platform: 'Pf 1' }
    ]
  },
  {
    id: '12301',
    number: '12301',
    name: 'Howrah Rajdhani Express',
    fromCode: 'NDLS',
    toCode: 'HWH',
    fromName: 'New Delhi (NDLS)',
    toName: 'Howrah Jn (HWH)',
    route: 'NDLS - HWH',
    departureTime: '04:50 PM',
    arrivalTime: '09:55 AM (Next Day)',
    status: 'Delayed by 15m',
    currentStation: 'Prayagraj Jn',
    nextStation: 'Pt. Deen Dayal Upadhyaya Jn',
    platform: 'Platform #4',
    delay: 15,
    speed: '120 km/h',
    stops: [
      { name: 'New Delhi (NDLS)', time: '04:50 PM', departed: true, platform: 'Pf 9' },
      { name: 'Kanpur Central (CNB)', time: '09:30 PM', departed: true, platform: 'Pf 3' },
      { name: 'Prayagraj Jn (PRYJ)', time: '11:50 PM', current: true, platform: 'Pf 4' },
      { name: 'Mughalsarai / DDU (DDU)', time: '01:45 AM', upcoming: true, platform: 'Pf 2' },
      { name: 'Howrah Jn (HWH)', time: '09:55 AM', upcoming: true, platform: 'Pf 9' }
    ]
  },
  {
    id: '12002',
    number: '12002',
    name: 'Bhopal Shatabdi Express',
    fromCode: 'NDLS',
    toCode: 'BPL',
    fromName: 'New Delhi (NDLS)',
    toName: 'Bhopal Jn / Rani Kamlapati (RKMP)',
    route: 'NDLS - RKMP',
    departureTime: '06:00 AM',
    arrivalTime: '02:40 PM',
    status: 'On Time',
    currentStation: 'Agra Cantt',
    nextStation: 'Morena',
    platform: 'Platform #2',
    delay: 0,
    speed: '140 km/h',
    stops: [
      { name: 'New Delhi (NDLS)', time: '06:00 AM', departed: true, platform: 'Pf 1' },
      { name: 'Mathura Jn (MTJ)', time: '07:19 AM', departed: true, platform: 'Pf 1' },
      { name: 'Agra Cantt (AGC)', time: '07:50 AM', current: true, platform: 'Pf 2' },
      { name: 'Morena (MRA)', time: '08:48 AM', upcoming: true, platform: 'Pf 1' },
      { name: 'Gwalior (GWL)', time: '09:23 AM', upcoming: true, platform: 'Pf 1' },
      { name: 'Jhansi Jn (VGLJ)', time: '10:45 AM', upcoming: true, platform: 'Pf 2' },
      { name: 'Bhopal Jn (BPL)', time: '02:40 PM', upcoming: true, platform: 'Pf 1' }
    ]
  },
  {
    id: '12951',
    number: '12951',
    name: 'Mumbai Tejas Rajdhani Express',
    fromCode: 'MMCT',
    toCode: 'NDLS',
    fromName: 'Mumbai Central (MMCT)',
    toName: 'New Delhi (NDLS)',
    route: 'MMCT - NDLS',
    departureTime: '05:00 PM',
    arrivalTime: '08:35 AM (Next Day)',
    status: 'On Time',
    currentStation: 'Surat',
    nextStation: 'Vadodara Jn',
    platform: 'Platform #1',
    delay: 0,
    speed: '130 km/h',
    stops: [
      { name: 'Mumbai Central (MMCT)', time: '05:00 PM', departed: true, platform: 'Pf 1' },
      { name: 'Surat (ST)', time: '07:43 PM', current: true, platform: 'Pf 1' },
      { name: 'Vadodara Jn (BRC)', time: '09:18 PM', upcoming: true, platform: 'Pf 2' },
      { name: 'Ratlam Jn (RTM)', time: '12:55 AM', upcoming: true, platform: 'Pf 4' },
      { name: 'Kota Jn (KOTA)', time: '03:55 AM', upcoming: true, platform: 'Pf 1' },
      { name: 'New Delhi (NDLS)', time: '08:35 AM', upcoming: true, platform: 'Pf 3' }
    ]
  },
  {
    id: '12004',
    number: '12004',
    name: 'Lucknow Swarna Shatabdi Express',
    fromCode: 'NDLS',
    toCode: 'LKO',
    fromName: 'New Delhi (NDLS)',
    toName: 'Lucknow Charbagh (LKO)',
    route: 'NDLS - LKO',
    departureTime: '06:10 AM',
    arrivalTime: '12:40 PM',
    status: 'On Time',
    currentStation: 'Aligarh Jn',
    nextStation: 'Tundla Jn',
    platform: 'Platform #3',
    delay: 0,
    speed: '125 km/h',
    stops: [
      { name: 'New Delhi (NDLS)', time: '06:10 AM', departed: true, platform: 'Pf 6' },
      { name: 'Ghaziabad (GZB)', time: '06:48 AM', departed: true, platform: 'Pf 2' },
      { name: 'Aligarh Jn (ALJN)', time: '07:49 AM', current: true, platform: 'Pf 3' },
      { name: 'Tundla Jn (TDL)', time: '08:45 AM', upcoming: true, platform: 'Pf 1' },
      { name: 'Kanpur Central (CNB)', time: '11:20 AM', upcoming: true, platform: 'Pf 5' },
      { name: 'Lucknow Charbagh (LKO)', time: '12:40 PM', upcoming: true, platform: 'Pf 1' }
    ]
  },
  {
    id: '12958',
    number: '12958',
    name: 'Swarna Jayanti Rajdhani Express',
    fromCode: 'NDLS',
    toCode: 'ADI',
    fromName: 'New Delhi (NDLS)',
    toName: 'Ahmedabad Jn (ADI)',
    route: 'NDLS - ADI',
    departureTime: '07:55 PM',
    arrivalTime: '08:45 AM',
    status: 'Delayed by 8m',
    currentStation: 'Jaipur Jn',
    nextStation: 'Ajmer Jn',
    platform: 'Platform #2',
    delay: 8,
    speed: '118 km/h',
    stops: [
      { name: 'New Delhi (NDLS)', time: '07:55 PM', departed: true, platform: 'Pf 4' },
      { name: 'Delhi Cantt (DEC)', time: '08:23 PM', departed: true, platform: 'Pf 1' },
      { name: 'Gurgaon (GGN)', time: '08:41 PM', departed: true, platform: 'Pf 1' },
      { name: 'Jaipur Jn (JP)', time: '11:55 PM', current: true, platform: 'Pf 2' },
      { name: 'Ajmer Jn (AII)', time: '01:55 AM', upcoming: true, platform: 'Pf 1' },
      { name: 'Abu Road (ABR)', time: '05:05 AM', upcoming: true, platform: 'Pf 1' },
      { name: 'Ahmedabad Jn (ADI)', time: '08:45 AM', upcoming: true, platform: 'Pf 1' }
    ]
  }
];

const generateLiveTrainForRoute = (fromStation, toStation, trainQuery) => {
  const fromClean = fromStation || 'Origin Station';
  const toClean = toStation || 'Destination Station';
  const trainNum = trainQuery && /^\d+$/.test(trainQuery) ? trainQuery : '12424';
  const trainTitle = trainQuery && !/^\d+$/.test(trainQuery) ? trainQuery : 'Superfast Express';

  return [
    {
      id: trainNum,
      number: trainNum,
      name: `${fromClean.split(' (')[0]} to ${toClean.split(' (')[0]} ${trainTitle}`,
      fromCode: fromClean.slice(0, 4).toUpperCase(),
      toCode: toClean.slice(0, 4).toUpperCase(),
      fromName: fromClean,
      toName: toClean,
      route: `${fromClean.split(' (')[0]} - ${toClean.split(' (')[0]}`,
      departureTime: '07:15 AM',
      arrivalTime: '03:45 PM',
      status: 'On Time',
      currentStation: 'Midway Junction',
      nextStation: toClean,
      platform: 'Platform #2',
      delay: 0,
      speed: '115 km/h',
      stops: [
        { name: fromClean, time: '07:15 AM', departed: true, platform: 'Pf 2' },
        { name: 'Intermediate Junction', time: '10:30 AM', departed: true, platform: 'Pf 1' },
        { name: 'Central Interchange', time: '01:15 PM', current: true, platform: 'Pf 3' },
        { name: toClean, time: '03:45 PM', upcoming: true, platform: 'Pf 1' }
      ]
    }
  ];
};

const MOCK_FOOD_ITEMS = [
  { id: 1, name: 'Royal Maharaja Veg Thali', desc: 'Basmati rice, 3 butter roti, paneer butter masala, dal makhani, boondi raita & gulab jamun', price: 220, type: 'veg', rating: '4.8', icon: '🍱' },
  { id: 2, name: 'Dum Hyderabadi Chicken Biryani', desc: 'Slow-cooked fragrant biryani served with spicy mirchi ka salan and chilled raita', price: 260, type: 'nonveg', rating: '4.9', icon: '🍗' },
  { id: 3, name: 'Amritsari Chole Bhature Combo', desc: '2 golden fluffy bhature served with spicy pindi chole, mint chutney & pickles', price: 140, type: 'veg', rating: '4.6', icon: '🫓' },
  { id: 4, name: 'Butter Chicken & Garlic Naan', desc: 'Boneless tender chicken in rich tomato butter gravy with 2 crisp garlic naan', price: 240, type: 'nonveg', rating: '4.7', icon: '🥘' },
  { id: 5, name: 'Kesari Gulab Jamun (2 Pcs)', desc: 'Soft khoya dumplings dipped in warm saffron-cardamom scented sugar syrup', price: 60, type: 'veg', rating: '4.9', icon: '🍮' }
];

const PROMOTION_OFFERS = [
  { code: 'BMTGROWW', desc: 'Flat 10% off up to ₹150 on your first booking with BooK my Train.', gradient: 'from-emerald-600 to-teal-700' },
  { code: 'ZEROFEE', desc: 'Pay via UPI and enjoy flat ₹0 payment gateway convenience fees.', gradient: 'from-blue-600 to-indigo-800' },
  { code: 'BMTSAFE', desc: 'Free travel insurance coverage of up to ₹10 Lakhs on every ticket.', gradient: 'from-amber-500 to-orange-700' }
];

const TRAVEL_SERVICES = [
  { id: 'food', name: 'Food on Track', category: 'E-Catering', icon: '🍴', desc: 'Hot meals from Domino’s & Haldiram’s delivered at coach seat.', badge: 'Seat Delivery', color: 'orange', action: 'food' },
  { id: 'hotels', name: 'Hotels & Pod Lounges', category: 'Station Stays', icon: '🏨', desc: 'Hourly executive lounges and soundproof pods near platforms.', badge: '200+ Hubs', color: 'blue', action: 'hotels' },
  { id: 'flights', name: 'Connecting Flights', category: 'Air Connect', icon: '✈️', desc: 'Synchronized rail-air combo ticketing with zero layover stress.', badge: 'Rail-Air Combo', color: 'emerald', action: 'flights' },
  { id: 'cabs', name: 'Platform Cabs & Auto', category: 'Transfers', icon: '🚖', desc: 'Pre-book verified platform exit pickup with zero-surge fares.', badge: 'Zero Surge', color: 'amber', action: 'upcoming' },
  { id: 'porter', name: 'Coolie / Porter Booking', category: 'Station Assist', icon: '🧳', desc: 'Pre-book verified railway porters with fixed transparent tariffs.', badge: 'Fixed Tariff', color: 'purple', action: 'upcoming' },
  { id: 'wheelchair', name: 'Wheelchair Assistance', category: 'Accessibility', icon: '♿', desc: 'Free station attendants and buggy escorts for senior citizens.', badge: 'Free Assist', color: 'teal', action: 'upcoming' },
  { id: 'insurance', name: 'Trip Protection & Refund', category: 'Protection', icon: '🛡️', desc: '100% instant refund on waitlist/tatkal with zero penalty.', badge: '100% Refund', color: 'rose', action: 'upcoming' },
  { id: 'radar', name: 'WhatsApp Train Radar', category: 'Smart Alerts', icon: '📱', desc: 'Real-time GPS delays, platform numbers & coach alerts on WhatsApp.', badge: 'Instant GPS', color: 'green', action: 'upcoming' }
];

const PORTAL_CAPABILITIES = [
  "Sub-50ms Fast Tatkal Passenger Autofill ⚡",
  "AI Waitlist Confirmation Probability Forecaster 🔮",
  "100% Instant Refund Directly to Your UPI ID 💳",
  "Live GPS Train Radar & PNR Status Tracking 📱",
  "Zero-Fee Cancellation with BMT Trip Shield 🛡️",
  "Seat-Delivered Hot Meals from Top Brands 🍴",
  "Executive Station Lounges & Luxury Pod Rooms 🏨"
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [recentBookings, setRecentBookings] = useState([]);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Tab states: search | pnr | live | food | hotels | flights
  const [activeTab, setActiveTab] = useState('search');
  
  // PNR Interactive States
  const [pnrInput, setPnrInput] = useState('');
  const [pnrResult, setPnrResult] = useState(null);
  const [pnrLoading, setPnrLoading] = useState(false);

  // Live Track Interactive States (Station entry, NO default train select!)
  const [liveSearchMode, setLiveSearchMode] = useState('stations'); // 'stations' | 'train'
  const [liveFromStation, setLiveFromStation] = useState('');
  const [liveToStation, setLiveToStation] = useState('');
  const [liveTrainQuery, setLiveTrainQuery] = useState('');
  const [liveTrackingLoading, setLiveTrackingLoading] = useState(false);
  const [liveResults, setLiveResults] = useState(null);
  const [selectedLiveTrain, setSelectedLiveTrain] = useState(null);
  const [liveSwapRotated, setLiveSwapRotated] = useState(false);
  const showToast = useToast();

  // Food Interactive States
  const [foodSearchPnr, setFoodSearchPnr] = useState('');
  const [foodMenuVisible, setFoodMenuVisible] = useState(false);
  const [cart, setCart] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Hotel Interactive States
  const [hotelCity, setHotelCity] = useState('New Delhi (NDLS)');
  const [hotelCheckIn, setHotelCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [hotelCheckOut, setHotelCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [hotelGuests, setHotelGuests] = useState('1 Room, 2 Guests');
  const [hotelSearchActive, setHotelSearchActive] = useState(false);

  // Flight Interactive States
  const [flightFrom, setFlightFrom] = useState('New Delhi (DEL)');
  const [flightTo, setFlightTo] = useState('Srinagar (SXR)');
  const [flightDate, setFlightDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [flightSearchActive, setFlightSearchActive] = useState(false);

  // Promotion carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Upcoming feature modal state (Requested by User!)
  const [upcomingService, setUpcomingService] = useState(null);
  const [serviceNotified, setServiceNotified] = useState(false);

  // General Notification Modal
  const [popupMsg, setPopupMsg] = useState(null);

  const setQuota = useSearchStore((s) => s.setQuota);

  // Speed feature modal: 'predictor' | 'refund' | 'cancellation' | 'tatkal' | null
  const [activeSpeedModal, setActiveSpeedModal] = useState(null);

  // AI Predictor interactive states
  const [predictorTab, setPredictorTab] = useState('calc'); // 'calc' | 'pnr'
  const [predictorWl, setPredictorWl] = useState(14);
  const [predictorClass, setPredictorClass] = useState('3A');
  const [predictorPnrInput, setPredictorPnrInput] = useState('1230198765');
  const [predictorPnrData, setPredictorPnrData] = useState(() => predictPnr('1230198765'));

  // Dynamic Portfolio-Style Typewriter States (Rotating website capabilities)
  const [typewriterText, setTypewriterText] = useState('');
  const [capabilityIndex, setCapabilityIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFull = PORTAL_CAPABILITIES[capabilityIndex];
    let timer;

    if (!isDeleting) {
      if (typewriterText.length < currentFull.length) {
        timer = setTimeout(() => {
          setTypewriterText(currentFull.slice(0, typewriterText.length + 1));
        }, 45);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typewriterText.length > 0) {
        timer = setTimeout(() => {
          setTypewriterText(currentFull.slice(0, typewriterText.length - 1));
        }, 25);
      } else {
        setIsDeleting(false);
        setCapabilityIndex((prev) => (prev + 1) % PORTAL_CAPABILITIES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, capabilityIndex]);

  // Tatkal live countdown timer
  const [tatkalTimeLeft, setTatkalTimeLeft] = useState({ ac: '', nonAc: '', acLive: false, nonAcLive: false });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const acTarget = new Date(now);
      acTarget.setHours(10, 0, 0, 0);
      const acLive = now.getHours() >= 10 && now.getHours() < 12;

      const nonAcTarget = new Date(now);
      nonAcTarget.setHours(11, 0, 0, 0);
      const nonAcLive = now.getHours() >= 11 && now.getHours() < 13;

      const formatDiff = (target) => {
        let diff = target - now;
        if (diff < 0) diff += 24 * 60 * 60 * 1000;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
      };

      setTatkalTimeLeft({
        ac: formatDiff(acTarget),
        nonAc: formatDiff(nonAcTarget),
        acLive,
        nonAcLive
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      bookingApi.list(null, 1, 3).then((res) => {
        const data = res.data || res;
        setRecentBookings(data.bookings || []);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % PROMOTION_OFFERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePnrSearch = (e) => {
    e.preventDefault();
    if (pnrInput.length < 10) return;
    
    setPnrLoading(true);
    setPnrResult(null);
    
    setTimeout(() => {
      setPnrLoading(false);
      setPnrResult({
        pnr: pnrInput,
        trainName: '22436 - Varanasi Vande Bharat Express',
        date: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
        class: 'Executive Class (EC)',
        chartStatus: 'CHART PREPARED',
        from: 'NEW DELHI (NDLS)',
        to: 'VARANASI JN (BSB)',
        passengers: [
          { name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Arvind Meena', status: 'CNF (Confirmed)', coach: 'C4', seat: '14 (Window)' },
          { name: 'Rohan Sharma', status: 'CNF (Confirmed)', coach: 'C4', seat: '16 (Aisle)' }
        ],
        probability: '100% Confirmation Probability'
      });
    }, 900);
  };

  const handleSwapLiveStations = () => {
    setLiveSwapRotated(!liveSwapRotated);
    const temp = liveFromStation;
    setLiveFromStation(liveToStation);
    setLiveToStation(temp);
  };

  const handleTrackLive = (e, customFrom, customTo, customTrainQuery) => {
    if (e) e.preventDefault();

    const fromVal = (customFrom !== undefined ? customFrom : liveFromStation)?.trim();
    const toVal = (customTo !== undefined ? customTo : liveToStation)?.trim();
    const trainQ = (customTrainQuery !== undefined ? customTrainQuery : liveTrainQuery)?.trim();

    if (liveSearchMode === 'stations' && (!customTrainQuery || customFrom)) {
      if (!fromVal) {
        showToast('Please enter boarding / From station', 'warning');
        return;
      }
      if (!toVal) {
        showToast('Please enter destination / To station', 'warning');
        return;
      }
      if (fromVal.toLowerCase() === toVal.toLowerCase()) {
        showToast('From and To stations cannot be the same', 'warning');
        return;
      }

      setLiveTrackingLoading(true);
      setLiveResults(null);
      setSelectedLiveTrain(null);

      setTimeout(() => {
        const fromLower = fromVal.toLowerCase();
        const toLower = toVal.toLowerCase();

        const matches = LIVE_TRAINS_DATA.filter((t) => {
          const fromMatches = t.fromName.toLowerCase().includes(fromLower) ||
                              t.fromCode.toLowerCase().includes(fromLower) ||
                              fromLower.includes(t.fromCode.toLowerCase());
          const toMatches = t.toName.toLowerCase().includes(toLower) ||
                            t.toCode.toLowerCase().includes(toLower) ||
                            toLower.includes(t.toCode.toLowerCase());
          return fromMatches && toMatches;
        });

        const finalTrains = matches.length > 0 ? matches : generateLiveTrainForRoute(fromVal, toVal);
        setLiveResults(finalTrains);
        setSelectedLiveTrain(finalTrains[0]);
        setLiveTrackingLoading(false);
      }, 400);
    } else {
      if (!trainQ) {
        showToast('Please enter train number or name (e.g. 22436, Rajdhani)', 'warning');
        return;
      }

      setLiveTrackingLoading(true);
      setLiveResults(null);
      setSelectedLiveTrain(null);

      setTimeout(() => {
        const qLower = trainQ.toLowerCase();
        const matches = LIVE_TRAINS_DATA.filter((t) =>
          t.number.includes(trainQ) ||
          t.name.toLowerCase().includes(qLower) ||
          t.fromCode.toLowerCase().includes(qLower) ||
          t.toCode.toLowerCase().includes(qLower)
        );

        const finalTrains = matches.length > 0 ? matches : generateLiveTrainForRoute('Origin Station', 'Destination Station', trainQ);
        setLiveResults(finalTrains);
        setSelectedLiveTrain(finalTrains[0]);
        setLiveTrackingLoading(false);
      }, 400);
    }
  };

  const handleSelectQuickLiveRoute = (from, to) => {
    setLiveSearchMode('stations');
    setLiveFromStation(from);
    setLiveToStation(to);
    handleTrackLive(null, from, to, null);
  };

  const handleFoodSearch = (e) => {
    e.preventDefault();
    if (foodSearchPnr.length < 10) return;
    setFoodMenuVisible(true);
    setOrderPlaced(false);
  };

  const updateCart = (itemId, change) => {
    setCart((prev) => {
      const qty = (prev[itemId] || 0) + change;
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  };

  const calculateFoodTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = MOCK_FOOD_ITEMS.find((f) => f.id === parseInt(id));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handlePlaceFoodOrder = () => {
    setOrderPlaced(true);
    setCart({});
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFCFE]">
      
      {/* 1. Ambient Hero Canvas (Reduced padding to eliminate huge gaps) */}
      <div className="relative pt-8 pb-8 px-4 overflow-hidden bg-groww-hero border-b border-slate-150">
        
        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Centered Catchy Hero Headline & Subtitle with Portfolio-Grade Aesthetics */}
          <div className="text-center max-w-4xl mx-auto mb-7 animate-fade-in-up">
            
            {/* 1. Opportunity Style Badge (Borderless, clean pill) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 text-slate-700 mb-3.5 group cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 tracking-normal">
                Fast and Reliable Indian Railway Ticketing Portal
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            {/* 2. Main Heading: Clean normal font like Claude (Inter), smaller refined size, and using "and" */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold tracking-tight leading-snug text-slate-900 text-center">
              Next-Gen Express Rail and <span className="text-emerald-600">Smart Tatkal</span> Portal
            </h1>

            {/* 3. Interactive Typewriter Line (Borderless chip, Explore: static in place, content moves forward) */}
            <div className="flex justify-center mt-3.5 mb-2 min-h-[42px]">
              <div className="inline-flex items-center bg-slate-100/80 hover:bg-slate-100 rounded-2xl px-4 py-2 w-full max-w-xl sm:w-[520px] md:w-[580px] text-left transition-colors">
                {/* Static Anchor Tag: Never shifts, stays fixed on the left with zero border */}
                <div className="flex items-center gap-1.5 shrink-0 mr-3 select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-700 tracking-normal">
                    Explore:
                  </span>
                </div>

                {/* Animated Text: Types forward from left to right */}
                <div className="flex-1 flex items-center min-w-0 overflow-hidden text-left">
                  <span className="text-xs sm:text-sm md:text-[15px] font-medium text-slate-800 whitespace-nowrap">
                    {typewriterText}
                  </span>
                  <span className="text-emerald-600 font-bold text-base animate-cursor-blink ml-1 shrink-0">
                    |
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Subtitle */}
            <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium mt-2 text-center leading-relaxed max-w-2xl mx-auto">
              Seamlessly compare schedules across 10,000+ routes, check live PNR status with AI confirmation probabilities, and enjoy guaranteed instant 100% refunds directly to your UPI account.
            </p>
          </div>

          {/* Elevated Multi-Service Hub Card */}
          <div className="glass-card rounded-3xl shadow-card p-3 md:p-5 max-w-4xl mx-auto border border-slate-150 animate-fade-in-up">
            
            {/* Horizontal Service Tab Switcher with Real Icons & High-Contrast Active Styling */}
            <div className="flex border-b border-slate-150 overflow-x-auto scrollbar-none pb-2.5 gap-2 md:justify-around px-1">
              
              {/* Tab 1: Book Tickets */}
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'search'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {/* Train Vector SVG */}
                <svg className={`w-4 h-4 ${activeTab === 'search' ? 'text-white' : 'text-emerald-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="4" y="3" width="16" height="16" rx="2" />
                  <path d="M4 11h16" />
                  <path d="M12 3v8" />
                  <circle cx="8" cy="15" r="1" fill="currentColor" />
                  <circle cx="16" cy="15" r="1" fill="currentColor" />
                </svg>
                <span>Book Tickets</span>
              </button>

              {/* Tab 2: Check PNR */}
              <button
                onClick={() => setActiveTab('pnr')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'pnr'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {/* PNR Barcode Scanner SVG */}
                <svg className={`w-4 h-4 ${activeTab === 'pnr' ? 'text-white' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" />
                </svg>
                <span>Check PNR</span>
              </button>

              {/* Tab 3: Live Running Status */}
              <button
                onClick={() => setActiveTab('live')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'live'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {/* Live Radar Signal SVG */}
                <svg className={`w-4 h-4 ${activeTab === 'live' ? 'text-white' : 'text-indigo-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                <span>Live Running Status</span>
              </button>

              {/* Tab 4: Food on Track */}
              <button
                onClick={() => setActiveTab('food')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'food'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {/* Chef Dining Cloche SVG */}
                <svg className={`w-4 h-4 ${activeTab === 'food' ? 'text-white' : 'text-orange-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M4 14h16M5 14a7 7 0 0114 0M4 17h16" />
                </svg>
                <span>Food on Track</span>
              </button>

              {/* Tab 5: Hotels */}
              <button
                type="button"
                onClick={() => setActiveTab('hotels')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'hotels'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {/* Hotel Building SVG */}
                <svg className={`w-4 h-4 ${activeTab === 'hotels' ? 'text-white' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Hotels &amp; Lounges</span>
              </button>

              {/* Tab 6: Flights */}
              <button
                type="button"
                onClick={() => setActiveTab('flights')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'flights'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {/* Airplane SVG */}
                <svg className={`w-4 h-4 ${activeTab === 'flights' ? 'text-white' : 'text-sky-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Flights</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4">
              
              {/* TAB 1: Search Form */}
              {activeTab === 'search' && (
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-xs">
                  <SearchForm />
                </div>
              )}

              {/* TAB 2: PNR Status Checker */}
              {activeTab === 'pnr' && (
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Check Real-Time PNR Status</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Enter your 10-digit Passenger Name Record (PNR) number from your railway ticket.</p>
                    </div>
                    <Link to="/pnr" className="text-xs font-bold text-emerald-700 hover:underline">
                      Open Dedicated PNR Page &rarr;
                    </Link>
                  </div>

                  <form onSubmit={handlePnrSearch} className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      maxLength={10}
                      value={pnrInput}
                      onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit PNR Number"
                      className="input-field max-w-md font-semibold tracking-widest text-slate-800 text-base"
                      required
                    />
                    <button
                      type="submit"
                      disabled={pnrInput.length < 10 || pnrLoading}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pnrLoading ? 'Checking...' : 'Check Status'}
                    </button>
                  </form>

                  {/* Quick Sample PNR buttons */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400 font-medium">Quick Demo PNR:</span>
                    {['2243612345', '1230198765'].map((demo) => (
                      <button
                        key={demo}
                        type="button"
                        onClick={() => {
                          setPnrInput(demo);
                          setPnrLoading(true);
                          setPnrResult(null);
                          setTimeout(() => {
                            setPnrLoading(false);
                            setPnrResult({
                              pnr: demo,
                              trainName: demo === '2243612345' ? '22436 - Varanasi Vande Bharat Express' : '12301 - Howrah Rajdhani Express',
                              date: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
                              class: 'Executive Class (EC)',
                              chartStatus: 'CHART PREPARED',
                              from: 'NEW DELHI (NDLS)',
                              to: demo === '2243612345' ? 'VARANASI JN (BSB)' : 'HOWRAH JN (HWH)',
                              passengers: [
                                { name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Arvind Meena', status: 'CNF (Confirmed)', coach: 'C4', seat: '14 (Window)' },
                                { name: 'Rohan Sharma', status: 'CNF (Confirmed)', coach: 'C4', seat: '16 (Aisle)' }
                              ],
                              probability: '100% Confirmation Probability'
                            });
                          }, 500);
                        }}
                        className="font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                      >
                        {demo}
                      </button>
                    ))}
                  </div>

                  {pnrLoading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <div className="animate-spin h-8 w-8 border-3 border-slate-200 border-t-emerald-600 rounded-full" />
                      <p className="text-xs text-slate-500 font-semibold">Retrieving live chart logs from CRIS railway servers...</p>
                    </div>
                  )}

                  {pnrResult && (
                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-4 animate-scale-in">
                      <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-3 items-start sm:items-center gap-2">
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">PNR Reference</p>
                          <p className="text-xl font-extrabold text-slate-900 tracking-wider">{pnrResult.pnr}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                          {pnrResult.chartStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400 font-medium">Train Name</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{pnrResult.trainName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Date of Journey</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{pnrResult.date}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">From Station</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{pnrResult.from}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Destination</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{pnrResult.to}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5">Passenger Berths Allotment</p>
                        <div className="space-y-2">
                          {pnrResult.passengers.map((passenger, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                                  {i + 1}
                                </span>
                                <span className="font-bold text-slate-800">{passenger.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[11px]">
                                  {passenger.status}
                                </span>
                                <span className="font-bold text-slate-900">Coach {passenger.coach} / Seat {passenger.seat}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-xl p-3 text-xs font-semibold">
                        <span className="text-base">🔮</span>
                        <span>ConfirmTkt AI Forecast: {pnrResult.probability} (Confirmed berth guaranteed)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Live Train Tracker (NO default train select! User enters stations or train) */}
              {activeTab === 'live' && (
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-xs space-y-5 animate-scale-in">
                  
                  {/* Header & Mode Switcher */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-900">Live Train Running Status</h3>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          GPS Radar Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enter your journey stations to track real-time train movement, delay logs &amp; platform arrivals.
                      </p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setLiveSearchMode('stations')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          liveSearchMode === 'stations'
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>🚉</span>
                        <span>By Stations</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLiveSearchMode('train')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          liveSearchMode === 'train'
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>🔢</span>
                        <span>By Train Number</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Search Form */}
                  <form onSubmit={handleTrackLive} className="space-y-4">
                    {liveSearchMode === 'stations' ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        {/* From Station */}
                        <div className="md:col-span-5">
                          <StationAutocomplete
                            label="Departure Station"
                            value={liveFromStation}
                            onChange={(val) => setLiveFromStation(val)}
                            placeholder="Boarding station or code"
                            icon="🟢"
                          />
                        </div>

                        {/* Swap Button */}
                        <div className="hidden md:flex md:col-span-1 justify-center pb-1">
                          <button
                            type="button"
                            onClick={handleSwapLiveStations}
                            aria-label="Swap Stations"
                            title="Swap Departure and Destination"
                            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 shadow-xs flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform duration-500 ${liveSwapRotated ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        </div>

                        {/* To Station */}
                        <div className="md:col-span-4">
                          <StationAutocomplete
                            label="Destination Station"
                            value={liveToStation}
                            onChange={(val) => setLiveToStation(val)}
                            placeholder="Arrival station or code"
                            icon="🔴"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-2">
                          <button
                            type="submit"
                            disabled={liveTrackingLoading}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {liveTrackingLoading ? (
                              <>
                                <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                                <span>Locating...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                                </svg>
                                <span>Track Trains</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Train Number or Name Input */
                      <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
                        <div className="flex-1 relative">
                          <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🚆</span>
                          <input
                            type="text"
                            value={liveTrainQuery}
                            onChange={(e) => setLiveTrainQuery(e.target.value)}
                            placeholder="Enter 5-digit Train No. or Name (e.g. 22436, Rajdhani, Vande Bharat)"
                            className="input-field pl-10 font-semibold text-slate-800 text-xs sm:text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={liveTrackingLoading}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                        >
                          {liveTrackingLoading ? (
                            <>
                              <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                              <span>Tracking...</span>
                            </>
                          ) : (
                            <>
                              <span>Track Live GPS</span>
                              <span>&rarr;</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Popular Express Corridors 1-Tap Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">
                      Quick Corridors:
                    </span>
                    {[
                      { from: 'New Delhi (NDLS)', to: 'Varanasi Jn (BSB)', label: 'NDLS → BSB (Vande Bharat)' },
                      { from: 'New Delhi (NDLS)', to: 'Howrah Jn (HWH)', label: 'NDLS → HWH (Rajdhani)' },
                      { from: 'New Delhi (NDLS)', to: 'Bhopal Jn / Rani Kamlapati (RKMP)', label: 'NDLS → RKMP (Shatabdi)' },
                      { from: 'Mumbai Central (MMCT)', to: 'New Delhi (NDLS)', label: 'MMCT → NDLS (Tejas Rajdhani)' },
                      { from: 'New Delhi (NDLS)', to: 'Lucknow Charbagh (LKO)', label: 'NDLS → LKO (Swarna Shatabdi)' }
                    ].map((route, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuickLiveRoute(route.from, route.to)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 transition-colors"
                      >
                        {route.label}
                      </button>
                    ))}
                  </div>

                  {/* Loading Indicator */}
                  {liveTrackingLoading && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2 bg-slate-50/50 rounded-2xl border border-slate-150">
                      <div className="animate-spin h-8 w-8 border-3 border-slate-200 border-t-emerald-600 rounded-full" />
                      <p className="text-xs font-bold text-slate-600 animate-pulse">
                        Querying central GPS transponder for real-time train telemetry...
                      </p>
                    </div>
                  )}

                  {/* Results: Matching Trains & Live GPS Route Tracking */}
                  {!liveTrackingLoading && liveResults && liveResults.length > 0 && selectedLiveTrain && (
                    <div className="space-y-4 animate-scale-in">
                      {/* Train Switcher Pills if multiple trains match */}
                      {liveResults.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            Select Train ({liveResults.length}):
                          </span>
                          {liveResults.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedLiveTrain(t)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                selectedLiveTrain.id === t.id
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <span>{t.number}</span>
                              <span>&middot;</span>
                              <span>{t.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Main Live Telemetry Card */}
                      <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-slate-50/80 via-white to-emerald-50/20 space-y-5">
                        
                        {/* Train Info Header */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                {selectedLiveTrain.name}
                              </h4>
                              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                #{selectedLiveTrain.number}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              Route: <span className="font-bold text-slate-700">{selectedLiveTrain.fromName}</span> &rarr; <span className="font-bold text-slate-700">{selectedLiveTrain.toName}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              selectedLiveTrain.delay > 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {selectedLiveTrain.delay > 0 ? `Delayed by ${selectedLiveTrain.delay}m` : '🟢 Running On Time'}
                            </span>
                          </div>
                        </div>

                        {/* Live Location Alert Bar */}
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs font-semibold text-emerald-950">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📍</span>
                            <span>
                              <strong>Currently Departed:</strong> {selectedLiveTrain.currentStation} &middot; Next Stop: <strong>{selectedLiveTrain.nextStation}</strong> ({selectedLiveTrain.platform})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-emerald-800">
                            <span>⚡ Speed: <strong>{selectedLiveTrain.speed}</strong></span>
                            <span>📶 GPS Sync: Just now</span>
                          </div>
                        </div>

                        {/* Station Vertical Progress Tracker */}
                        <div>
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                            Live Station Progress Tracker ({selectedLiveTrain.stops.length} Key Halts)
                          </p>
                          <div className="relative pl-6 space-y-6 pt-1 pb-1">
                            {/* Vertical Line */}
                            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200" />

                            {selectedLiveTrain.stops.map((stop, idx) => {
                              const isCurrent = stop.current || selectedLiveTrain.currentStation === stop.name.split(' (')[0];
                              const isDeparted = stop.departed;

                              return (
                                <div key={idx} className="relative flex items-center justify-between text-xs">
                                  <div className="flex items-center">
                                    {/* Stop Beacon */}
                                    <div className={`absolute -left-[20px] h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
                                      isCurrent
                                        ? 'bg-emerald-600 scale-125 z-10 ring-4 ring-emerald-100 shadow-sm'
                                        : isDeparted
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-300'
                                    }`}>
                                      {isCurrent && (
                                        <span className="absolute h-6 w-6 rounded-full bg-emerald-400/40 animate-ping-slow" />
                                      )}
                                      {isDeparted && !isCurrent && (
                                        <span className="text-[8px] text-white font-bold leading-none">✓</span>
                                      )}
                                    </div>

                                    {/* Station Name & Status */}
                                    <div className="ml-3">
                                      <p className={`font-bold ${isCurrent ? 'text-emerald-900 text-sm' : isDeparted ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {stop.name}
                                      </p>
                                      {isCurrent ? (
                                        <p className="text-[10px] text-emerald-700 font-extrabold uppercase mt-0.5 tracking-wider">
                                          📶 Live Location &middot; Departed {selectedLiveTrain.delay > 0 ? `(+${selectedLiveTrain.delay}m)` : '(Right Time)'}
                                        </p>
                                      ) : isDeparted ? (
                                        <p className="text-[10px] text-slate-400 font-semibold">
                                          Departed {stop.time}
                                        </p>
                                      ) : (
                                        <p className="text-[10px] text-slate-400 font-medium">
                                          Scheduled Arrival: {stop.time}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Platform Info */}
                                  <div className="text-right">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                                      {stop.platform || 'Platform 1'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Booking CTA for this train */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-200 text-xs">
                          <span className="text-slate-500 font-medium">
                            Need a confirmed seat on this express? Check live seat quota &amp; Tatkal availability.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              useSearchStore.getState().setSearchParams(
                                selectedLiveTrain.fromName,
                                selectedLiveTrain.toName,
                                new Date().toISOString().split('T')[0],
                                'GN'
                              );
                              navigate('/search');
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0"
                          >
                            Book This Train &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Initial Empty State (When no stations entered yet) */}
                  {!liveTrackingLoading && !liveResults && (
                    <div className="p-8 text-center bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl mx-auto shadow-2xs">
                        📡
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Enter Stations to Track Live Trains
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Enter your departure and arrival stations above, or choose any quick corridor to inspect real-time GPS locations, delays, and platform stops.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: Food on Track */}
              {activeTab === 'food' && (
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Gourmet Food Delivery on Seat</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Order restaurant-quality hot meals delivered right to your train berth.</p>
                    </div>
                    <Link to="/services" className="text-xs font-bold text-emerald-700 hover:underline">
                      Explore All Catering &rarr;
                    </Link>
                  </div>

                  {!foodMenuVisible ? (
                    <div className="space-y-2">
                      <form onSubmit={handleFoodSearch} className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          maxLength={10}
                          value={foodSearchPnr}
                          onChange={(e) => setFoodSearchPnr(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit PNR for Delivery"
                          className="input-field max-w-md font-semibold tracking-widest text-slate-800 text-base"
                          required
                        />
                        <button
                          type="submit"
                          disabled={foodSearchPnr.length < 10}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          Enter Food Court
                        </button>
                      </form>

                      {/* Quick demo for food */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Quick Demo:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFoodSearchPnr('2243612345');
                            setFoodMenuVisible(true);
                            setOrderPlaced(false);
                          }}
                          className="font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200 transition-colors"
                        >
                          PNR: 2243612345 (Vande Bharat)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-scale-in">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase">Delivery PNR Ref</p>
                          <p className="text-sm font-bold text-slate-800">PNR: {foodSearchPnr}</p>
                        </div>
                        <button
                          onClick={() => { setFoodMenuVisible(false); setCart({}); }}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          Change PNR
                        </button>
                      </div>

                      {orderPlaced ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                          <span className="text-4xl animate-bounce inline-block">🎉</span>
                          <h4 className="font-bold text-emerald-800 text-lg">Meal Booking Confirmed!</h4>
                          <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">
                            Your order has been accepted by BMT Kitchen Hub. Freshly cooked meals will be handed to your coach seat at <strong>Kanpur Central</strong> station stop. Cash on Delivery supported.
                          </p>
                          <button
                            onClick={() => setOrderPlaced(false)}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                          >
                            Order Another Meal
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-3 max-h-[380px] overflow-y-auto pr-2">
                            {MOCK_FOOD_ITEMS.map((food) => (
                              <div key={food.id} className="flex justify-between border border-slate-200 rounded-2xl p-3.5 hover:shadow-card bg-white items-center gap-3 transition-shadow">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{food.icon}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      food.type === 'veg' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                      {food.type.toUpperCase()}
                                    </span>
                                    <span className="font-bold text-slate-800 text-sm">{food.name}</span>
                                    <span className="text-xs text-amber-500 font-bold">⭐ {food.rating}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-snug">{food.desc}</p>
                                  <p className="text-sm font-extrabold text-slate-900">₹{food.price}</p>
                                </div>

                                <div>
                                  {cart[food.id] ? (
                                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50 shadow-xs">
                                      <button onClick={() => updateCart(food.id, -1)} className="px-2.5 py-1 text-slate-600 font-bold hover:bg-slate-200">-</button>
                                      <span className="px-2.5 font-bold text-xs text-slate-800">{cart[food.id]}</span>
                                      <button onClick={() => updateCart(food.id, 1)} className="px-2.5 py-1 text-slate-600 font-bold hover:bg-slate-200">+</button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => updateCart(food.id, 1)}
                                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                    >
                                      ADD +
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 flex flex-col justify-between max-h-[380px]">
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-2 uppercase tracking-wide">Basket Summary</h4>
                              
                              {Object.keys(cart).length === 0 ? (
                                <p className="text-xs text-slate-400 py-12 text-center">Your basket is empty. Select meals to order.</p>
                              ) : (
                                <div className="space-y-3 py-3 overflow-y-auto max-h-[180px]">
                                  {Object.entries(cart).map(([id, qty]) => {
                                    const item = MOCK_FOOD_ITEMS.find((f) => f.id === parseInt(id));
                                    if (!item) return null;
                                    return (
                                      <div key={id} className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-700">{item.name} <span className="text-slate-400 font-normal">x {qty}</span></span>
                                        <span className="font-extrabold text-slate-900">₹{item.price * qty}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {Object.keys(cart).length > 0 && (
                              <div className="border-t border-slate-200 pt-3 space-y-3">
                                <div className="flex justify-between text-xs font-bold text-slate-800">
                                  <span>Total (Incl. GST)</span>
                                  <span className="text-base text-emerald-700 font-extrabold">₹{calculateFoodTotal()}</span>
                                </div>
                                <button
                                  onClick={handlePlaceFoodOrder}
                                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all text-center"
                                >
                                  Place Cash on Delivery Order
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Hotels & Station Lounges */}
              {activeTab === 'hotels' && (
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-xs space-y-5 animate-scale-in">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Railway Station Retiring Rooms &amp; Executive Lounges</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Reserve verified AC rooms, soundproof pods, and executive lounges inside railway premises.</p>
                    </div>
                    <Link to="/services" className="text-xs font-bold text-emerald-700 hover:underline">
                      View All 200+ Station Stays &rarr;
                    </Link>
                  </div>

                  {/* Search Bar for Hotels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Station / City</label>
                      <input
                        type="text"
                        value={hotelCity}
                        onChange={(e) => setHotelCity(e.target.value)}
                        placeholder="Station or City Name"
                        className="input-field text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Check-in</label>
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        className="input-field text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Check-out</label>
                      <input
                        type="date"
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        className="input-field text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Guests &amp; Rooms</label>
                      <select
                        value={hotelGuests}
                        onChange={(e) => setHotelGuests(e.target.value)}
                        className="input-field text-xs font-semibold text-slate-800"
                      >
                        <option>1 Room, 1 Guest</option>
                        <option>1 Room, 2 Guests</option>
                        <option>2 Rooms, 4 Guests</option>
                        <option>Executive Pod (Single)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Station Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Popular Station Hubs:</span>
                    {['New Delhi (NDLS)', 'Varanasi Jn (BSB)', 'Mumbai Central (MMCT)', 'Bengaluru City (SBC)'].map((hub) => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => { setHotelCity(hub); setHotelSearchActive(true); }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                          hotelCity === hub ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {hub}
                      </button>
                    ))}
                  </div>

                  {/* Featured Stays Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-white hover:shadow-card transition-all space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">🏨</span>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">⭐ 4.8</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">BMT Executive Pod Lounge</h4>
                        <p className="text-xs text-slate-500">Platform #1, New Delhi (NDLS) • Soundproof pods with AC &amp; high-speed WiFi</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Hourly Rate</p>
                          <p className="font-extrabold text-slate-900 text-sm">₹899 <span className="text-[10px] text-slate-500 font-normal">/ 6 hrs</span></p>
                        </div>
                        <Link to="/services" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs">
                          Book Pod
                        </Link>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-white hover:shadow-card transition-all space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">🛏️</span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">⭐ 4.7</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Rail Yatri Comfort Hotel</h4>
                        <p className="text-xs text-slate-500">100m from Station Gate 2, Mumbai Central • 24x7 check-in, hot shower</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Nightly Rate</p>
                          <p className="font-extrabold text-slate-900 text-sm">₹1,499 <span className="text-[10px] text-slate-500 font-normal">/ night</span></p>
                        </div>
                        <Link to="/services" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs">
                          Reserve
                        </Link>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-white hover:shadow-card transition-all space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">🏛️</span>
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">⭐ 4.9</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Heritage Retiring Rooms</h4>
                        <p className="text-xs text-slate-500">Varanasi Cantt (BSB) • Authentic Indian vegetarian catering &amp; locker facility</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Nightly Rate</p>
                          <p className="font-extrabold text-slate-900 text-sm">₹1,199 <span className="text-[10px] text-slate-500 font-normal">/ night</span></p>
                        </div>
                        <Link to="/services" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs">
                          Reserve
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Connecting Flights */}
              {activeTab === 'flights' && (
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-xs space-y-5 animate-scale-in">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Multi-Modal Rail + Flight Connect</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Combine express trains with domestic flights for faster journeys with guaranteed layover connections.</p>
                    </div>
                    <Link to="/services" className="text-xs font-bold text-emerald-700 hover:underline">
                      Explore Rail-Air Combos &rarr;
                    </Link>
                  </div>

                  {/* Flight Search Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Departure Hub</label>
                      <input
                        type="text"
                        value={flightFrom}
                        onChange={(e) => setFlightFrom(e.target.value)}
                        placeholder="Origin Rail/Air City"
                        className="input-field text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Destination</label>
                      <input
                        type="text"
                        value={flightTo}
                        onChange={(e) => setFlightTo(e.target.value)}
                        placeholder="Final Airport / City"
                        className="input-field text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Travel Date</label>
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="input-field text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setFlightSearchActive(true)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Find Combos</span>
                      </button>
                    </div>
                  </div>

                  {/* Popular Combos */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommended Rail-Air Synchronized Routes</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-white hover:shadow-card transition-all flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">Delhi &rarr; Amritsar (Train) + Flight to Srinagar</span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Save ₹1,200</span>
                          </div>
                          <p className="text-xs text-slate-500">6h Total Duration • Free airport rail-shuttle transfer included</p>
                        </div>
                        <Link to="/services" className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0 ml-3">
                          Select
                        </Link>
                      </div>

                      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-white hover:shadow-card transition-all flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">Mumbai &rarr; Goa (Vande Bharat) + Flight to Kochi</span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Save ₹850</span>
                          </div>
                          <p className="text-xs text-slate-500">4h 30m Duration • Priority baggage check-in guarantee</p>
                        </div>
                        <Link to="/services" className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0 ml-3">
                          Select
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated High-Speed Train Track (Engine leading in front, 4 coaches trailing behind!) */}
          <div className="w-full max-w-4xl mx-auto mt-5 pointer-events-none hidden md:block">
            <div className="relative h-8 border-b border-dashed border-emerald-300/80 overflow-hidden">
              <div className="animate-train-glide absolute bottom-0.5 flex items-end">
                {/* Coach 4 (Tail Guard Coach with Red Blinking Beacon) */}
                <div className="relative h-5 w-16 bg-gradient-to-r from-emerald-700 to-teal-700 border border-emerald-800 rounded-l-md flex items-center justify-around px-1 shadow-xs shrink-0">
                  <span className="absolute -left-1 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="absolute -left-1 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-600" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="absolute -bottom-1 left-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                  <div className="absolute -bottom-1 right-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                </div>

                <div className="w-1.5 h-1 bg-slate-600 my-auto shrink-0" />

                {/* Coach 3 (Sleeper Coach) */}
                <div className="relative h-5 w-16 bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-700 rounded-xs flex items-center justify-around px-1 shadow-xs shrink-0">
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="absolute -bottom-1 left-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                  <div className="absolute -bottom-1 right-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                </div>

                <div className="w-1.5 h-1 bg-slate-600 my-auto shrink-0" />

                {/* Coach 2 (Pantry / Buffet Car) */}
                <div className="relative h-5 w-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border border-emerald-700 rounded-xs flex items-center justify-around px-1 shadow-xs shrink-0">
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="absolute -bottom-1 left-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                  <div className="absolute -bottom-1 right-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                </div>

                <div className="w-1.5 h-1 bg-slate-600 my-auto shrink-0" />

                {/* Coach 1 (Executive AC Chair Car) */}
                <div className="relative h-5 w-16 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 border border-emerald-700 rounded-xs flex items-center justify-around px-1 shadow-xs shrink-0">
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="w-2.5 h-2 bg-amber-100 rounded-xs border border-emerald-900/30" />
                  <div className="absolute -bottom-1 left-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                  <div className="absolute -bottom-1 right-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-600" />
                  </div>
                </div>

                <div className="w-1.5 h-1 bg-slate-600 my-auto shrink-0" />

                {/* 5. LOCOMOTIVE ENGINE (LEADING IN FRONT AT THE RIGHT!) */}
                <div className="relative shrink-0 flex translate-y-1 items-center">
                  <svg className="w-24 h-7 text-emerald-600 drop-shadow-sm" viewBox="0 0 120 30" fill="currentColor">
                    {/* Aerodynamic bullet train nose pointing right */}
                    <path d="M0 24 L0 8 L88 8 C104 8 114 18 118 24 Z" />
                    {/* Dark cockpit windshield */}
                    <path d="M82 10 L94 10 C102 10 108 17 110 20 L82 20 Z" fill="#0f172a" />
                    {/* Passenger / crew windows */}
                    <rect x="15" y="11" width="14" height="6" rx="1" fill="#ffffff" />
                    <rect x="35" y="11" width="14" height="6" rx="1" fill="#ffffff" />
                    <rect x="55" y="11" width="14" height="6" rx="1" fill="#ffffff" />
                    {/* Front Headlight with glow */}
                    <circle cx="114" cy="22" r="2.5" fill="#fef08a" />
                    {/* Bogie Wheels */}
                    <circle cx="20" cy="25" r="3.2" fill="#0f172a" />
                    <circle cx="35" cy="25" r="3.2" fill="#0f172a" />
                    <circle cx="75" cy="25" r="3.2" fill="#0f172a" />
                    <circle cx="95" cy="25" r="3.2" fill="#0f172a" />
                  </svg>
                  {/* Subtle forward beam of light */}
                  <div className="w-8 h-3 bg-gradient-to-r from-amber-200/50 to-transparent -ml-2 rounded-r-full blur-2xs pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Promotional Carousel Banner with Copy Code (Clean non-overlapping margin) */}
      <div className="max-w-5xl mx-auto px-4 my-5 relative z-10">
        <div className={`rounded-3xl p-5 md:p-6 text-white shadow-card-hover bg-gradient-to-r ${PROMOTION_OFFERS[carouselIndex].gradient} transition-all duration-700 ease-in-out`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                Exclusive Campaign
              </span>
              <p className="font-extrabold text-lg md:text-xl leading-snug">
                {PROMOTION_OFFERS[carouselIndex].desc}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopyCode(PROMOTION_OFFERS[carouselIndex].code)}
                className="bg-white text-slate-900 hover:bg-slate-50 font-extrabold text-xs px-3.5 py-2 rounded-xl tracking-wider shadow-sm flex items-center gap-2 transition-transform active:scale-95"
              >
                <span>{copiedCode === PROMOTION_OFFERS[carouselIndex].code ? '✓ Copied' : PROMOTION_OFFERS[carouselIndex].code}</span>
                <span className="text-xs text-slate-400">📋</span>
              </button>
              
              <div className="flex gap-1.5">
                {PROMOTION_OFFERS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NEW: Complete Travel Ecosystem (Compact cards + 8 features + upcoming feature notice) */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Beyond Train Ticketing
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Complete Rail Travel Ecosystem
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Everything for a seamless journey: hot meals, station pod stays, connecting flights, coolie bookings &amp; more.
            </p>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            Explore All Services &rarr;
          </Link>
        </div>

        {/* 8 Compact Service Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TRAVEL_SERVICES.map((s) => (
            <div
              key={s.id}
              className="p-3.5 sm:p-4 bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-card-hover rounded-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-150 group-hover:scale-105 transition-transform">
                    {s.icon}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                    {s.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                    {s.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                    {s.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (s.action === 'food') {
                      setActiveTab('food');
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    } else if (s.action === 'hotels') {
                      setActiveTab('hotels');
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    } else if (s.action === 'flights') {
                      setActiveTab('flights');
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    } else {
                      setUpcomingService(s);
                      setServiceNotified(false);
                    }
                  }}
                  className="w-full py-1.5 bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all text-center"
                >
                  {s.action === 'food' ? 'Order Food' : s.action === 'hotels' ? 'View Stays' : s.action === 'flights' ? 'Find Flights' : 'Explore Service'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Feature Update Modal (Requested by User!) */}
      {upcomingService && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
          onClick={() => setUpcomingService(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-xs">
              {upcomingService.icon}
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                🚀 Upcoming Feature Update · v2.4
              </span>
              <h3 className="font-extrabold text-xl text-slate-900 mt-2">
                {upcomingService.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5 max-w-sm mx-auto">
                We are actively integrating this feature with the official Indian Railway central network (CRIS) and authorized partner networks. This will be added in our upcoming update!
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 font-semibold">
              ⏳ Integration testing in progress for zero-delay bookings. Thank you for your patience!
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setServiceNotified(true)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                  serviceNotified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                }`}
              >
                {serviceNotified ? '✓ You are on the priority launch list!' : 'Notify Me When Live'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUpcomingService(null);
                  setServiceNotified(false);
                }}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Dynamic Conditional Section: Logged In vs Guest */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full">
        {isAuthenticated ? (
          /* LOGGED IN USER VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up">
            
            {/* Panel 1: Upcoming Travel & Actions */}
            <div className="card bg-white border border-slate-200/80 p-6 md:p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Upcoming Travel
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-1 tracking-tight">Active Journey Board</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Departing in 14h
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Train</p>
                    <p className="font-black text-slate-800 text-sm">Vande Bharat Express (22436)</p>
                    <p className="text-slate-600 font-medium">NDLS &rarr; BSB | Coach C4, Seat 14 (Window)</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status</p>
                    <p className="font-black text-emerald-600 text-sm">CNF (Confirmed)</p>
                    <p className="text-slate-500">Leaves tomorrow 06:00 AM</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <button onClick={() => setPopupMsg({ title: 'Download Ticket PDF', text: 'Preparing high-resolution e-ticket invoice. PDF document is downloading...' })} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all">
                    🎫 E-Ticket
                  </button>
                  <button onClick={() => setPopupMsg({ title: 'TDR Filing Center', text: 'TDR applications are accepted up to 4 hours post departure time. Connecting to BooK my Train TDR portal...' })} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all">
                    📝 File TDR
                  </button>
                  <button onClick={() => setPopupMsg({ title: 'Instant Refund Status', text: 'Zero pending refunds. Last transaction was settled back to original UPI payment source.' })} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all">
                    ⚡ Refund Check
                  </button>
                  <button onClick={() => setPopupMsg({ title: 'Wheelchair / Porter Help', text: 'Station assistance request registered for New Delhi station (NDLS). Porter contact details sent via SMS.' })} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all">
                    ♿ Station Help
                  </button>
                </div>
              </div>
            </div>

            {/* Panel 2: Loyalty Rewards Wallet */}
            <div className="card bg-white border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Your Loyalty Wallet</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Collect BMT reward coins on every booking and unlock perks.</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <span>👑</span> Gold Member
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">1,450</span>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">BMT Coins</span>
                </div>

                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-600">
                    <span>Points to Platinum Level</span>
                    <span>150 XP needed</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => setPopupMsg({ title: 'Complimentary Meal Voucher', text: 'Voucher BMT-FOOD100 applied to your profile. Redeem it in Food on Track tab.' })} className="p-3 border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left rounded-xl transition-all flex items-center justify-between">
                  <div className="text-xs font-bold">
                    <p className="text-slate-800">Free Catering Thali</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Claim voucher</p>
                  </div>
                  <span className="text-lg">🍱</span>
                </button>
                <button onClick={() => setPopupMsg({ title: 'Zero Convenience Pass', text: 'You have 2 active Zero Convenience Fee passes. Automatically applied on checkout.' })} className="p-3 border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left rounded-xl transition-all flex items-center justify-between">
                  <div className="text-xs font-bold">
                    <p className="text-slate-800">Zero Convenience Pass</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Active (2 passes)</p>
                  </div>
                  <span className="text-lg">🎫</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* GUEST / LOGGED-OUT USER VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up">
            
            {/* Panel 1: Join BMT Club CTA (Span 2) */}
            <div className="lg:col-span-2 card bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white relative overflow-hidden p-6 md:p-8 flex flex-col justify-between shadow-card-hover border-none">
              <div className="space-y-4">
                <span className="inline-block bg-emerald-600 text-white font-extrabold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                  Passenger Benefits Club
                </span>
                <h3 className="font-extrabold text-2xl md:text-3xl tracking-tight leading-tight">
                  Unlock Flat 15% Off Your First Train Booking
                </h3>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-lg">
                  Join BooK my Train today. Save companion passenger details for lightning checkouts, predict confirmation odds on waitlist tickets, and enjoy instant refunds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10 mt-6">
                <Link to="/login?tab=register" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-center text-xs rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all">
                  Register Free Account
                </Link>
                <Link to="/login" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-center text-xs rounded-xl transition-colors">
                  Sign In to Profile
                </Link>
              </div>
            </div>

            {/* Panel 2: Trending Route Deals */}
            <div className="card bg-white border border-slate-200/80 p-6 flex flex-col justify-between shadow-card">
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 tracking-tight text-base">Trending Route Deals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Explore weekend getaways at guaranteed lowest rail fares.</p>
                
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
                    <div>
                      <p className="font-bold text-slate-800">Delhi &rarr; Jaipur</p>
                      <p className="text-[10px] text-slate-400">AC Chair Car daily service</p>
                    </div>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">From ₹190</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
                    <div>
                      <p className="font-bold text-slate-800">Mumbai &rarr; Goa</p>
                      <p className="text-[10px] text-slate-400">Weekly Sleeper Express</p>
                    </div>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">From ₹340</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-1">
                    <div>
                      <p className="font-bold text-slate-800">Bangalore &rarr; Mysore</p>
                      <p className="text-[10px] text-slate-400">Daily Shatabdi connection</p>
                    </div>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">From ₹125</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors text-center mt-3"
              >
                Search Fares Above &uarr;
              </button>
            </div>

          </div>
        )}
      </div>

      {/* 5. Core Value Propositions ("Why Book With BMT - Engineered For Speed") */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
            ⚡ Engineered For Speed · 99.98% Gateway Uptime
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3">Why Travel with BooK my Train?</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">High-throughput Indian Railway architecture designed to be blisteringly fast, transparent, and passenger-first.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Card 1: AI Waitlist Predictor */}
          <div
            onClick={() => setActiveSpeedModal('predictor')}
            className="card group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl p-5 cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white"
          >
            <div>
              <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-1 flex items-center justify-center group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-sm overflow-hidden">
                <img src="/ai_predictor.jpg" alt="AI Waitlist Predictor" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    96.4% ACCURACY
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    ✨ Neural AI
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  AI Waitlist Predictor
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Know real mathematical probability of your RAC or waitlisted ticket getting confirmed before paying a single rupee.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Launch Live Predictor</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 2: Instant Refunds */}
          <div
            onClick={() => setActiveSpeedModal('refund')}
            className="card group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl p-5 cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white"
          >
            <div>
              <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-1 flex items-center justify-center group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-sm overflow-hidden">
                <img src="/instant_refund.jpg" alt="Instant Refunds" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    &lt; 60s UPI ROLLBACK
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    ⚡ NPCI Switch
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  Instant Refunds
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cancel anytime prior to chart preparation and receive an instant 100% automated refund settled straight to your UPI ID.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Refund Portal &amp; Cancel</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 3: Free Cancellation Pass */}
          <div
            onClick={() => setActiveSpeedModal('cancellation')}
            className="card group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl p-5 cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white"
          >
            <div>
              <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-1 flex items-center justify-center group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-sm overflow-hidden">
                <img src="/free_cancellation.jpg" alt="Free Cancellation Pass" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ZERO DEDUCTION
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    🛡️ Trip Shield
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  Free Cancellation Pass
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Opt for BMT Trip Shield at checkout to eliminate all clerkage and railway cancellation deductions completely.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>View Zero-Fee Pass</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 4: Fast Tatkal Engine */}
          <div
            onClick={() => setActiveSpeedModal('tatkal')}
            className="card group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl p-5 cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white"
          >
            <div>
              <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-1 flex items-center justify-center group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-sm overflow-hidden">
                <img src="/fast_tatkal.jpg" alt="Fast Tatkal Engine" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                    SUB-50ms SYNC
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    🚀 10 &amp; 11 AM Rush
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  Fast Tatkal Engine
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pre-filled master passenger list with one-tap checkout engine built specifically for the 10:00 AM &amp; 11:00 AM rush.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Launch Tatkal Rush</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>
        </div>

        {/* ─── MODAL 1: AI WAITLIST PREDICTOR TOOL ─── */}
        {activeSpeedModal === 'predictor' && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
            onClick={() => setActiveSpeedModal(null)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-scale-in relative text-slate-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img src="/ai_predictor.jpg" alt="AI Predictor" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ✨ Mathematical Confirmation Model
                    </span>
                    <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                      AI Waitlist Predictor
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSpeedModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
                >
                  &times;
                </button>
              </div>

              {/* Predictor Mode Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPredictorTab('calc')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    predictorTab === 'calc' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🧮 Calculator by Waitlist #
                </button>
                <button
                  type="button"
                  onClick={() => setPredictorTab('pnr')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    predictorTab === 'pnr' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔍 Check Any 10-Digit PNR
                </button>
              </div>

              {predictorTab === 'calc' ? (
                /* Interactive Waitlist Slider & Class Picker */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Coach Class:
                      </label>
                      <select
                        value={predictorClass}
                        onChange={(e) => setPredictorClass(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="3A">3 Tier AC (3A)</option>
                        <option value="2A">2 Tier AC (2A)</option>
                        <option value="1A">First AC (1A)</option>
                        <option value="SL">Sleeper Class (SL)</option>
                        <option value="CC">AC Chair Car (CC)</option>
                        <option value="EC">Executive Class (EC)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Waitlist Position:
                        </label>
                        <span className="font-mono font-black text-emerald-700 text-xs">
                          WL {predictorWl}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={80}
                        value={predictorWl}
                        onChange={(e) => setPredictorWl(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                      />
                    </div>
                  </div>

                  {/* Calculated Live Gauge Result */}
                  {(() => {
                    const forecast = predictWaitlist('12301', predictorClass, `WL ${predictorWl}`);
                    return (
                      <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                              Predicted Confirmation Probability
                            </span>
                            <h4 className="text-3xl font-black mt-0.5 text-white">
                              {forecast.probability}%
                              <span className={`text-xs uppercase font-extrabold ml-2.5 px-2 py-0.5 rounded ${
                                forecast.probability >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                forecast.probability >= 55 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                {forecast.level}
                              </span>
                            </h4>
                          </div>
                          <span className="text-3xl">🔮</span>
                        </div>

                        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              forecast.probability >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-300' :
                              forecast.probability >= 55 ? 'bg-gradient-to-r from-amber-500 to-yellow-300' :
                              'bg-gradient-to-r from-rose-500 to-orange-400'
                            }`}
                            style={{ width: `${forecast.probability}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {forecast.recommendation}
                        </p>

                        <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
                          {forecast.factors.map((f, i) => (
                            <p key={i}>&bull; {f}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* PNR Test Input Mode */
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={10}
                      value={predictorPnrInput}
                      onChange={(e) => setPredictorPnrInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit PNR"
                      className="input-field font-mono font-bold text-sm tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setPredictorPnrData(predictPnr(predictorPnrInput))}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Analyze
                    </button>
                  </div>

                  {predictorPnrData && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 text-sm">{predictorPnrData.trainName}</span>
                        <span className="font-extrabold text-emerald-700 text-base">{predictorPnrData.prediction.probability}% Chance</span>
                      </div>
                      <p className="text-slate-600">Current: <strong>{predictorPnrData.passengers[0]?.status}</strong> &middot; {predictorPnrData.chartStatus}</p>
                      <p className="text-slate-500">{predictorPnrData.prediction.recommendation}</p>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSpeedModal(null);
                          navigate(`/pnr?pnr=${predictorPnrData.pnr}`);
                        }}
                        className="w-full mt-2 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-xl transition-colors text-center"
                      >
                        Open Full Live PNR Status Page &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSpeedModal(null);
                    navigate('/pnr');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Go to Live PNR Portal &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSpeedModal(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Search Available Trains &uarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 2: INSTANT REFUNDS TERMINAL ─── */}
        {activeSpeedModal === 'refund' && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
            onClick={() => setActiveSpeedModal(null)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scale-in relative text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img src="/instant_refund.jpg" alt="Instant Refunds" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ⚡ &lt; 60s UPI Rollback
                    </span>
                    <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                      Instant Refund Pipeline
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSpeedModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
                >
                  &times;
                </button>
              </div>

              {/* Real Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Settlement</p>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">24.6s</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">NPCI Switch</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">Online</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Automation</p>
                  <p className="text-lg font-black text-indigo-700 mt-0.5">100%</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-900 text-sm">How Instant Refunds Work:</p>
                <ol className="space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>Visit <strong>My Bookings</strong> and click <strong>Cancel &amp; Refund</strong> on any confirmed or waitlisted ticket.</li>
                  <li>Our saga refund orchestrator releases your berths and commands an instant reversal through the NPCI UPI switch.</li>
                  <li>Funds appear in your original bank account/UPI VPA within seconds with a live transaction reference.</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSpeedModal(null);
                  navigate('/bookings');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>Go to My Bookings to Cancel &amp; Claim Refund &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── MODAL 3: FREE CANCELLATION PASS (BMT TRIP SHIELD) ─── */}
        {activeSpeedModal === 'cancellation' && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
            onClick={() => setActiveSpeedModal(null)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scale-in relative text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img src="/free_cancellation.jpg" alt="Free Cancellation" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      🛡️ Zero Deduction Shield
                    </span>
                    <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                      BMT Trip Shield Pass
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSpeedModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
                >
                  &times;
                </button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 text-xs">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 text-left font-bold">Coach Class</th>
                      <th className="py-2.5 px-3 text-center font-bold text-rose-600">Standard Deduction</th>
                      <th className="py-2.5 px-3 text-center font-extrabold text-emerald-700 bg-emerald-50">With Trip Shield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 font-semibold">1A / Executive (EC)</td>
                      <td className="py-2 px-3 text-center font-bold text-rose-500">₹240 / ticket</td>
                      <td className="py-2 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">₹0 (100% Refund)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">2 Tier AC (2A)</td>
                      <td className="py-2 px-3 text-center font-bold text-rose-500">₹200 / ticket</td>
                      <td className="py-2 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">₹0 (100% Refund)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">3 Tier AC (3A / 3E)</td>
                      <td className="py-2 px-3 text-center font-bold text-rose-500">₹180 / ticket</td>
                      <td className="py-2 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">₹0 (100% Refund)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Sleeper Class (SL)</td>
                      <td className="py-2 px-3 text-center font-bold text-rose-500">₹120 / ticket</td>
                      <td className="py-2 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">₹0 (100% Refund)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Waitlist / RAC</td>
                      <td className="py-2 px-3 text-center font-bold text-rose-500">₹60 / ticket</td>
                      <td className="py-2 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">₹0 (100% Refund)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-slate-700">
                <p className="font-bold text-emerald-950 mb-0.5">How to Activate:</p>
                <p className="text-slate-600 leading-relaxed">
                  Simply check the <strong>BMT Trip Shield</strong> box on the checkout page for just ₹49/passenger to unlock complete peace of mind.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSpeedModal(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                Search Trains &amp; Book with Free Cancellation &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ─── MODAL 4: FAST TATKAL ENGINE LAUNCHPAD ─── */}
        {activeSpeedModal === 'tatkal' && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
            onClick={() => setActiveSpeedModal(null)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scale-in relative text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img src="/fast_tatkal.jpg" alt="Fast Tatkal" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      🚀 Sub-50ms Rush Engine
                    </span>
                    <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                      Fast Tatkal Launchpad
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSpeedModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
                >
                  &times;
                </button>
              </div>

              {/* Live Countdown Clocks */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    AC Classes Tatkal
                  </span>
                  <p className="text-xl font-mono font-black text-white">
                    {tatkalTimeLeft.acLive ? '🔥 BOOKING LIVE' : tatkalTimeLeft.ac}
                  </p>
                  <p className="text-[10px] text-slate-400">Daily 10:00 AM Rush</p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Non-AC / Sleeper Tatkal
                  </span>
                  <p className="text-xl font-mono font-black text-white">
                    {tatkalTimeLeft.nonAcLive ? '🔥 BOOKING LIVE' : tatkalTimeLeft.nonAc}
                  </p>
                  <p className="text-[10px] text-slate-400">Daily 11:00 AM Rush</p>
                </div>
              </div>

              {/* Fast Tatkal Advantages */}
              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-900 text-sm">Tatkal Advantage with BooK my Train:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                    <p className="font-bold text-slate-900">⚡ 1-Tap Passenger Autofill</p>
                    <p className="text-[11px] text-slate-500">Master passengers loaded in 24ms with zero typing.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                    <p className="font-bold text-slate-900">🔒 Direct Gateway Sync</p>
                    <p className="text-[11px] text-slate-500">Bypasses bank OTP delays with instant UPI authorization.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSpeedModal(null);
                    navigate('/profile');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Manage Master Passengers &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuota('TQ');
                    setActiveSpeedModal(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>⚡</span>
                  <span>Search Tatkal Quota Trains &uarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Special Luxury & Tourist Trains Showcase */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Indian Rail Heritage
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Explore Premium Indian Trains</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Embark on legendary rail journeys and discover cultural heritage across the nation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-0 overflow-hidden border border-slate-200/80 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="relative overflow-hidden h-52 bg-slate-100 flex items-center justify-center">
                <img 
                  src="/vande_bharat.jpg" 
                  alt="Vande Bharat Express" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-emerald-600 text-white font-extrabold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                  Modern Fast Rail
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base">Vande Bharat Express</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  India's first indigenous semi-high speed train set equipped with GPS passenger info, rotating executive seats, CCTV security, and bio-vacuum toilets.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50/50">
              <span>Routes: All Key Metros</span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">Chair Car &amp; EC</span>
            </div>
          </div>

          <div className="card p-0 overflow-hidden border border-slate-200/80 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="relative overflow-hidden h-52 bg-slate-100 flex items-center justify-center">
                <img 
                  src="/palace_on_wheels.jpg" 
                  alt="Palace on Wheels" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-amber-600 text-white font-extrabold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                  Heritage Luxury
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base">Palace on Wheels</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Experience royal Rajasthan onboard cabins themed around ancient princely states. Deluxe dining saloons, spa lounges, and personal Khidmatgar attendants.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50/50">
              <span>Duration: 7 Nights Tour</span>
              <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded">Premium Tour Suite</span>
            </div>
          </div>

          <div className="card p-0 overflow-hidden border border-slate-200/80 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="relative overflow-hidden h-52 bg-slate-100 flex items-center justify-center">
                <img 
                  src="/nilgiri_toy_train.jpg" 
                  alt="Nilgiri Mountain Toy Train" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-teal-600 text-white font-extrabold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                  Scenic Mountain Rail
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base">Nilgiri Mountain Railway</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  UNESCO World Heritage steam train navigating lush valleys, 208 curves, 16 tunnels, and steep rack-rail systems in Tamil Nadu blue hills.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50/50">
              <span>Location: Ooty Scenic Hills</span>
              <span className="text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded">Steam Locomotive</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Recent Bookings Block (When user is logged in) */}
      {isAuthenticated && recentBookings.length > 0 && (
        <div className="bg-slate-50/80 py-12 border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Recent Bookings</h2>
                <p className="text-xs text-slate-500">Quickly review tickets and confirmation status logs.</p>
              </div>
              <Link to="/bookings" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 border border-slate-300 bg-white rounded-xl px-4 py-2 hover:bg-slate-50 transition-all shadow-xs">
                View All Bookings &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl shadow-card border border-slate-150 p-4 hover:shadow-card-hover transition-shadow">
                  <BookingCard booking={b} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Mobile App & Dedicated Platform Banner */}
      <div className="bg-white py-12 md:py-14 px-4 border-t border-slate-150 relative">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative z-10">
          
          {/* Left Description Column */}
          <div className="space-y-3.5 flex-1 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] sm:text-[11px] tracking-wider px-3 py-1 rounded-full uppercase border border-emerald-200/70 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ✦ NEXT-GEN RAIL TICKETING APP
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight text-slate-900 tracking-tight">
              Experience BooK my Train <span className="text-emerald-600">Anywhere, on Any Device</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Skip the browser queues and enjoy lightning-fast bookings with our dedicated high-performance app. Designed for sub-second Tatkal checkouts, instant 100% UPI refunds, offline ticket access during poor network coverage, and real-time live platform announcements directly on your home screen.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold bg-slate-50/90 px-3 py-2 rounded-xl border border-slate-200/70">
                <span className="text-emerald-600 text-base">⚡</span>
                <span>Sub-50ms Tatkal Engine</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold bg-slate-50/90 px-3 py-2 rounded-xl border border-slate-200/70">
                <span className="text-emerald-600 text-base">📶</span>
                <span>Offline Ticket Pass &amp; PNR</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold bg-slate-50/90 px-3 py-2 rounded-xl border border-slate-200/70">
                <span className="text-emerald-600 text-base">🔔</span>
                <span>Live Platform &amp; Delay Alerts</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold bg-slate-50/90 px-3 py-2 rounded-xl border border-slate-200/70">
                <span className="text-emerald-600 text-base">🛡️</span>
                <span>Zero-Fee UPI Cancellations</span>
              </div>
            </div>
          </div>

          {/* Interactive App Download Showcase Card (Directly adjacent with balanced gap) */}
          <div className="w-full sm:w-[320px] md:w-[340px] shrink-0">
            <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 border border-emerald-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-950/10 space-y-3.5 text-center">
              
              {/* App Identity Row */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/25">
                  🚅
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">BooK my Train</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">v2.4</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="text-amber-500">★★★★★</span>
                    <span>4.9 (140K+ Travelers)</span>
                  </p>
                </div>
              </div>

              {/* Supported Platforms Chips */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-600 font-bold flex-wrap">
                <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">Android</span>
                <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">iOS</span>
                <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">Windows</span>
                <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">macOS</span>
              </div>

              {/* Prominent Download Button */}
              <button 
                onClick={() => setInstallModalOpen(true)}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white rounded-2xl py-3.5 px-5 text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
              >
                <svg className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download App</span>
              </button>

              {/* Guarantee Microtext */}
              <p className="text-[10px] text-slate-500 font-semibold">
                ⚡ 1-Click Instant Install • Zero Store Wait • 100% Free
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 9. General Notification Modal */}
      {popupMsg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-150 rounded-3xl max-w-sm w-full p-6 shadow-card-hover space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-emerald-600">
              <span className="text-2xl">⚡</span>
              <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{popupMsg.title}</h4>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              {popupMsg.text}
            </p>
            <button
              onClick={() => setPopupMsg(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* 10. PWA Install Modal */}
      <PwaInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

    </div>
  );
}
