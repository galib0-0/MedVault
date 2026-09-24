import React, { useEffect, useState } from 'react';
import { useAccess } from '../../context/AccessContext';

/**
 * PostAccessNotification Component
 * Displays post-access emergency record alert to patient after session ends.
 * Auto-dismisses after 10 seconds.
 */
export default function PostAccessNotification() {
  const { postAccessNotification, setPostAccessNotification, reportUnauthorizedAccess } = useAccess();
  const [reported, setReported] = useState(false);

  // Auto dismiss after 10 seconds
  useEffect(() => {
    if (!postAccessNotification) return;

    const timer = setTimeout(() => {
      setPostAccessNotification(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [postAccessNotification, setPostAccessNotification]);

  if (!postAccessNotification) return null;

  const handleReport = () => {
    reportUnauthorizedAccess(postAccessNotification.id, 'Unrecognized emergency access');
    setReported(true);

    setTimeout(() => {
      setPostAccessNotification(null);
    }, 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '340px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -10px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.2)',
        zIndex: 9998,
        padding: '16px 18px',
        animation: 'slideUp 0.3s ease-out forwards',
        fontFamily: 'inherit',
      }}
    >
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {reported ? (
        <div style={{ textAlign: 'center', color: '#15803d', fontSize: '13px', fontWeight: '700', padding: '8px 0' }}>
          ✅ Report submitted to MedVault Security Team.
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px' }}>🔴</span>
            <strong style={{ fontSize: '14px', color: '#dc2626' }}>Emergency Record Access Alert</strong>
          </div>

          <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 8px' }}>
            Your medical records were accessed under emergency authorization.
          </p>

          <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#0f172a', marginBottom: '10px' }}>
            <strong>👨‍⚕️ {postAccessNotification.doctorName}</strong>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{postAccessNotification.hospitalName}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              📅 {postAccessNotification.dateTime} · ⏱️ {postAccessNotification.duration} · 📄 {postAccessNotification.recordsViewedCount} viewed
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setPostAccessNotification(null)}
              style={{ flex: 1, background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
            >
              View Full Details
            </button>
            <button
              type="button"
              onClick={handleReport}
              style={{ flex: 1, background: '#dc2626', color: '#ffffff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              🚨 Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
