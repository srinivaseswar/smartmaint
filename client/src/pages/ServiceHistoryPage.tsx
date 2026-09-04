import { useState } from 'react';
import { ClipboardList, Plus, Download, Paperclip } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import type { ServiceRecord } from '@/types';

export function ServiceHistoryPage() {
  const [selected, setSelected] = useState<ServiceRecord | null>(null);
  const {
    data, total, page, pageSize, totalPages, search, filters, isLoading,
    setPage, setFilters, setSearch,
  } = usePaginatedData<ServiceRecord>(api.getServiceRecords, ['machine_name', 'service_id', 'technician']);

  const columns: Column<ServiceRecord>[] = [
    { key: 'service_id', header: 'Service #', sortable: true, render: (s) => <span className="font-mono text-xs font-medium text-slate-900 dark:text-white">{s.service_id}</span> },
    {
      key: 'machine_name', header: 'Machine', sortable: true,
      render: (s) => <div><p className="font-medium text-slate-900 dark:text-white">{s.machine_name}</p><p className="text-xs text-slate-400">{s.machine_id_code}</p></div>,
    },
    { key: 'date', header: 'Date', sortable: true, render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.date}</span> },
    { key: 'technician', header: 'Technician', sortable: true, render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.technician}</span> },
    { key: 'type', header: 'Type', sortable: true, render: (s) => <Badge tone={s.type === 'preventive' ? 'primary' : s.type === 'corrective' ? 'warning' : s.type === 'predictive' ? 'success' : 'neutral'}>{s.type}</Badge> },
    { key: 'labor_hours', header: 'Labor Hours', sortable: true, align: 'center', render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.labor_hours}h</span> },
    { key: 'downtime_hours', header: 'Downtime', sortable: true, align: 'center', render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.downtime_hours}h</span> },
    { key: 'total_cost', header: 'Cost', sortable: true, align: 'right', render: (s) => <span className="font-medium text-slate-700 dark:text-slate-300">${s.total_cost.toLocaleString()}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Service History"
        subtitle="Complete digital service record for every machine"
        actions={<button className="btn-secondary"><Download className="h-4 w-4" /> Export</button>}
      />

      <div className="card p-4">
        <Toolbar searchValue={search} onSearchChange={setSearch}>
          <Select value={filters.type || ''} onChange={(v) => setFilters('type', v)} options={[{ value: 'preventive', label: 'Preventive' }, { value: 'corrective', label: 'Corrective' }, { value: 'predictive', label: 'Predictive' }, { value: 'inspection', label: 'Inspection' }]} placeholder="All Types" />
        </Toolbar>
      </div>

      <div className="mt-4 card">
        <DataTable columns={columns} rows={data} onRowClick={setSelected} isLoading={isLoading} />
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Service Record" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.service_id}</h3>
                <p className="text-sm text-slate-400">{selected.machine_name} · {selected.machine_id_code}</p>
              </div>
              <Badge tone={selected.type === 'preventive' ? 'primary' : selected.type === 'corrective' ? 'warning' : selected.type === 'predictive' ? 'success' : 'neutral'}>{selected.type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><p className="label">Date</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.date}</p></div>
              <div><p className="label">Technician</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.technician}</p></div>
              <div><p className="label">Labor Hours</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.labor_hours}h</p></div>
              <div><p className="label">Downtime</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.downtime_hours}h</p></div>
              <div><p className="label">Labor Cost</p><p className="text-sm text-slate-700 dark:text-slate-300">${selected.labor_cost.toLocaleString()}</p></div>
              <div><p className="label">Parts Cost</p><p className="text-sm text-slate-700 dark:text-slate-300">${selected.parts_cost.toLocaleString()}</p></div>
            </div>
            <div><p className="label">Problem Description</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.problem_description}</p></div>
            <div><p className="label">Diagnosis</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.diagnosis}</p></div>
            {selected.root_cause && <div><p className="label">Root Cause</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.root_cause}</p></div>}
            {selected.corrective_action && <div><p className="label">Corrective Action</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.corrective_action}</p></div>}
            {selected.parts_replaced.length > 0 && (
              <div>
                <p className="label">Parts Replaced</p>
                <div className="space-y-1.5">
                  {selected.parts_replaced.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{p.part_name}</span>
                      <span className="text-xs text-slate-400">{p.quantity} × ${p.unit_cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Cost</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">${selected.total_cost.toLocaleString()}</span>
            </div>
            {selected.attachments.length > 0 && (
              <div>
                <p className="label">Attachments</p>
                <div className="flex gap-2">
                  {selected.attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                      <Paperclip className="h-3 w-3" /> {a}
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
