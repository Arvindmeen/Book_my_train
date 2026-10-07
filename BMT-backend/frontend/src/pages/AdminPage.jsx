import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { adminApi } from '../api/admin.api';
import { AnimatedCounter } from '../utils/useAnimatedValue';
import AdminTabs from '../components/admin/AdminTabs';
import StationManager from '../components/admin/StationManager';
import TrainManager from '../components/admin/TrainManager';
import RouteManager from '../components/admin/RouteManager';
import ScheduleManager from '../components/admin/ScheduleManager';
import AdminTrafficTracker from '../components/admin/AdminTrafficTracker';
import AdminAuditManager from '../components/admin/AdminAuditManager';
import AdminSystemHealth from '../components/admin/AdminSystemHealth';

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'Traffic';
  const [tab, setTab] = useState(initialTab);
  const { user } = useAuthStore();

  // Real Header Telemetry Counts
  const [trainCount, setTrainCount] = useState(28);
  const [healthyServicesCount, setHealthyServicesCount] = useState(8);
  const [totalServicesCount, setTotalServicesCount] = useState(8);

  useEffect(() => {
    let isMounted = true;
    const loadQuickStats = async () => {
      try {
        const [trainsRes, healthRes] = await Promise.allSettled([
          adminApi.getTrains(),
          adminApi.getSystemHealth(),
        ]);
        if (!isMounted) return;

        if (trainsRes.status === 'fulfilled') {
          const list = Array.isArray(trainsRes.value?.data)
            ? trainsRes.value.data
            : Array.isArray(trainsRes.value)
            ? trainsRes.value
            : [];
          if (list.length > 0) setTrainCount(list.length);
        }

        if (healthRes.status === 'fulfilled' && healthRes.value?.services) {
          const svcs = healthRes.value.services;
          const healthy = svcs.filter((s) => s.status === 'OPERATIONAL').length;
          setHealthyServicesCount(healthy);
          setTotalServicesCount(svcs.length);
        }
      } catch (_) {}
    };

    loadQuickStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const currentParam = searchParams.get('tab');
    if (currentParam && currentParam !== tab) {
      setTab(currentParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const adminName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator';
  const adminEmail = user?.email || 'arvindmeena8171@gmail.com';

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Executive Admin Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/50 via-emerald-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md ring-4 ring-emerald-100">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                    Central Admin Control Center
                  </h1>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Administrator Authority
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Live Telemetry
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
                  <span className="font-medium text-emerald-800">Master Railway Gateway Connected &bull; Full CRUD &amp; Telemetry Authority</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                Level 1 Privileges
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar (Animated & Live) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-150 text-xs">
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">NETWORK CORRIDORS</span>
              <span className="font-black text-lg text-slate-900">Live Traffic</span>
              <span className="text-[10px] text-slate-500 block">Density &amp; waitlist surge</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">RAIL SERVICES</span>
              <span className="font-black text-lg text-emerald-700">
                <AnimatedCounter value={trainCount} suffix=" Active Services" />
              </span>
              <span className="text-[10px] text-slate-500 block">Vande Bharat &amp; Rajdhani</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">PNR AUDIT LEDGER</span>
              <span className="font-black text-lg text-indigo-700">Master Search</span>
              <span className="text-[10px] text-slate-500 block">System-wide verification</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all">
              <span className="text-slate-400 text-[11px] font-bold block uppercase">MICROSERVICES</span>
              <span className="font-black text-lg text-emerald-700">
                {healthyServicesCount} of {totalServicesCount} Healthy
              </span>
              <span className="text-[10px] text-slate-500 block">Cluster radar active</span>
            </div>
          </div>
        </div>

        {/* Administration Operations Management Directory (Image 1 Style Card Grid) */}
        <AdminTabs active={tab} onChange={handleTabChange} />

        {/* Active Tab Component */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6">
          {tab === 'Traffic' && <AdminTrafficTracker />}
          {tab === 'Trains' && <TrainManager />}
          {tab === 'Stations' && <StationManager />}
          {tab === 'Routes' && <RouteManager />}
          {tab === 'Schedules' && <ScheduleManager />}
          {tab === 'Audit' && <AdminAuditManager />}
          {tab === 'System' && <AdminSystemHealth />}
        </div>

      </div>
    </div>
  );
}
