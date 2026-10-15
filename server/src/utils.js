import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import { User } from './models.js';
import { requireRoles, roleForUser } from './access.js';

export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const fail = (res, status, error) => res.status(status).json({ error });

export const publicUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email || '',
  role: u.role || '',
  phone: u.phone || '',
  photo: u.photo || '',
  company: u.company || '',
  isOwner: !!u.isOwner,
  accessRole: roleForUser(u),
  canLogin: !!u.passwordHash,
});

export const cleanPhoto = (v) =>
  typeof v === 'string' && v.startsWith('data:image/') && v.length <= 400000 ? v : '';

export const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

export const sign = (user) => jwt.sign({ id: String(user._id) }, JWT_SECRET, { expiresIn: '7d' });

export const auth = ah(async (req, res, next) => {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return fail(res, 401, 'Sign in required.');
  let payload;
  try {
    payload = jwt.verify(t, JWT_SECRET);
  } catch {
    return fail(res, 401, 'Session expired. Sign in again.');
  }
  const user = await User.findById(payload.id);
  if (!user) return fail(res, 401, 'Account not found. Sign in again.');
  req.user = user;
  next();
});

export const ownerOnly = requireRoles('super_admin');
