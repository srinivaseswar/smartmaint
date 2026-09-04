import { useState } from 'react';
import { Package, Plus, Download, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { StatusBadge } from '@/components/ui/Badge';
import { StockLevelBar } from '@/components/ui/Indicators';
import { Modal } from '@/components/ui/Modal';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import { inventoryTransactions } from '@/data/seed';
import type { SparePart } from '@/types';

export function InventoryPage() {
  const [selected, setSelected] = useState<SparePart | null>(null);
  const [txView, setTxView] = useState(false);
  const {
    data, total, page, pageSize, totalPages, search, filters, isLoading,
    setPage, setFilters, setSearch,
  } = usePaginatedData<SparePart>(api.getSpareParts, ['name', 'part_number']);

  const columns: Column<SparePart>[] = [
    {
      key: 'part_number', header: 'Part', sortable: true,
      render: (p) => (
        <div>
          <p className="font-mono text-xs font-medium text-slate-900 dark:text-white">{p.part_number}</p>
          <p className="text-xs text-slate-400">{p.name}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortable: true, render: (p) => <span className="capitalize text-slate-600 dark:text-slate-300">{p.category}</span> },
    {
      key: 'current_stock', header: 'Stock Level', sortable: true,
      render: (p) => (
        <div className="w-32">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">{p.current_stock}</span>
            <span className="text-slate-400">/{p.max_stock}</span>
          </div>
          <StockLevelBar current={p.current_stock} min={p.min_stock} reorder={p.reorder_point} max={p.max_stock} />
        </div>
      ),
    },
    { key: 'unit_cost', header: 'Unit Cost', sortable: true, align: 'right', render: (p) => <span className="text-slate-600 dark:text-slate-300">${p.unit_cost}</span> },
    { key: 'supplier_name', header: 'Supplier', sortable: true, render: (p) => <span className="text-slate-600 dark:text-slate-300">{p.supplier_name}</span> },
    { key: 'warehouse_name', header: 'Warehouse', sortable: true, render: (p) => <span className="text-slate-600 dark:text-slate-300">{p.warehouse_name}</span> },
    { key: 'movement_class', header: 'Movement', sortable: true, render: (p) => <span className="capitalize text-slate-600 dark:text-slate-300">{p.movement_class}</span> },
    { key: 'stock_status', header: 'Status', sortable: true, render: (p) => <StatusBadge status={p.stock_status} /> },
  ];

  const partTransactions = selected ? inventoryTransactions.filter((t) => t.part_id === selected.id).slice(0, 10) : [];

  return (
    <div>
      <PageHeader
        title="Spare Parts Inventory"
        subtitle="Manage spare-part catalog, stock levels, and warehouse locations"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setTxView(true)}><ArrowDownToLine className="h-4 w-4" /> Transactions</button>
            <button className="btn-secondary"><Download className="h-4 w-4" /> Export</button>
            <button className="btn-primary"><Plus className="h-4 w-4" /> Add Part</button>
          </>
        }
      />

      <div className="card p-4">
        <Toolbar searchValue={search} onSearchChange={setSearch}>
          <Select value={filters.category || ''} onChange={(v) => setFilters('category', v)} options={[{ value: 'mechanical', label: 'Mechanical' }, { value: 'electrical', label: 'Electrical' }, { value: 'hydraulic', label: 'Hydraulic' }, { value: 'pneumatic', label: 'Pneumatic' }, { value: 'electronic', label: 'Electronic' }, { value: 'consumable', label: 'Consumable' }, { value: 'lubricant', label: 'Lubricant' }, { value: 'safety', label: 'Safety' }]} placeholder="All Categories" />
          <Select value={filters.stock_status || ''} onChange={(v) => setFilters('stock_status', v)} options={[{ value: 'in_stock', label: 'In Stock' }, { value: 'low_stock', label: 'Low Stock' }, { value: 'critical', label: 'Critical' }, { value: 'out_of_stock', label: 'Out of Stock' }, { value: 'overstock', label: 'Overstock' }]} placeholder="All Stock Status" />
          <Select value={filters.movement_class || ''} onChange={(v) => setFilters('movement_class', v)} options={[{ value: 'fast', label: 'Fast-Moving' }, { value: 'medium', label: 'Medium' }, { value: 'slow', label: 'Slow-Moving' }]} placeholder="All Movement" />
        </Toolbar>
      </div>

      <div className="mt-4 card">
        <DataTable columns={columns} rows={data} onRowClick={setSelected} isLoading={isLoading} />
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {/* Part detail modal */}
      <Modal open={!!selected && !txView} onClose={() => setSelected(null)} title="Spare Part Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.name}</h3>
                <p className="font-mono text-sm text-slate-400">{selected.part_number}</p>
              </div>
              <StatusBadge status={selected.stock_status} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><p className="label">Category</p><p className="text-sm capitalize text-slate-700 dark:text-slate-300">{selected.category}</p></div>
              <div><p className="label">Unit Cost</p><p className="text-sm text-slate-700 dark:text-slate-300">${selected.unit_cost}</p></div>
              <div><p className="label">Warehouse</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.warehouse_name}</p></div>
              <div><p className="label">Supplier</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.supplier_name}</p></div>
              <div><p className="label">Lead Time</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.lead_time_days} days</p></div>
              <div><p className="label">Batch Number</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.batch_number}</p></div>
              <div><p className="label">Current Stock</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selected.current_stock} units</p></div>
              <div><p className="label">Reserved</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.reserved_stock} units</p></div>
              <div><p className="label">Available</p><p className="text-sm font-semibold text-accent-600 dark:text-accent-400">{selected.current_stock - selected.reserved_stock} units</p></div>
              <div><p className="label">Min Stock</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.min_stock}</p></div>
              <div><p className="label">Reorder Point</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.reorder_point}</p></div>
              <div><p className="label">Max Stock</p><p className="text-sm text-slate-700 dark:text-slate-300">{selected.max_stock}</p></div>
            </div>
            <div>
              <p className="label">Stock Level</p>
              <div className="w-full">
                <StockLevelBar current={selected.current_stock} min={selected.min_stock} reorder={selected.reorder_point} max={selected.max_stock} />
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>Min: {selected.min_stock}</span>
                  <span>Reorder: {selected.reorder_point}</span>
                  <span>Max: {selected.max_stock}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="label">Inventory Valuation</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">${(selected.current_stock * selected.unit_cost).toLocaleString()}</p>
            </div>
            <div>
              <p className="label">Compatible Machines</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.compatible_machines.map((m) => (
                  <span key={m} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{m}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Recent Transactions</p>
              <div className="space-y-1.5">
                {partTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {t.type === 'stock_in' ? <ArrowDownToLine className="h-3.5 w-3.5 text-accent-500" /> : <ArrowUpFromLine className="h-3.5 w-3.5 text-danger-500" />}
                      <span className="text-xs capitalize text-slate-700 dark:text-slate-300">{t.type.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs text-slate-400">{t.quantity} units · {t.timestamp.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Transactions modal */}
      <Modal open={txView} onClose={() => setTxView(false)} title="Inventory Transactions" size="xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="table-th">Part</th>
                <th className="table-th">Type</th>
                <th className="table-th">Qty</th>
                <th className="table-th">Reference</th>
                <th className="table-th">By</th>
                <th className="table-th">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {inventoryTransactions.slice(0, 30).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="table-td"><p className="font-medium text-slate-900 dark:text-white">{t.part_name}</p><p className="text-xs text-slate-400">{t.part_number}</p></td>
                  <td className="table-td"><span className="capitalize">{t.type.replace('_', ' ')}</span></td>
                  <td className="table-td">{t.quantity}</td>
                  <td className="table-td font-mono text-xs">{t.reference}</td>
                  <td className="table-td">{t.performed_by}</td>
                  <td className="table-td">{t.timestamp.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
