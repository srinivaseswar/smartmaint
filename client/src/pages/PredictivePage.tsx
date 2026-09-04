import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, Gauge, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { PageHeader } from '@/components/ui/Toolbar';
import { KPICard } from '@/components/ui/KPICard';
import { RiskBadge } from '@/components/ui/Badge';
import { HealthScoreRing, ProgressBar } from '@/components/ui/Indicators';
import { machines } from '@/data/seed';

export function PredictivePage() {
  const [sortBy, setSortBy] = useState<'risk' | 'health' | 'mtbf'>('risk');

  const sortedMachines = [...machines].sort((a, b) => {
    if (sortBy === 'risk') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.risk_level] - order[b.risk_level];
    }
    if (sortBy === 'health') return a.health_score - b.health_score;
    return a.mtbf_hours - b.mtbf_hours;
  });

  const topRisk = sortedMachines.slice(0, 12);

  const avgMTBF = Math.round(machines.reduce((s, m) => s + m.mtbf_hours, 0) / machines.length);
  const avgMTTR = Math.round(machines.reduce((s, m) => s + m.mttr_hours, 0) / machines.length);
  const avgHealth = Math.round(machines.reduce((s, m) => s + m.health_score, 0) / machines.length);
  const criticalCount = machines.filter((m) => m.risk_level === 'critical' || m.risk_level === 'high').length;

  const radarData = machines.slice(0, 5).map((m) => ({
    machine: m.machine_id,
    health: m.health_score,
    reliability: Math.min(100, Math.round((m.mtbf_hours / 20000) * 100)),
    maintainability: Math.max(0, 100 - m.mttr_hours * 2),
  }));

  const recommendedActions = sortedMachines.filter((m) => m.health_score < 70).slice(0, 6);

  return (
    <div>
      <PageHeader title="Predictive Maintenance Analytics" subtitle="MTBF, MTTR, machine health scoring, and risk assessment" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Avg MTBF" value={`${avgMTBF.toLocaleString()}h`} icon={<TrendingUp className="h-5 w-5" />} tone="primary" subtitle="Mean Time Between Failures" />
        <KPICard label="Avg MTTR" value={`${avgMTTR}h`} icon={<Activity className="h-5 w-5" />} tone="warning" subtitle="Mean Time To Repair" />
        <KPICard label="Avg Health Score" value={`${avgHealth}%`} icon={<Gauge className="h-5 w-5" />} tone="success" />
        <KPICard label="High-Risk Machines" value={criticalCount} icon={<ShieldAlert className="h-5 w-5" />} tone="danger" subtitle="Critical or high risk" />
      </div>

      {/* Sort controls */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
        {([['risk', 'Risk Level'], ['health', 'Health Score'], ['mtbf', 'MTBF']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${sortBy === key ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Machine risk cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topRisk.map((m) => {
          const action =
            m.health_score >= 80 ? 'No action needed' :
            m.health_score >= 60 ? 'Schedule inspection within 30 days' :
            m.health_score >= 40 ? 'Schedule inspection within 7 days' :
            'Immediate attention required';
          return (
            <div key={m.id} className="card card-hover p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.machine_id}</p>
                  <p className="truncate text-xs text-slate-400">{m.name}</p>
                </div>
                <HealthScoreRing score={m.health_score} size={48} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <RiskBadge level={m.risk_level} />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-slate-400">MTBF</span><span className="font-medium text-slate-700 dark:text-slate-300">{m.mtbf_hours.toLocaleString()}h</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">MTTR</span><span className="font-medium text-slate-700 dark:text-slate-300">{m.mttr_hours}h</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Failures (30d)</span><span className="font-medium text-slate-700 dark:text-slate-300">{m.failure_count_30d}</span></div>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                <p className="text-[10px] font-medium text-slate-500">Recommended Action</p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{action}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">MTBF vs MTTR Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topRisk.map((m) => ({ name: m.machine_id, mtbf: m.mtbf_hours, mttr: m.mttr_hours }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-800" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="mtbf" fill="#3479ff" name="MTBF (hours)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mttr" fill="#f59e0b" name="MTTR (hours)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Machine Reliability Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" className="dark:!stroke-slate-800" />
              <PolarAngleAxis dataKey="machine" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
              <Radar name="Health" dataKey="health" stroke="#3479ff" fill="#3479ff" fillOpacity={0.3} />
              <Radar name="Reliability" dataKey="reliability" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Radar name="Maintainability" dataKey="maintainability" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommended actions table */}
      <div className="mt-6 card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <AlertTriangle className="h-4 w-4 text-warning-500" /> Maintenance Priority Recommendations
        </h3>
        <div className="space-y-2">
          {recommendedActions.map((m) => (
            <div key={m.id} className="flex items-center gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <HealthScoreRing score={m.health_score} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{m.machine_id} · {m.name}</p>
                <p className="text-xs text-slate-400">{m.factory_name} · {m.department_name}</p>
              </div>
              <div className="hidden sm:block w-32">
                <p className="mb-1 text-[10px] text-slate-400">Reliability</p>
                <ProgressBar value={m.health_score} tone={m.health_score >= 60 ? 'success' : m.health_score >= 40 ? 'warning' : 'danger'} />
              </div>
              <RiskBadge level={m.risk_level} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
