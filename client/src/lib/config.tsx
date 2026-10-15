import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { EntityKey, Row, Store, Data } from '@/lib/store';
import { checkState, findMachine, isLow, machineLabel, nextDue, scheduleState, warrantyState } from '@/lib/derive';
import { money, todayStr } from '@/lib/util';
import { Avatar, Dot } from '@/components/ui';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'photo';
  camera?: 'user' | 'environment';
  options?: string[];
  ref?: 'machines' | 'suppliers' | 'supplierUsers' | 'spares';
  adminOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  wide?: boolean;
}
export interface ColumnDef { key: string; label: string; render?: (r: Row, d: Data) => ReactNode }
export interface EntityConfig {
  entity: EntityKey;
  title: string;
  singular: string;
  note: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  searchKeys: string[];
  requires?: EntityKey;
  defaults?: Record<string, string | number>;
  actions?: (r: Row, s: Store) => ReactNode;
}

export const MACHINE_STATUS = ['Running', 'Idle', 'Under maintenance', 'Breakdown'];
const statusTone = { Running: 'ok', Idle: 'mute', 'Under maintenance': 'warn', Breakdown: 'bad' } as const;
const mName = (r: Row, d: Data) => machineLabel(findMachine(d, r.machineId));

export const CONFIGS: Record<EntityKey, EntityConfig> = {
  machines: {
    entity: 'machines', title: 'Machines', singular: 'machine',
    note: 'Register every machine once. Spares, warranty and service records link back to it.',
    searchKeys: ['name', 'machineCode', 'type', 'manufacturer', 'model', 'serialNumber', 'location'],
    defaults: { status: 'Running' },
    fields: [
      { key: 'photo', label: 'Machine photo', type: 'photo', camera: 'environment', wide: true },
      { key: 'name', label: 'Machine name', required: true, placeholder: 'Hydraulic press' },
      { key: 'machineCode', label: 'Machine ID', required: true, placeholder: 'MC-001' },
      { key: 'type', label: 'Type', placeholder: 'Press, lathe, conveyor…' },
      { key: 'manufacturer', label: 'Manufacturer' },
      { key: 'model', label: 'Model' },
      { key: 'serialNumber', label: 'Serial number' },
      { key: 'location', label: 'Location / line', placeholder: 'Plant 1 · Line A' },
      { key: 'installDate', label: 'Installed on', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: MACHINE_STATUS },
    ],
    columns: [
      { key: 'photo', label: 'Photo', render: (r) => <Avatar src={String(r.photo || '')} name={String(r.name)} size={36} /> },
      { key: 'machineCode', label: 'ID' },
      { key: 'name', label: 'Machine', render: (r) => <Link to={`/machines/${r.id}`} className="font-medium underline-offset-2 hover:text-brand hover:underline">{r.name}</Link> },
      { key: 'type', label: 'Type' },
      { key: 'manufacturer', label: 'Manufacturer' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', render: (r) => <Dot tone={statusTone[r.status as keyof typeof statusTone] ?? 'mute'}>{r.status}</Dot> },
      { key: 'check', label: 'Monthly check', render: (r, d) => { const s = checkState(d, r); return <Dot tone={s.tone}>{s.text}</Dot>; } },
    ],
  },
  spares: {
    entity: 'spares', title: 'Spare parts', singular: 'spare part', requires: 'machines',
    note: 'Track stock against a minimum level. Low items show up on the dashboard.',
    searchKeys: ['name', 'partNumber', 'location', 'specifications'],
    defaults: { quantity: 0, minQuantity: 1, unitCost: 0 },
    fields: [
      { key: 'name', label: 'Part name', required: true },
      { key: 'partNumber', label: 'Part number', required: true },
      { key: 'machineId', label: 'Used in machine', type: 'select', ref: 'machines' },
      { key: 'supplierId', label: 'Supplier', type: 'select', ref: 'suppliers' },
      { key: 'quantity', label: 'In stock', type: 'number', required: true },
      { key: 'minQuantity', label: 'Minimum stock', type: 'number', required: true },
      { key: 'specifications', label: 'Specifications', type: 'textarea', wide: true },
      { key: 'unitCost', label: 'Unit cost (₹)', type: 'number' },
      { key: 'location', label: 'Shelf / store' },
    ],
    columns: [
      { key: 'partNumber', label: 'Part no.' },
      { key: 'name', label: 'Part', render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'machineId', label: 'Machine', render: (r, d) => mName(r, d) },
      { key: 'quantity', label: 'Stock', render: (r) => <Dot tone={isLow(r) ? 'bad' : 'ok'}>{r.quantity} / min {r.minQuantity}</Dot> },
      { key: 'availability', label: 'Availability', render: (r) => Number(r.quantity) > 0 ? 'Available' : 'Out of stock' },
      { key: 'supplierId', label: 'Supplier', render: (r, d) => d.suppliers.find((s) => s.id === r.supplierId)?.name ?? '—' },
      { key: 'unitCost', label: 'Unit cost', render: (r) => money(r.unitCost) },
    ],
  },
  suppliers: {
    entity: 'suppliers', title: 'Suppliers', singular: 'supplier',
    note: 'Who you buy spares from and how quickly they deliver.',
    searchKeys: ['name', 'contactPerson', 'email', 'phone', 'address'],
    defaults: { leadTimeDays: 7 },
    fields: [
      { key: 'name', label: 'Supplier name', required: true },
      { key: 'accountId', label: 'Supplier login account', type: 'select', ref: 'supplierUsers', adminOnly: true },
      { key: 'contactPerson', label: 'Contact person' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'leadTimeDays', label: 'Lead time (days)', type: 'number' },
      { key: 'address', label: 'Address', type: 'textarea', wide: true },
    ],
    columns: [
      { key: 'name', label: 'Supplier', render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'contactPerson', label: 'Contact' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'leadTimeDays', label: 'Lead time', render: (r) => `${r.leadTimeDays} days` },
    ],
  },
  warranties: {
    entity: 'warranties', title: 'Warranty', singular: 'warranty', requires: 'machines',
    note: 'Warranties ending within 30 days are flagged on the dashboard.',
    searchKeys: ['provider', 'reference', 'coverage'],
    fields: [
      { key: 'machineId', label: 'Machine', type: 'select', ref: 'machines', required: true },
      { key: 'provider', label: 'Warranty provider', required: true },
      { key: 'startDate', label: 'Starts on', type: 'date', required: true },
      { key: 'endDate', label: 'Ends on', type: 'date', required: true },
      { key: 'reference', label: 'Reference / policy no.' },
      { key: 'coverage', label: 'What is covered', type: 'textarea', wide: true },
    ],
    columns: [
      { key: 'machineId', label: 'Machine', render: (r, d) => mName(r, d) },
      { key: 'provider', label: 'Provider' },
      { key: 'startDate', label: 'From' },
      { key: 'endDate', label: 'Until' },
      { key: 'status', label: 'Status', render: (r) => { const s = warrantyState(r); return <Dot tone={s.tone}>{s.text}</Dot>; } },
    ],
  },
  services: {
    entity: 'services', title: 'Service history', singular: 'service record', requires: 'machines',
    note: 'Every repair, inspection and preventive job, with cost and downtime.',
    searchKeys: ['technician', 'description', 'type'],
    defaults: { type: 'Preventive', cost: 0, downtimeHours: 0, date: todayStr() },
    fields: [
      { key: 'machineId', label: 'Machine', type: 'select', ref: 'machines', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Preventive', 'Corrective', 'Inspection'] },
      { key: 'technician', label: 'Technician' },
      { key: 'cost', label: 'Cost (₹)', type: 'number' },
      { key: 'downtimeHours', label: 'Downtime (hours)', type: 'number' },
      { key: 'description', label: 'Work done', type: 'textarea', wide: true, required: true },
    ],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'machineId', label: 'Machine', render: (r, d) => mName(r, d) },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Work done' },
      { key: 'technician', label: 'Technician' },
      { key: 'downtimeHours', label: 'Downtime', render: (r) => `${r.downtimeHours} h` },
      { key: 'cost', label: 'Cost', render: (r) => money(r.cost) },
    ],
  },
  inspections: {
    entity: 'inspections', title: 'Monthly checks', singular: 'monthly check', requires: 'machines',
    note: 'Check every machine once a month. Saving a check updates the machine status.',
    searchKeys: ['checkedBy', 'notes', 'condition'],
    defaults: { date: todayStr(), status: 'Running', condition: 'Good' },
    fields: [
      { key: 'machineId', label: 'Machine', type: 'select', ref: 'machines', required: true },
      { key: 'date', label: 'Checked on', type: 'date', required: true },
      { key: 'status', label: 'Machine status', type: 'select', options: MACHINE_STATUS, required: true },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Good', 'Needs attention', 'Critical'] },
      { key: 'checkedBy', label: 'Checked by' },
      { key: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'machineId', label: 'Machine', render: (r, d) => mName(r, d) },
      { key: 'status', label: 'Status', render: (r) => <Dot tone={statusTone[r.status as keyof typeof statusTone] ?? 'mute'}>{r.status}</Dot> },
      { key: 'condition', label: 'Condition' },
      { key: 'checkedBy', label: 'Checked by' },
      { key: 'notes', label: 'Notes' },
    ],
  },
  schedules: {
    entity: 'schedules', title: 'Preventive maintenance', singular: 'schedule', requires: 'machines',
    note: 'Repeating jobs. Mark one done and the next due date and a service record are created for you.',
    searchKeys: ['task'],
    defaults: { frequencyDays: 30 },
    fields: [
      { key: 'machineId', label: 'Machine', type: 'select', ref: 'machines', required: true },
      { key: 'task', label: 'Task', required: true, placeholder: 'Lubrication, belt check…' },
      { key: 'frequencyDays', label: 'Repeat every (days)', type: 'number', required: true },
      { key: 'lastDone', label: 'Last done on', type: 'date' },
    ],
    columns: [
      { key: 'task', label: 'Task', render: (r) => <span className="font-medium">{r.task}</span> },
      { key: 'machineId', label: 'Machine', render: (r, d) => mName(r, d) },
      { key: 'frequencyDays', label: 'Repeats', render: (r) => `Every ${r.frequencyDays} days` },
      { key: 'lastDone', label: 'Last done', render: (r) => r.lastDone || '—' },
      { key: 'next', label: 'Next due', render: (r) => { const s = scheduleState(r); return <Dot tone={s.tone}>{nextDue(r)} · {s.text}</Dot>; } },
    ],
    actions: (r, s) => (
      <button
        className="text-sm font-medium text-brand hover:underline"
        onClick={async () => {
          await s.update('schedules', r.id, { lastDone: todayStr() });
          await s.add('services', { machineId: r.machineId, date: todayStr(), type: 'Preventive', technician: '', description: String(r.task), cost: 0, downtimeHours: 0 });
        }}
      >
        Mark done
      </button>
    ),
  },
  supplyOrders: {
    entity: 'supplyOrders', title: 'Orders and deliveries', singular: 'supply order',
    note: 'Track requested parts, order progress and delivery status.',
    searchKeys: ['orderNumber', 'trackingNumber', 'status'],
    defaults: { quantity: 1, status: 'Requested', orderDate: todayStr() },
    fields: [
      { key: 'orderNumber', label: 'Order number', required: true },
      { key: 'supplierId', label: 'Supplier', type: 'select', ref: 'suppliers', required: true },
      { key: 'spareId', label: 'Spare part', type: 'select', ref: 'spares', required: true },
      { key: 'machineId', label: 'Related machine', type: 'select', ref: 'machines' },
      { key: 'quantity', label: 'Quantity ordered', type: 'number', required: true },
      { key: 'status', label: 'Order status', type: 'select', options: ['Requested', 'Ordered', 'Partially delivered', 'Delivered', 'Cancelled'], required: true },
      { key: 'orderDate', label: 'Order date', type: 'date', required: true },
      { key: 'expectedDate', label: 'Expected delivery', type: 'date' },
      { key: 'deliveredDate', label: 'Delivered on', type: 'date' },
      { key: 'trackingNumber', label: 'Tracking / delivery reference' },
    ],
    columns: [
      { key: 'orderNumber', label: 'Order', render: (r) => <span className="font-medium">{r.orderNumber}</span> },
      { key: 'supplierId', label: 'Supplier', render: (r, d) => d.suppliers.find((x) => x.id === r.supplierId)?.name ?? '—' },
      { key: 'spareId', label: 'Part', render: (r, d) => d.spares.find((x) => x.id === r.spareId)?.name ?? '—' },
      { key: 'quantity', label: 'Qty' },
      { key: 'status', label: 'Status' },
      { key: 'expectedDate', label: 'Expected' },
      { key: 'deliveredDate', label: 'Delivered' },
      { key: 'trackingNumber', label: 'Tracking' },
    ],
  },
  partWarranties: {
    entity: 'partWarranties', title: 'Spare-part warranties', singular: 'spare-part warranty',
    note: 'Track coverage and expiration dates for stocked parts.',
    searchKeys: ['provider', 'reference', 'coverage'],
    fields: [
      { key: 'spareId', label: 'Spare part', type: 'select', ref: 'spares', required: true },
      { key: 'provider', label: 'Warranty provider', required: true },
      { key: 'startDate', label: 'Starts on', type: 'date', required: true },
      { key: 'endDate', label: 'Expires on', type: 'date', required: true },
      { key: 'reference', label: 'Reference / claim number' },
      { key: 'coverage', label: 'Coverage details', type: 'textarea', wide: true },
    ],
    columns: [
      { key: 'spareId', label: 'Spare part', render: (r, d) => d.spares.find((x) => x.id === r.spareId)?.name ?? '—' },
      { key: 'provider', label: 'Provider' },
      { key: 'startDate', label: 'From' },
      { key: 'endDate', label: 'Expires' },
      { key: 'status', label: 'Status', render: (r) => { const state = warrantyState(r); return <Dot tone={state.tone}>{state.text}</Dot>; } },
    ],
  },
  partServices: {
    entity: 'partServices', title: 'Spare-part activity history', singular: 'spare-part activity',
    note: 'Record maintenance, repairs, stock receipts, usage and replacements.',
    searchKeys: ['eventType', 'performedBy', 'notes'],
    defaults: { date: todayStr(), eventType: 'Maintenance', quantity: 1 },
    fields: [
      { key: 'spareId', label: 'Spare part', type: 'select', ref: 'spares', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'eventType', label: 'Activity', type: 'select', options: ['Maintenance', 'Repair', 'Stock In', 'Usage', 'Replacement'], required: true },
      { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      { key: 'performedBy', label: 'Performed by' },
      { key: 'notes', label: 'Details', type: 'textarea', wide: true },
    ],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'spareId', label: 'Spare part', render: (r, d) => d.spares.find((x) => x.id === r.spareId)?.name ?? '—' },
      { key: 'eventType', label: 'Activity' },
      { key: 'quantity', label: 'Qty' },
      { key: 'performedBy', label: 'Performed by' },
      { key: 'notes', label: 'Details' },
    ],
  },
};
