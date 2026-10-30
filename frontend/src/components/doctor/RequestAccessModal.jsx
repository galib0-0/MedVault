import React, { useState } from 'react';
import { XCloseIcon, InfoIcon } from '../icons';
import PillButton from '../PillButton';
import WaitingApprovalScreen from './WaitingApprovalScreen';
import { createAccessRequest } from '../../lib/doctor';
import styles from '../../pages/doctor/doctor.module.css';

const PURPOSES = [
  'Scheduled Consultation',
  'Follow-up Visit',
  'Referred by another doctor',
  'Second opinion request',
  'Pre-surgery assessment',
  'Other',
];

const DURATIONS = ['15 minutes', '30 minutes', '1 hour', 'Until end of day', 'Specify...'];

/**
 * RequestAccessModal Component
 * Allows doctor to submit a routine patient record access request with Purpose, Referring Doctor, Notes, and Duration,
 * and transitions to the WaitingApprovalScreen.
 */
export default function RequestAccessModal({ patient, onClose, onRequestSent, onSwitchEmergency }) {
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [otherPurposeText, setOtherPurposeText] = useState('');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('30 minutes');
  const [customTime, setCustomTime] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdRequestId, setCreatedRequestId] = useState(null);

  // Validation logic
  const isPurposeValid =
    selectedPurpose !== '' &&
    (selectedPurpose === 'Other' ? otherPurposeText.trim().length >= 20 : true) &&
    (selectedPurpose === 'Referred by another doctor' ? referringDoctor.trim().length > 0 : true);

  const isFormValid = isPurposeValid;

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const finalPurpose = selectedPurpose === 'Other' ? otherPurposeText : selectedPurpose;
      const finalDuration = duration === 'Specify...' ? customTime : duration;
      const notesCombined = [
        referringDoctor ? `Referring Doctor: ${referringDoctor}` : '',
        notes ? `Notes: ${notes}` : '',
      ].filter(Boolean).join(' | ');

      const res = await createAccessRequest({
        patientId: patient.id || patient._id,
        medvaultId: patient.medvaultId,
        purpose: finalPurpose,
        notes: notesCombined,
        duration: finalDuration,
      });

      const reqId = res.request?.id || res.request?._id;
      setCreatedRequestId(reqId);
      setIsWaiting(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send access request. Please ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              📋
            </div>
            <div>
              <h2>Request Patient Record Access</h2>
              <p className={styles.modalSub}>
                Patient: <strong>{patient.fullName}</strong> ({patient.medvaultId})
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <XCloseIcon />
          </button>
        </header>

        {isWaiting ? (
          <div className={styles.modalBody}>
            <WaitingApprovalScreen
              patient={patient}
              requestId={createdRequestId}
              requestData={{
                purpose: selectedPurpose === 'Other' ? otherPurposeText : selectedPurpose,
                referringDoctor,
                duration: duration === 'Specify...' ? customTime : duration,
              }}
              onApproved={() => {
                onRequestSent({
                  patient,
                  purpose: selectedPurpose === 'Other' ? otherPurposeText : selectedPurpose,
                  duration: duration === 'Specify...' ? customTime : duration,
                });
                onClose();
              }}
              onDenied={onClose}
              onExpired={onClose}
              onCancelled={onClose}
              onSwitchEmergency={onSwitchEmergency}
            />
          </div>
        ) : (
          <form onSubmit={handleSendRequest} className={styles.modalBody}>
            {/* Purpose of Visit */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Purpose of Visit *</label>
              <div className={styles.reasonList}>
                {PURPOSES.map((p) => (
                  <label key={p} className={`${styles.reasonRadio} ${selectedPurpose === p ? styles.reasonSelected : ''}`}>
                    <input
                      type="radio"
                      name="routinePurpose"
                      value={p}
                      checked={selectedPurpose === p}
                      onChange={() => setSelectedPurpose(p)}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* If "Other" selected -> show textarea */}
            {selectedPurpose === 'Other' && (
              <div className={`${styles.formGroup} ${styles.slideDownWrap}`}>
                <label className={styles.label}>
                  Specify Purpose * <span className={styles.charHint}>(min 20 characters)</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows="3"
                  placeholder="Please describe the visit purpose..."
                  value={otherPurposeText}
                  onChange={(e) => setOtherPurposeText(e.target.value)}
                  required
                />
              </div>
            )}

            {/* If "Referred by another doctor" selected -> show input */}
            {selectedPurpose === 'Referred by another doctor' && (
              <div className={`${styles.formGroup} ${styles.slideDownWrap}`}>
                <label className={styles.label}>Referring Doctor Name *</label>
                <input
                  type="text"
                  className={styles.searchInput}
                  style={{ paddingLeft: '14px' }}
                  placeholder="Enter referring doctor's full name..."
                  value={referringDoctor}
                  onChange={(e) => setReferringDoctor(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Additional Notes (Optional) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Additional Notes (Optional) <span className={styles.charHint}>({200 - notes.length} chars left)</span>
              </label>
              <textarea
                className={styles.textarea}
                rows="2"
                maxLength={200}
                placeholder="Any notes for the patient..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Estimated Duration */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Estimated Duration</label>
              <select
                className={styles.selectCategory}
                style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {duration === 'Specify...' && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    style={{ paddingLeft: '14px' }}
                    placeholder="Specify duration (e.g. 45 mins)..."
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Blue Info Box */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '12px 16px',
                borderRadius: '12px',
                color: '#1e40af',
                fontSize: '12px',
                lineHeight: '1.5',
              }}
            >
              ℹ️ A real-time prompt will be sent directly to the patient's screen (Google 2-Step Auth style). When the patient reviews and clicks <strong>Allow</strong>, you will immediately receive access to their medical records.
            </div>

            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginTop: '12px',
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            <footer className={styles.modalFooter}>
              <PillButton type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </PillButton>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`${styles.authorizeBtn} ${isFormValid && !isSubmitting ? styles.authorizeBtnActive : styles.authorizeBtnDisabled}`}
              >
                {isSubmitting ? 'Sending Request...' : 'Send Access Request →'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
