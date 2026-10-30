import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const email = 'doctor.test@medvault.com';
  const password = 'DoctorTest@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const doctorData = {
    fullName: 'Dr. Rajesh Sharma',
    email,
    passwordHash,
    role: 'DOCTOR',
    verificationStatus: 'VERIFIED',
    profile: {
      dob: '1985-06-15',
      mobile: '+91 98765 43210',
      address: 'Suite 402, Medical Enclave',
      city: 'New Delhi',
      state: 'Delhi',
      hospitalName: 'Apollo Hospitals - Emergency Care',
      hospitalAddress: 'Sarita Vihar, Delhi Mathura Road, New Delhi',
      registrationNumber: 'DMC-2012-78491',
      stateMedicalCouncil: 'Delhi Medical Council',
      registrationDate: '2012-05-20',
      qualification: 'MBBS, MD (Emergency Medicine)',
      medicalCollege: 'All India Institute of Medical Sciences (AIIMS)',
      graduationYear: '2011',
      specialization: 'Emergency Medicine & Critical Care',
    },
  };

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'DOCTOR';
    existing.verificationStatus = 'VERIFIED';
    existing.passwordHash = passwordHash;
    existing.fullName = doctorData.fullName;
    existing.profile = { ...(existing.profile || {}), ...doctorData.profile };
    await existing.save();
    console.log('Updated existing test doctor account:', email);
  } else {
    await User.create(doctorData);
    console.log('Created new test doctor account:', email);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error creating test doctor:', err);
  process.exit(1);
});
