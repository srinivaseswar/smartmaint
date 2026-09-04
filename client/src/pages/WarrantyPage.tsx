import { useState } from 'react';
import { ShieldCheck, Plus, AlertTriangle, CalendarClock } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import type { Warranty } from '@/types';

export function WarrantyPage() {
  const [selected, setSelected] = useState<Warranty | null>(null);
  const {
    data, total, page, pageSize, totalPages, search, filters, isLoading,
    setPage, setFilters, setSearch,
  } = usePaginatedData<Warranty>(api.getWarranties, ['machine_name', 'warranty_number', 'provider']);

  const columns: Column<Warranty>[] = [
    { key: 'warranty_number', header: 'Warranty #', sortable: true, render: (w) => <span className="font-mono text-xs font-medium text-slate-900 dark:text-white">{w.warranty_number}</span> },
    {
      key: 'machine_name', header: 'Machine / Component', sortable: true,
      render: (w) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{w.machine_name}</p>
          <p className="text-xs text-slate-400">{w.component_name || w.machine_id_code}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true, render: (w) => <span className="capitalize text-slate-600 dark:text-slate-300">{w.type}</span> },
    { key: 'provider', header: 'Provider', sortable: true, render: (w) => <span className="text-slate-600 dark:text-slate-300">{w.provider}</span> },
    { key: 'start_date', header: 'Start', sortable: true, render: (w) => <span className="text-slate-600 dark:text-slate-300">{w.start_date}</span> },
    { key: 'end_date', header: 'End', sortable: true, render: (w) => <span className="text-slate-600 dark:text-slate-300">{w.end_date}</span> },
    {
      key: 'days_remaining', header: 'Days Left', sortable: true, align: 'center',
      render: (w) => (
        <span className={`text-sm font-medium ${w.days_remaining < 0 ? 'text-danger-600 dark:text-danger-400' : w.days_remaining < 60 ? 'text-warning-600 dark:text-warning-400' : 'text-slate-600 dark:text-slate-300'}`}>
          {w.days_remaining < 0 ? 'Expired' : w.days_remaining}
        </span>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (w) => <StatusBadge status={w.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Warranty Management"
        subtitle="Track machine and component warranties, expiry alerts, and claims"
        actions={<button className="btn-primary"><Plus className="h-4 w-4" /> Add Warranty</button>}
      />

      <div className="card p-4">
        <Toolbar searchValue={search} onSearchChange={setSearch}>
          <Select value={filters.status || ''} onChange={(v) => setFilters('status', v)} options={[{ value: 'active', label: 'Active' }, { value: 'expiring_soon', label: 'Expiring Soon' }, { value: 'expired', label: 'Expired' }, { value: 'claimed', label: 'Claimed' }]} placeholder="All Statuses" />
          <Select value={filters.type || ''} onChange={(v) => setFilters('type', v)} options={[{ value: 'machine', label: 'Machine' }, { value: 'component', label: 'Component' }]} placeholder="All Types" />
        </Toolbar>
      </div>

      <div className="mt-4 card">
        <DataTable columns={columns} rows={data} onRowClick={setSelected} isLoading={isLoading} />
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Warranty Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.machine_name}</h3>
                <p className="font-mono text-sm text-slate-400">{selected.warranty_number}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Type</p><p className="text-sm capitalize text-slate-700 dark:text-slate-300">{selected.type}</p></div>
              <div><p className="label">Provider</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.provider}</p></div>
              <div><p className="label">Start Date</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.start_date}</p></div>
              <div><p className="label">End Date</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.end_date}</p></div>
              <div><p className="label">Days Remaining</p><p className={`text-sm font-semibold ${selected.days_remaining < 0 ? 'text-danger-600 dark:text-danger-400' : selected.days_remaining < 60 ? 'text-warning-600 dark:text-warning-400' : 'text-accent-600 dark:text-accent-400'}`}>{selected.days_remaining < 0 ? 'Expired' : `${selected.days_remaining} days`}</p></div>
              {selected.component_name && <div><p className="label">Component</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.component_name}</p></div>}
            </div>
            <div><p className="label">Coverage</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.coverage}</p></div>
            <div><p className="label">Terms & Conditions</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.terms}</p></div>
            {selected.status === 'expiring_soon' && (
              <div className="flex items-center gap-2 rounded-lg bg-warning-50 p-3 dark:bg-warning-600/10">
                <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                <p className="text-sm text-warning-700 dark:text-warning-300">This warranty expires in {selected.days_remaining} days. Consider renewal or claim filing.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
