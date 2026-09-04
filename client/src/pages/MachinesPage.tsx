import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Plus, Download, Filter } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { StatusBadge, RiskBadge, PriorityBadge } from '@/components/ui/Badge';
import { HealthScoreRing } from '@/components/ui/Indicators';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import { factories } from '@/data/seed';
import type { Machine } from '@/types';

export function MachinesPage() {
  const navigate = useNavigate();
  const {
    data, total, page, pageSize, totalPages, search, sortBy, sortDir, filters, isLoading,
    setPage, setSortBy, setFilters,
  } = usePaginatedData<Machine>(api.getMachines, ['name', 'machine_id']);

  const columns: Column<Machine>[] = [
    {
      key: 'machine_id', header: 'Machine', sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Cpu className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{m.machine_id}</p>
            <p className="text-xs text-slate-400">{m.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true, render: (m) => <span className="text-slate-600 dark:text-slate-300">{m.type}</span> },
    { key: 'manufacturer', header: 'Manufacturer', sortable: true, render: (m) => <span className="text-slate-600 dark:text-slate-300">{m.manufacturer}</span> },
    { key: 'factory_name', header: 'Factory', sortable: true, render: (m) => <span className="text-slate-600 dark:text-slate-300">{m.factory_name}</span> },
    { key: 'department_name', header: 'Department', sortable: true, render: (m) => <span className="text-slate-600 dark:text-slate-300">{m.department_name}</span> },
    {
      key: 'criticality', header: 'Criticality', sortable: true,
      render: (m) => <PriorityBadge priority={m.criticality} />,
    },
    { key: 'status', header: 'Status', sortable: true, render: (m) => <StatusBadge status={m.status} /> },
    {
      key: 'health_score', header: 'Health', sortable: true, align: 'center',
      render: (m) => <HealthScoreRing score={m.health_score} size={48} />,
    },
    { key: 'risk_level', header: 'Risk', sortable: true, render: (m) => <RiskBadge level={m.risk_level} /> },
  ];

  const factoryOptions = factories.map((f) => ({ value: f.id, label: f.name }));

  return (
    <div>
      <PageHeader
        title="Factory & Machine Management"
        subtitle="Register, monitor, and manage all machines across your factories"
        actions={
          <>
            <button className="btn-secondary"><Download className="h-4 w-4" /> Export</button>
            <button className="btn-primary"><Plus className="h-4 w-4" /> Register Machine</button>
          </>
        }
      />

      <div className="card p-4">
        <Toolbar searchValue={search} onSearchChange={(v) => { setPage(1); }} >
          <Select
            value={filters.factory_id || ''}
            onChange={(v) => setFilters('factory_id', v)}
            options={factoryOptions}
            placeholder="All Factories"
          />
          <Select
            value={filters.status || ''}
            onChange={(v) => setFilters('status', v)}
            options={[
              { value: 'operational', label: 'Operational' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'breakdown', label: 'Breakdown' },
              { value: 'idle', label: 'Idle' },
            ]}
            placeholder="All Statuses"
          />
          <Select
            value={filters.criticality || ''}
            onChange={(v) => setFilters('criticality', v)}
            options={[
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            placeholder="All Criticality"
          />
        </Toolbar>
      </div>

      <div className="mt-4 card">
        <DataTable
          columns={columns}
          rows={data}
          onRowClick={(m) => navigate(`/machines/${m.id}`)}
          isLoading={isLoading}
          emptyMessage="No machines found matching your filters"
        />
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>
    </div>
  );
}
