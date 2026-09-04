import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneConfig: Record<Tone, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-600/10', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-600/20' },
  success: { bg: 'bg-accent-50 dark:bg-accent-600/10', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-600/20' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-600/10', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-600/20' },
  danger: { bg: 'bg-danger-50 dark:bg-danger-600/10', text: 'text-danger-600 dark:text-danger-400', ring: 'ring-danger-100 dark:ring-danger-600/20' },
  info: { bg: 'bg-sky-50 dark:bg-sky-600/10', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-100 dark:ring-sky-600/20' },
  neutral: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-700' },
};

export function KPICard({
  label,
  value,
  icon,
  tone = 'primary',
  trend,
  trendValue,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: Tone;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  subtitle?: string;
}) {
  const config = toneConfig[tone];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-accent-600 dark:text-accent-400' : trend === 'down' ? 'text-danger-600 dark:text-danger-400' : 'text-slate-400';

  return (
    <div className="card card-hover p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>
        <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1', config.bg, config.text, config.ring)}>
          {icon}
        </div>
      </div>
      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIcon className={clsx('h-3.5 w-3.5', trendColor)} />
          <span className={clsx('text-xs font-semibold', trendColor)}>{trendValue}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
