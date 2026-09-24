import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import recordsRouter from './routes/records.js';
import doctorRoutes from './routes/doctor.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  })
);
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRouter);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: err.message || 'Something went wrong.' });
});

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.warn('[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set. Skipping admin seed.');
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('[seed] Admin account already exists:', email);
    return;
  }

  await User.create({
    fullName: process.env.ADMIN_NAME || 'MedVault Admin',
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'ADMIN',
    verificationStatus: 'VERIFIED',
  });
  console.log('[seed] Created admin account:', email);
}

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing. Copy .env.example to .env and set it.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  await seedAdmin();

  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => {
    console.log(`MedVault backend listening on http://localhost:${port}`);
  });
}

start();