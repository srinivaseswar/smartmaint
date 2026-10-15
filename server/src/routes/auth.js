import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import { User } from '../models.js';
import { ah, auth, cleanPhoto, fail, isEmail, publicUser, sign, str } from '../utils.js';
import { ACCESS_ROLES, roleForUser } from '../access.js';
import { SUPER_ADMIN_SETUP_KEY } from '../config.js';

const r = Router();

function matchesSetupKey(candidate) {
  if (!SUPER_ADMIN_SETUP_KEY || typeof candidate !== 'string') return false;
  const submitted = Buffer.from(candidate);
  const configured = Buffer.from(SUPER_ADMIN_SETUP_KEY);
  return submitted.length === configured.length && timingSafeEqual(submitted, configured);
}

r.post('/signup', ah(async (req, res) => {
  const b = req.body || {};
  const name = str(b.name, 80);
  const email = str(b.email, 120).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  const accessRole = str(b.accessRole, 40);
  if (!name) return fail(res, 400, 'Enter your name.');
  if (!isEmail(email)) return fail(res, 400, 'Enter a valid email address.');
  if (password.length < 6) return fail(res, 400, 'Password must be at least 6 characters.');
  if (!ACCESS_ROLES.includes(accessRole)) return fail(res, 400, 'Choose a valid account role.');
  if (accessRole === 'super_admin') {
    if (!matchesSetupKey(b.setupKey)) return fail(res, 403, 'A valid Super Admin setup key is required.');
    const existingAdmin = await User.exists({ $or: [
      { accessRole: 'super_admin' },
      { accessRole: { $exists: false }, isOwner: true },
    ] });
    if (existingAdmin) return fail(res, 403, 'Super Admin accounts can only be created by an existing Super Admin.');
  }
  if (await User.exists({ email })) return fail(res, 409, 'This email is already registered. Sign in instead.');

  const id = new mongoose.Types.ObjectId();
  const user = await User.create({
    _id: id,
    workspace: id,
    isOwner: true,
    accessRole,
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: str(b.role, 60),
    company: str(b.company, 100),
    photo: cleanPhoto(b.photo),
  });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
}));

r.post('/login', ah(async (req, res) => {
  const email = str(req.body?.email, 120).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const accessRole = str(req.body?.accessRole, 40);
  if (!isEmail(email)) return fail(res, 400, 'Enter a valid email address.');
  if (password.length < 6) return fail(res, 400, 'Password must be at least 6 characters.');
  if (!ACCESS_ROLES.includes(accessRole)) return fail(res, 400, 'Choose a valid access role.');
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return fail(res, 401, 'Email or password is incorrect.');
  }
  if (roleForUser(user) !== accessRole) return fail(res, 403, 'The selected role does not match this account.');
  res.json({ token: sign(user), user: publicUser(user) });
}));

r.get('/me', auth, (req, res) => res.json(publicUser(req.user)));

export default r;
