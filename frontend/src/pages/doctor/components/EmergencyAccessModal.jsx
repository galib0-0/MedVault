import { useState, useEffect, useRef } from 'react';
import { ShieldIcon, AlertIcon, XCloseIcon } from '../../../components/icons';
import PillButton from '../../../components/PillButton';
import styles from '../doctor.module.css';

const REASONS = [
  'Patient unconscious and unable to provide history',
  'Patient unable to communicate (Severe distress / Trauma)',
  'Emergency resuscitation / ICU Admission',
  'Ambulance / Paramedic emergency care',
  'Critical allergy / Medication check before emergency procedure',
  'Other',
];

export default function EmergencyAccessModal({ patient, onClose, onGrant }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pulse animation state when button first transitions to enabled
  const [isPulsing, setIsPulsing] = useState(false);
  const prevEnabledRef = useRef(false);

  // Validation logic
  const isReasonValid =
    selectedReason !== '' &&
    (selectedReason !== 'Other' || customReason.trim().length >= 20);
  const isButtonEnabled = isReasonValid && confirmed;

  // Pulse effect when button becomes enabled for the first time
  useEffect(() => {
    if (isButtonEnabled && !prevEnabledRef.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1200);
      return () => clearTimeout(timer);
    }
    prevEnabledRef.current = isButtonEnabled;
  }, [isButtonEnabled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isButtonEnabled) return;
    setError('');

    const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    if (selectedReason === 'Other' && customReason.trim().length < 20) {
      setError('Written explanation must be at least 20 characters.');
      return;
    }

    setLoading(true);
    try {
      await onGrant({
        patientId: patient.id,
        medvaultId: patient.medvaultId,
        reason: selectedReason,
        customExplanation: selectedReason === 'Other' ? customReason : '',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to authorize emergency access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div className={styles.modalShieldIcon}>
              <ShieldIcon />
            </div>
            <div>
              <h2>Request Emergency Record Access</h2>
              <p className={styles.modalSub}>
                Patient: <strong>{patient.fullName}</strong> ({patient.medvaultId})
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <XCloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.emergencyNotice}>
            <AlertIcon />
            <div>
              <strong>Emergency Security Audit Notice</strong>
              <p>
                Accessing medical records under emergency status bypasses routine authorization. Every
                emergency access is logged in the permanent security audit trail and notified to the patient.
              </p>
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Select Emergency Access Reason *</label>
            <div className={styles.reasonList}>
              {REASONS.map((r) => (
                <label key={r} className={`${styles.reasonRadio} ${selectedReason === r ? styles.reasonSelected : ''}`}>
                  <input
                    type="radio"
                    name="emergencyReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => {
                      setSelectedReason(r);
                      setError('');
                    }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dynamic textarea for "Other" option with smooth slide-down animation */}
          {selectedReason === 'Other' && (
            <div className={`${styles.formGroup} ${styles.slideDownWrap}`}>
              <label className={styles.label}>
                Written Explanation * <span className={styles.charHint}>(min 20 characters)</span>
              </label>
              <textarea
                className={styles.textarea}
                rows="3"
                placeholder="Please describe the emergency reason..."
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  setError('');
                }}
                required
              />
              {customReason.trim().length > 0 && customReason.trim().length < 20 && (
                <span className={styles.charError}>
                  {20 - customReason.trim().length} more characters required
                </span>
              )}
            </div>
          )}

          {/* Emergency Confirmation Checkbox */}
          <div className={styles.checkboxWrapper}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span>
                I confirm this is a genuine medical emergency and understand that this access is permanently logged and the patient will be notified.
              </span>
            </label>
          </div>

          <footer className={styles.modalFooter}>
            <PillButton type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </PillButton>
            <button
              type="submit"
              disabled={!isButtonEnabled || loading}
              className={`${styles.authorizeBtn} ${isButtonEnabled ? styles.authorizeBtnActive : styles.authorizeBtnDisabled} ${isPulsing ? styles.buttonPulse : ''}`}
            >
              {loading ? 'Authorizing...' : 'Authorize Emergency Access'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
