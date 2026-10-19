/**
 * Realistic Multi-Layer Illustrated Icons for Rail Travel Services
 * Replaces generic flat emojis with high-fidelity, vibrant SVG artwork
 * featuring dynamic poses, depth, lighting and thematic color schemes.
 */

export default function ServiceRealisticIcon({ id, size = 'md', className = '' }) {
  // Container dimensions & padding based on requested size
  const sizeClasses = {
    sm: 'w-8 h-8 p-1 rounded-lg',
    md: 'w-11 h-11 p-1.5 rounded-xl',
    lg: 'w-13 h-13 p-2 rounded-2xl',
    xl: 'w-16 h-16 p-2.5 rounded-2xl'
  }[size] || 'w-11 h-11 p-1.5 rounded-xl';

  // Distinct jewel-tone gradient and glowing ambient shadow for each service
  const containerThemes = {
    food: 'bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/90 shadow-xs shadow-orange-500/10 text-orange-600',
    hotels: 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/90 shadow-xs shadow-blue-500/10 text-blue-600',
    cabs: 'bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-300 shadow-xs shadow-amber-500/15 text-amber-600',
    flights: 'bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-200/90 shadow-xs shadow-sky-500/10 text-sky-600',
    porter: 'bg-gradient-to-br from-rose-50 to-red-100 border border-rose-200/90 shadow-xs shadow-rose-500/10 text-rose-600',
    wheelchair: 'bg-gradient-to-br from-teal-50 to-emerald-100 border border-teal-200/90 shadow-xs shadow-teal-500/10 text-teal-600',
    insurance: 'bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200/90 shadow-xs shadow-indigo-500/10 text-indigo-600',
    radar: 'bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/90 shadow-xs shadow-emerald-500/10 text-emerald-600'
  }[id] || 'bg-slate-50 border border-slate-200';

  const renderSvg = () => {
    switch (id) {
      // 1. FOOD ON TRACK: Gourmet Banquet Cloche with Swirling Hot Steam & Golden Cutlery
      case 'food':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Swirling Hot Aroma Steam */}
            <path d="M16 11 C15 7, 18 6, 17 3" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M24 10 C23 6, 26 5, 25 2" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 11 C31 7, 34 6, 33 3" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
            {/* Cloche Top Brass Knob */}
            <circle cx="24" cy="13" r="2.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
            {/* Polished Gourmet Cloche Dome */}
            <path d="M9 28 C9 18 15 14 24 14 C33 14 39 18 39 28 Z" fill="url(#food-cloche-grad)" stroke="#ea580c" strokeWidth="1.2" />
            {/* Realistic Light Reflection Glare */}
            <path d="M14 26 C15 20 19 16 25 16" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.85" />
            {/* Banquet Serving Platter Tray */}
            <rect x="6" y="28" width="36" height="4" rx="2" fill="#ea580c" stroke="#9a3412" strokeWidth="0.8" />
            <path d="M10 32 L38 32 L35 35 L13 35 Z" fill="#c2410c" />
            {/* Crossed Chef Fork and Knife */}
            <path d="M15 37 L19 43" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M33 37 L29 43" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="24" cy="27" r="2" fill="#16a34a" />
            <defs>
              <linearGradient id="food-cloche-grad" x1="9" y1="14" x2="39" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="50%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
        );

      // 2. HOTELS & POD LOUNGES: Luxury High-Rise Hotel & Pod with Golden Stars & Suite Lighting
      case 'hotels':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* 3 Golden Luxury Stars */}
            <path d="M16 6 L17 9 L20 9 L17.5 11 L18.5 14 L16 12 L13.5 14 L14.5 11 L12 9 L15 9 Z" fill="#fbbf24" />
            <path d="M24 4 L25.2 7.5 L29 7.5 L26 9.8 L27.2 13.5 L24 11.2 L20.8 13.5 L22 9.8 L19 7.5 L22.8 7.5 Z" fill="#f59e0b" />
            <path d="M32 6 L33 9 L36 9 L33.5 11 L34.5 14 L32 12 L29.5 14 L30.5 11 L28 9 L31 9 Z" fill="#fbbf24" />
            {/* Boutique Hotel & Sleeping Pod Tower */}
            <rect x="8" y="16" width="32" height="28" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.2" />
            {/* Glowing Executive Windows */}
            <rect x="12" y="20" width="6" height="5" rx="1" fill="#fef08a" />
            <rect x="21" y="20" width="6" height="5" rx="1" fill="#38bdf8" fillOpacity="0.85" />
            <rect x="30" y="20" width="6" height="5" rx="1" fill="#fef08a" />
            <rect x="12" y="28" width="6" height="5" rx="1" fill="#38bdf8" fillOpacity="0.85" />
            <rect x="21" y="28" width="6" height="5" rx="1" fill="#fef08a" />
            <rect x="30" y="28" width="6" height="5" rx="1" fill="#38bdf8" fillOpacity="0.85" />
            {/* Grand Welcome Portico */}
            <path d="M19 44 L19 37 Q24 35 29 37 L29 44 Z" fill="#f59e0b" />
            <rect x="18" y="36" width="12" height="2" rx="0.5" fill="#fef08a" />
          </svg>
        );

      // 3. PLATFORM CABS & AUTO: 3D Sedan Taxi with Illuminated TAXI Sign & GPS Radar Pin
      case 'cabs':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Floating GPS Location Pin */}
            <g transform="translate(18, 1)">
              <path d="M6 0 C2.7 0 0 2.7 0 6 C0 10.5 6 15 6 15 C6 15 12 10.5 12 6 C12 2.7 9.3 0 6 0 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
              <circle cx="6" cy="6" r="2" fill="#ffffff" />
            </g>
            {/* TAXI Roof Top-light */}
            <rect x="19" y="15" width="10" height="3.5" rx="1" fill="#1e293b" />
            <rect x="20.5" y="15.5" width="7" height="2.5" rx="0.5" fill="#fef08a" />
            <path d="M22 17 L26 17" stroke="#000000" strokeWidth="1" />
            {/* Sleek Aerodynamic Sedan Body */}
            <path d="M12 24 L16 18 C17 17 19 16.5 21 16.5 L27 16.5 C29 16.5 31 17 32 18 L36 24 L42 26 C43.5 26.5 44 28 44 30 L44 35 C44 36 43 37 42 37 L40 37 C40 35 38 33 35.5 33 C33 33 31 35 31 37 L17 37 C17 35 15 33 12.5 33 C10 33 8 35 8 37 L6 37 C5 37 4 36 4 35 L4 30 C4 28 4.5 26.5 6 26 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
            {/* Tinted Panoramic Windshield */}
            <path d="M17 23 L19.5 19 C20 18.5 20.8 18 21.5 18 L26.5 18 C27.2 18 28 18.5 28.5 19 L31 23 Z" fill="#0f172a" />
            {/* Checkered Taxi Decal Band */}
            <rect x="7" y="27" width="4" height="2" fill="#000000" />
            <rect x="15" y="27" width="4" height="2" fill="#000000" />
            <rect x="23" y="27" width="4" height="2" fill="#000000" />
            <rect x="31" y="27" width="4" height="2" fill="#000000" />
            <rect x="39" y="27" width="4" height="2" fill="#000000" />
            {/* High-Beam Headlights */}
            <circle cx="7" cy="30" r="2" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
            <circle cx="41" cy="30" r="2" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
            {/* Wheels with Chrome Hubs */}
            <circle cx="12.5" cy="36" r="4.5" fill="#0f172a" />
            <circle cx="12.5" cy="36" r="2" fill="#f8fafc" />
            <circle cx="35.5" cy="36" r="4.5" fill="#0f172a" />
            <circle cx="35.5" cy="36" r="2" fill="#f8fafc" />
          </svg>
        );

      // 4. CONNECTING FLIGHTS: Passenger Jet Soaring in Banked Climb with Speed Streams
      case 'flights':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Curved Flight Contrail Stream */}
            <path d="M5 41 C13 36, 21 28, 29 18" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" opacity="0.8" />
            {/* Banked Jet Airliner */}
            <g transform="translate(10, 4) rotate(16 16 16)">
              {/* Left Wing */}
              <path d="M14 16 L2 24 L4 26 L16 20 Z" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="0.8" />
              {/* Right Wing */}
              <path d="M18 14 L30 6 L32 8 L20 18 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="0.8" />
              {/* Tail Fin */}
              <path d="M3 13 L0 6 L5 10 L8 15 Z" fill="#2563eb" />
              {/* Streamlined Fuselage */}
              <path d="M2 17 L24 17 C29 17 33 19 35 21 C33 23 29 25 24 25 L2 25 Z" fill="#ffffff" stroke="#1e40af" strokeWidth="1.2" />
              {/* Cockpit Visor */}
              <path d="M30 19 L33 20 L30 21 Z" fill="#0f172a" />
              {/* Windows Line */}
              <line x1="8" y1="20" x2="26" y2="20" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2 1.5" />
              {/* Underwing Jet Turbine */}
              <rect x="13" y="21" width="5" height="3" rx="1.5" fill="#475569" stroke="#1e293b" strokeWidth="0.8" />
            </g>
            {/* Soft Ambient Cloud Cushion */}
            <path d="M4 42 C4 39 7 38 9 39 C10 37 13 37 14 39 C16 38 19 39 19 42 Z" fill="#0284c7" fillOpacity="0.15" />
          </svg>
        );

      // 5. COOLIE / PORTER: Heavy Luggage Trolley, Stacked Suitcases & Official Brass Armband Badge
      case 'porter':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Official Indian Railways Coolie Badge (Billa No. 786) */}
            <rect x="4" y="5" width="14" height="8" rx="2" fill="#facc15" stroke="#b45309" strokeWidth="0.9" />
            <text x="11" y="11" fill="#78350f" fontSize="4.5" fontWeight="900" textAnchor="middle">№786</text>
            {/* Luggage Trolley Handle and Chassis */}
            <path d="M42 42 L14 42 L8 14" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 14 L5 12" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
            {/* Heavy Travel Trunk 1 (Navy Leather, Bottom) */}
            <rect x="15" y="26" width="26" height="13" rx="2" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
            <line x1="20" y1="26" x2="20" y2="39" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="36" y1="26" x2="36" y2="39" stroke="#f59e0b" strokeWidth="1.2" />
            <rect x="25" y="24" width="6" height="2" rx="0.5" fill="#f59e0b" />
            {/* Heavy Travel Trunk 2 (Ruby Red, Top) */}
            <rect x="18" y="15" width="20" height="11" rx="2" fill="#dc2626" stroke="#fca5a5" strokeWidth="1" />
            <line x1="22" y1="15" x2="22" y2="26" stroke="#fef08a" strokeWidth="1.2" />
            <line x1="34" y1="15" x2="34" y2="26" stroke="#fef08a" strokeWidth="1.2" />
            <rect x="26" y="13.5" width="4" height="2" rx="0.5" fill="#fef08a" />
            {/* Trolley Heavy Rubber Wheels */}
            <circle cx="16" cy="42" r="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="16" cy="42" r="1.5" fill="#f8fafc" />
            <circle cx="38" cy="42" r="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="38" cy="42" r="1.5" fill="#f8fafc" />
          </svg>
        );

      // 6. WHEELCHAIR ASSISTANCE: Active Sports Wheelchair with Spoked Rim & Caring Heart Halo
      case 'wheelchair':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Compassionate Escort Heart Halo */}
            <path d="M30 6 C28 4, 25 5, 24 7 C23 5, 20 4, 18 6 C15 9, 21 14, 24 16 C27 14, 33 9, 30 6 Z" fill="#f43f5e" />
            {/* Passenger Figure */}
            <circle cx="24" cy="20" r="3.5" fill="#0d9488" />
            {/* Ergonomic Wheelchair Chassis & Armrest */}
            <path d="M22 25 L26 25 L29 34 L35 34" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 28 L17 28" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
            {/* Push Handle */}
            <path d="M15 24 L17 28 L17 35" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            {/* Large Spoked Main Drive Wheel */}
            <circle cx="21" cy="35" r="8" stroke="#0d9488" strokeWidth="2" />
            <line x1="21" y1="27" x2="21" y2="43" stroke="#2dd4bf" strokeWidth="1" />
            <line x1="13" y1="35" x2="29" y2="35" stroke="#2dd4bf" strokeWidth="1" />
            <line x1="15.5" y1="29.5" x2="26.5" y2="40.5" stroke="#2dd4bf" strokeWidth="1" />
            <line x1="15.5" y1="40.5" x2="26.5" y2="29.5" stroke="#2dd4bf" strokeWidth="1" />
            <circle cx="21" cy="35" r="2.5" fill="#115e59" />
            {/* Front Ground Caster */}
            <circle cx="34" cy="41" r="2.5" fill="#0f172a" />
          </svg>
        );

      // 7. TRIP PROTECTION & REFUND: 3D Beveled Aegis Shield with Golden Rim & Verified Checkmark
      case 'insurance':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Metallic Golden Rim Shield Body */}
            <path d="M24 3 L40 9 C40 24 33 37 24 44 C15 37 8 24 8 9 L24 3 Z" fill="url(#shield-grad)" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
            {/* Inner Light Bevel Flare */}
            <path d="M24 6 L37 11 C37 23 31 34 24 40 Z" fill="#ffffff" fillOpacity="0.22" />
            {/* Bold 100% Guaranteed Refund Checkmark */}
            <path d="M16 23 L22 29 L32 17" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Trust Sparkle Badge on Crest */}
            <path d="M37 6 L38 9 L41 9 L38.5 11 L39.5 14 L37 12 L34.5 14 L35.5 11 L33 9 L36 9 Z" fill="#fbbf24" />
            <defs>
              <linearGradient id="shield-grad" x1="8" y1="3" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="60%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
          </svg>
        );

      // 8. WHATSAPP TRAIN RADAR: Smartphone with Live Radar Sweeping Waves, GPS Ping & WhatsApp Badge
      case 'radar':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Concentric Sonar Radar Waves */}
            <path d="M28 8 A18 18 0 0 1 42 22" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
            <path d="M26 13 A12 12 0 0 1 36 23" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            {/* Sleek Smartphone Case */}
            <rect x="8" y="10" width="22" height="34" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
            {/* Radar Display Screen */}
            <rect x="10.5" y="14" width="17" height="25" rx="2" fill="#022c22" />
            {/* Radar Crosshair Rings */}
            <circle cx="19" cy="26" r="6.5" stroke="#16a34a" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="19" cy="26" r="3" stroke="#22c55e" strokeWidth="1" />
            {/* Real-time GPS Train Blip */}
            <circle cx="21" cy="24" r="2" fill="#ef4444" />
            {/* WhatsApp Messenger Emblem Badge */}
            <g transform="translate(24, 2)">
              <circle cx="10" cy="10" r="9" fill="#25d366" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M6.5 12.5 C6.5 12.5 7.5 14 10 14 C12.5 14 13.5 12.5 13.5 12.5 C13 11 12 11 11.5 11.5 L10.5 12.5 C9 12 8 11 7.5 9.5 L8.5 8.5 C9 8 9 7 7.5 6.5 C7.5 6.5 6 7.5 6.5 12.5 Z" fill="#ffffff" />
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1 ${sizeClasses} ${containerThemes} ${className}`}
    >
      {renderSvg()}
    </div>
  );
}
