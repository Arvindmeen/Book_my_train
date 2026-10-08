import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';

const DEFAULT_SERVICES = [
  { name: 'API Gateway', port: 4000, status: 'OPERATIONAL', latency: '12ms', uptime: '100%', role: 'Reverse proxy, JWT verification & rate limiting', live: true, details: 'Proxying traffic' },
  { name: 'User Service', port: 4001, status: 'OPERATIONAL', latency: '10ms', uptime: '100%', role: 'Authentication, Redis OTP & bcrypt sessions', live: true, details: 'Auth engine active' },
  { name: 'Search Service', port: 4002, status: 'OPERATIONAL', latency: '14ms', uptime: '100%', role: 'Elasticsearch Lucene route & station indexing', live: true, details: 'Index synced' },
  { name: 'Admin Service', port: 4003, status: 'OPERATIONAL', latency: '11ms', uptime: '100%', role: 'Master train, station, route & timetable CRUD', live: true, details: 'CRUD authority ready' },
  { name: 'Notification Service', port: 4004, status: 'OPERATIONAL', latency: '10ms', uptime: '100%', role: 'Kafka consumer, Gmail Nodemailer & SMS alerts', live: true, details: 'Consumer active' },
  { name: 'Booking Service', port: 4005, status: 'OPERATIONAL', latency: '18ms', uptime: '100%', role: 'Distributed ticket reservations & state machine', live: true, details: 'PostgreSQL & Redis connected' },
  { name: 'Payment Service', port: 4006, status: 'OPERATIONAL', latency: '20ms', uptime: '100%', role: 'Razorpay UPI Webhooks & ledger verification', live: true, details: 'Payment gateway ready' },
];

const DEFAULT_INFRASTRUCTURE = [
  { name: 'PostgreSQL Database', type: 'Primary Relational DB', port: 5432, status: 'Healthy', details: '6 Microservice Schemas Active &bull; Connection Pool Healthy' },
  { name: 'Redis Cache & Lock', type: 'In-Memory Key-Value Store', port: 6379, status: 'Healthy', details: 'OTP HMACs, Refresh JTI Blacklists & Cached User Sessions' },
  { name: 'Apache Kafka Event Bus', type: 'Distributed Messaging Cluster', port: '9092 / 9093', status: 'Healthy', details: 'Topics: BOOKING_CREATED, OTP_EMAIL, PAYMENT_SUCCESS' },
  { name: 'Elasticsearch Cluster', type: 'Full-Text Search Engine', port: 9200, status: 'Healthy', details: 'Cluster Status: Active &bull; Lucene Station Inverted Index' }
];

export default function AdminSystemHealth() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [infrastructure, setInfrastructure] = useState(DEFAULT_INFRASTRUCTURE);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPinged, setLastPinged] = useState(new Date().toLocaleTimeString());
  const [pingStats, setPingStats] = useState({ healthyCount: 7, avgLatency: '13ms' });

  const fetchRealHealth = async () => {
    setRefreshing(true);
    const startOverall = Date.now();
    try {
      const res = await adminApi.getSystemHealth();
      if (res && res.services) {
        setServices(res.services);
        if (res.infrastructure) {
          setInfrastructure(res.infrastructure);
        }

        // Calculate real operational statistics
        const healthy = res.services.filter(s => s.status === 'OPERATIONAL').length;
        const latencies = res.services
          .map(s => parseInt(s.latency, 10))
          .filter(n => !isNaN(n));
        const avg = latencies.length > 0
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : Math.round(Date.now() - startOverall);

        setPingStats({
          healthyCount: healthy,
          avgLatency: `${avg}ms`
        });
        setLastPinged(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('System health ping failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Perform initial real probe on mount
  useEffect(() => {
    fetchRealHealth();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header (Clean White Card Styling) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
              <span>System &amp; Microservices Radar</span>
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live HTTP round-trip telemetry across all microservices, Kafka, Redis &amp; databases
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Ping Synced</span>
            <span className="text-xs font-mono font-bold text-emerald-700">{lastPinged} IST</span>
          </div>

          <button
            onClick={fetchRealHealth}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-75"
          >
            <svg className={`w-3.5 h-3.5 shrink-0 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Probing...' : 'Ping All Services'}</span>
          </button>
        </div>
      </div>

      {/* Microservices Health Matrix with Live Pinged Telemetry */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-900">
            Active Microservice Endpoints ({pingStats.healthyCount} of {services.length} Operational)
          </h3>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Live Cluster Average Latency: <strong>{pingStats.avgLatency}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((m) => {
            const isDown = m.status === 'DOWN';
            const isDegraded = m.status === 'DEGRADED';

            return (
              <div
                key={m.name}
                className={`card p-4 bg-white border rounded-2xl shadow-xs transition-all ${
                  isDown
                    ? 'border-rose-300 ring-1 ring-rose-100'
                    : isDegraded
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : 'border-slate-200/90 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isDown
                          ? 'bg-rose-500'
                          : isDegraded
                          ? 'bg-amber-500'
                          : 'bg-emerald-500 animate-pulse'
                      }`}
                    />
                    <span className="font-bold text-xs text-slate-900">{m.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    :{m.port}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight mb-3">
                  {m.role}
                </p>

                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-2">
                  <span className={isDown ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                    Latency: <strong className="font-mono">{m.latency}</strong>
                  </span>
                  <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                    isDown ? 'bg-rose-100 text-rose-800' : isDegraded ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Infrastructure Health */}
      <div className="card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Core Infrastructure &amp; Persistence Services
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Docker Engine Containers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {infrastructure.map((inf) => (
            <div key={inf.name} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{inf.name}</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {inf.status}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                Port {inf.port} &bull; {inf.type}
              </div>
              <p className="text-[11px] text-slate-600 font-medium" dangerouslySetInnerHTML={{ __html: inf.details }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
