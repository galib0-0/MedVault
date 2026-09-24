import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';

const router = Router();
const requireAdmin = requireRole('ADMIN');

// GET /api/admin/doctors - List doctors by verification status
router.get('/doctors', requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    let filter = { role: 'DOCTOR' };
    if (status) {
      filter.verificationStatus = status.toUpperCase();
    }

    const doctors = await User.find(filter).sort({ createdAt: -1 });
    res.json({ doctors: doctors.map((d) => d.toAuthJSON()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors.' });
  }
});

// PATCH /api/admin/doctors/:doctorId/verify - Approve or reject doctor credentials
router.patch('/doctors/:doctorId/verify', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    if (!['VERIFIED', 'REJECTED', 'PENDING', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status.' });
    }

    const doctor = await User.findOne({ _id: req.params.doctorId, role: 'DOCTOR' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor account not found.' });
    }

    doctor.verificationStatus = status;
    if (notes) {
      doctor.profile = { ...(doctor.profile || {}), verificationNotes: notes };
    }
    await doctor.save();

    res.json({ message: `Doctor status updated to ${status}`, doctor: doctor.toAuthJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update verification status.' });
  }
});

// GET /api/admin/audit-logs - View security access logs
router.get('/audit-logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const logs = await AccessLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs.' });
  }
});

export default router;
