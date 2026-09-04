import { useState } from 'react';
import { AlertTriangle, Plus, Download, Clock, Wrench } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import type { Breakdown } from '@/types';

export function BreakdownsPage() {
  const [selected, setSelected] = useState<Breakdown | null>(null);
  const {
    data, total, page, pageSize, totalPages, search, filters, isLoading,
    setPage, setFilters, setSearch,
  } = usePaginatedData<Breakdown>(api.getBreakdowns, ['machine_name']);

  const columns: Column<Breakdown>[] = [
    {
      key: 'breakdown_id', header: 'ID', sortable: true,
      render: (b) => <span className="font-mono text-xs font-medium text-slate-900 dark:text-white">{b.breakdown_id}</span>,
    },
    {
      key: 'machine_name', header: 'Machine', sortable: true,
      render: (b) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{b.machine_name}</p>
          <p className="text-xs text-slate-400">{b.machine_id_code}</p>
        </div>
      ),
    },
    { key: 'factory_name', header: 'Factory', sortable: true, render: (b) => <span className="text-slate-600 dark:text-slate-300">{b.factory_name}</span> },
    { key: 'severity', header: 'Severity', sortable: true, render: (b) => <PriorityBadge priority={b.severity} /> },
    { key: 'reported_date', header: 'Reported', sortable: true, render: (b) => <span className="text-slate-600 dark:text-slate-300">{b.reported_date}</span> },
    { key: 'downtime_hours', header: 'Downtime', sortable: true, align: 'center', render: (b) => <span className="text-slate-600 dark:text-slate-300">{b.downtime_hours}h</span> },
    { key: 'assigned_technician', header: 'Technician', sortable: true, render: (b) => <span className="text-slate-600 dark:text-slate-300">{b.assigned_technician}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Breakdown & Corrective Maintenance"
        subtitle="Report, track, and analyze machine breakdowns and repair activities"
        actions={
          <>
            <button className="btn-secondary"><Download className="h-4 w-4" /> Export</button>
            <button className="btn-primary"><Plus className="h-4 w-4" /> Report Breakdown</button>
          </>
        }
      />

      <div className="card p-4">
        <Toolbar searchValue={search} onSearchChange={setSearch}>
          <Select value={filters.status || ''} onChange={(v) => setFilters('status', v)} options={[{ value: 'reported', label: 'Reported' }, { value: 'diagnosing', label: 'Diagnosing' }, { value: 'in_repair', label: 'In Repair' }, { value: 'resolved', label: 'Resolved' }, { value: 'closed', label: 'Closed' }]} placeholder="All Statuses" />
          <Select value={filters.severity || ''} onChange={(v) => setFilters('severity', v)} options={[{ value: 'minor', label: 'Minor' }, { value: 'major', label: 'Major' }, { value: 'severe', label: 'Severe' }, { value: 'critical', label: 'Critical' }]} placeholder="All Severities" />
        </Toolbar>
      </div>

      <div className="mt-4 card">
        <DataTable columns={columns} rows={data} onRowClick={setSelected} isLoading={isLoading} />
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Breakdown Report" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.machine_name}</h3>
                <p className="text-sm text-slate-400">{selected.breakdown_id} · {selected.factory_name}</p>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={selected.severity} />
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Reported Date</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.reported_date}</p></div>
              <div><p className="label">Reported By</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.reported_by}</p></div>
              <div><p className="label">Assigned Technician</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.assigned_technician}</p></div>
              <div><p className="label">Downtime</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.downtime_hours} hours</p></div>
              <div><p className="label">Repair Cost</p><p className="text-sm text-slate-700 dark:text-slate-300">${selected.repair_cost.toLocaleString()}</p></div>
              <div><p className="label">Resolved Date</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.resolved_date || '—'}</p></div>
            </div>
            <div><p className="label">Symptoms</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.symptoms}</p></div>
            {selected.root_cause && <div><p className="label">Root Cause Analysis</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.root_cause}</p></div>}
            {selected.corrective_action && <div><p className="label">Corrective Action</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.corrective_action}</p></div>}
            {selected.parts_replaced.length > 0 && (
              <div>
                <p className="label">Parts Replaced</p>
                <div className="space-y-1.5">
                  {selected.parts_replaced.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{p.part_name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{p.quantity} × ${p.unit_cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
