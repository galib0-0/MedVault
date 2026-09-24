import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import Record from '../models/Record.js';
import AccessLog from '../models/AccessLog.js';
import { summarizeRecord } from '../services/gemini.js';

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
  const dir = path.join(UPLOAD_ROOT, String(userId));
  return multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
      } catch (err) {
        cb(err);
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
        } catch {
          /* background update failure is non-fatal */
        }
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

export default router;