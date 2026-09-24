import { useEffect, useState } from 'react';
import { XCloseIcon, CheckIcon } from '../../../components/icons.jsx';
import { updateProfile } from '../../../lib/auth';
import { useToast } from '../../../components/Toast.jsx';
import { BLOOD_GROUPS, GENDERS, RELATIONSHIPS } from '../../../lib/constants.js';
import styles from './ProfileEditModal.module.css';

const toOptions = (list) => list.map((v) => ({ value: v, label: v }));

export default function ProfileEditModal({ open, session, onClose, onSaved }) {
  const toast = useToast();
  const p = session?.profile || {};
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        fullName: session?.fullName || '',
        dob: p.dob || '',
        gender: p.gender || '',
        bloodGroup: p.bloodGroup || '',
        mobile: p.mobile || '',
        allergies: p.allergies || '',
        medicalConditions: p.medicalConditions || '',
        medications: p.medications || '',
        emergencyContactName: p.emergencyContactName || '',
        emergencyContactNumber: p.emergencyContactNumber || '',
        emergencyContactRelationship: p.emergencyContactRelationship || '',
        organDonor: p.organDonor === true,
      });
    }
  }, [open, session, p]);

  if (!open) return null;

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName,
        dob: form.dob,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        mobile: form.mobile,
        allergies: form.allergies,
        medicalConditions: form.medicalConditions,
        medications: form.medications,
        emergencyContactName: form.emergencyContactName,
        emergencyContactNumber: form.emergencyContactNumber,
        emergencyContactRelationship: form.emergencyContactRelationship,
        organDonor: form.organDonor,
      });
      toast('Your profile has been updated.', 'success');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Could not save your profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Edit profile">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div>
            <h3>Edit Profile</h3>
            <p>This information is shown to doctors during emergencies.</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <XCloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <span className={styles.group}>Basic details</span>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Full Name</span>
              <input value={form.fullName || ''} onChange={set('fullName')} required />
            </label>
            <label className={styles.field}>
              <span>Date of Birth</span>
              <input type="date" value={form.dob || ''} onChange={set('dob')} max={new Date().toISOString().split('T')[0]} />
            </label>
            <label className={styles.field}>
              <span>Gender</span>
              <select value={form.gender || ''} onChange={set('gender')}>
                <option value="">Select</option>
                {toOptions(GENDERS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Blood Group</span>
              <select value={form.bloodGroup || ''} onChange={set('bloodGroup')}>
                <option value="">Select</option>
                {toOptions(BLOOD_GROUPS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Mobile Number</span>
              <input type="tel" value={form.mobile || ''} onChange={set('mobile')} maxLength={10} />
            </label>
          </div>

          <span className={styles.group}>Medical profile</span>
          <div className={styles.grid}>
            <label className={`${styles.field} ${styles.full}`}>
              <span>Known Allergies</span>
              <input value={form.allergies || ''} onChange={set('allergies')} placeholder="e.g. Penicillin, peanuts" />
            </label>
            <label className={`${styles.field} ${styles.full}`}>
              <span>Existing Medical Conditions</span>
              <textarea value={form.medicalConditions || ''} onChange={set('medicalConditions')} rows={2} placeholder="e.g. Diabetes, hypertension" />
            </label>
            <label className={`${styles.field} ${styles.full}`}>
              <span>Current Medications</span>
              <textarea value={form.medications || ''} onChange={set('medications')} rows={2} placeholder="e.g. Metformin 500mg daily" />
            </label>
          </div>

          <span className={styles.group}>Emergency contact</span>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Contact Name</span>
              <input value={form.emergencyContactName || ''} onChange={set('emergencyContactName')} />
            </label>
            <label className={styles.field}>
              <span>Relationship</span>
              <select value={form.emergencyContactRelationship || ''} onChange={set('emergencyContactRelationship')}>
                <option value="">Select</option>
                {toOptions(RELATIONSHIPS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Contact Number</span>
              <input type="tel" value={form.emergencyContactNumber || ''} onChange={set('emergencyContactNumber')} maxLength={10} />
            </label>
          </div>

          <label className={styles.check}>
            <input type="checkbox" checked={form.organDonor === true} onChange={set('organDonor')} />
            <span>I am a registered organ donor</span>
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.save} disabled={saving}>
              <CheckIcon /> {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}