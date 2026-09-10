import { useState } from 'react';
import { Link } from 'react-router-dom';

const ALL_SERVICES = [
  {
    id: 'food',
    title: 'Food on Track (E-Catering)',
    badge: 'Seat Delivery',
    icon: '🍴',
    desc: 'Order hygienic, restaurant-quality meals from Domino’s, Haldiram’s & Saravana Bhavan delivered directly to your train coach seat.',
    features: ['Live tracking with PNR', 'Cash on Delivery available', 'FSSAI certified partner kitchens', 'Warm and fresh packaging'],
    buttonText: 'Order Food Now',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    accentColor: 'text-orange-700'
  },
  {
    id: 'hotels',
    title: 'Hotels & Executive Lounges',
    badge: 'BMT Verified',
    icon: '🏨',
    desc: 'Reserve luxury station retiring rooms, soundproof pods, or verified premium hotels within 500 meters of railway stations across India.',
    features: ['Hourly stay packages', 'Free high-speed WiFi', '24x7 check-in / check-out', 'Shower & baggage locker facilities'],
    buttonText: 'Browse Railway Stays',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    accentColor: 'text-blue-700'
  },
  {
    id: 'flights',
    title: 'Connecting Flight Tickets',
    badge: 'Rail-Air Combo',
    icon: '✈️',
    desc: 'Connecting distant rail hubs with domestic flights. Book multi-modal travel with synchronized schedules and zero layover stress.',
    features: ['Direct airport-rail shuttle guidance', 'Combo discounts up to ₹800', 'Baggage guarantee insurance', 'Instant digital boarding pass'],
    buttonText: 'Explore Air Connect',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    accentColor: 'text-emerald-700'
  },
  {
    id: 'cabs',
    title: 'Station Cabs & Metro Connect',
    badge: 'Zero Surge Pricing',
    icon: '🚖',
    desc: 'Pre-book verified station taxis or auto-rickshaws waiting at platform exits. Direct metro cards and QR tickets supported.',
    features: ['Fixed rate platform pickup', 'Driver details 30m prior to arrival', 'Zero surge guarantee', 'Direct integration with UPI'],
    buttonText: 'Book Station Taxi',
    color: 'from-amber-600 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    accentColor: 'text-amber-700'
  },
  {
    id: 'porter',
    title: 'Station Porter (Coolie) Booking',
    badge: 'Official Tariff',
    icon: '🧳',
    desc: 'Pre-book verified licensed railway porters at your coach arrival gate. Transparent fixed government luggage tariffs.',
    features: ['Zero bargaining guarantee', 'Porter waiting at coach door', 'Safe handling of heavy luggage', 'Digital receipt with booking'],
    buttonText: 'Book Station Porter',
    color: 'from-purple-600 to-indigo-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    accentColor: 'text-purple-700'
  },
  {
    id: 'wheelchair',
    title: 'Wheelchair & Accessibility Help',
    badge: 'Free Station Service',
    icon: '♿',
    desc: 'Dedicated electric buggy rides and wheelchair attendants for senior citizens and differently-abled travelers across all major junctions.',
    features: ['Platform-to-coach ramp escort', 'Free priority boarding assistance', '24x7 station accessibility desk', 'SMS attendant contact'],
    buttonText: 'Request Assistance',
    color: 'from-teal-600 to-emerald-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    accentColor: 'text-teal-700'
  },
  {
    id: 'insurance',
    title: 'Trip Guarantee & Free Cancel',
    badge: '100% Refund',
    icon: '🛡️',
    desc: 'Enjoy complete peace of mind. Get full 100% instant refunds if your waitlist ticket fails to confirm or if your travel plans change.',
    features: ['Zero cancellation fee penalty', 'Instant UPI rollback to source', 'Free ₹10 Lakhs travel accident cover', 'Delayed train compensation'],
    buttonText: 'Activate Protection',
    color: 'from-rose-600 to-pink-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    accentColor: 'text-rose-700'
  },
  {
    id: 'radar',
    title: 'WhatsApp Live Train Radar',
    badge: 'Instant GPS',
    icon: '📱',
    desc: 'Get live GPS tracking, upcoming station delay alarms, and platform number alerts sent automatically to your WhatsApp.',
    features: ['Zero app installation required', 'Automated wakeup alarms 30m prior', 'Platform change alerts in real-time', 'Family live route sharing'],
    buttonText: 'Enable WhatsApp Radar',
    color: 'from-green-600 to-emerald-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    accentColor: 'text-green-700'
  }
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [notified, setNotified] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFCFE] py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            Complete Rail Travel Ecosystem
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Integrated Travel Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            From chef-cooked gourmet meals at your train seat to luxury station lounges, airport combos, and station porter bookings.
          </p>
        </div>

        {/* 8 Compact Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_SERVICES.map((s) => (
            <div
              key={s.id}
              className={`p-4 bg-white border ${s.borderColor} shadow-xs hover:shadow-card-hover rounded-2xl transition-all duration-300 flex flex-col justify-between group`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-150 group-hover:scale-105 transition-transform">
                    {s.icon}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${s.bgColor} ${s.accentColor} border ${s.borderColor}`}>
                    {s.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {s.desc}
                  </p>
                </div>

                {/* Key Features List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {s.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedService(s);
                    setNotified(false);
                  }}
                  className={`w-full py-2 rounded-xl text-white font-bold text-xs bg-gradient-to-r ${s.color} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center`}
                >
                  {s.buttonText} &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Feature Update Modal (Requested by User!) */}
        {selectedService && (
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in-up"
            onClick={() => setSelectedService(null)}
          >
            <div
              className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-xs">
                {selectedService.icon}
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  🚀 Upcoming Feature Update · v2.4
                </span>
                <h4 className="font-extrabold text-slate-900 text-xl mt-2 leading-tight">
                  {selectedService.title}
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed font-medium mt-1.5 max-w-sm mx-auto">
                  We will add these features in our upcoming update! We are currently completing live API testing with the Indian Railway catering and logistics network.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 font-semibold">
                ⏳ Integration in progress. Thank you for your patience while we connect all stations!
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNotified(true)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    notified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {notified ? '✓ You are on the priority launch list!' : 'Notify Me When Live'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(null);
                    setNotified(false);
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home CTA */}
        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
          >
            <span>&larr;</span> Back to Home &amp; Train Search
          </Link>
        </div>

      </div>
    </div>
  );
}
