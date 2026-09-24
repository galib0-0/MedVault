import React, { useState } from 'react';
import { useAccess } from '../../context/AccessContext';
import styles from '../../pages/patient/patient.module.css';

const REPORT_REASONS = [
  "I didn't have an appointment with this doctor",
  'I denied this request but access happened anyway',
  "I don't recognize this doctor",
  'Other',
];

/**
 * AccessHistorySection Component
 * Displays "Who Accessed My Records" list with 🔵 Routine & 🔴 Emergency badges,
 * and allows reporting unauthorized accesses.
 */
export default function AccessHistorySection() {
  const { patientAccessHistory, reportUnauthorizedAccess } = useAccess();
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportSubmittedMsg, setReportSubmittedMsg] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!selectedReportId) return;

    reportUnauthorizedAccess(selectedReportId, reportReason);
    setReportSubmittedMsg(true);

    setTimeout(() => {
      setReportSubmittedMsg(false);
      setSelectedReportId(null);
    }, 2500);
  };

  return (
    <div className={styles.card} id="access-history">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>👁️ Who Accessed My Records</h3>
          <p className={styles.cardSub}>
            Full transparency — every access to your medical records is logged here.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {patientAccessHistory.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {/* Access Type Badge */}
              <span
                style={{
                  background: item.accessType === 'Routine' ? '#dbeafe' : '#fee2e2',
                  color: item.accessType === 'Routine' ? '#1e40af' : '#dc2626',
                  fontWeight: '700',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.accessType === 'Routine' ? '🔵 Routine' : '🔴 Emergency'}
              </span>

              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>{item.doctorName}</h4>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                  {item.specialty} • {item.hospital}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '10px',
                  }}
                >
                  <span>📅 {item.date}</span>
                  <span>⏱️ Duration: {item.duration}</span>
                  <span>📋 Purpose: {item.purpose}</span>
                  <span>📄 Viewed: {item.recordsViewedCount} of {item.totalRecords} records</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {item.status === 'Reported' ? (
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '700', background: '#fee2e2', padding: '6px 12px', borderRadius: '8px' }}>
                  🚨 Reported
                </span>
              ) : (
                <>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '6px 12px', borderRadius: '8px' }}>
                    ✅ Expected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedReportId(item.id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #fca5a5',
                      color: '#dc2626',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🚨 Report Unauthorized
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {selectedReportId && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: '#0f172a' }}>
              Report Unauthorized Access
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
              Why do you want to report this access?
            </p>

            {reportSubmittedMsg ? (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '14px', borderRadius: '10px', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>
                ✅ Report submitted. Our security team will review this within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {REPORT_REASONS.map((r) => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={reportReason === r}
                      onChange={() => setReportReason(r)}
                    />
                    <span>{r}</span>
                  </label>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedReportId(null)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
