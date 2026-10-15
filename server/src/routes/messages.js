import { Router } from 'express';
import mongoose from 'mongoose';
import { Message, User } from '../models.js';
import { ah, auth, fail, str } from '../utils.js';
import { requireRoles } from '../access.js';

const r = Router();
r.use(auth, requireRoles('super_admin', 'manager'));

const roleKey = (s) => (s || '').trim().toLowerCase();

function inboxFilter(user) {
  const or = [{ toType: 'all' }, { toType: 'user', toUser: user._id }];
  if (roleKey(user.role)) or.push({ toType: 'role', toRole: roleKey(user.role) });
  return { workspace: user.workspace, from: { $ne: user._id }, hiddenBy: { $ne: user._id }, $or: or };
}

r.get('/unread', ah(async (req, res) => {
  const count = await Message.countDocuments({ ...inboxFilter(req.user), readBy: { $ne: req.user._id } });
  res.json({ count });
}));

r.post('/read-all', ah(async (req, res) => {
  await Message.updateMany(
    { ...inboxFilter(req.user), readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } },
  );
  res.json({ ok: true });
}));

r.get('/', ah(async (req, res) => {
  const sent = req.query.box === 'sent';
  const filter = sent
    ? { workspace: req.user.workspace, from: req.user._id, hiddenBy: { $ne: req.user._id } }
    : inboxFilter(req.user);
  const rows = await Message.find(filter)
    .sort({ createdAt: -1 }).limit(200)
    .populate('from', 'name role photo')
    .populate('toUser', 'name');
  res.json(rows.map((m) => ({
    id: String(m._id),
    from: { id: String(m.from?._id || ''), name: m.from?.name || 'Removed person', role: m.from?.role || '', photo: m.from?.photo || '' },
    toLabel: m.toType === 'all' ? 'Everyone' : m.toType === 'role' ? `Everyone with role: ${m.toRoleLabel}` : m.toUser?.name || 'Removed person',
    subject: m.subject,
    body: m.body,
    createdAt: m.createdAt,
    unread: !sent && !m.readBy.some((x) => String(x) === String(req.user._id)),
    mine: String(m.from?._id) === String(req.user._id),
  })));
}));

r.post('/', ah(async (req, res) => {
  const b = req.body || {};
  const body = str(b.body, 2000);
  if (!body) return fail(res, 400, 'Write a message first.');
  const doc = { workspace: req.user.workspace, from: req.user._id, subject: str(b.subject, 120), body };

  if (b.toType === 'all') {
    doc.toType = 'all';
  } else if (b.toType === 'role') {
    const label = str(b.toRole, 60);
    const members = await User.find({ workspace: req.user.workspace, _id: { $ne: req.user._id } }, 'role');
    if (!label || !members.some((u) => roleKey(u.role) === roleKey(label))) return fail(res, 400, 'No one else has that role.');
    Object.assign(doc, { toType: 'role', toRole: roleKey(label), toRoleLabel: label });
  } else if (b.toType === 'user') {
    if (!mongoose.isValidObjectId(b.toUser)) return fail(res, 400, 'Choose who to send this to.');
    const to = await User.findOne({ _id: b.toUser, workspace: req.user.workspace });
    if (!to || String(to._id) === String(req.user._id)) return fail(res, 400, 'Choose who to send this to.');
    Object.assign(doc, { toType: 'user', toUser: to._id });
  } else {
    return fail(res, 400, 'Choose who to send this to.');
  }
  await Message.create(doc);
  res.status(201).json({ ok: true });
}));

// Deleting removes the message from YOUR inbox or sent list only. Other people keep their copy.
r.delete('/:id', ah(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, 'Not found.');
  const mine = { workspace: req.user.workspace, from: req.user._id };
  const received = inboxFilter(req.user);
  const msg = await Message.findOne({ _id: id, $or: [mine, received] });
  if (!msg) return fail(res, 404, 'Message not found.');
  await Message.updateOne({ _id: id }, { $addToSet: { hiddenBy: req.user._id } });
  res.json({ ok: true });
}));

export default r;
