import React, { useId } from 'react';

/**
 * AnimatedEyeToggle
 * An animated eye toggle button designed to sit inside password input fields.
 * - When hidden: Eye blinks closed with downward-curved sleeping eyelashes.
 * - When shown: Eye springs open. The iris & pupil dynamically track from
 *   left to right across the eye as the user types more password characters.
 */
export default function AnimatedEyeToggle({
  isOpen,
  onToggle,
  passwordLength = 0,
  className = '',
}) {
  const clipId = useId();

  // Horizontal pupil tracking across the eyeball:
  // Center is x = 14.
  // Left glance (for 1st character) = 9.5
  // Right glance (for 16+ characters) = 18.5
  const minX = 9.5;
  const maxX = 18.5;
  const maxTrackLength = 16;

  let pupilX = 14;
  if (passwordLength === 0) {
    pupilX = 14;
  } else {
    const progress = Math.min((passwordLength - 1) / (maxTrackLength - 1), 1);
    pupilX = minX + progress * (maxX - minX);
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? 'Hide password' : 'Show password'}
      title={isOpen ? 'Hide password (Close eye)' : 'Show password (Open eye)'}
      className={`group relative flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${className}`}
      tabIndex={-1}
    >
      <svg
        viewBox="0 0 28 28"
        className="w-6 h-6 overflow-visible transition-transform duration-200 group-hover:scale-110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <path d="M 2 14 C 6 6.5, 22 6.5, 26 14 C 22 21.5, 6 21.5, 2 14 Z" />
          </clipPath>
        </defs>

        {/* ================= OPEN EYE STATE ================= */}
        <g
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scale(1, 1)' : 'scale(1, 0.1)',
            transformOrigin: '14px 14px',
            transition: 'transform 0.22s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.18s ease',
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        >
          {/* Outer Eye Shape */}
          <path
            d="M 2 14 C 6 6.5, 22 6.5, 26 14 C 22 21.5, 6 21.5, 2 14 Z"
            className="stroke-slate-400 group-hover:stroke-emerald-600 transition-colors"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="#ffffff"
          />

          {/* Sclera & Iris & Pupil clipped inside eye */}
          <g clipPath={`url(#${clipId})`}>
            {/* Tracking Pupil + Iris Group */}
            <g
              style={{
                transform: `translateX(${pupilX - 14}px)`,
                transition: 'transform 0.18s cubic-bezier(0.34, 1.4, 0.64, 1)',
              }}
            >
              {/* Outer Emerald Iris */}
              <circle cx="14" cy="14" r="5.3" fill="#059669" />
              <circle cx="14" cy="14" r="4.3" fill="#10b981" opacity="0.9" />

              {/* Dark Pupil */}
              <circle cx="14" cy="14" r="2.8" fill="#0f172a" />

              {/* Sparkle highlights for lively cartoon glance */}
              <circle cx="15.6" cy="12.3" r="1.3" fill="#ffffff" />
              <circle cx="12.4" cy="15.3" r="0.65" fill="#ffffff" opacity="0.8" />
            </g>
          </g>
        </g>

        {/* ================= CLOSED EYE STATE (Sleeping / Hidden) ================= */}
        <g
          style={{
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'scale(1, 0.1)' : 'scale(1, 1)',
            transformOrigin: '14px 14px',
            transition: 'transform 0.22s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.18s ease',
            pointerEvents: !isOpen ? 'auto' : 'none',
          }}
        >
          {/* Closed Eyelid Curved Line */}
          <path
            d="M 4 14.5 C 8 20.5, 20 20.5, 24 14.5"
            className="stroke-slate-400 group-hover:stroke-emerald-600 transition-colors"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cute downward resting eyelashes */}
          <line
            x1="8"
            y1="18"
            x2="6"
            y2="22.5"
            className="stroke-slate-400 group-hover:stroke-emerald-600 transition-colors"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="19.5"
            x2="14"
            y2="24.5"
            className="stroke-slate-400 group-hover:stroke-emerald-600 transition-colors"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="20"
            y1="18"
            x2="22"
            y2="22.5"
            className="stroke-slate-400 group-hover:stroke-emerald-600 transition-colors"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </button>
  );
}
