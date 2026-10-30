import { useState } from 'react';
import { XCloseIcon, PlusIcon } from '../../../components/icons.jsx';
import { createDependent } from '../../../lib/dependents.js';
import { useToast } from '../../../components/Toast.jsx';
import { BLOOD_GROUPS } from '../../../lib/constants.js';
import styles from './AddDependentModal.module.css';

const RELATION_OPTIONS = ['Son', 'Daughter', 'Ward', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function AddDependentModal({ open, onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    relationship: 'Son',
    bloodGroup: 'Unknown',
    birthHospital: '',
    birthWeight: '',
    allergies: '',
    pediatricNotes: '',
  });

  if (!open) return null;

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.dob) {
      toast('Please enter child full name and date of birth.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await createDependent({
        fullName: form.fullName.trim(),
        dob: form.dob,
        gender: form.gender,
        relationship: form.relationship,
        bloodGroup: form.bloodGroup,
        birthHospital: form.birthHospital,
        birthWeight: form.birthWeight,
        allergies: form.allergies,
        pediatricNotes: form.pediatricNotes,
      });

      toast(`Pediatric profile created for ${form.fullName}. Immunization milestones initialized!`, 'success');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to create dependent profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Add Child or Dependent">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div>
            <h3>👶 Add Child / Pediatric Profile</h3>
            <p>Lifelong pediatric health tracking, immunization schedules and birth records.</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <XCloseIcon />
          </button>
        </div>

        <div className={styles.banner}>
          <span className={styles.bannerIcon}>📋</span>
          <div>
            <strong>Standard Pediatric Immunization Milestones Included</strong>
            <p style={{ margin: '2px 0 0', fontSize: '12px' }}>
              MedVault will automatically initialize standard pediatric vaccine milestones (BCG, OPV, Pentavalent, MMR, Rotavirus, etc.) calculated from date of birth.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <span className={styles.sectionTitle}>Basic Information</span>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.full}`}>
              <label>Child / Dependent Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={form.fullName}
                onChange={set('fullName')}
              />
            </div>

            <div className={styles.field}>
              <label>Date of Birth *</label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={form.dob}
                onChange={set('dob')}
              />
            </div>

            <div className={styles.field}>
              <label>Relationship *</label>
              <select value={form.relationship} onChange={set('relationship')}>
                {RELATION_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Gender *</label>
              <select value={form.gender} onChange={set('gender')}>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Blood Group</label>
              <select value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="Unknown">Unknown / Not Tested</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <span className={styles.sectionTitle}>Pediatric & Birth Records</span>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Birth Hospital / Clinic</label>
              <input
                type="text"
                placeholder="e.g. Fortis Memorial / Cloudnine"
                value={form.birthHospital}
                onChange={set('birthHospital')}
              />
            </div>

            <div className={styles.field}>
              <label>Birth Weight</label>
              <input
                type="text"
                placeholder="e.g. 3.2 kg"
                value={form.birthWeight}
                onChange={set('birthWeight')}
              />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Known Allergies (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Peanuts, Lactose"
                value={form.allergies}
                onChange={set('allergies')}
              />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Pediatric Notes / Special Conditions</label>
              <textarea
                placeholder="e.g. Full-term normal delivery, mild asthma under monitoring..."
                value={form.pediatricNotes}
                onChange={set('pediatricNotes')}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Creating Profile...' : <><PlusIcon /> Create Pediatric Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
