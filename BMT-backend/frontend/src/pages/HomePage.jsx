import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';
import BookingCard from '../components/bookings/BookingCard';
import { useAuthStore } from '../store/auth.store';
import { bookingApi } from '../api/booking.api';

// Sample mock data for interactive services
const MOCK_TRAINS = [
  { id: '22436', name: 'Varanasi Vande Bharat Express', route: 'NDLS - BSB', status: 'On Time', currentStation: 'Kanpur Central', delay: 0, stops: ['New Delhi', 'Kanpur Central', 'Prayagraj Jn', 'Varanasi Jn'] },
  { id: '12301', name: 'Howrah Rajdhani Express', route: 'NDLS - HWH', status: 'Delayed by 15m', currentStation: 'Prayagraj Jn', delay: 15, stops: ['New Delhi', 'Kanpur Central', 'Prayagraj Jn', 'Mughalsarai Jn', 'Howrah Jn'] },
  { id: '12002', name: 'Bhopal Shatabdi Express', route: 'NDLS - RKMP', status: 'On Time', currentStation: 'Agra Cantt', delay: 0, stops: ['New Delhi', 'Mathura Jn', 'Agra Cantt', 'Morena', 'Gwalior', 'Jhansi Jn', 'Bhopal'] }
];

const MOCK_FOOD_ITEMS = [
  { id: 1, name: 'Royal Veg Thali', desc: 'Basmati rice, 3 roti, paneer butter masala, dal makhani, raita & sweet', price: 220, type: 'veg', rating: '4.8' },
  { id: 2, name: 'Hyderabadi Chicken Biryani', desc: 'Rich chicken biryani served with spicy salan and cream raita', price: 260, type: 'nonveg', rating: '4.9' },
  { id: 3, name: 'Chole Bhature Combo', desc: '2 fluffy bhature served with pindi chole, pickles & salad', price: 140, type: 'veg', rating: '4.6' },
  { id: 4, name: 'Premium Butter Chicken Combo', desc: 'Butter chicken served with 2 butter naan or jeera rice', price: 240, type: 'nonveg', rating: '4.7' },
  { id: 5, name: 'Gulab Jamun (2 Pcs)', desc: 'Soft cottage cheese dumplings dipped in cardamon sugar syrup', price: 60, type: 'veg', rating: '4.9' }
];

const PROMOTION_OFFERS = [
  { code: 'BMTNEW', desc: 'Get 10% off up to ₹150 on your first booking with BooK my Train.', bg: 'from-primary-600 to-indigo-900' },
  { code: 'ZEROFEE', desc: 'Pay via UPI and enjoy flat ₹0 payment gateway convenience fees.', bg: 'from-orange-550 to-amber-700' },
  { code: 'BMTSAFE', desc: 'Free travel insurance coverage of up to ₹10 Lakhs on every ticket.', bg: 'from-emerald-650 to-teal-800' }
];

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [recentBookings, setRecentBookings] = useState([]);
  
  // Tab states: search | pnr | live | food | hotels | flights
  const [activeTab, setActiveTab] = useState('search');
  
  // PNR Interactive States
  const [pnrInput, setPnrInput] = useState('');
  const [pnrResult, setPnrResult] = useState(null);
  const [pnrLoading, setPnrLoading] = useState(false);

  // Live Track Interactive States
  const [selectedTrainId, setSelectedTrainId] = useState('');
  const [trackedTrain, setTrackedTrain] = useState(null);

  // Food Interactive States
  const [foodSearchPnr, setFoodSearchPnr] = useState('');
  const [foodMenuVisible, setFoodMenuVisible] = useState(false);
  const [cart, setCart] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Promotion carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);

  // General Notification Modal (e.g. for Hotel/Flight Dummies)
  const [popupMsg, setPopupMsg] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      bookingApi.list(null, 1, 3).then((res) => {
        const data = res.data || res;
        setRecentBookings(data.bookings || []);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Auto scroll promotions
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
          { name: 'Arvind Meena', status: 'CNF (Confirmed)', coach: 'C4', seat: '14 (Window)' },
          { name: 'Rohan Sharma', status: 'CNF (Confirmed)', coach: 'C4', seat: '16 (Aisle)' }
        ],
        probability: '100% Confirmation Probability'
      });
    }, 1200);
  };

  const handleTrackTrain = (id) => {
    setSelectedTrainId(id);
    const train = MOCK_TRAINS.find((t) => t.id === id);
    if (train) {
      setTrackedTrain(train);
    } else {
      setTrackedTrain(null);
    }
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

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      
      {/* 1. Travel Advisory News Marquee */}
      <div className="bg-slate-100 dark:bg-black border-slate-200 dark:border-slate-800 text-slate-700 dark:text-accent-400 py-2 border-b text-xs overflow-hidden relative select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="mx-8 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <strong>Advisory:</strong> Please carry original Identity Proof during travel. Digital IDs on DigiLocker are acceptable.
          </span>
          <span className="mx-8">
            🌟 <strong>Special Update:</strong> Bookings for Puja and Diwali Festival Special trains are open. Book up to 120 days in advance.
          </span>
          <span className="mx-8">
            🚆 <strong>New Train Launch:</strong> 6 new Vande Bharat Express routes added to the network. Search train schedules to explore.
          </span>
          <span className="mx-8 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <strong>Advisory:</strong> Please carry original Identity Proof during travel. Digital IDs on DigiLocker are acceptable.
          </span>
          <span className="mx-8">
            🌟 <strong>Special Update:</strong> Bookings for Puja and Diwali Festival Special trains are open. Book up to 120 days in advance.
          </span>
          <span className="mx-8">
            🚆 <strong>New Train Launch:</strong> 6 new Vande Bharat Express routes added to the network. Search train schedules to explore.
          </span>
        </div>
      </div>

      {/* 2. Hero Section with Silhouette Train Animation */}
      <div className="relative bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-white pt-12 pb-24 px-4 overflow-hidden border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
        
        {/* Background Animated Train */}
        <div className="absolute bottom-4 left-0 right-0 h-10 overflow-hidden pointer-events-none opacity-25 dark:opacity-20 border-b border-dashed border-slate-300 dark:border-white/10 hidden lg:block">
          <div className="animate-train absolute bottom-1 flex items-center">
            {/* Aerodynamic Locomotive SVG */}
            <svg className="w-20 h-6 text-slate-400 dark:text-white" viewBox="0 0 100 30" fill="currentColor">
              <path d="M90 20 L75 8 L10 8 L10 24 L90 24 Z" />
              <circle cx="20" cy="26" r="3" fill="#000" />
              <circle cx="35" cy="26" r="3" fill="#000" />
              <circle cx="65" cy="26" r="3" fill="#000" />
              <circle cx="80" cy="26" r="3" fill="#000" />
            </svg>
            <div className="h-4 w-12 bg-slate-300 dark:bg-white/70 ml-1 rounded-sm" />
            <div className="h-4 w-12 bg-slate-300 dark:bg-white/70 ml-1 rounded-sm" />
            <div className="h-4 w-12 bg-slate-300 dark:bg-white/70 ml-1 rounded-sm" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-500/10 text-accent-500 dark:text-accent-400 border border-accent-500/20 mb-3">
              ⚡ Fast & Reliable Ticketing System
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
              Compare & Book <span className="bg-gradient-to-r from-accent-600 to-orange-500 dark:from-accent-400 dark:to-orange-500 bg-clip-text text-transparent">Train Tickets</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-xl mx-auto font-medium">
              Authorized Booking Portal. Get instant reservation, automated confirmation forecasts, and 100% secure payments.
            </p>
          </div>

          {/* Glassmorphism Hub Card Container */}
          <div className="glass-card rounded-3xl shadow-2xl p-2 md:p-4 max-w-4xl mx-auto overflow-hidden animate-fade-in-up">
            
            {/* Horizontal Service Icons - Restyled to fix white contrast in Light/Dark */}
            <div className="flex border-b border-slate-200/20 dark:border-white/10 overflow-x-auto scrollbar-none pb-1.5 gap-1.5 md:justify-around px-2">
              <button
                onClick={() => { setActiveTab('search'); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === 'search' 
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/35 scale-105' 
                    : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <span>🚆</span> Book Tickets
              </button>

              <button
                onClick={() => { setActiveTab('pnr'); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === 'pnr' 
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/35 scale-105' 
                    : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <span>🔍</span> Check PNR
              </button>

              <button
                onClick={() => { setActiveTab('live'); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === 'live' 
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/35 scale-105' 
                    : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <span>📶</span> Live Running Status
              </button>

              <button
                onClick={() => { setActiveTab('food'); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === 'food' 
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/35 scale-105' 
                    : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <span>🍴</span> Food on Track
              </button>

              <button
                onClick={() => setPopupMsg({ title: 'Hotels & Stays Booking', text: 'Premium lounge & hotel booking systems are currently undergoing updates for holiday packages. Please contact support or visit back soon.' })}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap text-slate-650 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white transition-all duration-300"
              >
                <span>🏨</span> Hotels
              </button>

              <button
                onClick={() => setPopupMsg({ title: 'Flight Tickets', text: 'Flight search services integration is scheduled for Q4. BooK my Train members will receive early beta invitation access.' })}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap text-slate-650 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white transition-all duration-300"
              >
                <span>✈️</span> Flights
              </button>
            </div>

            {/* Inner Tab Contents - Added dark background transitions */}
            <div className="p-4 md:p-6 text-slate-800 dark:text-slate-200">
              
              {/* TAB 1: Search Form */}
              {activeTab === 'search' && (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-inner border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                  <SearchForm />
                </div>
              )}

              {/* TAB 2: PNR Status Checker */}
              {activeTab === 'pnr' && (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-inner border border-slate-100 dark:border-slate-800 space-y-4 transition-colors duration-300">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Check Real-Time PNR Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter your 10-digit Passenger Name Record (PNR) number printed on the ticket.</p>
                  
                  <form onSubmit={handlePnrSearch} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={10}
                      value={pnrInput}
                      onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit PNR Number"
                      className="input-field max-w-md font-semibold tracking-widest text-slate-800 dark:text-slate-100"
                      required
                    />
                    <button
                      type="submit"
                      disabled={pnrInput.length < 10 || pnrLoading}
                      className="px-6 rounded-xl bg-primary-900 hover:bg-primary-800 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:bg-accent-600 dark:hover:bg-accent-700"
                    >
                      {pnrLoading ? 'Checking...' : 'Check Status'}
                    </button>
                  </form>

                  {/* PNR Results Panel */}
                  {pnrLoading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-accent-600 rounded-full dark:border-slate-850" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Retrieving booking logs from central database...</p>
                    </div>
                  )}

                  {pnrResult && (
                    <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-5 bg-slate-50 dark:bg-slate-950/40 space-y-4 animate-fade-in-up">
                      <div className="flex flex-col sm:flex-row justify-between border-b dark:border-slate-800 pb-3 items-start sm:items-center">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">PNR Reference</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white tracking-wider">{pnrResult.pnr}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right">
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {pnrResult.chartStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 font-medium">Train Name</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{pnrResult.trainName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 font-medium">Date of Journey</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{pnrResult.date}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 font-medium">From Station</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{pnrResult.from}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 font-medium">Destination</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{pnrResult.to}</p>
                        </div>
                      </div>

                      <div className="border-t dark:border-slate-800 pt-3">
                        <p className="text-xs font-bold text-primary-900 dark:text-accent-400 mb-2 uppercase tracking-wide">Passenger Status Details</p>
                        <div className="space-y-2">
                          {pnrResult.passengers.map((passenger, i) => (
                            <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-lg border dark:border-slate-800 text-xs">
                              <div>
                                <span className="font-semibold text-slate-400 dark:text-slate-500 mr-2">P{i+1}.</span>
                                <span className="font-bold text-slate-850 dark:text-slate-200">{passenger.name}</span>
                              </div>
                              <div className="flex gap-4">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Booking: CNF</span>
                                <span className="font-bold text-slate-900 dark:text-white">Coach: {passenger.coach} / Seat: {passenger.seat}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-accent-50 dark:bg-accent-950/20 border border-accent-100 dark:border-accent-900/20 text-accent-800 dark:text-accent-400 rounded-lg p-3 text-xs font-semibold">
                        <span>🔮</span>
                        <span>ConfirmTkt Forecast: {pnrResult.probability} (CNF status guaranteed)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Live Train Tracker */}
              {activeTab === 'live' && (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-inner border border-slate-100 dark:border-slate-800 space-y-4 transition-colors duration-300">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Live Train Running Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select an active express train to track its geographical location on the grid.</p>
                  
                  <div className="max-w-md">
                    <select
                      value={selectedTrainId}
                      onChange={(e) => handleTrackTrain(e.target.value)}
                      className="input-field font-semibold text-slate-800 dark:text-slate-100"
                    >
                      <option value="">-- Choose Express Train --</option>
                      {MOCK_TRAINS.map((t) => (
                        <option key={t.id} value={t.id}>{t.id} - {t.name}</option>
                      ))}
                    </select>
                  </div>

                  {trackedTrain && (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50 dark:bg-slate-950/40 space-y-5 animate-fade-in-up">
                      <div className="flex justify-between items-center border-b dark:border-slate-850 pb-3">
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white">{trackedTrain.name} ({trackedTrain.id})</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Route: {trackedTrain.route}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            trackedTrain.status.includes('Delayed') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                          }`}>
                            {trackedTrain.status}
                          </span>
                        </div>
                      </div>

                      {/* Station Vertical Tracker Line */}
                      <div className="relative pl-6 space-y-6">
                        
                        {/* Line connector */}
                        <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200 dark:bg-slate-700" />

                        {trackedTrain.stops.map((stop, idx) => {
                          const isCurrent = trackedTrain.currentStation === stop;
                          
                          return (
                            <div key={idx} className="relative flex items-center text-xs">
                              {/* Station node dot */}
                              <div className={`absolute -left-[20px] h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                                isCurrent ? 'bg-emerald-600 scale-125 z-10' : 'bg-slate-300 dark:bg-slate-600'
                              }`}>
                                {isCurrent && (
                                  <span className="absolute h-6 w-6 rounded-full bg-emerald-500/30 animate-ping-slow" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className={`font-bold ${isCurrent ? 'text-emerald-700 dark:text-emerald-400 text-sm animate-pulse' : 'text-slate-700 dark:text-slate-350'}`}>
                                  {stop}
                                </p>
                                {isCurrent && (
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 tracking-wider animate-pulse">
                                    📶 Currently Departed {trackedTrain.delay > 0 ? `(+${trackedTrain.delay}m)` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-lg">
                        📡 Location logs updated via GPS tracker just now.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Food on Track (E-Catering) */}
              {activeTab === 'food' && (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-inner border border-slate-100 dark:border-slate-800 space-y-4 transition-colors duration-300">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Gourmet Food Delivery on Seat</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Order hygienic restaurant meals and get them delivered straight to your coach seat berth.</p>

                  {!foodMenuVisible ? (
                    <form onSubmit={handleFoodSearch} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={10}
                        value={foodSearchPnr}
                        onChange={(e) => setFoodSearchPnr(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit PNR for Delivery"
                        className="input-field max-w-md font-semibold tracking-widest text-slate-800 dark:text-slate-100"
                        required
                      />
                      <button
                        type="submit"
                        disabled={foodSearchPnr.length < 10}
                        className="px-6 rounded-xl bg-primary-900 hover:bg-primary-800 text-white font-bold text-sm transition-all dark:bg-accent-600 dark:hover:bg-accent-700"
                      >
                        Enter Food Court
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6 animate-fade-in-up">
                      
                      <div className="flex justify-between items-center border-b dark:border-slate-850 pb-3">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Delivery PNR Ref</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider">PNR: {foodSearchPnr}</p>
                        </div>
                        <button
                          onClick={() => { setFoodMenuVisible(false); setCart({}); }}
                          className="text-xs font-bold text-red-650 hover:underline"
                        >
                          Change PNR
                        </button>
                      </div>

                      {orderPlaced ? (
                        <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 rounded-xl p-6 text-center space-y-3">
                          <span className="text-4xl animate-bounce inline-block">🎉</span>
                          <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-base">Meal Booking Confirmed!</h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500 leading-relaxed max-w-sm mx-auto">
                            Your order has been received by BMT Authorized Chef Hub. Food will be delivered hot to your seat at <strong>Kanpur Central</strong> station stops. Cash on Delivery supported.
                          </p>
                          <button
                            onClick={() => setOrderPlaced(false)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Order Something Else
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Menu Listing */}
                          <div className="lg:col-span-2 space-y-3.5 max-h-[380px] overflow-y-auto pr-2">
                            {MOCK_FOOD_ITEMS.map((food) => (
                              <div key={food.id} className="flex justify-between border dark:border-slate-800 rounded-xl p-3.5 hover:shadow-sm bg-white dark:bg-slate-900 items-center gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      food.type === 'veg' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450' : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-450'
                                    }`}>
                                      {food.type.toUpperCase()}
                                    </span>
                                    <span className="font-bold text-slate-850 dark:text-slate-200 text-sm">{food.name}</span>
                                    <span className="text-xs text-amber-500 font-bold">⭐ {food.rating}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-snug">{food.desc}</p>
                                  <p className="text-sm font-extrabold text-primary-950 dark:text-slate-100">₹{food.price}</p>
                                </div>

                                {/* Cart buttons */}
                                <div>
                                  {cart[food.id] ? (
                                    <div className="flex items-center border dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-850">
                                      <button onClick={() => updateCart(food.id, -1)} className="px-2.5 py-1 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">-</button>
                                      <span className="px-2.5 font-bold text-xs text-slate-800 dark:text-slate-200">{cart[food.id]}</span>
                                      <button onClick={() => updateCart(food.id, 1)} className="px-2.5 py-1 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">+</button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => updateCart(food.id, 1)}
                                      className="px-4 py-1.5 bg-primary-900 hover:bg-primary-800 text-white rounded-lg text-xs font-bold transition-all dark:bg-accent-600 dark:hover:bg-accent-700"
                                    >
                                      ADD
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Cart Summary */}
                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between max-h-[380px]">
                            <div>
                              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs border-b dark:border-slate-800 pb-2 uppercase tracking-wide">Basket Summary</h4>
                              
                              {Object.keys(cart).length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-550 py-12 text-center">Your basket is empty. Add food items to proceed.</p>
                              ) : (
                                <div className="space-y-3 py-3 overflow-y-auto max-h-[180px]">
                                  {Object.entries(cart).map(([id, qty]) => {
                                    const item = MOCK_FOOD_ITEMS.find((f) => f.id === parseInt(id));
                                    if (!item) return null;
                                    return (
                                      <div key={id} className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{item.name} <span className="text-slate-400 dark:text-slate-550 font-medium">x {qty}</span></span>
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200">₹{item.price * qty}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {Object.keys(cart).length > 0 && (
                              <div className="border-t dark:border-slate-800 pt-3 space-y-3">
                                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                                  <span>Total (Incl. Tax)</span>
                                  <span>₹{calculateFoodTotal()}</span>
                                </div>
                                <button
                                  onClick={handlePlaceFoodOrder}
                                  className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-accent-600/10 transition-all text-center dark:bg-accent-600 dark:hover:bg-accent-500"
                                >
                                  Place COD Order
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

            </div>
          </div>

        </div>
      </div>

      {/* 3. Promotional Carousel Banners */}
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-12 relative z-20">
        <div className={`rounded-3xl p-6 md:p-8 text-white shadow-xl bg-gradient-to-r ${PROMOTION_OFFERS[carouselIndex].bg} transition-all duration-700 ease-in-out`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                Exclusive Campaign
              </span>
              <p className="font-black text-xl md:text-2xl leading-snug">
                {PROMOTION_OFFERS[carouselIndex].desc}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-white text-slate-900 border font-extrabold text-sm px-4 py-2 rounded-xl tracking-wider select-all shadow-md">
                {PROMOTION_OFFERS[carouselIndex].code}
              </span>
              <div className="flex gap-1">
                {PROMOTION_OFFERS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${i === carouselIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Conditional Panels based on Auth State */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isAuthenticated ? (
          /* LOGGED IN USER SECTION */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up">
            
            {/* Panel 1: Upcoming Travel & Utilities */}
            <div className="card bg-gradient-to-br from-slate-900 via-slate-850 to-primary-950 text-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-none relative overflow-hidden p-6 md:p-8">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-5">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] bg-accent-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Next Travel Board</span>
                    <h3 className="font-extrabold text-lg mt-1 tracking-tight">Active Journey Plan</h3>
                  </div>
                  <span className="text-xs font-bold text-accent-400">T-Minus 14h</span>
                </div>
                
                {/* Simulated upcoming ticket */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Train Reference</p>
                    <p className="font-black text-slate-200">Vande Bharat Express (22436)</p>
                    <p className="text-slate-350 font-medium mt-1">NDLS &rarr; BSB | Seat C4-14 (WS)</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status</p>
                    <p className="font-black text-emerald-400">CNF (Confirmed)</p>
                    <p className="text-slate-350">Leaves tomorrow 06:00 AM</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <button onClick={() => setPopupMsg({ title: 'Download Ticket', text: 'Preparing secure invoice. Your printable ticket PDF will be generated in 5 seconds.' })} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-[11px] font-bold transition-all">
                    🎫 E-Ticket
                  </button>
                  <button onClick={() => setPopupMsg({ title: 'TDR Filing Center', text: 'TDR requests are open up to 4 hours after scheduled departure. Proceeding to ticket select...' })} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-[11px] font-bold transition-all">
                    📝 File TDR
                  </button>
                  <button onClick={() => setPopupMsg({ title: 'Refund Status', text: 'Zero pending refunds. Last transaction was processed back to original source successfully.' })} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-[11px] font-bold transition-all">
                    ⚡ Refund Check
                  </button>
                  <button onClick={() => setPopupMsg({ title: 'Wheelchair / Assistance', text: 'Wheelchair assistance requested for New Delhi station departure. Porter contact details sent via SMS.' })} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-[11px] font-bold transition-all">
                    ♿ Help Desk
                  </button>
                </div>
              </div>
            </div>

            {/* Panel 2: Wallet Loyalty & Rewards */}
            <div className="card border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col justify-between dark:bg-slate-900">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-200 tracking-tight">Your Loyalty Wallet</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Collect BMT points on every booking and unlock perks.</p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-950/30 border border-amber-250/20 text-amber-700 dark:text-amber-455 font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1.5 select-none">
                    <span>👑</span> Gold Member
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">1,450</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">BMT Coins</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Points to Platinum Level</span>
                    <span>150 XP needed</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t dark:border-slate-800">
                <button onClick={() => setPopupMsg({ title: 'Loyalty Meal Voucher', text: 'Congratulations! Your free meal voucher BMT-FOOD100 has been added to your profile. Use it in E-Catering tab.' })} className="p-3 border dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-left rounded-xl transition-all flex items-center justify-between">
                  <div className="text-xs font-bold">
                    <p className="text-slate-850 dark:text-slate-200">Free Catering Thali</p>
                    <p className="text-[10px] text-amber-600 font-medium">Claim voucher</p>
                  </div>
                  <span className="text-lg">📝”</span>
                </button>
                <button onClick={() => setPopupMsg({ title: 'Zero Convenience Fee Pass', text: 'You have active zero Convenience Fee passes. This will automatically be applied during ticket booking checkouts.' })} className="p-3 border dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 dark:hover:bg-slate-800 text-left rounded-xl transition-all flex items-center justify-between">
                  <div className="text-xs font-bold">
                    <p className="text-slate-855 dark:text-slate-200">Zero Convenience Fee Pass</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Active (2 left)</p>
                  </div>
                  <span className="text-lg">🎫</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* GUEST / NON-LOGGED IN USER SECTION */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up">
            
            {/* Panel 1: Join BMT Club CTA (Span 2) */}
            <div className="lg:col-span-2 card bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 border-none text-white relative overflow-hidden p-6 md:p-8 flex flex-col justify-between dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
              <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-accent-500/10 blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <span className="inline-block bg-accent-500 text-white font-extrabold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                  Passenger Benefits Hub
                </span>
                <h3 className="font-black text-2xl md:text-3xl tracking-tight leading-tight">
                  Unlock Flat 15% Off Your First Ticket Booking
                </h3>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-lg">
                  Join the BooK my Train Club today. Save companion passenger details for fast checkouts, predict confirmation ratios on waitlist tickets, and enjoy instant wallet refunds on cancellations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5 mt-6">
                <Link to="/login?redirect=/" className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-center text-xs rounded-xl shadow-lg shadow-accent-600/15 hover:shadow-accent-500/35 transition-all">
                  Register Free Account
                </Link>
                <Link to="/login" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-center text-xs rounded-xl transition-colors">
                  Sign In to Profile
                </Link>
              </div>
            </div>

            {/* Panel 2: Weekend Trending Low Fares */}
            <div className="card border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between dark:bg-slate-900">
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-850 dark:text-slate-200 tracking-tight text-base">Trending Route Deals</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Explore weekend gateways at lowest guaranteed rail fares.</p>
                
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs border-b dark:border-slate-800 pb-2">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Delhi &rarr; Jaipur</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550">AC Chair Car daily service</p>
                    </div>
                    <span className="font-black text-primary-900 dark:text-accent-400">Fares from ₹190</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b dark:border-slate-800 pb-2">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Mumbai &rarr; Goa</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550">Weekly Sleeper Express</p>
                    </div>
                    <span className="font-black text-primary-900 dark:text-accent-400">Fares from ₹340</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-1">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Bangalore &rarr; Mysore</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550">Daily Shatabdi connection</p>
                    </div>
                    <span className="font-black text-primary-900 dark:text-accent-400">Fares from ₹125</span>
                  </div>
                </div>
              </div>

              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[11px] transition-colors text-center mt-3">
                Search Fares Above &uarr;
              </button>
            </div>

          </div>
        )}
      </div>

      {/* 4. Core Features - Why Book With BMT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Why Travel with BooK my Train?</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5">Making Indian Railway bookings smooth, transparent, and passenger-friendly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card group hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-4 bg-accent-100 dark:bg-accent-950/20 h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">🔮</div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">AI Waitlist Prediction</h3>
            <p className="text-xs text-slate-500 dark:text-slate-455 leading-relaxed">Know the exact probability of your waitlisted ticket getting confirmed before booking.</p>
          </div>
          <div className="card group hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-4 bg-accent-100 dark:bg-accent-950/20 h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">⚡</div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Instant Refunds</h3>
            <p className="text-xs text-slate-500 dark:text-slate-455 leading-relaxed">Cancel tickets up to chart preparation and receive full refund directly in your account.</p>
          </div>
          <div className="card group hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-4 bg-accent-100 dark:bg-accent-950/20 h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">🛡️</div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Free Cancellation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-455 leading-relaxed">Opt for free cancellation and secure 100% refund without any cancellation fee.</p>
          </div>
          <div className="card group hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-4 bg-accent-100 dark:bg-accent-950/20 h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">📞</div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">24x7 Rail Support</h3>
            <p className="text-xs text-slate-500 dark:text-slate-455 leading-relaxed">Dedicated booking helpers to resolve all ticket query issues instantly via call & chat.</p>
          </div>
        </div>
      </div>

      {/* 5. Special Luxury & Tourist Trains Showcase - Linked generated image assets */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Explore Premium Indian Trains</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5">Embark on legendary rail journeys and explore cultural heritage in comfort.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Train Card 1 - Vande Bharat */}
          <div className="border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/50 transition-all duration-300 group bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="relative overflow-hidden h-52 bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
                <img 
                  src="/vande_bharat.jpg" 
                  alt="Vande Bharat Express" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-accent-600 text-white font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded-full uppercase">
                  Modern Fast Rail
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Vande Bharat Express</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  India's first indigenous semi-high speed train set. Equipped with GPS passenger info, rotating executive seats, CCTV security, and bio-vacuum toilets.
                </p>
              </div>
            </div>
            <div className="p-5 border-t dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20">
              <span>Routes: Key Metros</span>
              <span className="text-accent-600">Chair Car & EC</span>
            </div>
          </div>

          {/* Train Card 2 - Palace on Wheels */}
          <div className="border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/50 transition-all duration-300 group bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="relative overflow-hidden h-52 bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
                <img 
                  src="/palace_on_wheels.jpg" 
                  alt="Palace on Wheels" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-amber-600 text-white font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded-full uppercase">
                  Heritage Luxury
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Palace on Wheels</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Experience royal Rajasthan onboard cabins themed around ancient princely states. Deluxe dining saloons, spa lounges, and personal Khidmatgar attendants.
                </p>
              </div>
            </div>
            <div className="p-5 border-t dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20">
              <span>Duration: 7 Nights</span>
              <span className="text-amber-600">Premium Tour Suite</span>
            </div>
          </div>

          {/* Train Card 3 - Nilgiri Toy Train */}
          <div className="border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/50 transition-all duration-300 group bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="relative overflow-hidden h-52 bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
                <img 
                  src="/nilgiri_toy_train.jpg" 
                  alt="Nilgiri Mountain Toy Train" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-emerald-600 text-white font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded-full uppercase">
                  Scenic Toy Train
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Nilgiri Mountain Railway</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  UNESCO World Heritage steam train navigating lush valleys, 208 curves, 16 tunnels and steep rack-rail systems in Tamil Nadu blue hills.
                </p>
              </div>
            </div>
            <div className="p-5 border-t dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20">
              <span>Location: Ooty Scenic</span>
              <span className="text-emerald-600">Steam Locomotive</span>
            </div>
          </div>

        </div>
      </div>

      {/* 6. Recent Bookings Block (Preserves core functionality) */}
      {isAuthenticated && recentBookings.length > 0 && (
        <div className="bg-slate-100 dark:bg-slate-950 py-12 border-t dark:border-slate-900 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Your Recent Bookings</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quickly review tickets and confirmation status logs.</p>
              </div>
              <Link to="/bookings" className="text-xs font-bold text-primary-900 dark:text-accent-405 hover:text-accent-600 dark:hover:text-accent-300 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 hover:bg-white dark:hover:bg-slate-900 transition-all">
                View All Bookings &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentBookings.map((b) => (
                <div key={b.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 p-4 hover:shadow-md transition-shadow">
                  <BookingCard booking={b} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. App Promotion Banner */}
      <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white py-14 px-4 border-t border-slate-200 dark:border-slate-900 overflow-hidden relative transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          
          <div className="space-y-4 max-w-xl">
            <span className="inline-block bg-accent-600 text-white font-bold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
              Exclusive Mobile App
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-slate-900 dark:text-white">
              Get BooK my Train App on Your Android / iOS Device
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
              Enable smart notifications, get alerted instantly when coach charts are prepared, track delays, and check booking updates. Scan the QR code to install.
            </p>
            {/* App Badges */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setPopupMsg({ title: 'Google Play Download', text: 'You are being redirected to Google Play Store... (Mock Event)' })}
                className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2.5 shadow-sm group"
              >
                <svg className="w-4 h-4 text-slate-800 dark:text-white transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.784 12 3.609 22.186c-.18.18-.291.43-.291.706v-20.78c0 .277.111.527.291.706zM15.2 10.584l2.871-1.637-2.871-1.637v3.274zm3.968-2.261l-3.327-1.897L4.721 1.22c.241-.141.522-.22.822-.22h12.569c.301 0 .582.079.822.22l3.327 1.897c.502.287.822.82.822 1.411 0 .591-.32 1.124-.822 1.411l-3.086 1.76z M15.2 13.416l2.871 1.637-2.871 1.637v-3.274zm3.968 2.261l-3.327 1.897L4.721 22.78c.241.141.522.22.822.22h12.569c.301 0 .582-.079.822-.22l3.327-1.897c.502-.287.822-.82.822-1.411 0-.591-.32-1.124-.822-1.411l-3.086-1.76z"/>
                </svg>
                Google Play
              </button>
              <button 
                onClick={() => setPopupMsg({ title: 'App Store Download', text: 'You are being redirected to Apple App Store... (Mock Event)' })}
                className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2.5 shadow-sm group"
              >
                <svg className="w-4 h-4 text-slate-800 dark:text-white transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-1.01 2.96.96.08 2.07-.5 2.84-1.35z"/>
                </svg>
                Apple App Store
              </button>
            </div>
          </div>

          {/* QR Code Widget */}
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-sm shadow-md dark:shadow-none">
            <div className="bg-slate-50 dark:bg-white p-2.5 rounded-2xl w-28 h-28 flex items-center justify-center shadow-lg">
              {/* Mock QR Code Pattern using plain HTML/CSS */}
              <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 bg-slate-50">
                <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" />
                <div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
              </div>
            </div>
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-slate-800 dark:text-slate-100">Scan QR Code</p>
              <p className="text-slate-550 dark:text-slate-400 leading-snug">Open camera on your smartphone & point to download.</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* 8. Notification Popup Modal */}
      {popupMsg && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3 text-accent-600 dark:text-accent-400">
              <span className="text-2xl">⚡</span>
              <h4 className="font-black text-slate-900 dark:text-white text-lg leading-none">{popupMsg.title}</h4>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
              {popupMsg.text}
            </p>
            <button
              onClick={() => setPopupMsg(null)}
              className="w-full py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl text-xs transition-colors dark:bg-accent-600 dark:hover:bg-accent-700"
            >
              Understand
            </button>
          </div>
        </div>
      )}

    </div>
  );
}