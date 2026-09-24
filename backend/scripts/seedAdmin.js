import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing.');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('ADMIN_EMAIL / ADMIN_PASSWORD are missing.');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    fullName: process.env.ADMIN_NAME || 'MedVault Admin',
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'ADMIN',
    verificationStatus: 'VERIFIED',
  });

  console.log('Admin account created:', email);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});