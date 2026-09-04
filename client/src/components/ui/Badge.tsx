import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-600/15 dark:text-primary-300',
  success: 'bg-accent-50 text-accent-700 dark:bg-accent-600/15 dark:text-accent-300',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-300',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-600/15 dark:text-danger-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-600/15 dark:text-sky-300',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span className={clsx('badge', toneClasses[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { tone: Tone; label: string }> = {
    operational: { tone: 'success', label: 'Operational' },
    maintenance: { tone: 'warning', label: 'Maintenance' },
    breakdown: { tone: 'danger', label: 'Breakdown' },
    idle: { tone: 'neutral', label: 'Idle' },
    decommissioned: { tone: 'neutral', label: 'Decommissioned' },
    scheduled: { tone: 'info', label: 'Scheduled' },
    in_progress: { tone: 'warning', label: 'In Progress' },
    completed: { tone: 'success', label: 'Completed' },
    overdue: { tone: 'danger', label: 'Overdue' },
    cancelled: { tone: 'neutral', label: 'Cancelled' },
    reported: { tone: 'danger', label: 'Reported' },
    diagnosing: { tone: 'warning', label: 'Diagnosing' },
    in_repair: { tone: 'warning', label: 'In Repair' },
    resolved: { tone: 'success', label: 'Resolved' },
    closed: { tone: 'neutral', label: 'Closed' },
    active: { tone: 'success', label: 'Active' },
    expiring_soon: { tone: 'warning', label: 'Expiring Soon' },
    expired: { tone: 'danger', label: 'Expired' },
    claimed: { tone: 'info', label: 'Claimed' },
    in_stock: { tone: 'success', label: 'In Stock' },
    low_stock: { tone: 'warning', label: 'Low Stock' },
    critical: { tone: 'danger', label: 'Critical' },
    out_of_stock: { tone: 'danger', label: 'Out of Stock' },
    overstock: { tone: 'info', label: 'Overstock' },
    preferred: { tone: 'primary', label: 'Preferred' },
    inactive: { tone: 'neutral', label: 'Inactive' },
    blacklisted: { tone: 'danger', label: 'Blacklisted' },
    draft: { tone: 'neutral', label: 'Draft' },
    pending_approval: { tone: 'warning', label: 'Pending Approval' },
    approved: { tone: 'success', label: 'Approved' },
    rejected: { tone: 'danger', label: 'Rejected' },
    ordered: { tone: 'info', label: 'Ordered' },
    received: { tone: 'success', label: 'Received' },
    sent: { tone: 'info', label: 'Sent' },
    confirmed: { tone: 'primary', label: 'Confirmed' },
    partial: { tone: 'warning', label: 'Partial' },
    ok: { tone: 'success', label: 'OK' },
    warning: { tone: 'warning', label: 'Warning' },
    replaced: { tone: 'neutral', label: 'Replaced' },
  };

  const config = statusMap[status] || { tone: 'neutral' as Tone, label: status };
  return <Badge tone={config.tone} dot>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, Tone> = {
    low: 'neutral',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
    minor: 'neutral',
    major: 'warning',
    severe: 'danger',
  };
  return <Badge tone={map[priority] || 'neutral'}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
}

export function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    low: { tone: 'success', label: 'Low Risk' },
    medium: { tone: 'warning', label: 'Medium Risk' },
    high: { tone: 'danger', label: 'High Risk' },
    critical: { tone: 'danger', label: 'Critical Risk' },
  };
  const config = map[level] || { tone: 'neutral' as Tone, label: level };
  return <Badge tone={config.tone} dot>{config.label}</Badge>;
}
