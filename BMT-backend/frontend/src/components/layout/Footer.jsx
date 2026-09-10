export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-b from-slate-50/80 via-white to-white border-t border-slate-200/90 text-slate-600 text-sm relative overflow-hidden">
      
      {/* Subtle decorative background ambient light */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Upper Footer: 4 High-Impact Value Feature Cards with Real SVGs */}
      <div className="border-b border-slate-200/70 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Highlight 1: Instant Reservation */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-card-hover hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 group flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 text-amber-600 border border-amber-200/70 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform flex-shrink-0 shadow-xs">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                Instant Reservation
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Sub-50ms Direct Gateway Sync
              </p>
            </div>
          </div>

          {/* Highlight 2: Zero Convenience Fee */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-card-hover hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 group flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform flex-shrink-0 shadow-xs">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                Zero Convenience Fee
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                0₹ on UPI Payments
              </p>
            </div>
          </div>

          {/* Highlight 3: 100% Secure Refunds */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-card-hover hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 group flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 border border-blue-200/70 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform flex-shrink-0 shadow-xs">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                100% Instant Refunds
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                &lt; 60s Automated UPI Reversal
              </p>
            </div>
          </div>

          {/* Highlight 4: AI Waitlist Predictor */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-card-hover hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 group flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 text-purple-600 border border-purple-200/70 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform flex-shrink-0 shadow-xs">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                AI Waitlist Predictor
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                96.4% Neural Accuracy
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Security Badges (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white rounded-2xl p-2.5 shadow-md shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-display font-black text-2xl text-slate-900 tracking-tight">
                BooK my <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Train</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-sm">
              India's premier high-throughput rail ticketing platform engineered with real-time seat tracking, deep AI confirmation forecasts, and zero-deduction instant refunds.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-[10px] text-slate-700 px-3 py-1.5 rounded-xl font-bold border border-slate-200/90 shadow-xs">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>256-BIT SSL SECURE</span>
              </span>

              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-[10px] text-emerald-800 px-3 py-1.5 rounded-xl font-bold border border-emerald-200/80 shadow-xs">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>100% SECURE &amp; VERIFIED</span>
              </span>
            </div>
          </div>

          {/* Column 2: Book Services (Span 2.5) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-2.5">
              Book Services
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li>
                <a href="/search" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Book Train Tickets</span>
                </a>
              </li>
              <li>
                <a href="/pnr" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Check PNR Live Status</span>
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Food on Track (E-Catering)</span>
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Hotels &amp; Station Lounges</span>
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Connecting Flights &amp; Cabs</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Legal (Span 2.5) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-2.5">
              Support &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li>
                <a href="#terms" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Terms &amp; Conditions</span>
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Cancellation &amp; Refund Rules</span>
                </a>
              </li>
              <li>
                <a href="#helpdesk" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Customer Care Helpline (139)</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                  <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">&rsaquo;</span>
                  <span>Frequently Asked Questions</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Creator Desk (Span 3) - NAME ABOVE ADDRESS, REAL ICONS, ADDRESS LAST! */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-2.5">
              Contact &amp; Developer
            </h4>

            <ul className="space-y-3 text-xs text-slate-700 font-medium">
              
              {/* 1. CREATOR NAME WITH DIRECT PORTFOLIO LINK (ABOVE ADDRESS AS REQUESTED!) */}
              <li className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white p-3 rounded-2xl border border-emerald-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group">
                <a
                  href="https://arvindmeena.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 text-slate-900"
                  title="Visit Arvind Meena's Portfolio: https://arvindmeena.vercel.app/"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Real Avatar/Code SVG */}
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                        Lead Developer &amp; Creator
                      </p>
                      <p className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Arvind Meena
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <span>Portfolio</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
                  </span>
                </a>
              </li>

              {/* 2. PHONE (REAL SVG ICON) */}
              <li className="flex items-center gap-2.5 px-1 text-slate-600">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href="tel:+917217332482" className="hover:text-emerald-600 transition-colors font-semibold">
                  +91 7217332482
                </a>
              </li>

              {/* 3. EMAIL (REAL SVG ICON) */}
              <li className="flex items-center gap-2.5 px-1 text-slate-600">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:arvindmeena8171@gmail.com" className="hover:text-emerald-600 transition-colors font-semibold truncate">
                  arvindmeena8171@gmail.com
                </a>
              </li>

              {/* 4. ADDRESS COMES LAST (REAL SVG ICON!) */}
              <li className="flex items-start gap-2.5 px-1 text-slate-600 pt-0.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold leading-relaxed">
                  IIT Kharagpur, West Bengal, India
                </span>
              </li>

            </ul>

            {/* Animated Social & Developer Profile Icons (REAL SVGS) */}
            <div className="flex items-center gap-2.5 pt-2">
              
              {/* Portfolio Direct Icon Button */}
              <a
                href="https://arvindmeena.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-emerald-500/25 border border-emerald-200"
                title="Arvind Meena Portfolio"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Arvindmeen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-slate-200"
                title="GitHub: Arvindmeen"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/arvind-meena-78a258288"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/25 border border-slate-200"
                title="LinkedIn: Arvind Meena"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/rinku_meena014/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-rose-500/25 border border-slate-200"
                title="Instagram: rinku_meena014"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

            </div>
          </div>

        </div>

        {/* Footer Bottom Line */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} BooK my Train Ltd. Crafted with precision for Indian Railways by{' '}
            <a
              href="https://arvindmeena.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
            >
              Arvind Meena
            </a>
            .
          </p>
          <p className="text-slate-400 text-center sm:text-right">
            BooK my Train &mdash; Next-Gen Rail Architecture &middot; High Throughput &middot; Passenger-First
          </p>
        </div>

      </div>
    </footer>
  );
}
