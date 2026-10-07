const TABS = [
  {
    id: 'Traffic',
    label: 'Live Traffic',
    subtitle: 'Corridor density radar',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'Trains',
    label: 'Create Train',
    subtitle: 'Coaches & timetables',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="3" width="16" height="15" rx="3" strokeWidth="2" />
        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
        <circle cx="16" cy="14" r="1.5" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M4 11h16M7 18l-2 3M17 18l2 3" />
      </svg>
    ),
  },
  {
    id: 'Stations',
    label: 'Create Stations',
    subtitle: 'Platforms & junctions',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'Routes',
    label: 'Create Train Routes',
    subtitle: 'Stops & distances',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'Schedules',
    label: 'Create Train Schedule',
    subtitle: 'Departure & active runs',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'Audit',
    label: 'Passenger Audit',
    subtitle: 'Global PNR lookup',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'System',
    label: 'System Health',
    subtitle: '8 Microservices check',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function AdminTabs({ active, onChange }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Operations Management Directory</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Command Modules
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Immediate access to train scheduling, station directory, traffic radar, and passenger manifest
          </p>
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
          Full Administrative Controls
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`p-4 rounded-xl border text-left group transition-all duration-200 active:scale-95 cursor-pointer relative flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-50/90 to-teal-50/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/25'
                  : 'bg-slate-50 hover:bg-emerald-50/60 border-slate-200/90 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm ring-2 ring-emerald-300'
                      : `${tab.iconBg} ${tab.iconColor} group-hover:scale-105`
                  }`}
                >
                  {tab.icon}
                </div>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 group-hover:text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Switch &rarr;
                  </span>
                )}
              </div>
              <div>
                <div
                  className={`font-bold text-xs transition-colors ${
                    isActive ? 'text-emerald-950 font-black' : 'text-slate-900 group-hover:text-emerald-800'
                  }`}
                >
                  {tab.label}
                </div>
                <span
                  className={`text-[11px] block mt-0.5 transition-colors line-clamp-1 ${
                    isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {tab.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
