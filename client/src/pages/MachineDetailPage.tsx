import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Cpu, Wrench, AlertTriangle, Clock, Calendar, Factory,
  Settings, Activity, TrendingUp, Package, FileText, ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { HealthScoreRing, ProgressBar } from '@/components/ui/Indicators';
import { StatusBadge, RiskBadge, PriorityBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/Toolbar';
import { api } from '@/lib/api';
import { maintenanceSchedules, breakdowns, serviceRecords } from '@/data/seed';
import type { Machine } from '@/types';

export function MachineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);

  useEffect(() => {
    if (id) api.getMachine(id).then(setMachine);
  }, [id]);

  if (!machine) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500" /></div>;
  }

  const machineMaintenance = maintenanceSchedules.filter((s) => s.machine_id === machine.id).slice(0, 5);
  const machineBreakdowns = breakdowns.filter((b) => b.machine_id === machine.id).slice(0, 5);
  const machineServices = serviceRecords.filter((s) => s.machine_id === machine.id).slice(0, 5);

  const healthTrend = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2026, i, 1).toLocaleString('en', { month: 'short' }),
    score: Math.max(30, Math.min(100, machine.health_score + Math.round((Math.random() - 0.5) * 20))),
  }));

  const recommendedAction =
    machine.health_score >= 80 ? 'No action needed — schedule routine inspection' :
    machine.health_score >= 60 ? 'Schedule inspection within 30 days' :
    machine.health_score >= 40 ? 'Schedule inspection within 7 days' :
    'Immediate attention required — schedule emergency maintenance';

  return (
    <div>
      <button onClick={() => navigate('/machines')} className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Machines
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Machine info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-600/10">
                  <Cpu className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">{machine.name}</h1>
                  <p className="text-sm text-slate-400">{machine.machine_id} · {machine.type}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={machine.status} />
                    <RiskBadge level={machine.risk_level} />
                    <PriorityBadge priority={machine.criticality} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <HealthScoreRing score={machine.health_score} size={80} />
                <p className="mt-1 text-xs font-medium text-slate-500">Health Score</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: 'Manufacturer', value: machine.manufacturer, icon: Factory },
                { label: 'Model', value: machine.model, icon: Settings },
                { label: 'Serial Number', value: machine.serial_number, icon: FileText },
                { label: 'Factory', value: machine.factory_name, icon: Factory },
                { label: 'Department', value: machine.department_name, icon: Settings },
                { label: 'Production Line', value: machine.production_line, icon: TrendingUp },
                { label: 'Installation Date', value: machine.installation_date, icon: Calendar },
                { label: 'Operating Hours', value: `${machine.operating_hours.toLocaleString()} hrs`, icon: Clock },
                { label: 'Total Downtime', value: `${machine.total_downtime_hours} hrs`, icon: AlertTriangle },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <item.icon className="h-3.5 w-3.5" /> {item.label}
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health trend */}
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Health Score Trend (12 months)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={healthTrend}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-800" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#healthGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Components */}
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Machine Components</h3>
            <div className="space-y-2">
              {machine.components.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.part_number} · {c.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.last_replaced && <span className="text-xs text-slate-400">Last replaced: {c.last_replaced}</span>}
                    <StatusBadge status={c.current_status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Predictive + maintenance */}
        <div className="space-y-6">
          {/* Predictive card */}
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Predictive Analytics</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">MTBF</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{machine.mtbf_hours.toLocaleString()} hrs</span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400">Mean Time Between Failures</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">MTTR</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{machine.mttr_hours} hrs</span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400">Mean Time To Repair</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Failures (30d)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{machine.failure_count_30d}</span>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Recommended Action</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{recommendedAction}</p>
              </div>
            </div>
          </div>

          {/* Recent maintenance */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Maintenance</h3>
              <Link to="/maintenance" className="text-xs text-primary-600 hover:underline dark:text-primary-400">View all</Link>
            </div>
            <div className="space-y-2">
              {machineMaintenance.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{m.type}</p>
                      <p className="text-[10px] text-slate-400">{m.scheduled_date}</p>
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent breakdowns */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Breakdown History</h3>
              <Link to="/breakdowns" className="text-xs text-primary-600 hover:underline dark:text-primary-400">View all</Link>
            </div>
            <div className="space-y-2">
              {machineBreakdowns.length === 0 && <p className="text-xs text-slate-400">No breakdowns recorded</p>}
              {machineBreakdowns.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-danger-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{b.breakdown_id}</p>
                      <p className="text-[10px] text-slate-400">{b.reported_date} · {b.downtime_hours}h downtime</p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Service history */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Service History</h3>
              <Link to="/service-history" className="text-xs text-primary-600 hover:underline dark:text-primary-400">View all</Link>
            </div>
            <div className="space-y-2">
              {machineServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{s.service_id}</p>
                      <p className="text-[10px] text-slate-400">{s.date} · ${s.total_cost}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">{s.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
