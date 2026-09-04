import { useState } from 'react';
import { FileClock, Download, Monitor, Globe } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { Badge } from '@/components/ui/Badge';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import { ROLE_MAP } from '@/lib/rbac';
import type { AuditLog } from '@/types';

export function AuditPage() {
  const {
    data, total, page, pageSize, totalPages, search, filters, isLoading,
    setPage, setFilters, setSearch,
  } = usePaginatedData<AuditLog>(api.getAuditLogs, ['user', 'action', 'module', 'entity_id']);

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp', header: 'Timestamp', sortable: true,
      render: (l) => <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{l.timestamp.replace('T', ' ').replace('Z', '')}</span>,
    },
    { key: 'user', header: 'User', sortable: true, render: (l) => <div><p className="font-medium text-slate-900 dark:text-white">{l.user}</p><p className="text-xs text-slate-400">{ROLE_MAP[l.user_role]?.name || l.user_role}</p></div> },
    { key: 'action', header: 'Action', sortable: true, render: (l) => <Badge tone={l.action === 'CREATE' ? 'success' : l.action === 'DELETE' || l.action === 'REJECT' ? 'danger' : l.action === 'APPROVE' || l.action === 'RESOLVE' || l.action === 'COMPLETE' ? 'primary' : 'neutral'}>{l.action}</Badge> },
    { key: 'module', header: 'Module', sortable: true, render: (l) => <span className="text-slate-600 dark:text-slate-300">{l.module}</span> },
    { key: 'entity_id', header: 'Entity', render: (l) => l.entity_id ? <span className="font-mono text-xs text-slate-500">{l.entity_id}</span> : <span className="text-slate-300">—</span> },
    {
      key: 'changes', header: 'Changes',
      render: (l) => l.previous_value || l.updated_value ? (
        <div className="text-xs">
          {l.previous_value && <span className="text-danger-600 dark:text-danger-400 line-through">{l.previous_value}</span>}
          {l.previous_value && l.updated_value && <span className="mx-1 text-slate-400">→</span>}
          {l.updated_value && <span className="text-accent-600 dark:text-accent-400">{l.updated_value}</span>}
        </div>
      ) : <span className="text-slate-300">—</span>,
    },
    { key: 'ip_address', header: 'IP Address', render: (l) => <span className="font-mono text-xs text-slate-500">{l.ip_address}</span> },
    { key: 'device', header: 'Device', render: (l) => <div className="flex items-center gap-1.5"><Monitor className="h-3 w-3 text-slate-400" /><span className="text-xs text-slate-500">{l.device}</span></div> },
  ];

  return (
    <div>
      <PageHeader
        title="Audit & Activity Tracking"
        subtitle="Complete audit trail of all user actions and system changes"
        actions={<button className="btn-secondary"><Download className="h-4 w-4" /> Export Logs</button>}
      />

      <div className="card p-4">
        <Toolbar searchValue={search} onSearchChange={setSearch}>
          <Select value={filters.module || ''} onChange={(v) => setFilters('module', v)} options={[{ value: 'Machines', label: 'Machines' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Breakdowns', label: 'Breakdowns' }, { value: 'Inventory', label: 'Inventory' }, { value: 'Procurement', label: 'Procurement' }, { value: 'Warranty', label: 'Warranty' }, { value: 'Auth', label: 'Auth' }]} placeholder="All Modules" />
          <Select value={filters.action || ''} onChange={(v) => setFilters('action', v)} options={[{ value: 'CREATE', label: 'Create' }, { value: 'UPDATE', label: 'Update' }, { value: 'DELETE', label: 'Delete' }, { value: 'APPROVE', label: 'Approve' }, { value: 'LOGIN', label: 'Login' }]} placeholder="All Actions" />
        </Toolbar>
      </div>

      <div className="mt-4 card">
        <DataTable columns={columns} rows={data} isLoading={isLoading} />
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>
    </div>
  );
}
