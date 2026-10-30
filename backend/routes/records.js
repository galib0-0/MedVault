import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import Record from '../models/Record.js';
import AccessLog from '../models/AccessLog.js';
import AccessRequest from '../models/AccessRequest.js';
import { summarizeRecord, translateMedicalReport } from '../services/gemini.js';

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.resolve(__dirname, '..', 'uploads');

const CATEGORY_LABELS = {
  lab: 'Lab Reports',
  prescription: 'Prescriptions',
  xray: 'X-Rays / Scans',
  discharge: 'Discharge Summaries',
  bill: 'Medical Bills',
  other: 'Other Documents',
};

const MAX_BYTES = 25 * 1024 * 1024;

function storageForUser(userId) {
  return multer.diskStorage({
    destination: async (_req, _file, cb) => {
      const dir = path.join(UPLOAD_ROOT, String(userId));
      try {
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
      } catch (err) {
        try {
          const fallback = path.join(os.tmpdir(), 'medvault-uploads', String(userId));
          await fs.mkdir(fallback, { recursive: true });
          cb(null, fallback);
        } catch (fallbackErr) {
          cb(err);
        }
      }
    },
    filename: (_req, file, cb) => {
      const safe = Buffer.from(file.originalname, 'latin1')
        .toString('utf8')
        .replace(/[^\w.\-\u0900-\u097F]+/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  });
}

function uploadFor(userId) {
  return multer({
    storage: storageForUser(userId),
    limits: { fileSize: MAX_BYTES },
    fileFilter: (_req, _file, cb) => {
      cb(null, true);
    },
  });
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const records = await Record.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load records.' });
  }
});

router.get('/access-history', requireAuth, async (req, res) => {
  try {
    const logs = await AccessLog.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load access history.' });
  }
});

// GET /api/records/access-requests/pending - Fetch active pending access request for this patient
router.get('/access-requests/pending', requireAuth, async (req, res) => {
  try {
    const pendingReq = await AccessRequest.findOne({
      patient: req.user._id,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json({ request: pendingReq ? pendingReq.toJSON() : null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check pending access requests.' });
  }
});

// POST /api/records/access-requests/:id/respond - Patient ALLOWS or DENIES access
router.post('/access-requests/:id/respond', requireAuth, async (req, res) => {
  try {
    const { action } = req.body || {}; // 'APPROVED' or 'DENIED'
    if (!['APPROVED', 'DENIED'].includes(action)) {
      return res.status(400).json({ message: 'Action must be APPROVED or DENIED.' });
    }

    const accessReq = await AccessRequest.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!accessReq) {
      return res.status(404).json({ message: 'Access request not found.' });
    }

    if (accessReq.status !== 'PENDING') {
      return res.status(400).json({
        message: `Request is already ${accessReq.status.toLowerCase()}.`,
        status: accessReq.status,
      });
    }

    accessReq.status = action;
    accessReq.respondedAt = new Date();
    await accessReq.save();

    // Log into AccessLog for audit trail
    if (action === 'APPROVED') {
      await AccessLog.create({
        doctor: accessReq.doctor,
        doctorName: accessReq.doctorName,
        doctorSpecialization: accessReq.doctorSpecialization,
        doctorHospital: accessReq.doctorHospital,
        patient: req.user._id,
        patientMedvaultId: req.user.medvaultId || accessReq.patientMedvaultId,
        patientName: req.user.fullName,
        accessType: 'STANDARD_CONSULTATION',
        reason: accessReq.purpose,
        customExplanation: accessReq.notes || 'Routine consultation approved by patient',
        recordsAccessed: ['Consultation Access - Approved by Patient'],
        authorizationStatus: 'AUTHORIZED',
      });
    } else {
      await AccessLog.create({
        doctor: accessReq.doctor,
        doctorName: accessReq.doctorName,
        doctorSpecialization: accessReq.doctorSpecialization,
        doctorHospital: accessReq.doctorHospital,
        patient: req.user._id,
        patientMedvaultId: req.user.medvaultId || accessReq.patientMedvaultId,
        patientName: req.user.fullName,
        accessType: 'STANDARD_CONSULTATION',
        reason: accessReq.purpose,
        customExplanation: 'Denied by patient via prompt',
        recordsAccessed: [],
        authorizationStatus: 'DENIED',
      });
    }

    res.json({ success: true, status: action, request: accessReq.toJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process access response.' });
  }
});

router.post('/', requireAuth, (req, res) => {
  const upload = uploadFor(req.user._id);

  upload.single('file')(req, res, async (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({
        message: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 25 MB).' : err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const category = CATEGORY_LABELS[req.body?.category] || 'Other Documents';
    const categoryId = req.body?.category || 'other';

    try {
      const record = await Record.create({
        user: req.user._id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        category,
        categoryId,
        storagePath: req.file.path,
        aiStatus: 'processing',
      });

      summarizeRecord({
        filePath: req.file.path,
        originalName: req.file.originalname,
        category,
        mimeType: req.file.mimetype,
      }).then(async (summary) => {
        try {
          await Record.updateOne(
            { _id: record._id },
            {
              aiStatus: summary.source === 'error' ? 'failed' : 'ready',
              aiSummary: summary,
              critical: Boolean(summary.critical),
            }
          );
        } catch (updateErr) {
          console.error('[Record Update Error]:', updateErr);
        }
      }).catch(async (fatalErr) => {
        console.error('[Record Summarize Fatal]:', fatalErr.message);
        await Record.updateOne(
          { _id: record._id },
          {
            aiStatus: 'failed',
            aiSummary: {
              summary: `AI summarization encountered an issue (${fatalErr.message}). You can click below to retry.`,
              finding: 'AI analysis error',
              findingType: 'none',
              recommendation: 'Click retry to re-analyze with Gemini.',
              critical: false,
              source: 'error',
            },
          }
        ).catch(() => {});
      });

      res.status(201).json({ record });
    } catch (createErr) {
      await fs.unlink(req.file.path).catch(() => {});
      res.status(500).json({ message: 'Failed to save record.' });
    }
  });
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    res.json({ record });
  } catch {
    res.status(500).json({ message: 'Failed to load record.' });
  }
});

// DELETE /api/records/:id - Safely delete record, file, and AI summary
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Record not found or unauthorized.' });
    }

    // Safely remove physical file from disk if it exists
    if (record.storagePath) {
      await fs.unlink(record.storagePath).catch((unlinkErr) => {
        console.warn(`[Delete Record] Could not unlink ${record.storagePath}:`, unlinkErr.message);
      });
    }

    // Remove document from MongoDB (also cleans up embedded aiSummary)
    await Record.deleteOne({ _id: record._id });

    res.json({ success: true, message: 'Record and associated AI summary safely deleted.' });
  } catch (err) {
    console.error('[Delete Record Error]:', err);
    res.status(500).json({ message: 'Failed to delete record.' });
  }
});

// POST /api/records/:id/re-summarize - Re-trigger AI summarization with Gemini
router.post('/:id/re-summarize', requireAuth, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    record.aiStatus = 'processing';
    await record.save();

    summarizeRecord({
      filePath: record.storagePath,
      originalName: record.originalName,
      category: record.category,
      mimeType: record.mimeType,
    }).then(async (summary) => {
      try {
        await Record.updateOne(
          { _id: record._id },
          {
            aiStatus: summary.source === 'error' ? 'failed' : 'ready',
            aiSummary: summary,
            critical: Boolean(summary.critical),
          }
        );
      } catch {
        /* background update failure is non-fatal */
      }
    }).catch(async (fatalErr) => {
      console.error('[Record Summarize Fatal]:', fatalErr.message);
      await Record.updateOne(
        { _id: record._id },
        {
          aiStatus: 'failed',
          aiSummary: {
            summary: `AI summarization encountered an issue (${fatalErr.message}). You can click below to retry.`,
            finding: 'AI analysis error',
            findingType: 'none',
            recommendation: 'Click retry to re-analyze with Gemini.',
            critical: false,
            source: 'error',
          },
        }
      ).catch(() => {});
    });

    res.json({ message: 'Summarization started.', record });
  } catch (err) {
    res.status(500).json({ message: 'Failed to trigger summarization.' });
  }
});

// POST /api/records/translate - Translate medical report into target regional language
router.post('/translate', requireAuth, async (req, res) => {
  try {
    const { text, language, recordId } = req.body || {};
    if (!text && !recordId) {
      return res.status(400).json({ message: 'Text or recordId is required for translation.' });
    }

    const targetLang = language || 'English';
    if (targetLang.toLowerCase() === 'english') {
      return res.json({ translated: text, language: 'English' });
    }

    let sourceText = text;

    if (recordId) {
      const record = await Record.findById(recordId);
      if (record && record.aiSummary) {
        if (!sourceText) {
          sourceText = record.aiSummary.report || record.aiSummary.summary || '';
        }
        // Return cached translation if available
        if (record.aiSummary.translations && record.aiSummary.translations[targetLang]) {
          return res.json({
            translated: record.aiSummary.translations[targetLang],
            language: targetLang,
            cached: true,
          });
        }
      }
    }

    const translated = await translateMedicalReport({
      text: sourceText,
      targetLanguage: targetLang,
    });

    // Cache if recordId exists
    if (recordId) {
      try {
        const record = await Record.findById(recordId);
        if (record && record.aiSummary) {
          const translations = record.aiSummary.translations || {};
          translations[targetLang] = translated;
          record.aiSummary.translations = translations;
          record.markModified('aiSummary');
          await record.save();
        }
      } catch {
        // caching failure is non-fatal
      }
    }

    res.json({ translated, language: targetLang, cached: false });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Translation failed.' });
  }
});

// POST /api/records/:id/sync-medications - Add deciphered medications to patient's active medication list
router.post('/:id/sync-medications', requireAuth, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    const meds = record.aiSummary?.medications || [];
    if (!meds.length) {
      return res.status(400).json({ message: 'No structured medications found in this record.' });
    }

    const currentMeds = Array.isArray(req.user.profile?.medications)
      ? req.user.profile.medications
      : typeof req.user.profile?.medications === 'string'
      ? req.user.profile.medications.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const newMedStrings = meds.map(
      (m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ''}${m.frequency ? ` - ${m.frequency}` : ''}`
    );

    const merged = Array.from(new Set([...currentMeds, ...newMedStrings]));

    req.user.profile = {
      ...(req.user.profile || {}),
      medications: merged,
    };

    req.user.markModified('profile');
    await req.user.save();

    res.json({
      message: `${newMedStrings.length} medication(s) synchronized to your active profile.`,
      medications: merged,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to sync medications.', error: err.message });
  }
});

export default router;