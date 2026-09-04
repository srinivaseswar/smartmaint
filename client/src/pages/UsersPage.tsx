import { useState } from 'react';
import { Plus, Download, Mail, Phone, ShieldCheck, Building2, Clock, Check } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import { ROLE_CATALOG, ROLE_MAP } from '@/lib/rbac';
import { factories } from '@/data/seed';
import type { User, RoleKey } from '@/types';

const roleTone: Record<RoleKey, 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  super_admin: 'danger',
  factory_manager: 'primary',
  maintenance_manager: 'warning',
  maintenance_engineer: 'info',
  inventory_manager: 'success',
  procurement_officer: 'neutral',
  supplier: 'neutral',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function UsersPage() {
  const [selected, setSelected] = useState<User | null>(null);
  const {
    data, total, page, pageSize, totalPages, search, filters, isLoading,
    setPage, setFilters, setSearch,
  } = usePaginatedData<User>(api.getUsersPaginated, ['name', 'email', 'role_name']);

  const roleOptions = ROLE_CATALOG.map((r) => ({ value: r.key, label: r.name }));
  const factoryMap = Object.fromEntries(factories.map((f) => [f.id, f.name]));

  const columns: Column<User>[] = [
    {
      key: 'name', header: 'User', sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: u.avatar_color }}>
            {initials(u.name)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
            <p className="text-xs text-slate-400">{u.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email', header: 'Email', sortable: true,
      render: (u) => <span className="text-slate-600 dark:text-slate-300">{u.email}</span>,
    },
    {
      key: 'role', header: 'Role', sortable: true,
      render: (u) => <Badge tone={roleTone[u.role]}>{ROLE_MAP[u.role]?.name || u.role}</Badge>,
    },
    {
      key: 'factory_id', header: 'Factory', sortable: true,
      render: (u) => <span className="text-slate-600 dark:text-slate-300">{u.factory_id ? factoryMap[u.factory_id] || '—' : 'Global'}</span>,
    },
    {
      key: 'phone', header: 'Phone', sortable: false,
      render: (u) => <span className="text-slate-600 dark:text-slate-300">{u.phone || '—'}</span>,
    },
    {
      key: 'last_active', header: 'Last Active', sortable: true,
      render: (u) => <span className="text-slate-600 dark:text-slate-300">{u.last_active}</span>,
    },
  ];

  const selectedRole = selected ? ROLE_MAP[selected.role] : null;

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and permissions"
        actions={
          <>
            <button className="btn-secondary"><Download className="h-4 w-4" /> Export</button>
            <button className="btn-primary"><Plus className="h-4 w-4" /> Add User</button>
          </>
        }
      />

      <div className="card p-4">
        <Toolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search users...">
          <Select
            value={filters.role || ''}
            onChange={(v) => setFilters('role', v)}
            options={roleOptions}
            placeholder="All Roles"
          />
        </Toolbar>
      </div>

      <div className="mt-4 card">
        <DataTable columns={columns} rows={data} onRowClick={setSelected} isLoading={isLoading} />
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details" size="md">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: selected.avatar_color }}>
                {initials(selected.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone={roleTone[selected.role]}>{selectedRole?.name}</Badge>
                  <span className="text-xs text-slate-400">{selected.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400"><Mail className="h-3.5 w-3.5" /> Email</div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selected.email}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400"><Phone className="h-3.5 w-3.5" /> Phone</div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selected.phone || '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400"><Building2 className="h-3.5 w-3.5" /> Factory</div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selected.factory_id ? factoryMap[selected.factory_id] || '—' : 'Global Access'}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> Last Active</div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selected.last_active}</p>
              </div>
            </div>

            {selectedRole && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Role & Permissions</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{selectedRole.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRole.permissions.includes('*') ? (
                    <Badge tone="danger" dot>Full Access (All Modules)</Badge>
                  ) : (
                    selectedRole.permissions.map((perm) => (
                      <span key={perm} className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Check className="h-3 w-3 text-accent-500" />
                        {perm}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
