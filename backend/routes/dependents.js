import express from 'express';
import Dependent from '../models/Dependent.js';
import Record from '../models/Record.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Standard pediatric vaccination milestone generator
function generateStandardVaccinationSchedule(dobDate) {
  const dob = new Date(dobDate);
  const now = new Date();
  const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());

  const milestones = [
    { name: 'BCG, OPV 0 & Hep-B (Birth Dose)', dueAge: 'At Birth', dueMonth: 0 },
    { name: 'Pentavalent 1, Rotavirus 1 & IPV 1', dueAge: '6 Weeks', dueMonth: 1.5 },
    { name: 'Pentavalent 2 & Rotavirus 2', dueAge: '10 Weeks', dueMonth: 2.5 },
    { name: 'Pentavalent 3, Rotavirus 3 & PCV 1', dueAge: '14 Weeks', dueMonth: 3.5 },
    { name: 'Influenza Annual Dose', dueAge: '6 Months', dueMonth: 6 },
    { name: 'MMR 1 (Measles, Mumps, Rubella) & OPV Booster', dueAge: '9 Months', dueMonth: 9 },
    { name: 'Hepatitis A (Dose 1)', dueAge: '12 Months', dueMonth: 12 },
    { name: 'MMR 2 & Chickenpox (Varicella 1)', dueAge: '15 Months', dueMonth: 15 },
    { name: 'DPT Booster 1 & IPV Booster', dueAge: '18 Months', dueMonth: 18 },
    { name: 'Typhoid Conjugate Vaccine', dueAge: '2 Years', dueMonth: 24 },
    { name: 'DPT Booster 2 & OPV Booster', dueAge: '5 Years', dueMonth: 60 },
    { name: 'Td / Tdap & HPV Milestone', dueAge: '10 Years', dueMonth: 120 },
    { name: 'Td Adulthood Booster', dueAge: '16 Years', dueMonth: 192 },
  ];

  return milestones.map((m) => {
    let status = 'upcoming';
    let administeredDate = null;

    if (ageMonths >= m.dueMonth + 3) {
      status = 'completed';
      administeredDate = new Date(dob.getTime() + m.dueMonth * 30 * 24 * 60 * 60 * 1000);
    } else if (ageMonths >= m.dueMonth) {
      status = 'due';
    }

    return {
      name: m.name,
      dueAge: m.dueAge,
      status,
      administeredDate,
      notes: '',
    };
  });
}

// GET /api/dependents - List all dependents of logged-in patient
router.get('/', requireAuth, async (req, res) => {
  try {
    const dependents = await Dependent.find({ parent: req.user._id }).sort({ createdAt: -1 });

    const results = await Promise.all(
      dependents.map(async (dep) => {
        const json = dep.toJSON();
        // Count any records specifically tagged or uploaded for this child if any
        const recordCount = await Record.countDocuments({
          user: req.user._id,
          'aiSummary.dependentId': dep._id,
        }).catch(() => 0);
        json.records = recordCount;
        return json;
      })
    );

    // Compute aggregated vaccination metrics across all family members
    let totalCompleted = 0;
    let totalAll = 0;
    const aggregatedVaccinationItems = [];

    results.forEach((dep) => {
      if (dep.vaccinations && dep.vaccinations.items) {
        dep.vaccinations.items.forEach((v) => {
          totalAll += 1;
          if (v.status === 'completed') totalCompleted += 1;
          aggregatedVaccinationItems.push({
            id: v._id || `${dep.id}-${v.name}`,
            dependentName: dep.name,
            name: `${v.name} (${dep.name})`,
            status: v.status,
            dueAge: v.dueAge,
            administeredDate: v.administeredDate,
          });
        });
      }
    });

    const overallPct = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 100;

    res.json({
      dependents: results,
      vaccinationOverview: {
        overall: overallPct,
        totalCompleted,
        totalPending: totalAll - totalCompleted,
        items: aggregatedVaccinationItems.slice(0, 8),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve dependents.', error: err.message });
  }
});

// POST /api/dependents - Add new child or dependent profile
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      fullName,
      dob,
      gender,
      relationship,
      bloodGroup,
      birthHospital,
      birthWeight,
      allergies,
      pediatricNotes,
    } = req.body || {};

    if (!fullName || !dob) {
      return res.status(400).json({ message: 'Full name and Date of Birth are required.' });
    }

    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) {
      return res.status(400).json({ message: 'Invalid Date of Birth.' });
    }

    const allergiesArray = Array.isArray(allergies)
      ? allergies
      : typeof allergies === 'string'
      ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const generatedVaccines = generateStandardVaccinationSchedule(birthDate);

    const dependent = await Dependent.create({
      parent: req.user._id,
      fullName: fullName.trim(),
      dob: birthDate,
      gender: gender || 'Male',
      relationship: relationship || 'Son',
      bloodGroup: bloodGroup || 'Unknown',
      birthHospital: birthHospital ? birthHospital.trim() : '',
      birthWeight: birthWeight ? birthWeight.trim() : '',
      allergies: allergiesArray,
      pediatricNotes: pediatricNotes ? pediatricNotes.trim() : '',
      vaccinations: generatedVaccines,
    });

    res.status(201).json({
      message: 'Pediatric profile created successfully.',
      dependent: dependent.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create dependent profile.', error: err.message });
  }
});

// PATCH /api/dependents/:id - Update dependent details
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const dependent = await Dependent.findOne({ _id: req.params.id, parent: req.user._id });
    if (!dependent) {
      return res.status(404).json({ message: 'Dependent not found.' });
    }

    const updatable = [
      'fullName',
      'bloodGroup',
      'gender',
      'relationship',
      'birthHospital',
      'birthWeight',
      'pediatricNotes',
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        dependent[field] = req.body[field];
      }
    });

    if (req.body.allergies !== undefined) {
      dependent.allergies = Array.isArray(req.body.allergies)
        ? req.body.allergies
        : String(req.body.allergies).split(',').map((s) => s.trim()).filter(Boolean);
    }

    await dependent.save();
    res.json({ message: 'Dependent profile updated.', dependent: dependent.toJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update dependent.', error: err.message });
  }
});

// PATCH /api/dependents/:id/vaccinations/:vacId - Update vaccination dose status
router.patch('/:id/vaccinations/:vacId', requireAuth, async (req, res) => {
  try {
    const dependent = await Dependent.findOne({ _id: req.params.id, parent: req.user._id });
    if (!dependent) {
      return res.status(404).json({ message: 'Dependent not found.' });
    }

    const vaccine = dependent.vaccinations.id(req.params.vacId);
    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine entry not found.' });
    }

    const { status, administeredDate, notes } = req.body || {};
    if (status) vaccine.status = status;
    if (administeredDate !== undefined) vaccine.administeredDate = administeredDate ? new Date(administeredDate) : null;
    if (notes !== undefined) vaccine.notes = notes;

    await dependent.save();
    res.json({ message: 'Vaccination dose updated.', dependent: dependent.toJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update vaccination.', error: err.message });
  }
});

// POST /api/dependents/:id/transition-independent - Section 13 Adulthood Independence Flag
router.post('/:id/transition-independent', requireAuth, async (req, res) => {
  try {
    const dependent = await Dependent.findOne({ _id: req.params.id, parent: req.user._id });
    if (!dependent) {
      return res.status(404).json({ message: 'Dependent not found.' });
    }

    const { isAdulthood } = dependent.getAgeInfo();
    if (!isAdulthood) {
      return res.status(400).json({
        message: 'Dependent has not yet reached adulthood (age 18). Independent account transition is available upon turning 18.',
      });
    }

    dependent.isIndependent = true;
    await dependent.save();

    res.json({
      message: `${dependent.fullName} is now flagged as eligible for an independent MedVault account transition!`,
      dependent: dependent.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to transition profile.', error: err.message });
  }
});

// DELETE /api/dependents/:id - Remove dependent
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await Dependent.findOneAndDelete({ _id: req.params.id, parent: req.user._id });
    if (!result) {
      return res.status(404).json({ message: 'Dependent not found.' });
    }
    res.json({ message: 'Dependent profile removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete dependent.', error: err.message });
  }
});

export default router;
