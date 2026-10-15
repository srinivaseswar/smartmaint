import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CLIENT_ORIGIN, MONGO_URI, PORT } from './config.js';
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
import peopleRoutes from './routes/people.js';
import messageRoutes from './routes/messages.js';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// In production, serve the built React app from the same server.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ error: 'This email is already registered.' });
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Server error. Try again.' : err.message });
});

let resolvedMongoUri = MONGO_URI;

if (!resolvedMongoUri) {
  if (process.env.NODE_ENV === 'production') {
    console.error('MONGO_URI is required in production. Set it to your MongoDB Atlas connection string in the service environment.');
    process.exit(1);
  }
  const memoryServer = await MongoMemoryServer.create();
  resolvedMongoUri = memoryServer.getUri();
  console.log(`Using in-memory MongoDB at ${resolvedMongoUri}`);
}

try {
  await mongoose.connect(resolvedMongoUri);
  console.log('MongoDB connected');
} catch (e) {
  const detail = String(e.message || e).replaceAll(resolvedMongoUri, '[MONGO_URI]');
  console.error(`Cannot connect to MongoDB. Check MONGO_URI, Atlas network access, and database credentials.\n${detail}`);
  process.exit(1);
}
app.listen(PORT, () => console.log(`SmartMaint API running on http://localhost:${PORT}`));
