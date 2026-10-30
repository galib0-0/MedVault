import { useState } from 'react';
import { XCloseIcon, BadgeCheckIcon } from '../../../components/icons.jsx';
import { updateVaccination, transitionIndependent } from '../../../lib/dependents.js';
import { useToast } from '../../../components/Toast.jsx';
import styles from './DependentDetailModal.module.css';

export default function DependentDetailModal({ open, dependent, onClose, onUpdated }) {
  const toast = useToast();
  const [transitioning, setTransitioning] = useState(false);
  const [updatingVacId, setUpdatingVacId] = useState(null);

  if (!open || !dependent) return null;

  const depId = dependent.id || dependent._id;
  const isAdulthood = dependent.isAdulthood;
  const isIndependent = dependent.isIndependent;
  const vaccines = dependent.vaccinations?.items || [];

  const handleTransition = async () => {
    if (!window.confirm(`Are you sure you want to transition ${dependent.name || dependent.fullName} to an independent MedVault account?`)) {
      return;
    }

    setTransitioning(true);
    try {
      await transitionIndependent(depId);
      toast(`${dependent.name || dependent.fullName} has been granted adult account independence!`, 'success');
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to transition account.', 'error');
    } finally {
      setTransitioning(false);
    }
  };

  const handleToggleVaccine = async (v) => {
    const nextStatus = v.status === 'completed' ? 'due' : 'completed';
    const administeredDate = nextStatus === 'completed' ? new Date().toISOString() : null;

    setUpdatingVacId(v._id || v.id);
    try {
      await updateVaccination(depId, v._id || v.id, {
        status: nextStatus,
        administeredDate,
      });
      toast(`Updated ${v.name} status to ${nextStatus}.`, 'success');
      if (onUpdated) onUpdated();
    } catch (err) {
      toast(err.message || 'Failed to update vaccine record.', 'error');
    } finally {
      setUpdatingVacId(null);
    }
  };

  const formattedDob = dependent.dob
    ? new Date(dependent.dob).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Dependent Profile Details">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div className={styles.hero}>
            <div className={styles.avatar}>
              {(dependent.name || dependent.fullName || 'C').charAt(0)}
            </div>
            <div className={styles.heroInfo}>
              <h3>{dependent.name || dependent.fullName}</h3>
              <div className={styles.heroMeta}>
                <span>{dependent.relation || dependent.relationship || 'Child'}</span>
                <span>•</span>
                <span>Age: {dependent.age}</span>
                <span>•</span>
                <span>DOB: {formattedDob}</span>
              </div>
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <XCloseIcon />
          </button>
        </div>

        <div className={styles.body}>
          {/* Spec Section 13: Adulthood Independence Indicator */}
          {isAdulthood && (
            <div className={`${styles.adulthoodBanner} ${isIndependent ? styles.independent : ''}`}>
              <span className={styles.adulthoodIcon}>{isIndependent ? '🎓' : '🎂'}</span>
              <div className={styles.adulthoodText}>
                <strong>
                  {isIndependent
                    ? 'Independent MedVault Account Granted'
                    : 'Adulthood Independence Milestone (Age 18+)'}
                </strong>
                <p>
                  {isIndependent
                    ? `${dependent.name || dependent.fullName} now holds an independent health vault. Parental records remain archived securely.`
                    : `${dependent.name || dependent.fullName} has reached the legal age of majority (18 years). Under MedVault regulations, they are eligible to separate their pediatric profile into an independent adult account.`}
                </p>
                {!isIndependent && (
                  <button
                    type="button"
                    className={styles.transBtn}
                    onClick={handleTransition}
                    disabled={transitioning}
                  >
                    {transitioning ? 'Processing...' : '🚀 Transition to Independent Account'}
                  </button>
                )}
                {isIndependent && (
                  <span className={styles.transBadge}>
                    <BadgeCheckIcon /> Independent Profile Active
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Pediatric Vitals & Birth Records */}
          <div className={styles.vitalsGrid}>
            <div className={styles.vitalCard}>
              <div className={styles.vitalLabel}>Blood Group</div>
              <div className={styles.vitalValue}>{dependent.bloodGroup || '—'}</div>
            </div>
            <div className={styles.vitalCard}>
              <div className={styles.vitalLabel}>Birth Weight</div>
              <div className={styles.vitalValue}>{dependent.birthWeight || '—'}</div>
            </div>
            <div className={styles.vitalCard}>
              <div className={styles.vitalLabel}>Birth Hospital</div>
              <div className={styles.vitalValue}>{dependent.birthHospital || '—'}</div>
            </div>
          </div>

          {/* Allergies & Pediatric Notes */}
          {((dependent.allergies && dependent.allergies.length > 0) || dependent.pediatricNotes) && (
            <div className={styles.pediatricNotesBox}>
              {dependent.allergies && dependent.allergies.length > 0 && (
                <div style={{ marginBottom: dependent.pediatricNotes ? '6px' : '0' }}>
                  <strong>⚠️ Known Allergies:</strong>{' '}
                  {Array.isArray(dependent.allergies) ? dependent.allergies.join(', ') : dependent.allergies}
                </div>
              )}
              {dependent.pediatricNotes && (
                <div>
                  <strong>📝 Pediatric Clinical Notes:</strong> {dependent.pediatricNotes}
                </div>
              )}
            </div>
          )}

          {/* Immunization Milestones */}
          <div className={styles.vacHeader}>
            <h4>💉 Pediatric Immunization Milestones</h4>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {dependent.vaccinations?.completed || 0} completed /{' '}
              {(dependent.vaccinations?.completed || 0) + (dependent.vaccinations?.pending || 0)} total
            </span>
          </div>

          {vaccines.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
              No immunization milestones logged.
            </p>
          ) : (
            <ul className={styles.vacList}>
              {vaccines.map((v) => {
                const isDone = v.status === 'completed';
                const isDue = v.status === 'due';
                const statusClass = isDone
                  ? styles.statusCompleted
                  : isDue
                  ? styles.statusDue
                  : styles.statusUpcoming;

                return (
                  <li key={v._id || v.id} className={styles.vacItem}>
                    <div className={styles.vacInfo}>
                      <span className={styles.vacName}>{v.name}</span>
                      <span className={styles.vacMilestone}>
                        Target Milestone: <strong>{v.dueAge}</strong>
                        {v.administeredDate && (
                          <> • Administered on: {new Date(v.administeredDate).toLocaleDateString('en-IN')}</>
                        )}
                      </span>
                    </div>
                    <div className={styles.vacActions}>
                      <span className={`${styles.vacStatusPill} ${statusClass}`}>
                        {v.status}
                      </span>
                      {v._id && (
                        <button
                          type="button"
                          className={styles.markBtn}
                          disabled={updatingVacId === v._id}
                          onClick={() => handleToggleVaccine(v)}
                        >
                          {isDone ? 'Mark as Due' : '✓ Mark as Done'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
