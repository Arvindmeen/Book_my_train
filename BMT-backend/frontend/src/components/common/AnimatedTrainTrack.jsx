import { useState } from 'react';

/**
 * High-Fidelity Realistic Indian Railways Vande Bharat Express Train
 * - Dynamic spinning 8-spoke alloy wheels with center axle caps
 * - Hover to stop: Entire train halts and wheels freeze on hover
 * - Realistic aerodynamic bullet nose, driver cockpit, pantograph & headlight beam
 * - Detailed coaches with interior warm light, passenger windows & bellows connectors
 * - Authentic Last Vehicle (LV) tail marker with flashing red LED beacons
 * - Realistic steel rails & concrete sleeper railway track
 */

function TrainWheel({ cx, cy, r = 5.2 }) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <g
        className="animate-train-wheel"
        style={{
          transformOrigin: 'center',
          transformBox: 'fill-box'
        }}
      >
        {/* Outer steel tire & flange */}
        <circle cx={0} cy={0} r={r} fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        {/* Dark inner rim recess */}
        <circle cx={0} cy={0} r={r * 0.75} fill="#1e293b" />
        {/* 6 visible metallic spokes */}
        <line x1={0} y1={-r * 0.8} x2={0} y2={r * 0.8} stroke="#cbd5e1" strokeWidth="1.1" strokeLinecap="round" />
        <line x1={-r * 0.8} y1={0} x2={r * 0.8} y2={0} stroke="#cbd5e1" strokeWidth="1.1" strokeLinecap="round" />
        <line x1={-r * 0.58} y1={-r * 0.58} x2={r * 0.58} y2={r * 0.58} stroke="#cbd5e1" strokeWidth="1.1" strokeLinecap="round" />
        <line x1={-r * 0.58} y1={r * 0.58} x2={r * 0.58} y2={-r * 0.58} stroke="#cbd5e1" strokeWidth="1.1" strokeLinecap="round" />
        {/* Center axle cap & hub */}
        <circle cx={0} cy={0} r={r * 0.32} fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
        <circle cx={0} cy={0} r={r * 0.14} fill="#f97316" />
      </g>
    </g>
  );
}

function BogieFrame({ x1, x2, y }) {
  return (
    <g>
      {/* Bogie steel chassis connecting the two wheels */}
      <rect x={x1 - 1} y={y - 2.5} width={x2 - x1 + 2} height="3" rx="1" fill="#334155" />
      {/* Primary suspension coil springs */}
      <rect x={(x1 + x2) / 2 - 2.5} y={y - 4.5} width="5" height="3" rx="0.5" fill="#475569" stroke="#1e293b" strokeWidth="0.5" />
      {/* Left and right brake shoes */}
      <rect x={x1 - 5} y={y - 1} width="2" height="3" rx="0.5" fill="#1e293b" />
      <rect x={x2 + 3} y={y - 1} width="2" height="3" rx="0.5" fill="#1e293b" />
    </g>
  );
}

export default function AnimatedTrainTrack({ onTrackClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto my-3 relative z-10 select-none train-track-container group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTrackClick}
      title="Vande Bharat Express (In-Transit) · Hover to stop train · Click to track live status"
    >
      {/* Hover Info Tooltip Badge */}
      <div className="flex items-center justify-between px-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-amber-500' : 'bg-emerald-500 animate-ping'}`} />
            <span>{isHovered ? '⏸️ Train Paused at Station (Hovered)' : '⚡ High-Speed Rail Corridor · 130 km/h'}</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
            Hover to halt train &bull; Wheels spin live
          </span>
        </div>

        <span className="text-[10px] font-extrabold text-slate-500 hidden md:inline font-mono">
          Route: NDLS &rarr; BSB (Vande Bharat 22436)
        </span>
      </div>

      {/* Track & Train Stage */}
      <div className="relative h-12 overflow-hidden rounded-2xl bg-gradient-to-b from-transparent via-slate-50/50 to-slate-100/60 border border-slate-200/60 shadow-2xs">
        
        {/* Railway Sleepers / Ties (Repeating Pattern along the track) */}
        <div className="absolute bottom-1 inset-x-0 h-2 flex justify-between px-1 pointer-events-none opacity-40">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="w-1.5 h-full bg-slate-400 rounded-2xs shrink-0" />
          ))}
        </div>

        {/* Shiny Steel Rails */}
        <div className="absolute bottom-2.5 inset-x-0 h-[2px] bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 shadow-xs pointer-events-none" />
        <div className="absolute bottom-[9px] inset-x-0 h-[1px] bg-white/80 pointer-events-none" />

        {/* The Animated High-Speed Train Rake */}
        <div className="animate-train-glide absolute bottom-1.5 flex items-end">
          
          <svg
            className="h-10 w-auto overflow-visible drop-shadow-md"
            viewBox="0 0 540 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ═══════════════════════════════════════════════════════════════════
                COACH 4: TAIL GUARD VEHICLE (REAR - BLINKING RED BEACONS + 'LV')
                ═══════════════════════════════════════════════════════════════════ */}
            <g id="coach-4-tail" transform="translate(0, 0)">
              {/* Coach Body with rounded aerodynamic tail */}
              <path
                d="M10 8 Q4 8 2 14 L2 27 L115 27 L115 8 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />
              {/* Deep Navy Lower Skirt */}
              <path
                d="M2 22 L2 27 L115 27 L115 22 Z"
                fill="#1e3a8a"
              />
              {/* Saffron / Orange Speed Stripe */}
              <rect x="2" y="20.5" width="113" height="1.8" fill="#f97316" />
              {/* Top Navy Roof Band */}
              <rect x="8" y="8" width="107" height="2" fill="#1e3a8a" />
              {/* Roof AC Unit */}
              <rect x="35" y="5" width="45" height="3" rx="1.5" fill="#475569" stroke="#334155" strokeWidth="0.5" />
              {/* Continuous Tinted Ribbon Windows with warm interior light */}
              <rect x="18" y="11.5" width="90" height="7" rx="1.5" fill="#0f172a" />
              {/* Passenger Window Glass Panels with Ambient Glow */}
              <rect x="21" y="12.5" width="12" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />
              <rect x="36" y="12.5" width="12" height="5" rx="1" fill="#fef08a" fillOpacity="0.75" />
              <rect x="51" y="12.5" width="12" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />
              <rect x="66" y="12.5" width="12" height="5" rx="1" fill="#fef08a" fillOpacity="0.75" />
              <rect x="81" y="12.5" width="12" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />
              <rect x="96" y="12.5" width="9" height="5" rx="1" fill="#fef08a" fillOpacity="0.75" />

              {/* Passenger Silhouettes inside windows */}
              <circle cx="27" cy="14" r="1.5" fill="#451a03" />
              <circle cx="57" cy="14" r="1.5" fill="#451a03" />
              <circle cx="87" cy="14" r="1.5" fill="#451a03" />

              {/* Rear Red Flashing Beacons */}
              <circle cx="3" cy="13" r="2.2" fill="#ef4444" className="animate-ping" opacity="0.8" />
              <circle cx="3" cy="13" r="1.6" fill="#dc2626" />
              <circle cx="3" cy="23" r="1.6" fill="#dc2626" />

              {/* Indian Railways Official 'LV' (Last Vehicle) Circular Board */}
              <circle cx="6" cy="18" r="3.2" fill="#facc15" stroke="#000000" strokeWidth="0.8" />
              <line x1="4.2" y1="16.2" x2="7.8" y2="19.8" stroke="#000000" strokeWidth="1" />
              <line x1="4.2" y1="19.8" x2="7.8" y2="16.2" stroke="#000000" strokeWidth="1" />

              {/* Bogie 1 (Rear) */}
              <BogieFrame x1={20} x2={36} y={32} />
              <TrainWheel cx={20} cy={32} />
              <TrainWheel cx={36} cy={32} />

              {/* Bogie 2 (Front) */}
              <BogieFrame x1={78} x2={94} y={32} />
              <TrainWheel cx={78} cy={32} />
              <TrainWheel cx={94} cy={32} />
            </g>

            {/* Accordion Gangway / Bellows 1 */}
            <g id="bellows-1" transform="translate(115, 9)">
              <rect x="0" y="0" width="8" height="17" fill="#1e293b" rx="1" />
              <line x1="2.5" y1="0" x2="2.5" y2="17" stroke="#475569" strokeWidth="1" />
              <line x1="5.5" y1="0" x2="5.5" y2="17" stroke="#475569" strokeWidth="1" />
            </g>

            {/* ═══════════════════════════════════════════════════════════════════
                COACH 3: EXECUTIVE CHAIR CAR (PASSENGER)
                ═══════════════════════════════════════════════════════════════════ */}
            <g id="coach-3-chair" transform="translate(123, 0)">
              {/* Coach Body */}
              <rect x="0" y="8" width="120" height="19" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Deep Navy Lower Skirt */}
              <rect x="0" y="22" width="120" height="5" fill="#1e3a8a" />
              {/* Saffron / Orange Speed Stripe */}
              <rect x="0" y="20.5" width="120" height="1.8" fill="#f97316" />
              {/* Top Navy Roof Band */}
              <rect x="0" y="8" width="120" height="2" fill="#1e3a8a" />
              {/* Roof AC Pod */}
              <rect x="38" y="5" width="44" height="3" rx="1.5" fill="#475569" stroke="#334155" strokeWidth="0.5" />

              {/* Continuous Tinted Ribbon Windows */}
              <rect x="8" y="11.5" width="104" height="7" rx="1.5" fill="#0f172a" />
              {/* Window Glass Panes with Interior Lighting */}
              <rect x="11" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />
              <rect x="27" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.7" />
              <rect x="43" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />
              <rect x="59" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.75" />
              <rect x="75" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />
              <rect x="91" y="12.5" width="18" height="5" rx="1" fill="#fef08a" fillOpacity="0.7" />

              {/* Passenger Silhouettes */}
              <circle cx="17" cy="14" r="1.5" fill="#451a03" />
              <circle cx="49" cy="14" r="1.5" fill="#451a03" />
              <circle cx="81" cy="14" r="1.5" fill="#451a03" />

              {/* Coach Badge */}
              <text x="60" y="25" fill="#ffffff" fontSize="3" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
                C-3 &bull; CHAIR CAR
              </text>

              {/* Bogie 1 (Rear) */}
              <BogieFrame x1={22} x2={38} y={32} />
              <TrainWheel cx={22} cy={32} />
              <TrainWheel cx={38} cy={32} />

              {/* Bogie 2 (Front) */}
              <BogieFrame x1={82} x2={98} y={32} />
              <TrainWheel cx={82} cy={32} />
              <TrainWheel cx={98} cy={32} />
            </g>

            {/* Accordion Gangway / Bellows 2 */}
            <g id="bellows-2" transform="translate(243, 9)">
              <rect x="0" y="0" width="8" height="17" fill="#1e293b" rx="1" />
              <line x1="2.5" y1="0" x2="2.5" y2="17" stroke="#475569" strokeWidth="1" />
              <line x1="5.5" y1="0" x2="5.5" y2="17" stroke="#475569" strokeWidth="1" />
            </g>

            {/* ═══════════════════════════════════════════════════════════════════
                COACH 2: PANTRY / BUFFET CAR (WITH ELECTRIC ROOF PANTOGRAPH)
                ═══════════════════════════════════════════════════════════════════ */}
            <g id="coach-2-pantry" transform="translate(251, 0)">
              {/* Roof Pantograph (Articulated Electric Single-Arm) */}
              <path d="M40 8 L48 2 L62 2 L56 8" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="46" y1="2" x2="64" y2="2" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />

              {/* Coach Body */}
              <rect x="0" y="8" width="120" height="19" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Deep Navy Lower Skirt */}
              <rect x="0" y="22" width="120" height="5" fill="#1e3a8a" />
              {/* Saffron / Orange Speed Stripe */}
              <rect x="0" y="20.5" width="120" height="1.8" fill="#f97316" />
              {/* Top Navy Roof Band */}
              <rect x="0" y="8" width="120" height="2" fill="#1e3a8a" />

              {/* Tinted Windows */}
              <rect x="8" y="11.5" width="104" height="7" rx="1.5" fill="#0f172a" />
              <rect x="11" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.8" />
              <rect x="27" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.8" />
              
              {/* Pantry Cloche / Dining Insignia in Middle Window */}
              <rect x="52" y="12.5" width="16" height="5" rx="1" fill="#f97316" fillOpacity="0.3" stroke="#f97316" strokeWidth="0.5" />
              <text x="60" y="16.5" fill="#f97316" fontSize="3.5" fontWeight="black" textAnchor="middle">
                🍴
              </text>

              <rect x="78" y="12.5" width="13" height="5" rx="1" fill="#fef08a" fillOpacity="0.8" />
              <rect x="94" y="12.5" width="15" height="5" rx="1" fill="#fef08a" fillOpacity="0.8" />

              {/* Coach Badge */}
              <text x="60" y="25" fill="#ffffff" fontSize="3" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
                C-2 &bull; PANTRY CAR
              </text>

              {/* Bogie 1 (Rear) */}
              <BogieFrame x1={22} x2={38} y={32} />
              <TrainWheel cx={22} cy={32} />
              <TrainWheel cx={38} cy={32} />

              {/* Bogie 2 (Front) */}
              <BogieFrame x1={82} x2={98} y={32} />
              <TrainWheel cx={82} cy={32} />
              <TrainWheel cx={98} cy={32} />
            </g>

            {/* Accordion Gangway / Bellows 3 */}
            <g id="bellows-3" transform="translate(371, 9)">
              <rect x="0" y="0" width="8" height="17" fill="#1e293b" rx="1" />
              <line x1="2.5" y1="0" x2="2.5" y2="17" stroke="#475569" strokeWidth="1" />
              <line x1="5.5" y1="0" x2="5.5" y2="17" stroke="#475569" strokeWidth="1" />
            </g>

            {/* ═══════════════════════════════════════════════════════════════════
                LOCOMOTIVE ENGINE: AERODYNAMIC BULLET NOSE (LEADING IN FRONT AT RIGHT)
                ═══════════════════════════════════════════════════════════════════ */}
            <g id="locomotive-engine" transform="translate(379, 0)">
              {/* Forward Light Beam Cone casting over the track! */}
              <polygon
                points="136,22 220,10 220,38 136,27"
                fill="url(#headlight-glow-grad)"
                className="pointer-events-none"
              />

              {/* Main Aerodynamic Bullet Train Body */}
              <path
                d="M0 8 L95 8 C118 8 132 17 138 23 L138 27 L0 27 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />

              {/* Deep Navy Aerodynamic Wedge */}
              <path
                d="M0 22 L105 22 C120 22 133 24 138 27 L0 27 Z"
                fill="#1e3a8a"
              />

              {/* Swept Dynamic Saffron Speed Ribbon */}
              <path
                d="M0 20.5 L100 20.5 C118 20.5 128 22 135 24.5 L133 26 C126 23.5 116 22 98 22 L0 22 Z"
                fill="#f97316"
              />

              {/* Streamlined Cockpit Panoramic Windshield */}
              <path
                d="M92 9.5 L108 9.5 C122 9.5 129 16 133 20 L92 20 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="0.5"
              />
              {/* Cockpit Sky Reflection Glare */}
              <path
                d="M98 11 L112 11 C119 11 124 15 126 17 L104 17 Z"
                fill="#38bdf8"
                fillOpacity="0.4"
              />

              {/* Passenger / Crew Windows */}
              <rect x="12" y="11.5" width="20" height="7" rx="1.5" fill="#0f172a" />
              <rect x="15" y="12.5" width="14" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />
              <rect x="38" y="11.5" width="20" height="7" rx="1.5" fill="#0f172a" />
              <rect x="41" y="12.5" width="14" height="5" rx="1" fill="#fef08a" fillOpacity="0.85" />

              {/* Vande Bharat Locomotive Insignia */}
              <text x="68" y="16.5" fill="#1e3a8a" fontSize="3.5" fontWeight="900" letterSpacing="0.8">
                VANDE BHARAT
              </text>
              <text x="68" y="25" fill="#f8fafc" fontSize="3" fontWeight="bold">
                22436 &bull; WAP-5
              </text>

              {/* High-Intensity Dual LED Headlight with Pulse Aura */}
              <circle cx="134" cy="22.5" r="3" fill="#fef08a" fillOpacity="0.4" className="animate-pulse" />
              <circle cx="134" cy="22.5" r="1.8" fill="#fef08a" stroke="#d97706" strokeWidth="0.5" />

              {/* Bogie 1 (Rear) */}
              <BogieFrame x1={24} x2={42} y={32} />
              <TrainWheel cx={24} cy={32} />
              <TrainWheel cx={42} cy={32} />

              {/* Bogie 2 (Front Leading Traction Truck) */}
              <BogieFrame x1={84} x2={102} y={32} />
              <TrainWheel cx={84} cy={32} />
              <TrainWheel cx={102} cy={32} />
            </g>

            {/* Gradient definition for the forward glowing headlight beam */}
            <defs>
              <linearGradient id="headlight-glow-grad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
                <stop offset="35%" stopColor="#fef08a" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

        </div>
      </div>
    </div>
  );
}
