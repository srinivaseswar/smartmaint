import { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader, Select } from '@/components/ui/Toolbar';
import { Badge } from '@/components/ui/Badge';
import { notifications as allNotifications } from '@/data/seed';
import { useAppSelector } from '@/store';

export function NotificationsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [filter, setFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  if (!user) return null;
  let notifs = allNotifications.filter((n) => n.target_roles.includes(user.role));

  if (filter !== 'all') notifs = notifs.filter((n) => n.priority === filter);
  if (readFilter === 'unread') notifs = notifs.filter((n) => !n.read);
  if (readFilter === 'read') notifs = notifs.filter((n) => n.read);

  const unreadCount = allNotifications.filter((n) => n.target_roles.includes(user.role) && !n.read).length;

  const iconFor = (priority: string) => {
    if (priority === 'critical') return <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-400" />;
    if (priority === 'warning') return <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />;
    return <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />;
  };

  const bgFor = (priority: string) => {
    if (priority === 'critical') return 'bg-danger-50 dark:bg-danger-600/10';
    if (priority === 'warning') return 'bg-warning-50 dark:bg-warning-600/10';
    return 'bg-sky-50 dark:bg-sky-600/10';
  };

  return (
    <div>
      <PageHeader
        title="Notification Center"
        subtitle={`${unreadCount} unread notifications`}
        actions={<button className="btn-secondary"><CheckCheck className="h-4 w-4" /> Mark all read</button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select value={filter} onChange={setFilter} options={[{ value: 'critical', label: 'Critical' }, { value: 'warning', label: 'Warning' }, { value: 'info', label: 'Info' }]} placeholder="All Priorities" />
        <Select value={readFilter} onChange={setReadFilter} options={[{ value: 'unread', label: 'Unread' }, { value: 'read', label: 'Read' }]} placeholder="All" />
      </div>

      <div className="space-y-2">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={clsx(
              'card card-hover flex items-start gap-4 p-4',
              !n.read && 'ring-1 ring-primary-200 dark:ring-primary-800',
            )}
          >
            <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', bgFor(n.priority))}>
              {iconFor(n.priority)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                </div>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone={n.priority === 'critical' ? 'danger' : n.priority === 'warning' ? 'warning' : 'info'}>{n.module}</Badge>
                <span className="text-xs text-slate-400">{n.timestamp.replace('T', ' · ').replace('Z', '')}</span>
              </div>
            </div>
            {n.action_url && (
              <a href={n.action_url} className="shrink-0 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
                View
              </a>
            )}
          </div>
        ))}
        {notifs.length === 0 && (
          <div className="card flex h-40 items-center justify-center text-sm text-slate-400">
            <Bell className="mr-2 h-5 w-5" /> No notifications
          </div>
        )}
      </div>
    </div>
  );
}
