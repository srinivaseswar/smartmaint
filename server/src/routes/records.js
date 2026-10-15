import { Router } from 'express';
import mongoose from 'mongoose';
import { KINDS, Record } from '../models.js';
import { ah, auth, fail } from '../utils.js';
import { canAccessRecords, roleForUser } from '../access.js';

const r = Router();
r.use(auth);

const REQUIRED = {
  machines: ['name', 'machineCode'],
  spares: ['name', 'partNumber'],
  suppliers: ['name'],
  warranties: ['machineId', 'provider', 'startDate', 'endDate'],
  services: ['machineId', 'date', 'description'],
  schedules: ['machineId', 'task'],
  inspections: ['machineId', 'date', 'status'],
  supplyOrders: ['orderNumber', 'supplierId', 'spareId', 'quantity', 'status', 'orderDate'],
  partWarranties: ['spareId', 'provider', 'startDate', 'endDate'],
  partServices: ['spareId', 'date', 'eventType', 'quantity'],
};

const BLOCKED = new Set(['id', '_id', 'createdAt']);
const ORDER_STATUSES = ['Requested', 'Ordered', 'Partially delivered', 'Delivered', 'Cancelled'];
function clean(body) {
  const out = {};
  for (const [k, v] of Object.entries(body && typeof body === 'object' ? body : {}).slice(0, 40)) {
    if (BLOCKED.has(k) || k.startsWith('$') || k.includes('.')) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, k === 'photo' ? 400000 : 2000);
  }
  return out;
}

const dateOnly = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const shape = (rec) => ({
  ...rec.data,
  id: String(rec._id),
  createdAt: rec.data?.createdAt || new Date(rec.createdAt).toISOString().slice(0, 10),
});
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stockDelta = (eventType, quantity) => {
  if (eventType === 'Stock In') return quantity;
  if (eventType === 'Usage' || eventType === 'Replacement') return -quantity;
  return 0;
};

async function adjustSpareStock(workspace, spareId, delta) {
  if (!delta) return;
  if (!mongoose.isValidObjectId(spareId)) throw Object.assign(new Error('Choose a valid spare part.'), { status: 400 });
  const spare = await Record.findOne({ _id: spareId, workspace, kind: 'spares' });
  if (!spare) throw Object.assign(new Error('Spare part not found.'), { status: 404 });
  const quantity = Number(spare.data?.quantity || 0) + delta;
  if (quantity < 0) throw Object.assign(new Error('Insufficient stock for this activity.'), { status: 409 });
  spare.data = { ...spare.data, quantity };
  spare.markModified('data');
  await spare.save();
}

const kindCheck = (req, res, next) =>
  KINDS.includes(req.params.kind) ? next() : fail(res, 404, 'Unknown record type.');

function missing(kind, data) {
  return REQUIRED[kind].find((k) => data[k] === undefined || String(data[k]).trim() === '');
}

async function codeTaken(workspace, code, exceptId) {
  const q = {
    workspace, kind: 'machines',
    'data.machineCode': new RegExp(`^${esc(String(code).trim())}$`, 'i'),
  };
  if (exceptId) q._id = { $ne: exceptId };
  return !!(await Record.exists(q));
}

r.get('/', ah(async (req, res) => {
  const allowedKinds = KINDS.filter((kind) => canAccessRecords(req.user, 'read', kind));
  const rows = await Record.find({ workspace: req.user.workspace, kind: { $in: allowedKinds } }).sort({ _id: -1 }).lean();
  let visible = rows;
  if (roleForUser(req.user) === 'supplier') {
    const email = (req.user.email || '').toLowerCase();
    const accountId = String(req.user._id);
    const suppliers = rows.filter((row) => row.kind === 'suppliers'
      && (String(row.data?.accountId || '') === accountId || String(row.data?.email || '').trim().toLowerCase() === email));
    const supplierIds = new Set(suppliers.map((row) => String(row._id)));
    const suppliedSpares = rows.filter((row) => row.kind === 'spares' && supplierIds.has(String(row.data?.supplierId || '')));
    const spareIds = new Set(suppliedSpares.map((row) => String(row._id)));
    const machineIds = new Set([
      ...suppliedSpares.map((row) => String(row.data?.machineId || '')),
      ...rows.filter((row) => row.kind === 'supplyOrders' && supplierIds.has(String(row.data?.supplierId || '')))
        .map((row) => String(row.data?.machineId || '')),
    ].filter(Boolean));
    visible = rows.filter((row) => {
      if (row.kind === 'suppliers') return supplierIds.has(String(row._id));
      if (row.kind === 'spares') return spareIds.has(String(row._id));
      if (row.kind === 'supplyOrders') return supplierIds.has(String(row.data?.supplierId || ''));
      if (row.kind === 'machines') return machineIds.has(String(row._id));
      return false;
    });
  }
  const out = Object.fromEntries(KINDS.map((k) => [k, []]));
  visible.forEach((x) => out[x.kind]?.push(shape(x)));
  res.json(out);
}));

r.post('/:kind', kindCheck, ah(async (req, res) => {
  const { kind } = req.params;
  if (!canAccessRecords(req.user, 'write', kind)) return fail(res, 403, 'You do not have permission to change this record type.');
  const data = clean(req.body);
  const m = missing(kind, data);
  if (m) return fail(res, 400, `${m} is required.`);
  if (kind === 'supplyOrders' && (!Number.isFinite(Number(data.quantity)) || Number(data.quantity) <= 0)) {
    return fail(res, 400, 'Quantity must be greater than zero.');
  }
  if (kind === 'partServices' && ['Stock In', 'Usage', 'Replacement'].includes(data.eventType)
    && (!Number.isFinite(Number(data.quantity)) || Number(data.quantity) <= 0)) {
    return fail(res, 400, 'Quantity must be greater than zero.');
  }
  if (kind === 'supplyOrders') {
    if (!ORDER_STATUSES.includes(data.status)) return fail(res, 400, 'Choose a valid order status.');
    const [supplier, spare] = await Promise.all([
      Record.exists({ _id: data.supplierId, workspace: req.user.workspace, kind: 'suppliers' }),
      Record.findOne({ _id: data.spareId, workspace: req.user.workspace, kind: 'spares' }),
    ]);
    if (!supplier || !spare) return fail(res, 400, 'Choose a supplier and spare part in this workspace.');
    if (spare.data?.supplierId && String(spare.data.supplierId) !== String(data.supplierId)) return fail(res, 400, 'The selected supplier does not supply this spare part.');
    if (data.machineId && !(await Record.exists({ _id: data.machineId, workspace: req.user.workspace, kind: 'machines' }))) return fail(res, 400, 'Choose a machine in this workspace.');
  }
  if (['partWarranties', 'partServices'].includes(kind)
    && !(await Record.exists({ _id: data.spareId, workspace: req.user.workspace, kind: 'spares' }))) {
    return fail(res, 400, 'Choose a spare part in this workspace.');
  }
  if (kind === 'partWarranties' && data.endDate < data.startDate) return fail(res, 400, 'Warranty cannot end before it starts.');
  if (kind === 'partServices' && !['Maintenance', 'Repair', 'Stock In', 'Usage', 'Replacement'].includes(data.eventType)) return fail(res, 400, 'Choose a valid spare-part activity.');
  if (kind === 'machines' && (await codeTaken(req.user.workspace, data.machineCode))) {
    return fail(res, 409, 'Another machine already uses this Machine ID.');
  }
  data.createdAt = dateOnly(req.body?.createdAt) || new Date().toISOString().slice(0, 10);
  const delta = kind === 'partServices' ? stockDelta(data.eventType, Number(data.quantity)) : 0;
  if (delta < 0) {
    const spare = await Record.findOne({ _id: data.spareId, workspace: req.user.workspace, kind: 'spares' });
    if (!spare || Number(spare.data?.quantity || 0) < -delta) return fail(res, 409, 'Insufficient stock for this activity.');
  }
  const rec = await Record.create({ workspace: req.user.workspace, kind, data });
  try {
    if (delta) await adjustSpareStock(req.user.workspace, data.spareId, delta);
  } catch (error) {
    await rec.deleteOne();
    throw error;
  }
  res.status(201).json(shape(rec));
}));

r.put('/:kind/:id', kindCheck, ah(async (req, res) => {
  const { kind, id } = req.params;
  if (!canAccessRecords(req.user, 'write', kind)) return fail(res, 403, 'You do not have permission to change this record type.');
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, 'Not found.');
  const rec = await Record.findOne({ _id: id, workspace: req.user.workspace, kind });
  if (!rec) return fail(res, 404, 'Not found.');
  if (roleForUser(req.user) === 'supplier'
    && String(rec.data?.accountId || '') !== String(req.user._id)
    && String(rec.data?.email || '').trim().toLowerCase() !== (req.user.email || '').toLowerCase()) {
    return fail(res, 403, 'You can only edit your own supplier profile.');
  }
  const data = { ...rec.data, ...clean(req.body) };
  if (kind === 'suppliers' && roleForUser(req.user) === 'supplier') {
    data.email = (req.user.email || '').toLowerCase();
    data.accountId = String(req.user._id);
  }
  const m = missing(kind, data);
  if (m) return fail(res, 400, `${m} is required.`);
  if (kind === 'partServices' && roleForUser(req.user) !== 'super_admin') return fail(res, 403, 'Inventory history entries cannot be edited. Add a correcting entry instead.');
  if (kind === 'supplyOrders') {
    if (!Number.isFinite(Number(data.quantity)) || Number(data.quantity) <= 0) return fail(res, 400, 'Quantity must be greater than zero.');
    if (!ORDER_STATUSES.includes(data.status)) return fail(res, 400, 'Choose a valid order status.');
    const [supplier, spare] = await Promise.all([
      Record.exists({ _id: data.supplierId, workspace: req.user.workspace, kind: 'suppliers' }),
      Record.findOne({ _id: data.spareId, workspace: req.user.workspace, kind: 'spares' }),
    ]);
    if (!supplier || !spare) return fail(res, 400, 'Choose a supplier and spare part in this workspace.');
    if (spare.data?.supplierId && String(spare.data.supplierId) !== String(data.supplierId)) return fail(res, 400, 'The selected supplier does not supply this spare part.');
    if (data.machineId && !(await Record.exists({ _id: data.machineId, workspace: req.user.workspace, kind: 'machines' }))) return fail(res, 400, 'Choose a machine in this workspace.');
  }
  if (kind === 'partWarranties') {
    if (!(await Record.exists({ _id: data.spareId, workspace: req.user.workspace, kind: 'spares' }))) return fail(res, 400, 'Choose a spare part in this workspace.');
    if (data.endDate < data.startDate) return fail(res, 400, 'Warranty cannot end before it starts.');
  }
  if (kind === 'partServices') {
    if (!['Maintenance', 'Repair', 'Stock In', 'Usage', 'Replacement'].includes(data.eventType)) return fail(res, 400, 'Choose a valid spare-part activity.');
    if (['Stock In', 'Usage', 'Replacement'].includes(data.eventType) && (!Number.isFinite(Number(data.quantity)) || Number(data.quantity) <= 0)) return fail(res, 400, 'Quantity must be greater than zero.');
    if (!(await Record.exists({ _id: data.spareId, workspace: req.user.workspace, kind: 'spares' }))) return fail(res, 400, 'Choose a spare part in this workspace.');
    const oldDelta = stockDelta(rec.data.eventType, Number(rec.data.quantity));
    const newDelta = stockDelta(data.eventType, Number(data.quantity));
    const stockChanges = [];
    try {
      if (String(rec.data.spareId) === String(data.spareId)) {
        const change = newDelta - oldDelta;
        if (change) {
          await adjustSpareStock(req.user.workspace, data.spareId, change);
          stockChanges.push([data.spareId, -change]);
        }
      } else {
        if (oldDelta) {
          await adjustSpareStock(req.user.workspace, rec.data.spareId, -oldDelta);
          stockChanges.push([rec.data.spareId, oldDelta]);
        }
        if (newDelta) {
          await adjustSpareStock(req.user.workspace, data.spareId, newDelta);
          stockChanges.push([data.spareId, -newDelta]);
        }
      }
      rec.data = data;
      rec.markModified('data');
      await rec.save();
    } catch (error) {
      for (const [spareId, delta] of stockChanges.reverse()) await adjustSpareStock(req.user.workspace, spareId, delta);
      throw error;
    }
    return res.json(shape(rec));
  }
  if (kind === 'machines' && (await codeTaken(req.user.workspace, data.machineCode, rec._id))) {
    return fail(res, 409, 'Another machine already uses this Machine ID.');
  }
  rec.data = data;
  rec.markModified('data');
  await rec.save();
  res.json(shape(rec));
}));

r.delete('/:kind/:id', kindCheck, ah(async (req, res) => {
  const { kind, id } = req.params;
  if (!canAccessRecords(req.user, 'delete', kind)) return fail(res, 403, 'You do not have permission to delete this record type.');
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, 'Not found.');
  const rec = await Record.findOne({ _id: id, workspace: req.user.workspace, kind });
  if (!rec) return fail(res, 404, 'Not found.');
  if (kind === 'partServices' && roleForUser(req.user) !== 'super_admin') return fail(res, 403, 'Inventory history entries cannot be deleted.');
  if (kind === 'partServices') {
    const delta = -stockDelta(rec.data.eventType, Number(rec.data.quantity));
    if (delta) await adjustSpareStock(req.user.workspace, rec.data.spareId, delta);
    try {
      await rec.deleteOne();
    } catch (error) {
      if (delta) await adjustSpareStock(req.user.workspace, rec.data.spareId, -delta);
      throw error;
    }
  } else {
    await rec.deleteOne();
  }
  if (kind === 'machines') {
    const ws = req.user.workspace;
    await Record.deleteMany({ workspace: ws, kind: { $in: ['warranties', 'services', 'schedules', 'inspections'] }, 'data.machineId': id });
    await Record.updateMany({ workspace: ws, kind: 'spares', 'data.machineId': id }, { $set: { 'data.machineId': '' } });
  }
  res.json({ ok: true });
}));

export default r;
