import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
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
    const password = sanitizePassword(body.password) || (body.googleId ? crypto.randomUUID() : '');

    if (!body.fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Full name, email and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (!body.googleId && password.length < 8) {
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
      profile: {
        ...pickProfile(body, [
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
        ]),
        googleId: body.googleId || undefined,
        googleAuth: Boolean(body.googleId || body.googleAuth),
        profilePhoto: body.profilePhoto || undefined,
      },
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
    const password = sanitizePassword(body.password) || (body.googleId ? crypto.randomUUID() : '');

    if (!body.fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Full name, email and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (!body.googleId && password.length < 8) {
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
      profile: {
        ...pickProfile(body, [
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
        googleId: body.googleId || undefined,
        googleAuth: Boolean(body.googleId || body.googleAuth),
        profilePhoto: body.profilePhoto || undefined,
      },
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

// POST /api/auth/google/verify - Verify Google token and check if account exists (without auto-creating user)
router.post('/google/verify', async (req, res) => {
  try {
    const { credential, accessToken } = req.body || {};
    let email = '';
    let fullName = '';
    let picture = '';
    let sub = '';

    const DEFAULT_GOOGLE_CLIENT_ID = '1094871067975-vrrhfem71sseh67g6lsfugtdvq4e9k6c.apps.googleusercontent.com';
    const expectedClientId = (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim()) || DEFAULT_GOOGLE_CLIENT_ID;

    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          if (expectedClientId && payload.aud !== expectedClientId) {
            return res.status(401).json({ message: 'Google token audience mismatch.' });
          }
          email = sanitizeEmail(payload.email);
          fullName = payload.name || email.split('@')[0];
          picture = payload.picture || '';
          sub = payload.sub || '';
        } else {
          return res.status(401).json({ message: 'Invalid Google authentication token.' });
        }
      } catch (tokenErr) {
        return res.status(500).json({ message: 'Failed to verify Google token with Google servers.' });
      }
    } else if (accessToken) {
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (infoRes.ok) {
          const payload = await infoRes.json();
          email = sanitizeEmail(payload.email);
          fullName = payload.name || email.split('@')[0];
          picture = payload.picture || '';
          sub = payload.sub || '';
        } else {
          return res.status(401).json({ message: 'Invalid Google access token.' });
        }
      } catch (tokenErr) {
        return res.status(500).json({ message: 'Failed to verify Google access token with Google servers.' });
      }
    } else {
      return res.status(400).json({ message: 'Google credential or accessToken is required.' });
    }

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Valid Google email is required.' });
    }

    const user = await User.findOne({ email });
    if (user) {
      if (user.role === 'PATIENT' && !user.medvaultId) {
        user.medvaultId = await generateMedVaultId();
        await user.save();
      }
      return res.json({
        exists: true,
        session: issueSession(user),
        user: user.toAuthJSON(),
      });
    }

    return res.json({
      exists: false,
      googleUser: {
        email,
        fullName,
        picture,
        googleId: sub,
        accessToken: accessToken || credential,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Google verification failed.' });
  }
});

// POST /api/auth/google - Authenticate or register with Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken, email: bodyEmail, fullName: bodyName, role: requestedRole, profilePhoto, googleId } = req.body || {};

    let email = bodyEmail ? sanitizeEmail(bodyEmail) : '';
    let fullName = bodyName ? String(bodyName).trim() : '';
    let picture = profilePhoto || '';
    let sub = googleId || '';

    const DEFAULT_GOOGLE_CLIENT_ID = '1094871067975-vrrhfem71sseh67g6lsfugtdvq4e9k6c.apps.googleusercontent.com';
    const expectedClientId = (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim()) || DEFAULT_GOOGLE_CLIENT_ID;

    // If credential token from Google Identity Services is provided, verify it
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          if (expectedClientId && payload.aud !== expectedClientId) {
            return res.status(401).json({ message: 'Google token audience mismatch.' });
          }
          email = sanitizeEmail(payload.email);
          fullName = payload.name || fullName || email.split('@')[0];
          picture = payload.picture || picture;
          sub = payload.sub || sub;
        } else {
          return res.status(401).json({ message: 'Invalid Google authentication token.' });
        }
      } catch (tokenErr) {
        return res.status(500).json({ message: 'Failed to verify Google token with Google servers.' });
      }
    } else if (accessToken) {
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (infoRes.ok) {
          const payload = await infoRes.json();
          email = sanitizeEmail(payload.email);
          fullName = payload.name || fullName || email.split('@')[0];
          picture = payload.picture || picture;
          sub = payload.sub || sub;
        } else {
          return res.status(401).json({ message: 'Invalid Google access token.' });
        }
      } catch (tokenErr) {
        return res.status(500).json({ message: 'Failed to verify Google access token with Google servers.' });
      }
    }

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Valid Google email is required.' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isAdmin = adminEmail && email === adminEmail;

    let user = await User.findOne({ email });

    if (user) {
      // Existing User -> Issue session
      if (user.role === 'PATIENT' && !user.medvaultId) {
        user.medvaultId = await generateMedVaultId();
        await user.save();
      }
      return res.json(issueSession(user));
    }

    // New User -> Google Sign-Up
    const role = isAdmin
      ? 'ADMIN'
      : requestedRole === 'DOCTOR'
      ? 'DOCTOR'
      : 'PATIENT';

    const verificationStatus = role === 'DOCTOR' ? 'PENDING' : 'VERIFIED';
    const medvaultId = role === 'PATIENT' ? await generateMedVaultId() : undefined;
    const randomPassword = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      fullName: fullName || email.split('@')[0],
      email,
      passwordHash,
      role,
      verificationStatus,
      medvaultId,
      profile: {
        profilePhoto: picture,
        googleId: sub,
        googleAuth: true,
      },
    });

    return res.status(201).json(issueSession(user));
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Google authentication failed.' });
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

// POST /api/auth/save-google-client-id - Save Google Client ID into environment
router.post('/save-google-client-id', async (req, res) => {
  try {
    const { clientId } = req.body || {};
    if (!clientId || !clientId.trim()) {
      return res.status(400).json({ message: 'Client ID is required.' });
    }
    const clean = clientId.trim();
    process.env.GOOGLE_CLIENT_ID = clean;

    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const dirname = path.dirname(fileURLToPath(import.meta.url));

    const backendEnvPath = path.resolve(dirname, '..', '.env');
    const frontendEnvPath = path.resolve(dirname, '..', '..', 'frontend', '.env');

    try {
      let bEnv = await fs.readFile(backendEnvPath, 'utf8');
      if (bEnv.includes('GOOGLE_CLIENT_ID=')) {
        bEnv = bEnv.replace(/GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID=${clean}`);
      } else {
        bEnv += `\nGOOGLE_CLIENT_ID=${clean}\n`;
      }
      await fs.writeFile(backendEnvPath, bEnv, 'utf8');
    } catch {}

    try {
      let fEnv = '';
      try {
        fEnv = await fs.readFile(frontendEnvPath, 'utf8');
      } catch {}
      if (fEnv.includes('VITE_GOOGLE_CLIENT_ID=')) {
        fEnv = fEnv.replace(/VITE_GOOGLE_CLIENT_ID=.*/g, `VITE_GOOGLE_CLIENT_ID=${clean}`);
      } else {
        fEnv += `\nVITE_GOOGLE_CLIENT_ID=${clean}\n`;
      }
      await fs.writeFile(frontendEnvPath, fEnv, 'utf8');
    } catch {}

    res.json({ success: true, message: 'Google Client ID saved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save Google Client ID.', error: err.message });
  }
});

export default router;