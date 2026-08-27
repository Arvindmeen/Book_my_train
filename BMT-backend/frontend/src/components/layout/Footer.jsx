export default function Footer() {
  return (
    <footer className="mt-auto transition-colors duration-300 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-900">
      
      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-accent-500 text-white rounded-lg p-1.5 shadow-md shadow-accent-600/10">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">BooK my Train</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              BooK my Train is India's leading online ticketing platform, offering lightning-fast bookings, automated PNR prediction, and live rail running status.
            </p>
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-bold border border-slate-300 dark:border-slate-700">BMT CERTIFIED</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-bold border border-slate-300 dark:border-slate-700">SSL SECURED</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-bold border border-slate-300 dark:border-slate-700">100% SAFE</span>
            </div>
          </div>
 
          {/* Quick Services */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-l-2 border-accent-500 pl-2">Book Services</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a href="/search" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Book Train Tickets</a>
              </li>
              <li>
                <a href="#pnr" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Check PNR Status</a>
              </li>
              <li>
                <a href="#live-track" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Live Train Running Status</a>
              </li>
              <li>
                <a href="#e-catering" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Order Food on Track</a>
              </li>
              <li>
                <a href="#hotels" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">BMT Hotels & Stays</a>
              </li>
            </ul>
          </div>
 
          {/* Help & Policies */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-l-2 border-accent-500 pl-2">Support & Legal</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a href="#terms" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Terms of Service</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Privacy Policy</a>
              </li>
              <li>
                <a href="#refund" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Refund & Cancellation</a>
              </li>
              <li>
                <a href="#customer-care" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">Customer Care Help Desk</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-accent-500 dark:hover:text-accent-400 transition-all duration-300 hover:translate-x-1.5 transform inline-block">FAQs & Guides</a>
              </li>
            </ul>
          </div>
 
          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-l-2 border-accent-500 pl-2">Contact Desk</h4>
            <ul className="space-y-3.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex items-start gap-2.5 group cursor-pointer">
                <span className="text-accent-600 dark:text-accent-500 font-bold transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 inline-block">📍</span>
                <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">IIT Kharagpur</span>
              </li>
              <li className="flex items-center gap-2.5 group cursor-pointer">
                <span className="text-accent-600 dark:text-accent-500 font-bold transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 inline-block">📞</span>
                <a href="tel:+917217332482" className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">+91 7217332482</a>
              </li>
              <li className="flex items-center gap-2.5 group cursor-pointer">
                <span className="text-accent-600 dark:text-accent-500 font-bold transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 inline-block">✉️</span>
                <a href="mailto:arvindmeena8171@gmail.com" className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300 hover:underline">arvindmeena8171@gmail.com</a>
              </li>
            </ul>
            
            {/* Hover-Animated Social Media Icons */}
            <div className="flex gap-3 pt-5">
              <a href="#github" className="w-8 h-8 rounded-full bg-slate-200 hover:bg-accent-500 dark:bg-slate-800 dark:hover:bg-accent-500 flex items-center justify-center text-slate-700 hover:text-white dark:text-slate-300 transition-all duration-350 hover:-translate-y-1 hover:rotate-12 hover:shadow-lg shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#twitter" className="w-8 h-8 rounded-full bg-slate-200 hover:bg-accent-500 dark:bg-slate-800 dark:hover:bg-accent-500 flex items-center justify-center text-slate-700 hover:text-white dark:text-slate-300 transition-all duration-350 hover:-translate-y-1 hover:rotate-12 hover:shadow-lg shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#linkedin" className="w-8 h-8 rounded-full bg-slate-200 hover:bg-accent-500 dark:bg-slate-800 dark:hover:bg-accent-500 flex items-center justify-center text-slate-700 hover:text-white dark:text-slate-300 transition-all duration-350 hover:-translate-y-1 hover:rotate-12 hover:shadow-lg shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
 
        </div>
 
        {/* Footer Bottom Area */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-900 text-center text-xs space-y-2 font-medium">
          <p className="text-slate-400 dark:text-slate-500">
            Disclaimer: BooK my Train is an independent travel assistant and booking platform. For official updates, please refer to government notifications.
          </p>
          <p className="text-slate-500 dark:text-slate-650">
            &copy; {new Date().getFullYear()} BooK my Train Ltd. (Subsidiary of BMT Group). All Rights Reserved.
          </p>
        </div>
 
      </div>
    </footer>
  );
}
