import { useState } from 'react';

const MOCK_FOOD_ITEMS = [
  { id: 1, name: 'Royal Maharaja Veg Thali', desc: 'Basmati rice, 3 butter roti, paneer butter masala, dal makhani, boondi raita & gulab jamun', price: 220, type: 'veg', rating: '4.8', icon: '🍱' },
  { id: 2, name: 'Dum Hyderabadi Chicken Biryani', desc: 'Slow-cooked fragrant biryani served with spicy mirchi ka salan and chilled raita', price: 260, type: 'nonveg', rating: '4.9', icon: '🍗' },
  { id: 3, name: 'Amritsari Chole Bhature Combo', desc: '2 golden fluffy bhature served with spicy pindi chole, mint chutney & pickles', price: 140, type: 'veg', rating: '4.6', icon: '🫓' },
  { id: 4, name: 'Butter Chicken & Garlic Naan', desc: 'Boneless tender chicken in rich tomato butter gravy with 2 crisp garlic naan', price: 240, type: 'nonveg', rating: '4.7', icon: '🥘' },
  { id: 5, name: 'Kesari Gulab Jamun (2 Pcs)', desc: 'Soft khoya dumplings dipped in warm saffron-cardamom scented sugar syrup', price: 60, type: 'veg', rating: '4.9', icon: '🍮' }
];

export default function ServiceBookingModal({ service, onClose }) {
  if (!service) return null;

  const serviceId = service.id || service.action || '';

  // ─── 1. PORTER (COOLIE) STATE ───
  const [porterStation, setPorterStation] = useState('New Delhi (NDLS)');
  const [porterPnr, setPorterPnr] = useState('2419821456');
  const [porterCoach, setPorterCoach] = useState('B3');
  const [porterBerth, setPorterBerth] = useState('24');
  const [porterBags, setPorterBags] = useState(2);
  const [porterPhone, setPorterPhone] = useState('9876543210');
  const [porterPickup, setPorterPickup] = useState('Coach Door on Platform');
  const [porterConfirmed, setPorterConfirmed] = useState(null);

  // ─── 2. WHEELCHAIR ASSIST STATE ───
  const [wheelchairStation, setWheelchairStation] = useState('New Delhi (NDLS)');
  const [wheelchairPnr, setWheelchairPnr] = useState('2419821456');
  const [wheelchairPassenger, setWheelchairPassenger] = useState('Satish Sharma (Senior Citizen)');
  const [wheelchairType, setWheelchairType] = useState('Wheelchair with Dedicated Station Attendant');
  const [wheelchairPhone, setWheelchairPhone] = useState('9876543210');
  const [wheelchairConfirmed, setWheelchairConfirmed] = useState(null);

  // ─── 3. TRIP SHIELD / INSURANCE STATE ───
  const [insurancePnr, setInsurancePnr] = useState('2419821456');
  const [insurancePassenger, setInsurancePassenger] = useState('Arvind Meena');
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(null);

  // ─── 4. WHATSAPP RADAR STATE ───
  const [radarPhone, setRadarPhone] = useState('9876543210');
  const [radarTrain, setRadarTrain] = useState('22436 Vande Bharat Express');
  const [radarPnr, setRadarPnr] = useState('2419821456');
  const [radarWakeup, setRadarWakeup] = useState(true);
  const [radarGps, setRadarGps] = useState(true);
  const [radarPlatform, setRadarPlatform] = useState(true);
  const [radarConfirmed, setRadarConfirmed] = useState(false);

  // ─── 5. CONNECTING FLIGHTS STATE ───
  const [flightFrom, setFlightFrom] = useState('New Delhi (DEL)');
  const [flightTo, setFlightTo] = useState('Mumbai (BOM)');
  const [flightDate, setFlightDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [flightSelected, setFlightSelected] = useState('indigo');
  const [flightConfirmed, setFlightConfirmed] = useState(null);

  // ─── 6. FOOD ON TRACK STATE ───
  const [foodPnr, setFoodPnr] = useState('2419821456');
  const [foodCart, setFoodCart] = useState({});
  const [foodConfirmed, setFoodConfirmed] = useState(false);

  // ─── 7. HOTELS & POD LOUNGES STATE ───
  const [hotelStation, setHotelStation] = useState('New Delhi (NDLS)');
  const [hotelType, setHotelType] = useState('Executive Soundproof Pod • ₹899 (6 hrs)');
  const [hotelCheckIn, setHotelCheckIn] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [hotelGuests, setHotelGuests] = useState('1 Guest');
  const [hotelConfirmed, setHotelConfirmed] = useState(null);

  const calculatePorterTariff = (bags) => {
    if (bags <= 1) return 100;
    if (bags === 2) return 180;
    if (bags === 3) return 250;
    return 320;
  };

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

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 animate-scale-in relative text-slate-800 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-150 pb-3.5">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {service.icon || '🚆'}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {service.badge || 'Official Railway Assist'}
              </span>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mt-1">
                {service.name || service.title || 'Railway Passenger Assist'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            &times;
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 1: STATION PORTER (COOLIE) BOOKING
            ══════════════════════════════════════════════════════════════════════════════ */}
        {serviceId === 'porter' && (
          <div className="space-y-4">
            {!porterConfirmed ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPorterConfirmed({
                    passId: `BMT-PORTER-${Math.floor(100000 + Math.random() * 900000)}`,
                    porterName: 'Ramesh Kumar',
                    badgeNo: 'Billa #402',
                    phone: '+91 98112 34567',
                    station: porterStation,
                    coach: porterCoach,
                    berth: porterBerth,
                    bags: porterBags,
                    tariff: calculatePorterTariff(porterBags),
                    pickup: porterPickup,
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-slate-700">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>🛡️</span> Transparent Government Fixed Tariff Guaranteed
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Licensed railway porter will meet you at your designated coach gate. Zero bargaining required. Pay fixed tariff upon baggage delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PNR or Train #</label>
                    <input
                      type="text"
                      value={porterPnr}
                      onChange={(e) => setPorterPnr(e.target.value)}
                      placeholder="10-digit PNR"
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
                      placeholder="e.g. B2, S4, A1"
                      className="input-field text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seat / Berth</label>
                    <input
                      type="text"
                      value={porterBerth}
                      onChange={(e) => setPorterBerth(e.target.value)}
                      placeholder="e.g. 23"
                      className="input-field text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Number of Bags</label>
                    <select
                      value={porterBags}
                      onChange={(e) => setPorterBags(parseInt(e.target.value, 10))}
                      className="input-field text-xs font-bold"
                    >
                      <option value={1}>1 Bag (up to 40 kg) • ₹100</option>
                      <option value={2}>2 Bags with Trolley • ₹180</option>
                      <option value={3}>3 Heavy Luggage • ₹250</option>
                      <option value={4}>4+ Bags with Hand Cart • ₹320</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Meeting Location</label>
                    <select
                      value={porterPickup}
                      onChange={(e) => setPorterPickup(e.target.value)}
                      className="input-field text-xs font-semibold"
                    >
                      <option>Coach Door on Platform</option>
                      <option>Station Main Entry Gate #1</option>
                      <option>Platform Foot-Over-Bridge (FOB)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Passenger Contact (Mobile)</label>
                  <input
                    type="tel"
                    value={porterPhone}
                    onChange={(e) => setPorterPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="input-field text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Fixed Tariff Payable</p>
                    <p className="text-base font-extrabold text-emerald-700">₹{calculatePorterTariff(porterBags)}</p>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Confirm Porter Booking &rarr;
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-scale-in text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    Booking Confirmed • Token {porterConfirmed.passId}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">
                    Porter Assigned: {porterConfirmed.porterName} ({porterConfirmed.badgeNo})
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Your licensed railway coolie has been notified. He will be waiting with baggage trolley at <strong>{porterConfirmed.station} &bull; Coach {porterConfirmed.coach}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Porter Direct Contact:</span>
                    <strong className="text-emerald-700 font-mono">{porterConfirmed.phone}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Meeting Point:</span>
                    <strong className="text-slate-800">{porterConfirmed.pickup}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payable to Porter:</span>
                    <strong className="text-slate-900 text-sm">₹{porterConfirmed.tariff} (Cash or UPI)</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPorterConfirmed(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Book Another Porter
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 2: WHEELCHAIR & ACCESSIBILITY ASSIST (100% Free Govt Service)
            ══════════════════════════════════════════════════════════════════════════════ */}
        {serviceId === 'wheelchair' && (
          <div className="space-y-4">
            {!wheelchairConfirmed ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setWheelchairConfirmed({
                    passId: `BMT-SAHAYAK-${Math.floor(1000 + Math.random() * 9000)}`,
                    station: wheelchairStation,
                    passenger: wheelchairPassenger,
                    service: wheelchairType,
                    deskContact: '+91 94120 54321',
                    stationDesk: 'Divyangjan & Senior Citizen Assist Desk (Platform #1 Main Hall)',
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl text-slate-700">
                  <p className="font-bold text-teal-950 flex items-center gap-1.5">
                    <span>♿</span> 100% Free Service under Sugamya Bharat Abhiyan
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Dedicated electric buggy golf carts, wheelchair escorts, and ramp attendants are provided at zero charge across all major railway stations for senior citizens and patients.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Station Junction</label>
                    <select
                      value={wheelchairStation}
                      onChange={(e) => setWheelchairStation(e.target.value)}
                      className="input-field text-xs font-semibold"
                    >
                      <option>New Delhi (NDLS)</option>
                      <option>Howrah Junction (HWH)</option>
                      <option>Mumbai Central (MMCT)</option>
                      <option>Chennai Central (MAS)</option>
                      <option>Varanasi Junction (BSB)</option>
                      <option>KSR Bengaluru (SBC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Passenger Name &amp; Category</label>
                    <input
                      type="text"
                      value={wheelchairPassenger}
                      onChange={(e) => setWheelchairPassenger(e.target.value)}
                      placeholder="e.g. Satish Sharma (Senior Citizen)"
                      className="input-field text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Required</label>
                    <select
                      value={wheelchairType}
                      onChange={(e) => setWheelchairType(e.target.value)}
                      className="input-field text-xs font-semibold"
                    >
                      <option>Wheelchair with Dedicated Station Attendant</option>
                      <option>Electric Golf Cart / Buggy Shuttle across Platforms</option>
                      <option>Platform-to-Berth Ramp Assistance</option>
                      <option>Sight Assist &amp; Braille Station Guide</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PNR or Train #</label>
                      <input
                        type="text"
                        value={wheelchairPnr}
                        onChange={(e) => setWheelchairPnr(e.target.value)}
                        placeholder="10-digit PNR"
                        className="input-field text-xs font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Contact</label>
                      <input
                        type="tel"
                        value={wheelchairPhone}
                        onChange={(e) => setWheelchairPhone(e.target.value)}
                        placeholder="10-digit phone"
                        className="input-field text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Government Service Fee</p>
                    <p className="text-base font-extrabold text-teal-700">₹0 &bull; 100% Free</p>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Request Free Assistance &rarr;
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-scale-in text-center">
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  ♿
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
                    Assist Token: {wheelchairConfirmed.passId}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">
                    Accessibility Escort Confirmed
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Attendant is assigned for <strong>{wheelchairConfirmed.passenger}</strong> at <strong>{wheelchairConfirmed.station}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Service:</span>
                    <strong className="text-slate-800">{wheelchairConfirmed.service}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Helpdesk Point:</span>
                    <strong className="text-slate-800">{wheelchairConfirmed.stationDesk}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Direct Helpline:</span>
                    <strong className="text-teal-700 font-mono">{wheelchairConfirmed.deskContact}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWheelchairConfirmed(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Request for Another Station
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 3: TRIP SHIELD & 100% INSTANT REFUND PROTECTION
            ══════════════════════════════════════════════════════════════════════════════ */}
        {(serviceId === 'insurance' || serviceId === 'protection') && (
          <div className="space-y-4">
            {!insuranceConfirmed ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setInsuranceConfirmed({
                    certificateNo: `BMT-SHIELD-${Date.now().toString().slice(-8)}`,
                    pnr: insurancePnr,
                    passenger: insurancePassenger,
                    coverAmount: '₹10,00,000 (Ten Lakhs INR)',
                    refundPolicy: '100% Automated UPI/Bank Reversal (Zero Railway Clerkage)',
                    validity: 'Valid across entire train journey from origin to destination',
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-2xl text-slate-700">
                  <p className="font-bold text-rose-950 flex items-center gap-1.5">
                    <span>🛡️</span> Zero Clerkage Guarantee &amp; Free Accidental Protection
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Cancel anytime before charting and receive 100% full refund with zero cancellation charges. Includes free ₹10 Lakhs travel accidental insurance.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PNR Number to Protect</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={insurancePnr}
                      onChange={(e) => setInsurancePnr(e.target.value)}
                      placeholder="10-digit ticket PNR"
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
                      placeholder="Full Name as per Aadhaar"
                      className="input-field text-xs font-bold"
                      required
                    />
                  </div>

                  {/* Protection Benefits Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-emerald-700">✓ 100% Full Refund</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">No deduction on WL drop or voluntary cancel</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-rose-700">✓ ₹10 Lakhs Cover</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Comprehensive travel accident protection</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Shield Cost</p>
                    <p className="text-base font-extrabold text-rose-700">₹0 &bull; Complimentary on BMT</p>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Activate Trip Shield &rarr;
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-scale-in text-center">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  🛡️
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                    Certificate: {insuranceConfirmed.certificateNo}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">
                    Trip Shield Active for PNR {insuranceConfirmed.pnr}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Insured traveler: <strong>{insuranceConfirmed.passenger}</strong>. 100% automated refund guarantee is armed for this ticket.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Accidental Coverage:</span>
                    <strong className="text-slate-900">{insuranceConfirmed.coverAmount}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Refund Guarantee:</span>
                    <strong className="text-emerald-700 font-bold">{insuranceConfirmed.refundPolicy}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <strong className="text-emerald-700 font-extrabold">Active on Central Reservation Pool</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInsuranceConfirmed(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Protect Another PNR
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 4: WHATSAPP LIVE TRAIN RADAR
            ══════════════════════════════════════════════════════════════════════════════ */}
        {serviceId === 'radar' && (
          <div className="space-y-4">
            {!radarConfirmed ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setRadarConfirmed(true);
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-green-50/80 border border-green-200 rounded-2xl text-slate-700">
                  <p className="font-bold text-green-950 flex items-center gap-1.5">
                    <span>📱</span> Live Satellite Alerts Delivered to Your WhatsApp
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Never worry about sleeping past your stop or guessing platform numbers. Get automatic GPS location pings and 30-minute wakeup alarms sent to your WhatsApp.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp Number (+91)</label>
                    <input
                      type="tel"
                      value={radarPhone}
                      onChange={(e) => setRadarPhone(e.target.value)}
                      placeholder="10-digit WhatsApp number"
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
                      placeholder="e.g. 22436 Vande Bharat or 10-digit PNR"
                      className="input-field text-xs font-bold"
                      required
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={radarWakeup}
                        onChange={(e) => setRadarWakeup(e.target.checked)}
                        className="rounded text-green-600 accent-green-600"
                      />
                      <span className="font-semibold text-slate-800 text-xs">⏰ 30-Minute Wakeup Call before destination station</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={radarGps}
                        onChange={(e) => setRadarGps(e.target.checked)}
                        className="rounded text-green-600 accent-green-600"
                      />
                      <span className="font-semibold text-slate-800 text-xs">📍 Real-time GPS Location &amp; Delay alerts (every 30 mins)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={radarPlatform}
                        onChange={(e) => setRadarPlatform(e.target.checked)}
                        className="rounded text-green-600 accent-green-600"
                      />
                      <span className="font-semibold text-slate-800 text-xs">🚉 Platform Number &amp; Coach Position changes</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <span className="text-[11px] font-bold text-green-700">✓ Free Service</span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Enable WhatsApp Radar &rarr;
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-scale-in text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  💬
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-green-800 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    Radar Active on +91 {radarPhone}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">
                    WhatsApp Radar Linked to Train {radarTrain}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    You will receive direct notifications on WhatsApp. Below is a preview of the upcoming live ping:
                  </p>
                </div>

                {/* Simulated WhatsApp Notification Card */}
                <div className="bg-[#E7F6E7] border border-green-300 rounded-2xl p-4 text-xs text-left space-y-1.5 shadow-xs font-mono">
                  <div className="flex justify-between items-center text-green-900 font-bold border-b border-green-200/80 pb-1">
                    <span>🚆 BMT Live Train Radar (Verified)</span>
                    <span className="text-[10px]">Just now</span>
                  </div>
                  <p className="text-slate-800 font-semibold text-[11px]">Train #22436 Vande Bharat Express</p>
                  <p className="text-slate-700 text-[11px]">&bull; 📍 Position: In transit between Tundla &amp; Kanpur (120 km/h)</p>
                  <p className="text-slate-700 text-[11px]">&bull; 🚉 Next Halt: <strong>Kanpur Central (Pf #1)</strong> in ~24 mins</p>
                  <p className="text-slate-700 text-[11px]">&bull; ⏰ Wake-up alert armed for your destination!</p>
                </div>

                <button
                  type="button"
                  onClick={() => setRadarConfirmed(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Configure Another Alert
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 5: CONNECTING FLIGHTS (RAIL-AIR COMBO)
            ══════════════════════════════════════════════════════════════════════════════ */}
        {serviceId === 'flights' && (
          <div className="space-y-4">
            {!flightConfirmed ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFlightConfirmed({
                    pnr: `AIR-BMT-${Math.floor(100000 + Math.random() * 900000)}`,
                    flight: flightSelected === 'indigo' ? 'IndiGo 6E-2045' : flightSelected === 'airindia' ? 'Air India AI-804' : 'Akasa Air QP-1314',
                    from: flightFrom,
                    to: flightTo,
                    date: flightDate,
                    discount: '₹800 Rail-Air Combo Discount Applied',
                    fare: flightSelected === 'indigo' ? '₹3,450' : flightSelected === 'airindia' ? '₹3,900' : '₹3,190',
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-slate-700">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>✈️</span> Synchronized Rail-Air Combo Ticketing
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Seamless multi-modal travel. Book connecting flights synchronized with your train arrival times, with airport shuttle assistance and luggage insurance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Departure Station / Airport</label>
                    <input
                      type="text"
                      value={flightFrom}
                      onChange={(e) => setFlightFrom(e.target.value)}
                      className="input-field text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destination Airport</label>
                    <input
                      type="text"
                      value={flightTo}
                      onChange={(e) => setFlightTo(e.target.value)}
                      className="input-field text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Travel Date</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="input-field text-xs font-semibold"
                    required
                  />
                </div>

                {/* Selectable Flights */}
                <div className="space-y-2 pt-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Synchronized Flights</label>
                  
                  <div
                    onClick={() => setFlightSelected('indigo')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      flightSelected === 'indigo' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">IndiGo 6E-2045 &bull; Non-stop (2h 15m)</p>
                      <p className="text-[10px] text-slate-500">Dep: 07:15 AM &bull; Arr: 09:30 AM &bull; 4h buffer from train arrival</p>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-800">₹3,450</span>
                  </div>

                  <div
                    onClick={() => setFlightSelected('airindia')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      flightSelected === 'airindia' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">Air India AI-804 &bull; Non-stop (2h 10m)</p>
                      <p className="text-[10px] text-slate-500">Dep: 10:30 AM &bull; Arr: 12:40 PM &bull; Includes complimentary hot meal</p>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-800">₹3,900</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Combo Discount -₹800</span>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Book Air Connect Ticket &rarr;
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-scale-in text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  ✈️
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    Confirmed • PNR {flightConfirmed.pnr}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">
                    Connecting Flight Reserved ({flightConfirmed.flight})
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Route: <strong>{flightConfirmed.from} &rarr; {flightConfirmed.to}</strong> on {flightConfirmed.date}.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Flight:</span>
                    <strong className="text-slate-900">{flightConfirmed.flight}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Combo Benefit:</span>
                    <strong className="text-emerald-700 font-bold">{flightConfirmed.discount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Fare:</span>
                    <strong className="text-slate-900 text-sm">{flightConfirmed.fare}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFlightConfirmed(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Search Another Flight
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 6: FOOD ON TRACK (E-CATERING SEAT DELIVERY)
            ══════════════════════════════════════════════════════════════════════════════ */}
        {serviceId === 'food' && (
          <div className="space-y-4">
            {!foodConfirmed ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-2xl text-slate-700">
                  <p className="font-bold text-orange-950 flex items-center gap-1.5">
                    <span>🍴</span> FSSAI Certified Hot Gourmet Meals Delivered to Coach Seat
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Enter your PNR to order fresh meals from Domino’s, Haldiram’s &amp; top station kitchens. Cash on Delivery supported.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Train PNR</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={foodPnr}
                    onChange={(e) => setFoodPnr(e.target.value)}
                    placeholder="10-digit ticket PNR"
                    className="input-field text-xs font-mono font-bold"
                  />
                </div>

                {/* Food Items */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {MOCK_FOOD_ITEMS.map((food) => (
                    <div key={food.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex justify-between items-center gap-3 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{food.icon}</span>
                          <span className="font-extrabold text-slate-900 text-xs">{food.name}</span>
                          <span className={`text-[9px] font-bold px-1 rounded ${food.type === 'veg' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {food.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{food.desc}</p>
                        <p className="text-xs font-extrabold text-slate-900 mt-1">₹{food.price}</p>
                      </div>

                      <div className="shrink-0">
                        {foodCart[food.id] ? (
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                            <button onClick={() => updateFoodCart(food.id, -1)} className="px-2 py-1 text-slate-700 font-bold hover:bg-slate-200">-</button>
                            <span className="px-2 font-bold text-xs">{foodCart[food.id]}</span>
                            <button onClick={() => updateFoodCart(food.id, 1)} className="px-2 py-1 text-slate-700 font-bold hover:bg-slate-200">+</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateFoodCart(food.id, 1)}
                            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                          >
                            ADD +
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total (Incl. Delivery)</p>
                    <p className="text-base font-extrabold text-orange-700">₹{calculateFoodTotal()}</p>
                  </div>
                  <button
                    disabled={Object.keys(foodCart).length === 0}
                    onClick={() => setFoodConfirmed(true)}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Place Cash on Delivery Order &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-scale-in text-center">
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  🍱
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                    Order Confirmed • COD ₹{calculateFoodTotal()}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">
                    Meal Booking Confirmed for PNR {foodPnr}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Your meal will be prepared fresh and hand-delivered directly to your train coach seat at the upcoming major junction halt.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFoodConfirmed(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Order Additional Meal
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 7: HOTELS & STATION POD LOUNGES
            ══════════════════════════════════════════════════════════════════════════════ */}
        {serviceId === 'hotels' && (
          <div className="space-y-4">
            {!hotelConfirmed ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setHotelConfirmed({
                    bookingId: `BMT-STAY-${Math.floor(100000 + Math.random() * 900000)}`,
                    station: hotelStation,
                    room: hotelType,
                    date: hotelCheckIn,
                    guests: hotelGuests,
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-slate-700">
                  <p className="font-bold text-blue-950 flex items-center gap-1.5">
                    <span>🏨</span> Station Pod Lounges &amp; Verified Retiring Rooms
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Reserve soundproof AC sleeping pods and luxury executive retiring rooms inside railway station platforms across 200+ junctions.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Railway Station Junction</label>
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Accommodation Type</label>
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

                  <div className="grid grid-cols-2 gap-3">
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
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Guests &amp; Beds</label>
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
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <span className="text-[11px] font-bold text-blue-700">✓ Free Cancellation up to 2h</span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Confirm Station Stay &rarr;
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-scale-in text-center">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  🏨
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                    Stay Voucher: {hotelConfirmed.bookingId}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">
                    Station Pod Reserved at {hotelConfirmed.station}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Your keycode and access pass have been generated. Present voucher at the platform executive desk.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Accommodation:</span>
                    <strong className="text-slate-800">{hotelConfirmed.room}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Check-in:</span>
                    <strong className="text-slate-800">{hotelConfirmed.date} (24x7 desk open)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Access Keycode:</span>
                    <strong className="text-blue-700 font-mono font-bold text-sm">POD-7749</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHotelConfirmed(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Reserve Another Stay
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            FEATURE 8: PLATFORM CABS & AUTO (RIDE TRACKER EXTERNAL WEBSITE)
            ══════════════════════════════════════════════════════════════════════════════ */}
        {(serviceId === 'cabs' || serviceId === 'ride') && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-md shadow-amber-500/20">
              🚖
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3 py-1 rounded-full border border-amber-300">
                Zero Surge Guarantee &bull; Ride Tracker App
              </span>
              <h4 className="font-extrabold text-xl text-slate-900 mt-2">
                Platform Cabs &amp; Auto Pickup
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                Pre-book verified platform exit pickup with live GPS tracking on Ride Tracker. Fixed government meter fares, zero surge pricing, and verified drivers waiting at the platform exit.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-slate-700">
              ⚡ Opening Ride Tracker official booking portal in a secure new tab.
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://ride-tracker-ruddy.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Ride Tracker Web App ↗</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
