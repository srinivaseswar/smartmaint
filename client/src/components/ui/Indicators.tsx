import { clsx } from 'clsx';

export function HealthScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'primary',
  className,
}: {
  value: number;
  max?: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-accent-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };
  return (
    <div className={clsx('h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-500', colors[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function StockLevelBar({
  current,
  min,
  reorder,
  max,
}: {
  current: number;
  min: number;
  max: number;
  reorder: number;
}) {
  const pct = Math.min(100, (current / max) * 100);
  const minPct = (min / max) * 100;
  const reorderPct = (reorder / max) * 100;
  const tone = current <= min ? 'danger' : current <= reorder ? 'warning' : 'success';
  const colors = { success: 'bg-accent-500', warning: 'bg-warning-500', danger: 'bg-danger-500' };

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className={clsx('h-full rounded-full transition-all', colors[tone])}
        style={{ width: `${pct}%` }}
      />
      <div className="absolute top-0 h-full w-px bg-slate-400 dark:bg-slate-500" style={{ left: `${minPct}%` }} />
      <div className="absolute top-0 h-full w-px bg-warning-400 dark:bg-warning-600" style={{ left: `${reorderPct}%` }} />
    </div>
  );
}
