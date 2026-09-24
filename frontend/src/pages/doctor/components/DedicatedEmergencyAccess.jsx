import { useState, useEffect, useRef } from 'react';
import { QrCodeIcon, ShieldIcon, AlertIcon, SearchIcon } from '../../../components/icons';
import { DUMMY_EMERGENCY_ACCESSES, MOCK_DUMMY_PATIENT } from '../mockData';
import styles from '../doctor.module.css';

const REASONS = [
  'Patient unconscious and unable to provide history',
  'Patient unable to communicate (Severe distress / Trauma)',
  'Emergency resuscitation / ICU Admission',
  'Ambulance / Paramedic emergency care',
  'Critical allergy / Medication check before emergency procedure',
  'Other',
];

export default function DedicatedEmergencyAccess({ onAuthorizeAccess }) {
  const [medvaultIdInput, setMedvaultIdInput] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pulse animation state when button first transitions to enabled
  const [isPulsing, setIsPulsing] = useState(false);
  const prevEnabledRef = useRef(false);

  const isReasonValid =
    selectedReason !== '' &&
    (selectedReason !== 'Other' || customReason.trim().length >= 20);
  const isIdValid = medvaultIdInput.trim().length >= 3;
  const isButtonEnabled = isIdValid && isReasonValid && confirmed;

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

    setLoading(true);
    try {
      // Simulate finding patient and granting access
      const patientToGrant = {
        ...MOCK_DUMMY_PATIENT,
        medvaultId: medvaultIdInput.trim().toUpperCase(),
        fullName: medvaultIdInput.toUpperCase().includes('MV-29183746')
          ? 'Priya Sharma'
          : medvaultIdInput.toUpperCase().includes('MV-48291037')
          ? 'Arjun Reddy'
          : 'Priya Sharma',
      };

      await onAuthorizeAccess({
        patient: patientToGrant,
        reason: selectedReason === 'Other' ? customReason.trim() : selectedReason,
        customExplanation: selectedReason === 'Other' ? customReason : '',
      });
    } catch (err) {
      setError(err.message || 'Emergency access failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.emergencyPageWrap}>
      {/* Red themed page header */}
      <div className={styles.emergencyHeaderCard}>
        <div className={styles.emergencyHeaderTitleRow}>
          <div className={styles.redLightningBadge}>⚡</div>
          <div>
            <h2>Emergency Patient Access</h2>
            <p className={styles.emergencySubHeader}>
              For life-threatening situations. Every access is permanently logged and audited.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.emergencyFormCard}>
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Section 1 — Quick Access by MedVault ID or QR Scanner */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionHeading}>1. Patient Identification</h3>
          <div className={styles.searchAndQrGrid}>
            <div className={styles.idInputBox}>
              <label className={styles.label}>Patient MedVault ID *</label>
              <div className={styles.inputWithIcon}>
                <SearchIcon className={styles.inputIconLeft} />
                <input
                  type="text"
                  className={styles.medvaultIdInput}
                  placeholder="Enter Patient MedVault ID (e.g. MV-36365758)"
                  value={medvaultIdInput}
                  onChange={(e) => setMedvaultIdInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.orDivider}>
              <span>OR</span>
            </div>

            <div className={styles.qrScannerBox} title="Scan patient QR code placeholder">
              <QrCodeIcon className={styles.qrCameraIcon} />
              <span className={styles.qrText}>Scan Patient QR Code</span>
              <span className={styles.qrSubText}>(UI Placeholder Scanner)</span>
            </div>
          </div>
        </div>

        {/* Section 2 — Emergency Reason */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionHeading}>2. Emergency Access Reason *</h3>
          <div className={styles.reasonList}>
            {REASONS.map((r) => (
              <label
                key={r}
                className={`${styles.reasonRadio} ${selectedReason === r ? styles.reasonSelected : ''}`}
              >
                <input
                  type="radio"
                  name="emergencyPageReason"
                  value={r}
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other' && (
            <div className={`${styles.formGroup} ${styles.slideDownWrap}`} style={{ marginTop: '12px' }}>
              <label className={styles.label}>
                Written Explanation * <span className={styles.charHint}>(min 20 characters)</span>
              </label>
              <textarea
                className={styles.textarea}
                rows="3"
                placeholder="Please describe the emergency reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
              />
              {customReason.trim().length > 0 && customReason.trim().length < 20 && (
                <span className={styles.charError}>
                  {20 - customReason.trim().length} more characters required
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section 3 — Confirmation Checkbox & Submit */}
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

        <div className={styles.emergencySubmitRow}>
          <button
            type="submit"
            disabled={!isButtonEnabled || loading}
            className={`${styles.authorizeRedBtn} ${isButtonEnabled ? styles.authorizeRedActive : styles.authorizeBtnDisabled} ${isPulsing ? styles.buttonPulse : ''}`}
          >
            {loading ? 'Accessing File...' : 'Find Patient Immediately'}
          </button>
        </div>
      </form>

      {/* Section 3 — Recent Emergency Accesses Table */}
      <div className={styles.recentHistoryCard}>
        <h3 className={styles.historyCardTitle}>Recent Emergency Accesses</h3>
        <div className={styles.tableResponsive}>
          <table className={styles.emergencyTable}>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>MedVault ID</th>
                <th>Reason</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_EMERGENCY_ACCESSES.map((row, index) => (
                <tr key={row.id} className={index % 2 === 1 ? styles.evenRow : ''}>
                  <td><strong>{row.patientName}</strong></td>
                  <td><span className={styles.mvIdTag}>{row.medvaultId}</span></td>
                  <td>{row.reason}</td>
                  <td>{row.dateTime}</td>
                  <td>{row.duration}</td>
                  <td><span className={styles.completedBadge}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
