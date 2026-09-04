import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Wrench, AlertTriangle, Clock, Package, TrendingUp,
  DollarSign, Truck, ShieldCheck, ArrowRight, Activity,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
} from 'recharts';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge, RiskBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/Toolbar';
import { api } from '@/lib/api';
import type { KPIData } from '@/types';
import { machines, maintenanceSchedules, spareParts, notifications } from '@/data/seed';
import { useAppSelector } from '@/store';

export function DashboardPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [downtimeTrend, setDowntimeTrend] = useState<{ month: string; planned: number; unplanned: number }[]>([]);
  const [costTrend, setCostTrend] = useState<{ month: string; preventive: number; corrective: number }[]>([]);
  const [breakdownFreq, setBreakdownFreq] = useState<{ week: string; breakdowns: number }[]>([]);
  const [partConsumption, setPartConsumption] = useState<{ name: string; consumed: number }[]>([]);
  const [maintenancePie, setMaintenancePie] = useState<{ name: string; value: number; color: string }[]>([]);
  const [reliability, setReliability] = useState<{ name: string; reliability: number; mtbf: number }[]>([]);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    (async () => {
      const [k, dt, ct, bf, pc, mp, rl] = await Promise.all([
        api.getKPIs(), api.getDowntimeTrend(), api.getMaintenanceCostTrend(),
        api.getBreakdownFrequency(), api.getSparePartConsumption(),
        api.getPreventiveVsCorrective(), api.getMachineReliability(),
      ]);
      setKpis(k); setDowntimeTrend(dt); setCostTrend(ct); setBreakdownFreq(bf);
      setPartConsumption(pc); setMaintenancePie(mp); setReliability(rl);
    })();
  }, []);

  if (!kpis) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500" /></div>;
  }

  const upcomingMaintenance = maintenanceSchedules
    .filter((s) => s.status === 'scheduled' && new Date(s.scheduled_date) >= new Date('2026-08-28'))
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
    .slice(0, 5);

  const criticalParts = spareParts
    .filter((p) => p.stock_status === 'critical' || p.stock_status === 'out_of_stock')
    .slice(0, 5);

  const userNotifs = notifications.filter((n) => user && n.target_roles.includes(user.role)).slice(0, 4);

  return (
    <div>
      <PageHeader title="Operations Dashboard" subtitle="Real-time overview of factory maintenance, inventory, and performance metrics" />

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Machines" value={kpis.total_machines} icon={<Cpu className="h-5 w-5" />} tone="primary" trend="up" trendValue="+3" subtitle={`${kpis.operational_machines} operational`} />
        <KPICard label="Under Maintenance" value={kpis.machines_under_maintenance} icon={<Wrench className="h-5 w-5" />} tone="warning" subtitle="In progress" />
        <KPICard label="Active Breakdowns" value={kpis.breakdown_count} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" trend="down" trendValue="-2" subtitle="Requires attention" />
        <KPICard label="Total Downtime (hrs)" value={kpis.total_downtime_hours.toLocaleString()} icon={<Clock className="h-5 w-5" />} tone="info" trend="down" trendValue="-12%" subtitle="Year to date" />
      </div>

      {/* KPI Row 2 */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Maintenance Cost YTD" value={`$${(kpis.maintenance_cost_ytd / 1000).toFixed(0)}K`} icon={<DollarSign className="h-5 w-5" />} tone="primary" trend="up" trendValue="+8%" />
        <KPICard label="Inventory Value" value={`$${(kpis.inventory_value / 1000000).toFixed(2)}M`} icon={<Package className="h-5 w-5" />} tone="success" />
        <KPICard label="Low-Stock Parts" value={kpis.low_stock_parts + kpis.critical_stock_parts} icon={<TrendingUp className="h-5 w-5" />} tone="warning" subtitle={`${kpis.critical_stock_parts} critical`} />
        <KPICard label="Avg Supplier Performance" value={`${kpis.avg_supplier_performance}%`} icon={<Truck className="h-5 w-5" />} tone="success" trend="up" trendValue="+2%" />
      </div>

      {/* Charts Row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Machine Downtime Trends</h3>
              <p className="text-xs text-slate-400">Planned vs unplanned downtime (hours)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={downtimeTrend}>
              <defs>
                <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3479ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3479ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="unplannedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-800" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="planned" stroke="#3479ff" fill="url(#plannedGrad)" strokeWidth={2} name="Planned" />
              <Area type="monotone" dataKey="unplanned" stroke="#ef4444" fill="url(#unplannedGrad)" strokeWidth={2} name="Unplanned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Maintenance Cost Trends</h3>
              <p className="text-xs text-slate-400">Preventive vs corrective ($)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-800" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => `${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="preventive" fill="#3479ff" name="Preventive" radius={[4, 4, 0, 0]} />
              <Bar dataKey="corrective" fill="#f59e0b" name="Corrective" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Maintenance Distribution</h3>
            <p className="text-xs text-slate-400">By type</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={maintenancePie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {maintenancePie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Breakdown Frequency</h3>
            <p className="text-xs text-slate-400">Weekly count</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={breakdownFreq}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-800" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="breakdowns" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Machine Reliability</h3>
            <p className="text-xs text-slate-400">Health score by machine</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={reliability}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-800" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="reliability" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Upcoming maintenance + Critical parts + Notifications */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Upcoming maintenance */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Maintenance</h3>
            <Link to="/maintenance" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingMaintenance.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-600/10">
                  <Wrench className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{m.machine_name}</p>
                  <p className="text-[10px] text-slate-400">{m.scheduled_date} · {m.assigned_technician}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Critical parts */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Critical Stock Alerts</h3>
            <Link to="/inventory" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {criticalParts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 dark:bg-danger-600/10">
                  <Package className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.part_number} · {p.current_stock} / {p.min_stock} min</p>
                </div>
                <StatusBadge status={p.stock_status} />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
            <Link to="/notifications" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {userNotifs.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  n.priority === 'critical' ? 'bg-danger-50 dark:bg-danger-600/10' :
                  n.priority === 'warning' ? 'bg-warning-50 dark:bg-warning-600/10' :
                  'bg-sky-50 dark:bg-sky-600/10'
                }`}>
                  {n.priority === 'critical' ? <AlertTriangle className="h-4 w-4 text-danger-600 dark:text-danger-400" /> :
                   n.priority === 'warning' ? <AlertTriangle className="h-4 w-4 text-warning-600 dark:text-warning-400" /> :
                   <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Machine status overview */}
      <div className="mt-4 card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Machine Status Overview</h3>
          <Link to="/machines" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {machines.slice(0, 8).map((m) => (
            <Link key={m.id} to={`/machines/${m.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Cpu className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{m.machine_id}</p>
                <p className="truncate text-[10px] text-slate-400">{m.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={m.status} />
                <RiskBadge level={m.risk_level} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
