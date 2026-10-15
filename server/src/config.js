import 'dotenv/config';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('JWT_SECRET is required in production.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) console.warn('JWT_SECRET not set. Using an insecure dev secret. Copy .env.example to .env.');

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret';
export const SUPER_ADMIN_SETUP_KEY = process.env.SUPER_ADMIN_SETUP_KEY || '';
export const PORT = Number(process.env.PORT) || 5000;
export const MONGO_URI = process.env.MONGO_URI || '';
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true;
