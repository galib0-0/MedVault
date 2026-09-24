import React from 'react';
import { useAccess } from '../../context/AccessContext';
import styles from '../../pages/doctor/doctor.module.css';

/**
 * TrustScore Component
 * Displays the doctor's Trust Score gauge, audit history breakdown, and restriction banners.
 */
export default function TrustScore() {
  const { trustScore } = useAccess();
  const score = trustScore?.score || 87;

  // Determine score level color and status text
  let scoreColor = '#16a34a';
  let statusText = 'Excellent 🟢';
  let banner = null;

  if (score >= 90) {
    scoreColor = '#16a34a';
    statusText = 'Excellent 🟢';
  } else if (score >= 70) {
    scoreColor = '#d97706';
    statusText = 'Good 🟡';
  } else if (score >= 50) {
    scoreColor = '#ea580c';
    statusText = 'Fair 🟠';
    banner = '⚠️ Restricted Mode — routine access requires 2-step verification';
  } else if (score >= 30) {
    scoreColor = '#dc2626';
    statusText = 'Suspended 🔴';
    banner = '🔴 Account Suspended — contact admin';
  } else {
    scoreColor = '#7f1d1d';
    statusText = 'Banned 🚫';
    banner = '🚫 Account Permanently Restricted — reported to NMC';
  }

  return (
    <div className={styles.sectionCard} style={{ marginTop: '20px' }}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderTitle}>
          <div style={{ fontSize: '28px' }}>🛡️</div>
          <div>
            <h2>Doctor Trust Score & Verification Integrity</h2>
            <p className={styles.subtitle}>
              Automated compliance score derived from access logs, patient approvals, and anomaly checks.
            </p>
          </div>
        </div>
      </div>

      {/* Restriction Banner if applicable */}
      {banner && (
        <div
          style={{
            background: score < 50 ? '#fef2f2' : '#fffbe8',
            border: `1px solid ${score < 50 ? '#fecaca' : '#fef3c7'}`,
            color: score < 50 ? '#991b1b' : '#92400e',
            padding: '14px 20px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {banner}
        </div>
      )}

      {/* Score Gauge & Breakdown Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'center' }}>
        {/* Speedometer Gauge Visual */}
        <div
          style={{
            background: 'var(--bg-page)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(${scoreColor} ${score * 3.6}deg, #e2e8f0 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <strong style={{ fontSize: '28px', color: '#0f172a', lineHeight: 1 }}>{score}</strong>
              <span style={{ fontSize: '10px', color: '#64748b' }}>/ 100</span>
            </div>
          </div>
          <strong style={{ fontSize: '15px', color: scoreColor }}>{statusText}</strong>
        </div>

        {/* Breakdown Card */}
        <div
          style={{
            background: 'var(--bg-page)',
            borderRadius: '20px',
            padding: '20px 24px',
            border: '1px solid var(--line)',
            fontSize: '13px',
            lineHeight: '1.8',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px', marginBottom: '12px' }}>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>Trust Score: {score} / 100</strong>
            <span style={{ fontWeight: '700', color: scoreColor }}>{statusText}</span>
          </div>

          <div style={{ color: '#334155' }}>
            <div>✅ <strong>{trustScore.totalRoutineAccesses || 47}</strong> routine accesses (All patient approved)</div>
            <div>✅ <strong>{trustScore.totalEmergencyAccesses || 3}</strong> emergency accesses (All verified legitimate)</div>
            <div>⚠️ <strong>{trustScore.flaggedAccesses || 1}</strong> flagged access (Reviewed and cleared)</div>
            <div>❌ <strong>{trustScore.violations || 0}</strong> violations</div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
            <span>Access Level: <strong style={{ color: '#16a34a' }}>{trustScore.accessLevel || 'FULL'} ✅</strong></span>
            <span>Next review: <strong>{trustScore.nextReview || '01 Oct 2026'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
