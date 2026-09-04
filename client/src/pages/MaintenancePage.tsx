import { useState } from 'react';
import { Wrench, Plus, Calendar, List, Clock, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import { maintenanceSchedules, machines } from '@/data/seed';
import type { MaintenanceSchedule } from '@/types';

export function MaintenancePage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selected, setSelected] = useState<MaintenanceSchedule | null>(null);
  const {
    data, total, page, pageSize, totalPages, search, filters, isLoading,
    setPage, setFilters, setSearch,
  } = usePaginatedData<MaintenanceSchedule>(api.getMaintenanceSchedules, ['machine_name']);

  const machineOptions = machines.slice(0, 20).map((m) => ({ value: m.id, label: m.machine_id }));

  const columns: Column<MaintenanceSchedule>[] = [
    {
      key: 'machine_name', header: 'Machine', sortable: true,
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{s.machine_name}</p>
          <p className="text-xs text-slate-400">{s.machine_id_code}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true, render: (s) => <span className="capitalize text-slate-600 dark:text-slate-300">{s.type}</span> },
    { key: 'priority', header: 'Priority', sortable: true, render: (s) => <PriorityBadge priority={s.priority} /> },
    { key: 'scheduled_date', header: 'Scheduled', sortable: true, render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.scheduled_date}</span> },
    { key: 'assigned_technician', header: 'Technician', sortable: true, render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.assigned_technician}</span> },
    { key: 'estimated_hours', header: 'Est. Hours', sortable: true, align: 'center', render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.estimated_hours}h</span> },
    { key: 'status', header: 'Status', sortable: true, render: (s) => <StatusBadge status={s.status} /> },
  ];

  // Calendar view
  const today = new Date('2026-08-28');
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startWeekday = monthStart.getDay();
  const calendarDays: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return maintenanceSchedules.filter((s) => s.scheduled_date === dateStr);
  };

  return (
    <div>
      <PageHeader
        title="Preventive Maintenance"
        subtitle="Schedule, track, and manage maintenance work orders"
        actions={
          <>
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
              <button onClick={() => setView('list')} className={clsx('rounded-md px-3 py-1.5 text-xs font-medium', view === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400')}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setView('calendar')} className={clsx('rounded-md px-3 py-1.5 text-xs font-medium', view === 'calendar' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400')}>
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            <button className="btn-primary"><Plus className="h-4 w-4" /> Schedule Maintenance</button>
          </>
        }
      />

      {view === 'list' ? (
        <>
          <div className="card p-4">
            <Toolbar searchValue={search} onSearchChange={setSearch}>
              <Select value={filters.status || ''} onChange={(v) => setFilters('status', v)} options={[{ value: 'scheduled', label: 'Scheduled' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'overdue', label: 'Overdue' }]} placeholder="All Statuses" />
              <Select value={filters.type || ''} onChange={(v) => setFilters('type', v)} options={[{ value: 'preventive', label: 'Preventive' }, { value: 'corrective', label: 'Corrective' }, { value: 'predictive', label: 'Predictive' }, { value: 'inspection', label: 'Inspection' }]} placeholder="All Types" />
              <Select value={filters.priority || ''} onChange={(v) => setFilters('priority', v)} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} placeholder="All Priorities" />
            </Toolbar>
          </div>
          <div className="mt-4 card">
            <DataTable columns={columns} rows={data} onRowClick={setSelected} isLoading={isLoading} />
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {today.toLocaleString('en', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button className="btn-secondary px-2 py-1 text-xs">Prev</button>
              <button className="btn-secondary px-2 py-1 text-xs">Today</button>
              <button className="btn-secondary px-2 py-1 text-xs">Next</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="pb-2 text-center text-xs font-semibold text-slate-400">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              const daySchedules = day ? getSchedulesForDay(day) : [];
              const isToday = day === today.getDate();
              return (
                <div
                  key={i}
                  className={clsx(
                    'min-h-[100px] rounded-lg border p-1.5',
                    day === null ? 'border-transparent' : 'border-slate-100 dark:border-slate-800',
                    isToday && 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-600/5',
                  )}
                >
                  {day && (
                    <>
                      <p className={clsx('mb-1 text-xs font-medium', isToday ? 'text-primary-700 dark:text-primary-300' : 'text-slate-500 dark:text-slate-400')}>{day}</p>
                      <div className="space-y-1">
                        {daySchedules.slice(0, 3).map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelected(s)}
                            className={clsx(
                              'block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium transition-colors',
                              s.status === 'overdue' ? 'bg-danger-100 text-danger-700 dark:bg-danger-600/20 dark:text-danger-300' :
                              s.status === 'completed' ? 'bg-accent-100 text-accent-700 dark:bg-accent-600/20 dark:text-accent-300' :
                              s.status === 'in_progress' ? 'bg-warning-100 text-warning-700 dark:bg-warning-600/20 dark:text-warning-300' :
                              'bg-primary-100 text-primary-700 dark:bg-primary-600/20 dark:text-primary-300',
                            )}
                          >
                            {s.machine_id_code}
                          </button>
                        ))}
                        {daySchedules.length > 3 && <p className="text-[10px] text-slate-400">+{daySchedules.length - 3} more</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Maintenance Work Order" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.machine_name}</h3>
                <p className="text-sm text-slate-400">{selected.machine_id_code} · {selected.factory_name}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Type</p><p className="text-sm capitalize text-slate-700 dark:text-slate-300">{selected.type}</p></div>
              <div><p className="label">Priority</p><PriorityBadge priority={selected.priority} /></div>
              <div><p className="label">Scheduled Date</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.scheduled_date}</p></div>
              <div><p className="label">Assigned Technician</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.assigned_technician}</p></div>
              <div><p className="label">Estimated Hours</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.estimated_hours}h</p></div>
              <div><p className="label">Cost</p><p className="text-sm text-slate-700 dark:text-slate-300">${selected.cost}</p></div>
            </div>
            <div><p className="label">Description</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.description}</p></div>
            <div>
              <p className="label">Checklist</p>
              <div className="space-y-2">
                {selected.checklist.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                    {c.completed ? <CheckCircle2 className="h-4 w-4 text-accent-500" /> : <Clock className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
                    <span className={clsx('text-sm', c.completed ? 'text-slate-500 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-300')}>{c.task}</span>
                  </div>
                ))}
              </div>
            </div>
            {selected.recurring && (
              <div className="rounded-lg bg-primary-50 p-3 text-xs text-primary-700 dark:bg-primary-600/10 dark:text-primary-300">
                Recurring every {selected.interval_days} days
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
