/**
 * Premium Illustrated Icons for Rail Travel Services
 * - Designed on a crisp 24x24 standard vector grid
 * - Multi-layer duotone fills, glossy light reflections and jewel-tone backdrops
 * - Strictly bounded dimensions (never breaks card layouts or flex containers)
 */

const SIZE_CONFIGS = {
  sm: {
    boxClass: 'w-8 h-8 p-1.5 rounded-lg',
    svgSize: 18,
    px: 32
  },
  md: {
    boxClass: 'w-10 h-10 p-2 rounded-xl',
    svgSize: 22,
    px: 40
  },
  lg: {
    boxClass: 'w-11 h-11 p-2 rounded-xl',
    svgSize: 24,
    px: 44
  },
  xl: {
    boxClass: 'w-14 h-14 p-2.5 rounded-2xl',
    svgSize: 30,
    px: 56
  }
};

export default function ServiceRealisticIcon({ id, size = 'md', className = '' }) {
  const cfg = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  // Curated jewel-tone gradient backgrounds with delicate borders and ambient glow
  const containerThemes = {
    food: 'bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-orange-200/90 shadow-2xs text-orange-600',
    hotels: 'bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-blue-500/5 border border-blue-200/90 shadow-2xs text-blue-600',
    cabs: 'bg-gradient-to-br from-amber-400/20 via-yellow-500/15 to-orange-500/10 border border-amber-300 shadow-2xs text-amber-600',
    flights: 'bg-gradient-to-br from-sky-400/20 via-blue-500/10 to-indigo-500/5 border border-sky-200/90 shadow-2xs text-sky-600',
    porter: 'bg-gradient-to-br from-rose-500/15 via-red-500/10 to-rose-500/5 border border-rose-200/90 shadow-2xs text-rose-600',
    wheelchair: 'bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-teal-500/5 border border-teal-200/90 shadow-2xs text-teal-600',
    insurance: 'bg-gradient-to-br from-indigo-500/15 via-blue-600/10 to-indigo-500/5 border border-indigo-200/90 shadow-2xs text-indigo-600',
    radar: 'bg-gradient-to-br from-emerald-500/15 via-green-500/10 to-emerald-500/5 border border-emerald-200/90 shadow-2xs text-emerald-600'
  }[id] || 'bg-slate-100 border border-slate-200 text-slate-700';

  const renderSvg = () => {
    switch (id) {
      // 1. FOOD ON TRACK: Gourmet Banquet Cloche with Swirling Hot Steam & Crossed Chef Cutlery
      case 'food':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Rising Steam */}
            <path d="M8 3.5C8 2.5 9 2 9 1" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M12 3C12 2 13 1.5 13 0.5" stroke="#ea580c" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M16 3.5C16 2.5 17 2 17 1" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" />
            {/* Cloche Knob */}
            <circle cx="12" cy="5.5" r="1.2" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
            {/* Cloche Dome */}
            <path d="M4 14C4 8.8 7.5 6.8 12 6.8C16.5 6.8 20 8.8 20 14H4Z" fill="url(#food-dome-grad)" stroke="#ea580c" strokeWidth="1.4" strokeLinejoin="round" />
            {/* Cloche Highlight */}
            <path d="M6.5 13C6.5 10 8.5 8.5 12 8.5" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.85" />
            {/* Base Tray Platter */}
            <rect x="2.5" y="14" width="19" height="2.5" rx="1.25" fill="#f97316" stroke="#c2410c" strokeWidth="0.9" />
            {/* Cutlery underneath */}
            <path d="M7 18.5L9.5 22" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M17 18.5L14.5 22" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M11 18.5H13" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
            <defs>
              <linearGradient id="food-dome-grad" x1="4" y1="6.8" x2="20" y2="14" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="55%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
        );

      // 2. HOTELS & POD LOUNGES: Luxury Hotel Tower with 3 Golden Stars & Glowing Suite Windows
      case 'hotels':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Hotel Building Base */}
            <rect x="3.5" y="6.5" width="17" height="15.5" rx="2" fill="url(#hotel-grad)" stroke="#2563eb" strokeWidth="1.4" />
            {/* 3 Golden Stars overhead */}
            <g transform="translate(0, -0.5)">
              <path d="M8 4L8.7 5.5L10.2 5.5L9 6.4L9.5 7.8L8.2 6.9L7 7.8L7.4 6.4L6.2 5.5L7.7 5.5Z" fill="#fbbf24" />
              <path d="M12 2.5L12.8 4.2L14.5 4.2L13.1 5.2L13.7 6.8L12.2 5.8L10.8 6.8L11.3 5.2L10 4.2L11.7 4.2Z" fill="#f59e0b" />
              <path d="M16 4L16.7 5.5L18.2 5.5L17 6.4L17.5 7.8L16.2 6.9L15 7.8L15.4 6.4L14.2 5.5L15.7 5.5Z" fill="#fbbf24" />
            </g>
            {/* Suite Windows in 2x3 grid */}
            <rect x="5.8" y="8.5" width="3" height="2.2" rx="0.5" fill="#fef08a" />
            <rect x="10.5" y="8.5" width="3" height="2.2" rx="0.5" fill="#93c5fd" />
            <rect x="15.2" y="8.5" width="3" height="2.2" rx="0.5" fill="#fef08a" />
            <rect x="5.8" y="12.5" width="3" height="2.2" rx="0.5" fill="#93c5fd" />
            <rect x="10.5" y="12.5" width="3" height="2.2" rx="0.5" fill="#fef08a" />
            <rect x="15.2" y="12.5" width="3" height="2.2" rx="0.5" fill="#93c5fd" />
            {/* Grand Entrance Canopy */}
            <path d="M9.5 22V18.5C9.5 17.8 10.1 17.2 10.8 17.2H13.2C13.9 17.2 14.5 17.8 14.5 18.5V22" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
            <defs>
              <linearGradient id="hotel-grad" x1="3.5" y1="6.5" x2="20.5" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#eff6ff" />
                <stop offset="100%" stopColor="#bfdbfe" />
              </linearGradient>
            </defs>
          </svg>
        );

      // 3. PLATFORM CABS & AUTO: Front-Perspective City Sedan Taxi with TAXI Sign & GPS Map Pin
      case 'cabs':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Floating GPS Location Pin */}
            <g transform="translate(9, 0.5) scale(0.6)">
              <path d="M5 0C2.2 0 0 2.2 0 5C0 8.8 5 12.5 5 12.5C5 12.5 10 8.8 10 5C10 2.2 7.8 0 5 0Z" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="5" cy="5" r="1.8" fill="#ffffff" />
            </g>
            {/* TAXI Roof Sign */}
            <rect x="9.5" y="8" width="5" height="1.8" rx="0.8" fill="#1e293b" />
            <rect x="10.5" y="8.3" width="3" height="1.2" rx="0.4" fill="#fef08a" />
            {/* Modern Aerodynamic Sedan Body */}
            <path d="M5 14L7.5 10.2C8 9.5 8.8 9.2 9.7 9.2H14.3C15.2 9.2 16 9.5 16.5 10.2L19 14C20.2 14.3 21 15.3 21 16.5V19C21 19.6 20.6 20 20 20H18.8C18.4 18.8 17.3 18 16 18C14.7 18 13.6 18.8 13.2 20H10.8C10.4 18.8 9.3 18 8 18C6.7 18 5.6 18.8 5.2 20H4C3.4 20 3 19.6 3 19V16.5C3 15.3 3.8 14.3 5 14Z" fill="url(#taxi-grad)" stroke="#b45309" strokeWidth="1.3" strokeLinejoin="round" />
            {/* Front Windshield */}
            <path d="M7.8 13.5L9.6 10.6C9.8 10.3 10.2 10.1 10.6 10.1H13.4C13.8 10.1 14.2 10.3 14.4 10.6L16.2 13.5H7.8Z" fill="#0f172a" />
            {/* Headlights */}
            <circle cx="5.5" cy="16" r="1.2" fill="#fef08a" stroke="#d97706" strokeWidth="0.7" />
            <circle cx="18.5" cy="16" r="1.2" fill="#fef08a" stroke="#d97706" strokeWidth="0.7" />
            {/* Wheels with Hubs */}
            <circle cx="8" cy="19.5" r="2" fill="#0f172a" />
            <circle cx="8" cy="19.5" r="0.8" fill="#f8fafc" />
            <circle cx="16" cy="19.5" r="2" fill="#0f172a" />
            <circle cx="16" cy="19.5" r="0.8" fill="#f8fafc" />
            <defs>
              <linearGradient id="taxi-grad" x1="3" y1="9.2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        );

      // 4. CONNECTING FLIGHTS: Commercial Jet Airliner in Banked Climb with Speed Contrail
      case 'flights':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Contrail Path */}
            <path d="M3 20C7 18 11 14 15 8" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 2" />
            {/* Banked Jet Airliner */}
            <g transform="translate(6, 2) rotate(15 8 8)">
              {/* Left Wing */}
              <path d="M7 8L1 12.5L2 13.5L8 10Z" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="0.8" />
              {/* Right Wing */}
              <path d="M9 7L15 2.5L16 3.5L10 9Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="0.8" />
              {/* Tail Fin */}
              <path d="M1.5 6L0 2.5L2.5 4.5L4 7Z" fill="#1e40af" />
              {/* Fuselage */}
              <path d="M1 8.5H12C14.5 8.5 16.5 9.5 17.5 10.5C16.5 11.5 14.5 12.5 12 12.5H1Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1.2" />
              {/* Cockpit Window */}
              <path d="M15 9.8L16.2 10.5L15 11.2Z" fill="#0f172a" />
              {/* Cabin Windows */}
              <line x1="4" y1="10.5" x2="13" y2="10.5" stroke="#0284c7" strokeWidth="1" strokeDasharray="1 1" />
            </g>
            {/* Cloud Cushion Base */}
            <path d="M2 21.5C2 20 3.5 19.5 4.5 20C5 19 6.5 19 7 20C8 19.5 9.5 20 9.5 21.5H2Z" fill="#bae6fd" fillOpacity="0.7" />
          </svg>
        );

      // 5. COOLIE / PORTER: Heavy Luggage Trolley, Stacked Vintage Trunks & Official Coolie Badge
      case 'porter':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Official Coolie Armband Badge (Billa No. 786) */}
            <rect x="2" y="2.5" width="7" height="4.5" rx="1.2" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
            <text x="5.5" y="6" fill="#78350f" fontSize="3" fontWeight="900" textAnchor="middle">№786</text>
            {/* Luggage Trolley Handle and Frame */}
            <path d="M21 21H7L4 7" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 7L2.5 6" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
            {/* Bottom Travel Trunk (Navy Leather) */}
            <rect x="7.5" y="13" width="13.5" height="6.5" rx="1.2" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="0.9" />
            <line x1="10" y1="13" x2="10" y2="19.5" stroke="#f59e0b" strokeWidth="1" />
            <line x1="18.5" y1="13" x2="18.5" y2="19.5" stroke="#f59e0b" strokeWidth="1" />
            <rect x="12.5" y="12" width="3.5" height="1.2" rx="0.4" fill="#f59e0b" />
            {/* Top Travel Trunk (Ruby Red) */}
            <rect x="9" y="7.5" width="10.5" height="5.5" rx="1.2" fill="#dc2626" stroke="#fca5a5" strokeWidth="0.9" />
            <line x1="11.5" y1="7.5" x2="11.5" y2="13" stroke="#fef08a" strokeWidth="1" />
            <line x1="17" y1="7.5" x2="17" y2="13" stroke="#fef08a" strokeWidth="1" />
            <rect x="13" y="6.6" width="2.5" height="1" rx="0.3" fill="#fef08a" />
            {/* Heavy Rubber Trolley Wheels */}
            <circle cx="8" cy="21" r="2.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="8" cy="21" r="0.8" fill="#f8fafc" />
            <circle cx="19" cy="21" r="2.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="19" cy="21" r="0.8" fill="#f8fafc" />
          </svg>
        );

      // 6. WHEELCHAIR ASSISTANCE: International Active Mobility Wheelchair with Caring Heart Accent
      case 'wheelchair':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Caring Heart Accent Top */}
            <path d="M16 2.5C15 1.5 13.5 2 13 3C12.5 2 11 1.5 10 2.5C8.5 4 11.5 6.5 13 7.5C14.5 6.5 17.5 4 16 2.5Z" fill="#f43f5e" />
            {/* Passenger Figure */}
            <circle cx="13" cy="9.5" r="1.8" fill="#0d9488" />
            {/* Wheelchair Frame */}
            <path d="M12 12H14L15.5 16.5H18.5" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 13.5H9.5" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round" />
            {/* Push Handle */}
            <path d="M8.5 11.5L9.5 13.5V17" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" />
            {/* Spoked Drive Wheel */}
            <circle cx="11.5" cy="17" r="4.2" stroke="#0d9488" strokeWidth="1.6" />
            <line x1="11.5" y1="13" x2="11.5" y2="21" stroke="#2dd4bf" strokeWidth="0.9" />
            <line x1="7.5" y1="17" x2="15.5" y2="17" stroke="#2dd4bf" strokeWidth="0.9" />
            <circle cx="11.5" cy="17" r="1.2" fill="#115e59" />
            {/* Front Caster */}
            <circle cx="18" cy="20.5" r="1.3" fill="#0f172a" />
          </svg>
        );

      // 7. TRIP PROTECTION & REFUND: 3D Beveled Aegis Shield with Golden Rim & Verified Checkmark
      case 'insurance':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Metallic Golden Rim Shield Body */}
            <path d="M12 1.5L20 4.5C20 12 16.5 18.5 12 22C7.5 18.5 4 12 4 4.5L12 1.5Z" fill="url(#ins-shield-grad)" stroke="#f59e0b" strokeWidth="1.4" strokeLinejoin="round" />
            {/* Inner Light Flare Bevel */}
            <path d="M12 3L18.5 5.5C18.5 11.5 15.5 17 12 20V3Z" fill="#ffffff" fillOpacity="0.22" />
            {/* 100% Refund Verified Checkmark */}
            <path d="M8 11.5L10.8 14.5L16 8.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Sparkle Glint Top-Right */}
            <path d="M18.5 2.5L19 4L20.5 4L19.3 5L19.7 6.5L18.5 5.5L17.3 6.5L17.7 5L16.5 4L18 4Z" fill="#fbbf24" />
            <defs>
              <linearGradient id="ins-shield-grad" x1="4" y1="1.5" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="60%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
          </svg>
        );

      // 8. WHATSAPP TRAIN RADAR: Smartphone with Concentric Radar Waves, Train Blip & WhatsApp Emblem
      case 'radar':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: `${cfg.svgSize}px`, height: `${cfg.svgSize}px` }}>
            {/* Concentric Radar Waves */}
            <path d="M14 4C17.5 5.2 20 8 20.5 11" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M13 7C15.5 7.8 17 9.5 17.5 11.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            {/* Smartphone Case */}
            <rect x="4" y="5" width="11" height="17" rx="2.5" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />
            {/* Radar Screen Area */}
            <rect x="5.2" y="7" width="8.6" height="12.5" rx="1" fill="#022c22" />
            {/* Radar Crosshairs */}
            <circle cx="9.5" cy="13.2" r="3.2" stroke="#16a34a" strokeWidth="0.8" strokeDasharray="1 1" />
            <circle cx="9.5" cy="13.2" r="1.5" stroke="#22c55e" strokeWidth="0.8" />
            {/* Live GPS Blip */}
            <circle cx="10.5" cy="12.2" r="1" fill="#ef4444" />
            {/* WhatsApp Chat Speech Bubble Badge Top-Right */}
            <g transform="translate(13.5, 1)">
              <circle cx="4.5" cy="4.5" r="4.2" fill="#25d366" stroke="#ffffff" strokeWidth="1" />
              <path d="M2.8 5.8C2.8 5.8 3.3 6.6 4.7 6.6C6.1 6.6 6.6 5.8 6.6 5.8C6.3 5 5.7 5 5.4 5.3L4.9 5.8C4.1 5.5 3.6 5 3.3 4.2L3.8 3.7C4.1 3.4 4.1 2.8 3.3 2.5C3.3 2.5 2.5 3 2.8 5.8Z" fill="#ffffff" />
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${cfg.boxClass} ${containerThemes} ${className}`}
      style={{
        width: `${cfg.px}px`,
        height: `${cfg.px}px`,
        minWidth: `${cfg.px}px`,
        minHeight: `${cfg.px}px`,
        maxWidth: `${cfg.px}px`,
        maxHeight: `${cfg.px}px`
      }}
    >
      {renderSvg()}
    </div>
  );
}
