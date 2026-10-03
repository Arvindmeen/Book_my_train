const TABS = [
  {
    id: 'Traffic',
    label: 'Live Traffic',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'Trains',
    label: 'Rail Services',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="3" width="16" height="15" rx="3" strokeWidth="2" />
        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
        <circle cx="16" cy="14" r="1.5" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M4 11h16M7 18l-2 3M17 18l2 3" />
      </svg>
    ),
  },
  {
    id: 'Routes',
    label: 'Create Route',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'Stations',
    label: 'Station Network',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'Schedules',
    label: 'Timetables',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'Audit',
    label: 'Passenger Audit',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'System',
    label: 'System Health',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function AdminTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto p-1 scrollbar-none">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 ring-1 ring-emerald-500'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200/60'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
