import React, { useState } from 'react';
import { useAccess } from '../context/AccessContext';
import Logo from '../components/Logo';
import PillButton from '../components/PillButton';
import { SearchIcon, ShieldIcon, XCloseIcon } from '../components/icons';
import styles from './doctor/doctor.module.css';

/**
 * AdminReviewQueue Page Component
 * Allows administrators to review automatically flagged suspicious emergency accesses,
 * inspect anomaly detection details, clear flags, issue warnings, or suspend doctor accounts.
 */
export default function AdminReviewQueue() {
  const { flaggedQueue, updateFlaggedStatus } = useAccess();
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'FLAGGED' | 'REVIEW'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogModal, setSelectedLogModal] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'LEGITIMATE'|'WARNING'|'SUSPEND', flagId, doctorName }
  const [actionReason, setActionReason] = useState('');

  // Filtered queue items
  const filteredItems = flaggedQueue.filter((item) => {
    if (filterSeverity !== 'ALL' && item.severity !== filterSeverity) return false;
    if (searchTerm && !item.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!actionModal) return;

    updateFlaggedStatus(actionModal.flagId, actionModal.type, actionReason);
    setActionModal(null);
    setActionReason('');
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <Logo withText className={styles.logo} />
          <span className={styles.portalTag} style={{ background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}>
            Admin Portal
          </span>
        </div>

        <div className={styles.topRight}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
            Administrator Portal Access
          </span>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <main className={styles.contentArea}>
          {/* Header */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <div style={{ fontSize: '28px' }}>🚨</div>
                <div>
                  <h2 style={{ fontSize: '22px', margin: 0 }}>Flagged Access Review Queue</h2>
                  <p className={styles.subtitle}>
                    Automatically detected suspicious access patterns requiring human administrative review.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Total Flagged</span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>🔴 5</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '14px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '11px', color: '#991b1b', textTransform: 'uppercase', fontWeight: '700' }}>Critical</span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>🚨 2</div>
              </div>
              <div style={{ background: '#fffbe8', padding: '16px', borderRadius: '14px', border: '1px solid #fef3c7' }}>
                <span style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase', fontWeight: '700' }}>Pending Review</span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>🟡 3</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: '700' }}>Resolved Today</span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>✅ 8</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['ALL', 'CRITICAL', 'FLAGGED', 'REVIEW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    style={{
                      background: filterSeverity === sev ? '#0f172a' : '#f1f5f9',
                      color: filterSeverity === sev ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {sev === 'ALL' ? 'All' : sev === 'CRITICAL' ? '🚨 Critical' : sev === 'FLAGGED' ? '🔴 Flagged' : '🟡 Review'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className={styles.searchInputWrap} style={{ width: '260px' }}>
                  <SearchIcon className={styles.searchIconInside} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Access Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredItems.map((item) => {
              const isCrit = item.severity === 'CRITICAL';
              const isFlag = item.severity === 'FLAGGED';
              const headerBg = isCrit ? '#dc2626' : isFlag ? '#ea580c' : '#d97706';

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {/* Severity Header */}
                  <div style={{ background: headerBg, color: '#ffffff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>
                      {isCrit ? '🚨 CRITICAL' : isFlag ? '🔴 FLAGGED' : '🟡 REVIEW'} — Risk Score: {item.riskScore} / 100
                    </span>
                    <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                      Status: {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Doctor & Patient Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>
                          {item.doctorName} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal' }}>({item.specialization})</span>
                        </h3>
                        <div style={{ fontSize: '12px', color: '#475569' }}>{item.hospitalName}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#0f172a' }}>
                          Accessed: <strong>{item.patientName}</strong> ({item.patientMedvaultId})
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          Time: {item.dateTime} · Duration: {item.duration}
                        </div>
                      </div>
                    </div>

                    {/* Flag Reasons Bullet List */}
                    <div>
                      <strong style={{ fontSize: '13px', color: '#dc2626', display: 'block', marginBottom: '6px' }}>
                        🚩 Flag Reasons Detected:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {item.flagReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Admin Actions */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                      <button
                        type="button"
                        onClick={() => setActionModal({ type: 'LEGITIMATE', flagId: item.id, doctorName: item.doctorName })}
                        style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '8px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✅ Mark Legitimate
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionModal({ type: 'WARNING', flagId: item.id, doctorName: item.doctorName })}
                        style={{ background: '#fffbe8', color: '#b45309', border: '1px solid #fef3c7', padding: '8px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ⚠️ Issue Warning
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionModal({ type: 'SUSPEND', flagId: item.id, doctorName: item.doctorName })}
                        style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                      >
                        🔴 Suspend Account
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedLogModal(item)}
                        style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '10px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' }}
                      >
                        📋 View Full Log
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* View Full Log Modal */}
      {selectedLogModal && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedLogModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '580px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>Detailed Access File Log</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Doctor: <strong>{selectedLogModal.doctorName}</strong> · Patient: <strong>{selectedLogModal.patientName}</strong>
            </p>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '12px', margin: '14px 0' }}>
              <div>📱 <strong>Device:</strong> {selectedLogModal.deviceInfo}</div>
              <div>📍 <strong>Location:</strong> {selectedLogModal.location}</div>
            </div>

            <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Files Opened:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedLogModal.fileLogs?.map((file, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📄 {file.name}</span>
                  <span style={{ color: '#64748b' }}>Opened at {file.openedAt} ({file.duration})</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setSelectedLogModal(null)}
                style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Action Prompt Modal */}
      {actionModal && (
        <div className={styles.modalBackdrop} onClick={() => setActionModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>
              {actionModal.type === 'LEGITIMATE'
                ? 'Mark Access as Legitimate'
                : actionModal.type === 'WARNING'
                ? 'Issue Warning to Doctor'
                : 'Suspend Doctor Account'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
              Doctor: <strong>{actionModal.doctorName}</strong>
            </p>

            <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>
                {actionModal.type === 'LEGITIMATE'
                  ? 'Reason for clearing flag *'
                  : actionModal.type === 'WARNING'
                  ? 'Warning message to doctor *'
                  : 'Suspension reason *'}
              </label>
              <textarea
                className={styles.textarea}
                rows="3"
                placeholder="Enter details..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: actionModal.type === 'LEGITIMATE' ? '#16a34a' : actionModal.type === 'WARNING' ? '#b45309' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
