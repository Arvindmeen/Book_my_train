import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import AdminTabs from '../components/admin/AdminTabs';
import StationManager from '../components/admin/StationManager';
import TrainManager from '../components/admin/TrainManager';
import RouteManager from '../components/admin/RouteManager';
import ScheduleManager from '../components/admin/ScheduleManager';

export default function AdminPage() {
  const [tab, setTab] = useState('Stations');
  const { user } = useAuthStore();

  const adminName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Arvind Meena';
  const adminEmail = user?.email || 'arvindmeena8171@gmail.com';

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Executive Admin Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/50 via-emerald-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-600 flex items-center justify-center text-3xl text-white shadow-md ring-4 ring-amber-200/60">
                🛡️
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                    Central Admin Control Center
                  </h1>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                    👑 Super Administrator
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  Administrator: <span className="text-slate-900 font-bold">{adminName}</span> ({adminEmail})
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-medium text-emerald-800">Master Railway Gateway Connected &bull; Full CRUD Authority</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                Level 1 Privileges
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-150 text-xs">
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">STATION DIRECTORY</span>
              <span className="font-black text-lg text-slate-900">Active</span>
              <span className="text-[10px] text-slate-500 block">Junction &amp; Terminal sync</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">EXPRESS FLEET</span>
              <span className="font-black text-lg text-emerald-700">Vande / Rajdhani</span>
              <span className="text-[10px] text-slate-500 block">Coaches &amp; berth matrix</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">ACTIVE SCHEDULES</span>
              <span className="font-black text-lg text-slate-900">Live Services</span>
              <span className="text-[10px] text-slate-500 block">Daily timetable control</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">ACCESS SECURITY</span>
              <span className="font-black text-lg text-amber-700">Exclusive</span>
              <span className="text-[10px] text-slate-500 block">Restricted to Arvind Meena</span>
            </div>
          </div>
        </div>

        {/* Administration Tab Selector */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs">
          <AdminTabs active={tab} onChange={setTab} />
        </div>

        {/* Active Tab Component */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6">
          {tab === 'Stations' && <StationManager />}
          {tab === 'Trains' && <TrainManager />}
          {tab === 'Routes' && <RouteManager />}
          {tab === 'Schedules' && <ScheduleManager />}
        </div>

      </div>
    </div>
  );
}
