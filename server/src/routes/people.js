import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models.js';
import { ah, auth, cleanPhoto, fail, isEmail, ownerOnly, publicUser, str } from '../utils.js';
import { ACCESS_ROLES, roleForUser, requireRoles } from '../access.js';

const r = Router();
r.use(auth);

r.get('/', ah(async (req, res) => {
  const isAdmin = roleForUser(req.user) === 'super_admin';
  const query = isAdmin
    ? { workspace: req.user.workspace }
    : roleForUser(req.user) === 'manager'
      ? { workspace: req.user.workspace }
      : { _id: req.user._id, workspace: req.user.workspace };
  const users = await User.find(query).sort({ isOwner: -1, createdAt: 1 });
  res.json(users.map(publicUser));
}));

r.get('/recipients', requireRoles('super_admin', 'manager'), ah(async (req, res) => {
  const users = await User.find({ workspace: req.user.workspace }, 'name role photo');
  res.json(users.map((person) => ({ id: String(person._id), name: person.name, role: person.role || '', photo: person.photo || '' })));
}));

r.post('/', ownerOnly, ah(async (req, res) => {
  const b = req.body || {};
  const name = str(b.name, 80);
  const role = str(b.role, 60);
  const accessRole = str(b.accessRole, 40) || 'manager';
  const email = str(b.email, 120).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  if (!name) return fail(res, 400, 'Enter a name.');
  if (!role) return fail(res, 400, 'Enter a role.');
  if (!ACCESS_ROLES.includes(accessRole)) return fail(res, 400, 'Choose a valid access role.');
  if (email && !isEmail(email)) return fail(res, 400, 'Enter a valid email address.');
  if (password && !email) return fail(res, 400, 'An email is needed to let this person sign in.');
  if (password && password.length < 6) return fail(res, 400, 'Password must be at least 6 characters.');
  if (email && (await User.exists({ email }))) return fail(res, 409, 'This email is already registered.');

  const person = await User.create({
    workspace: req.user.workspace,
    name, role, accessRole,
    email: email || undefined,
    passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
    phone: str(b.phone, 30),
    company: req.user.company,
    photo: cleanPhoto(b.photo),
  });
  res.status(201).json(publicUser(person));
}));

r.put('/:id', ah(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, 'Not found.');
  const isSuperAdmin = roleForUser(req.user) === 'super_admin';
  if (!isSuperAdmin && String(req.user._id) !== id) return fail(res, 403, 'You can only edit your own profile.');
  const person = await User.findOne({ _id: id, workspace: req.user.workspace });
  if (!person) return fail(res, 404, 'Not found.');
  const b = req.body || {};
  if (b.accessRole !== undefined) {
    if (!isSuperAdmin) return fail(res, 403, 'Only a Super Admin can change access roles.');
    if (!ACCESS_ROLES.includes(b.accessRole)) return fail(res, 400, 'Choose a valid access role.');
    if (String(req.user._id) === id && b.accessRole !== roleForUser(req.user)) return fail(res, 400, 'You cannot change your own access role.');
    person.accessRole = b.accessRole;
  }
  const name = str(b.name, 80);
  if (b.name !== undefined) { if (!name) return fail(res, 400, 'Enter a name.'); person.name = name; }
  if (b.role !== undefined) person.role = str(b.role, 60);
  if (b.phone !== undefined) person.phone = str(b.phone, 30);
  if (b.photo !== undefined) person.photo = cleanPhoto(b.photo);
  await person.save();
  res.json(publicUser(person));
}));

r.delete('/:id', ownerOnly, ah(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, 'Not found.');
  if (String(req.user._id) === id) return fail(res, 400, 'You cannot delete your own account here.');
  const gone = await User.findOneAndDelete({ _id: id, workspace: req.user.workspace });
  if (!gone) return fail(res, 404, 'Not found.');
  res.json({ ok: true });
}));

export default r;
