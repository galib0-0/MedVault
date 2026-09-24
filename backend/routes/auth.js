import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizePassword(value) {
  return String(value || '');
}

const isMissing = (value) =>
  value === null || value === undefined || String(value).trim() === '';

function pickProfile(body, keys) {
  const profile = {};
  keys.forEach((key) => {
    if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
      profile[key] = body[key];
    }
  });
  return profile;
}

async function generateMedVaultId() {
  for (let i = 0; i < 5; i += 1) {
    const num = Math.floor(10000000 + Math.random() * 89999999);
    const id = `MV-${num}`;
    const exists = await User.findOne({ medvaultId: id });
    if (!exists) return id;
  }
  throw new Error('Could not allocate a unique MedVault ID. Please retry.');
}

function issueSession(user) {
  return {
    token: signToken(user),
    user: user.toAuthJSON(),
  };
}

router.post('/signup/patient', async (req, res) => {
  try {
    const body = req.body || {};
    const email = sanitizeEmail(body.email);
    const password = sanitizePassword(body.password);

    if (!body.fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Full name, email and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists. Please sign in.' });
    }

    const medvaultId = await generateMedVaultId();
    const user = await User.create({
      fullName: body.fullName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'PATIENT',
      verificationStatus: 'VERIFIED',
      medvaultId,
      profile: pickProfile(body, [
        'dob',
        'gender',
        'mobile',
        'address',
        'city',
        'state',
        'pinCode',
        'emergencyContactName',
        'emergencyContactNumber',
        'emergencyContactRelationship',
        'bloodGroup',
        'allergies',
        'medicalConditions',
        'medications',
      ]),
    });

    res.status(201).json(issueSession(user));
  } catch (err) {
    res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
});

router.post('/signup/doctor', async (req, res) => {
  try {
    const body = req.body || {};
    const email = sanitizeEmail(body.email);
    const password = sanitizePassword(body.password);

    if (!body.fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Full name, email and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists. Please sign in.' });
    }

    const user = await User.create({
      fullName: body.fullName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'DOCTOR',
      verificationStatus: 'PENDING',
      profile: pickProfile(body, [
        'dob',
        'mobile',
        'address',
        'city',
        'state',
        'hospitalName',
        'hospitalAddress',
        'registrationNumber',
        'stateMedicalCouncil',
        'registrationDate',
        'qualification',
        'medicalCollege',
        'graduationYear',
        'specialization',
        'profilePhoto',
        'registrationCertificate',
        'degreeCertificate',
        'professionalId',
      ]),
    });

    res.status(201).json(issueSession(user));
  } catch (err) {
    res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const body = req.body || {};
    const email = sanitizeEmail(body.email);
    const password = sanitizePassword(body.password);

    if (isMissing(email) || isMissing(password)) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ message: 'Invalid email or password.' });
    }

    res.json(issueSession(user));
  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toAuthJSON() });
});

const PROFILE_KEYS = [
  'dob',
  'gender',
  'mobile',
  'address',
  'city',
  'state',
  'pinCode',
  'emergencyContactName',
  'emergencyContactNumber',
  'emergencyContactRelationship',
  'bloodGroup',
  'allergies',
  'medicalConditions',
  'medications',
  'organDonor',
];

router.patch('/me/profile', requireAuth, async (req, res) => {
  try {
    const body = req.body || {};

    if (typeof body.fullName === 'string' && body.fullName.trim()) {
      req.user.fullName = body.fullName.trim();
    }

    req.user.profile = {
      ...(req.user.profile || {}),
      ...pickProfile(body, PROFILE_KEYS),
    };

    await req.user.save();
    res.json({ user: req.user.toAuthJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile. Please try again.' });
  }
});

router.get('/dashboards', requireAuth, (req, res) => {
  const allowed =
    req.user.role === 'ADMIN'
      ? ['PATIENT', 'DOCTOR']
      : [req.user.role === 'PATIENT' ? 'PATIENT' : 'DOCTOR'];
  res.json({ allowed });
});

export default router;