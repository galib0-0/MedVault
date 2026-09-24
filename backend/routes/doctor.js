import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Record from '../models/Record.js';
import AccessLog from '../models/AccessLog.js';
import DoctorNote from '../models/DoctorNote.js';

const router = Router();

// Middleware ensuring user is a DOCTOR or ADMIN
const requireDoctorAccess = requireRole('DOCTOR', 'ADMIN');

// GET /api/doctor/me - Doctor profile and verification status
router.get('/me', requireAuth, requireDoctorAccess, async (req, res) => {
  try {
    res.json({ doctor: req.user.toAuthJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor profile.' });
  }
});

// GET /api/doctor/patients/search?q= - Search patients by MedVault ID, name, or email
router.get('/patients/search', requireAuth, requireDoctorAccess, async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ patients: [] });
    }

    const isMedVaultId = /^MV-\d{8}$/i.test(query);

    let searchFilter = { role: 'PATIENT' };
    if (isMedVaultId) {
      searchFilter.medvaultId = query.toUpperCase();
    } else {
      searchFilter.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { medvaultId: { $regex: query, $options: 'i' } },
      ];
    }

    const patients = await User.find(searchFilter)
      .limit(10)
      .select('fullName email medvaultId profile createdAt');

    const formatted = patients.map((p) => ({
      id: p._id,
      fullName: p.fullName,
      email: p.email,
      medvaultId: p.medvaultId || 'MV-DEMO123',
      dob: p.profile?.dob || '—',
      gender: p.profile?.gender || '—',
      bloodGroup: p.profile?.bloodGroup || 'Not specified',
      allergies: p.profile?.allergies || 'None reported',
      medicalConditions: p.profile?.medicalConditions || 'None reported',
      medications: p.profile?.medications || 'None reported',
      emergencyContactName: p.profile?.emergencyContactName || '—',
      emergencyContactNumber: p.profile?.emergencyContactNumber || '—',
    }));

    res.json({ patients: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to search patients.' });
  }
});

// POST /api/doctor/emergency-access - Request emergency access to a patient's records
router.post('/emergency-access', requireAuth, requireDoctorAccess, async (req, res) => {
  try {
    const { patientId, medvaultId, reason, customExplanation } = req.body || {};

    if (!reason) {
      return res.status(400).json({ message: 'An emergency access reason is required.' });
    }

    // Check doctor verification status (ADMIN bypasses)
    if (req.user.role !== 'ADMIN' && req.user.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        message:
          'Access denied. Your medical credentials must be VERIFIED before requesting emergency access.',
        verificationStatus: req.user.verificationStatus || 'PENDING',
      });
    }

    // Find patient by ID or MedVault ID
    let patientFilter = { role: 'PATIENT' };
    if (patientId) {
      patientFilter._id = patientId;
    } else if (medvaultId) {
      patientFilter.medvaultId = medvaultId.trim().toUpperCase();
    } else {
      return res.status(400).json({ message: 'Patient ID or MedVault ID is required.' });
    }

    const patient = await User.findOne(patientFilter);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Retrieve records
    const records = await Record.find({ user: patient._id }).sort({ createdAt: -1 });

    // Log the emergency access event to AccessLog (Audit Trail)
    const log = await AccessLog.create({
      doctor: req.user._id,
      doctorName: req.user.fullName,
      doctorSpecialization: req.user.profile?.specialization || 'Medical Practitioner',
      doctorHospital: req.user.profile?.hospitalName || 'MedVault Emergency Network',
      patient: patient._id,
      patientMedvaultId: patient.medvaultId || 'MV-UNKNOWN',
      patientName: patient.fullName,
      accessType: 'EMERGENCY',
      reason: reason === 'Other' ? `Other: ${customExplanation || ''}` : reason,
      customExplanation: customExplanation || '',
      recordsAccessed: records.map((r) => r.category || 'Medical Record'),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      authorizationStatus: 'AUTHORIZED',
    });

    // Format Emergency Medical Card Data
    const emergencyCard = {
      patientId: patient._id,
      medvaultId: patient.medvaultId,
      fullName: patient.fullName,
      dob: patient.profile?.dob || '—',
      gender: patient.profile?.gender || '—',
      bloodGroup: patient.profile?.bloodGroup || 'Not specified',
      allergies: patient.profile?.allergies || 'None reported',
      medicalConditions: patient.profile?.medicalConditions || 'None reported',
      medications: patient.profile?.medications || 'None reported',
      emergencyContact: {
        name: patient.profile?.emergencyContactName || '—',
        number: patient.profile?.emergencyContactNumber || '—',
        relationship: patient.profile?.emergencyContactRelationship || '—',
      },
      auditLogId: log._id,
    };

    res.json({
      success: true,
      message: 'Emergency access granted. Action recorded in security audit log.',
      emergencyCard,
      records,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to process emergency access.' });
  }
});

// GET /api/doctor/patients/:patientId/records - Get records for a specific patient
router.get('/patients/:patientId/records', requireAuth, requireDoctorAccess, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        message: 'Your medical credentials must be VERIFIED to view patient records.',
      });
    }

    const patient = await User.findOne({ _id: req.params.patientId, role: 'PATIENT' });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const records = await Record.find({ user: patient._id }).sort({ createdAt: -1 });

    res.json({
      patient: {
        id: patient._id,
        fullName: patient.fullName,
        medvaultId: patient.medvaultId,
        dob: patient.profile?.dob || '—',
        bloodGroup: patient.profile?.bloodGroup || 'Not specified',
        allergies: patient.profile?.allergies || 'None',
        medicalConditions: patient.profile?.medicalConditions || 'None',
        medications: patient.profile?.medications || 'None',
      },
      records,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve patient records.' });
  }
});

// POST /api/doctor/patients/:patientId/notes - Add clinical note for a patient
router.post('/patients/:patientId/notes', requireAuth, requireDoctorAccess, async (req, res) => {
  try {
    const { note, category } = req.body || {};
    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Note content cannot be empty.' });
    }

    const patient = await User.findOne({ _id: req.params.patientId, role: 'PATIENT' });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const doctorNote = await DoctorNote.create({
      doctor: req.user._id,
      doctorName: req.user.fullName,
      doctorSpecialization: req.user.profile?.specialization || 'Medical Practitioner',
      patient: patient._id,
      note: note.trim(),
      category: category || 'General',
    });

    res.status(201).json({ note: doctorNote });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add doctor note.' });
  }
});

// GET /api/doctor/patients/:patientId/notes - Fetch doctor notes for patient
router.get('/patients/:patientId/notes', requireAuth, requireDoctorAccess, async (req, res) => {
  try {
    const notes = await DoctorNote.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor notes.' });
  }
});

export default router;
