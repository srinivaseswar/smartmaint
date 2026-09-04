import { useState } from 'react';
import { Truck, Plus, Star, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Toolbar, Select, PageHeader } from '@/components/ui/Toolbar';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/Indicators';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { api } from '@/lib/api';
import { purchaseRequests, purchaseOrders } from '@/data/seed';
import type { Supplier, PurchaseRequest, PurchaseOrder } from '@/types';

export function SuppliersPage() {
  const [tab, setTab] = useState<'suppliers' | 'requests' | 'orders'>('suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const {
    data: suppliers, total: sTotal, page: sPage, pageSize: sPageSize, totalPages: sTotalPages, search: sSearch, filters: sFilters, isLoading: sLoading,
    setPage: sSetPage, setFilters: sSetFilters, setSearch: sSetSearch,
  } = usePaginatedData<Supplier>(api.getSuppliers, ['name', 'contact_person']);
  const {
    data: requests, total: rTotal, page: rPage, pageSize: rPageSize, totalPages: rTotalPages, search: rSearch, filters: rFilters, isLoading: rLoading,
    setPage: rSetPage, setFilters: rSetFilters, setSearch: rSetSearch,
  } = usePaginatedData<PurchaseRequest>(api.getPurchaseRequests, ['request_number', 'requested_by']);
  const {
    data: orders, total: oTotal, page: oPage, pageSize: oPageSize, totalPages: oTotalPages, search: oSearch, filters: oFilters, isLoading: oLoading,
    setPage: oSetPage, setFilters: oSetFilters, setSearch: oSetSearch,
  } = usePaginatedData<PurchaseOrder>(api.getPurchaseOrders, ['order_number', 'supplier_name']);

  const supplierColumns: Column<Supplier>[] = [
    { key: 'name', header: 'Supplier', sortable: true, render: (s) => <div><p className="font-medium text-slate-900 dark:text-white">{s.name}</p><p className="text-xs text-slate-400">{s.contact_person}</p></div> },
    { key: 'rating', header: 'Rating', sortable: true, align: 'center', render: (s) => <div className="flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 text-warning-400 fill-warning-400" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.rating}</span></div> },
    { key: 'lead_time_days', header: 'Lead Time', sortable: true, align: 'center', render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.lead_time_days}d</span> },
    { key: 'on_time_delivery_rate', header: 'On-Time %', sortable: true, align: 'center', render: (s) => <div className="w-24"><ProgressBar value={s.on_time_delivery_rate} tone={s.on_time_delivery_rate >= 90 ? 'success' : s.on_time_delivery_rate >= 80 ? 'warning' : 'danger'} /><span className="mt-1 block text-xs text-slate-500">{s.on_time_delivery_rate}%</span></div> },
    { key: 'quality_rate', header: 'Quality %', sortable: true, align: 'center', render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.quality_rate}%</span> },
    { key: 'total_orders', header: 'Orders', sortable: true, align: 'center', render: (s) => <span className="text-slate-600 dark:text-slate-300">{s.total_orders}</span> },
    { key: 'total_value', header: 'Total Value', sortable: true, align: 'right', render: (s) => <span className="text-slate-600 dark:text-slate-300">${(s.total_value / 1000000).toFixed(2)}M</span> },
    { key: 'status', header: 'Status', sortable: true, render: (s) => <StatusBadge status={s.status} /> },
  ];

  const requestColumns: Column<PurchaseRequest>[] = [
    { key: 'request_number', header: 'Request #', sortable: true, render: (r) => <span className="font-mono text-xs font-medium text-slate-900 dark:text-white">{r.request_number}</span> },
    { key: 'requested_by', header: 'Requested By', sortable: true, render: (r) => <span className="text-slate-600 dark:text-slate-300">{r.requested_by}</span> },
    { key: 'department', header: 'Department', sortable: true, render: (r) => <span className="text-slate-600 dark:text-slate-300">{r.department}</span> },
    { key: 'priority', header: 'Priority', sortable: true, render: (r) => <Badge tone={r.priority === 'urgent' ? 'danger' : r.priority === 'high' ? 'warning' : 'info'}>{r.priority}</Badge> },
    { key: 'total_value', header: 'Value', sortable: true, align: 'right', render: (r) => <span className="text-slate-600 dark:text-slate-300">${r.total_value.toLocaleString()}</span> },
    { key: 'required_date', header: 'Required By', sortable: true, render: (r) => <span className="text-slate-600 dark:text-slate-300">{r.required_date}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  const orderColumns: Column<PurchaseOrder>[] = [
    { key: 'order_number', header: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs font-medium text-slate-900 dark:text-white">{o.order_number}</span> },
    { key: 'supplier_name', header: 'Supplier', sortable: true, render: (o) => <span className="text-slate-600 dark:text-slate-300">{o.supplier_name}</span> },
    { key: 'total_value', header: 'Value', sortable: true, align: 'right', render: (o) => <span className="text-slate-600 dark:text-slate-300">${o.total_value.toLocaleString()}</span> },
    { key: 'order_date', header: 'Order Date', sortable: true, render: (o) => <span className="text-slate-600 dark:text-slate-300">{o.order_date}</span> },
    { key: 'expected_delivery', header: 'Expected Delivery', sortable: true, render: (o) => <span className="text-slate-600 dark:text-slate-300">{o.expected_delivery}</span> },
    { key: 'delivery_progress', header: 'Progress', sortable: true, align: 'center', render: (o) => <div className="w-24"><ProgressBar value={o.delivery_progress} tone={o.delivery_progress === 100 ? 'success' : 'primary'} /><span className="mt-1 block text-xs text-slate-500">{o.delivery_progress}%</span></div> },
    { key: 'status', header: 'Status', sortable: true, render: (o) => <StatusBadge status={o.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Supplier & Procurement Management"
        subtitle="Manage suppliers, purchase requests, and purchase orders"
        actions={tab === 'suppliers' ? <button className="btn-primary"><Plus className="h-4 w-4" /> Add Supplier</button> : tab === 'requests' ? <button className="btn-primary"><Plus className="h-4 w-4" /> New Request</button> : <button className="btn-primary"><Plus className="h-4 w-4" /> Create Order</button>}
      />

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
        {([['suppliers', 'Suppliers'], ['requests', 'Purchase Requests'], ['orders', 'Purchase Orders']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={clsx('flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors', tab === key ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'suppliers' && (
        <>
          <div className="card p-4">
            <Toolbar searchValue={sSearch} onSearchChange={sSetSearch}>
              <Select value={sFilters.status || ''} onChange={(v) => sSetFilters('status', v)} options={[{ value: 'active', label: 'Active' }, { value: 'preferred', label: 'Preferred' }, { value: 'inactive', label: 'Inactive' }, { value: 'blacklisted', label: 'Blacklisted' }]} placeholder="All Statuses" />
            </Toolbar>
          </div>
          <div className="mt-4 card">
            <DataTable columns={supplierColumns} rows={suppliers} onRowClick={setSelectedSupplier} isLoading={sLoading} />
            <Pagination page={sPage} totalPages={sTotalPages} total={sTotal} pageSize={sPageSize} onPageChange={sSetPage} />
          </div>
        </>
      )}

      {tab === 'requests' && (
        <>
          <div className="card p-4">
            <Toolbar searchValue={rSearch} onSearchChange={rSetSearch}>
              <Select value={rFilters.status || ''} onChange={(v) => rSetFilters('status', v)} options={[{ value: 'draft', label: 'Draft' }, { value: 'pending_approval', label: 'Pending Approval' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'ordered', label: 'Ordered' }, { value: 'received', label: 'Received' }]} placeholder="All Statuses" />
            </Toolbar>
          </div>
          <div className="mt-4 card">
            <DataTable columns={requestColumns} rows={requests} onRowClick={setSelectedRequest} isLoading={rLoading} />
            <Pagination page={rPage} totalPages={rTotalPages} total={rTotal} pageSize={rPageSize} onPageChange={rSetPage} />
          </div>
        </>
      )}

      {tab === 'orders' && (
        <>
          <div className="card p-4">
            <Toolbar searchValue={oSearch} onSearchChange={oSetSearch}>
              <Select value={oFilters.status || ''} onChange={(v) => oSetFilters('status', v)} options={[{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'partial', label: 'Partial' }, { value: 'received', label: 'Received' }]} placeholder="All Statuses" />
            </Toolbar>
          </div>
          <div className="mt-4 card">
            <DataTable columns={orderColumns} rows={orders} onRowClick={setSelectedOrder} isLoading={oLoading} />
            <Pagination page={oPage} totalPages={oTotalPages} total={oTotal} pageSize={oPageSize} onPageChange={oSetPage} />
          </div>
        </>
      )}

      {/* Supplier detail */}
      <Modal open={!!selectedSupplier} onClose={() => setSelectedSupplier(null)} title="Supplier Profile" size="lg">
        {selectedSupplier && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedSupplier.name}</h3>
                <p className="text-sm text-slate-400">{selectedSupplier.contact_person} · {selectedSupplier.email}</p>
              </div>
              <StatusBadge status={selectedSupplier.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><p className="label">Rating</p><div className="flex items-center gap-1"><Star className="h-4 w-4 text-warning-400 fill-warning-400" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedSupplier.rating}/5</span></div></div>
              <div><p className="label">Lead Time</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedSupplier.lead_time_days} days</p></div>
              <div><p className="label">Phone</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedSupplier.phone}</p></div>
              <div><p className="label">Address</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedSupplier.address}</p></div>
              <div><p className="label">Established</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedSupplier.established}</p></div>
              <div><p className="label">Parts Supplied</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedSupplier.parts_supplied}</p></div>
              <div><p className="label">Total Orders</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedSupplier.total_orders}</p></div>
              <div><p className="label">Total Value</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">${(selectedSupplier.total_value / 1000000).toFixed(2)}M</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-xs text-slate-400">On-Time Delivery Rate</p>
                <div className="mt-2"><ProgressBar value={selectedSupplier.on_time_delivery_rate} tone="success" /></div>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedSupplier.on_time_delivery_rate}%</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-xs text-slate-400">Quality Rate</p>
                <div className="mt-2"><ProgressBar value={selectedSupplier.quality_rate} tone="primary" /></div>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedSupplier.quality_rate}%</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Request detail */}
      <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Purchase Request" size="lg">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedRequest.request_number}</h3>
              <StatusBadge status={selectedRequest.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Requested By</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedRequest.requested_by}</p></div>
              <div><p className="label">Department</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedRequest.department}</p></div>
              <div><p className="label">Created</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedRequest.created_date}</p></div>
              <div><p className="label">Required By</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedRequest.required_date}</p></div>
              <div><p className="label">Priority</p><Badge tone={selectedRequest.priority === 'urgent' ? 'danger' : 'warning'}>{selectedRequest.priority}</Badge></div>
              <div><p className="label">Approved By</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedRequest.approved_by || '—'}</p></div>
            </div>
            <div><p className="label">Justification</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedRequest.justification}</p></div>
            <div>
              <p className="label">Items</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-800"><th className="table-th">Part</th><th className="table-th">Qty</th><th className="table-th">Unit Cost</th><th className="table-th">Total</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {selectedRequest.items.map((it, i) => (
                      <tr key={i}><td className="table-td">{it.part_name}</td><td className="table-td">{it.quantity}</td><td className="table-td">${it.unit_cost}</td><td className="table-td font-medium">${it.total.toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end"><p className="text-lg font-bold text-slate-900 dark:text-white">Total: ${selectedRequest.total_value.toLocaleString()}</p></div>
          </div>
        )}
      </Modal>

      {/* Order detail */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Purchase Order" size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedOrder.order_number}</h3>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Supplier</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.supplier_name}</p></div>
              <div><p className="label">Created By</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.created_by}</p></div>
              <div><p className="label">Order Date</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.order_date}</p></div>
              <div><p className="label">Expected Delivery</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.expected_delivery}</p></div>
              <div><p className="label">Actual Delivery</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.actual_delivery || '—'}</p></div>
              <div><p className="label">Delivery Progress</p><div className="mt-1"><ProgressBar value={selectedOrder.delivery_progress} tone="primary" /></div></div>
            </div>
            <div>
              <p className="label">Items</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-800"><th className="table-th">Part</th><th className="table-th">Qty</th><th className="table-th">Unit Cost</th><th className="table-th">Total</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {selectedOrder.items.map((it, i) => (
                      <tr key={i}><td className="table-td">{it.part_name}</td><td className="table-td">{it.quantity}</td><td className="table-td">${it.unit_cost}</td><td className="table-td font-medium">${it.total.toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end"><p className="text-lg font-bold text-slate-900 dark:text-white">Total: ${selectedOrder.total_value.toLocaleString()}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
