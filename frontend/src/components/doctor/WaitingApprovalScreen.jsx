import React, { useState, useEffect } from 'react';
import { XCloseIcon, CheckCircleIcon, AlertIcon, ClockIcon } from '../icons';
import styles from '../../pages/doctor/doctor.module.css';

/**
 * WaitingApprovalScreen Component
 * Displays real-time OTP approval waiting state with 10-minute timer, progress bar,
 * 3 channel indicators, and state handling (Approved, Denied, Expired, Cancelled).
 */
export default function WaitingApprovalScreen({
  patient,
  requestData,
  onApproved,
  onDenied,
  onExpired,
  onCancelled,
  onSwitchEmergency,
}) {
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes countdown
  const [approvalState, setApprovalState] = useState('WAITING'); // 'WAITING' | 'APPROVED' | 'DENIED' | 'EXPIRED'

  // Timer countdown with useEffect cleanup
  useEffect(() => {
    if (approvalState !== 'WAITING') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setApprovalState('EXPIRED');
          if (onExpired) onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [approvalState, onExpired]);

  // DEMO SIMULATION: In production, this state change comes from WebSocket/real-time backend event
  useEffect(() => {
    if (approvalState !== 'WAITING') return;

    const demoTimer = setTimeout(() => {
      // PRODUCTION: Replace with real-time WebSocket / SSE listener
      // DEMO: Auto-approve after 8 seconds of waiting
      setApprovalState('APPROVED');
    }, 8000);

    return () => clearTimeout(demoTimer);
  }, [approvalState]);

  // Auto-close after approval after 3 seconds
  useEffect(() => {
    if (approvalState === 'APPROVED') {
      const closeTimer = setTimeout(() => {
        if (onApproved) onApproved();
      }, 3000);
      return () => clearTimeout(closeTimer);
    }
  }, [approvalState, onApproved]);

  const formatMmSs = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress Bar color calculation
  const percentage = (secondsLeft / 600) * 100;
  const progressColor =
    secondsLeft > 300 ? '#16a34a' : secondsLeft > 180 ? '#d97706' : '#dc2626';

  return (
    <div style={{ textAlign: 'center', padding: '16px 8px' }}>
      {/* STATE 1: WAITING FOR PATIENT APPROVAL */}
      {approvalState === 'WAITING' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Pulsing Blue Spinner */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '5px solid #dbeafe',
              borderTopColor: '#2563eb',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
              ⏳ Waiting for Patient Approval
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              An OTP has been sent to <strong>{patient?.fullName || 'the patient'}</strong> via:
            </p>
          </div>

          {/* 3 Channel Indicators */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              width: '100%',
              maxWidth: '440px',
              margin: '8px 0',
            }}
          >
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px' }}>📱</div>
              <strong style={{ fontSize: '12px', display: 'block', color: '#0f172a', marginTop: '2px' }}>SMS</strong>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>+91 ****3210</span>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', display: 'block', marginTop: '4px' }}>Sent ✅</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px' }}>✉️</div>
              <strong style={{ fontSize: '12px', display: 'block', color: '#0f172a', marginTop: '2px' }}>Email</strong>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>mat***@gmail</span>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', display: 'block', marginTop: '4px' }}>Sent ✅</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px' }}>🔔</div>
              <strong style={{ fontSize: '12px', display: 'block', color: '#0f172a', marginTop: '2px' }}>In-App</strong>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>MedVault App</span>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', display: 'block', marginTop: '4px' }}>Sent ✅</span>
            </div>
          </div>

          {/* Timer & Depleting Progress Bar */}
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: progressColor, marginBottom: '6px' }}>
              <span>Request expires in:</span>
              <span>{formatMmSs(secondsLeft)}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: progressColor,
                  transition: 'width 1s linear, background-color 0.3s ease',
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0' }}>
            Simulating live response (will auto-approve in ~8 seconds for demo)...
          </p>

          <button
            type="button"
            onClick={onCancelled}
            style={{
              background: 'transparent',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              padding: '8px 18px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* STATE A — APPROVED */}
      {approvalState === 'APPROVED' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ fontSize: '56px', color: '#16a34a', animation: 'popIn 0.3s ease-out' }}>✅</div>
          <style>{`@keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.15); } 100% { transform: scale(1); } }`}</style>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', margin: '0 0 6px' }}>
              Access Granted!
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
              <strong>{patient?.fullName || 'Patient'}</strong> approved your request.
            </p>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              OTP verified successfully.
            </span>
          </div>

          <button
            type="button"
            onClick={onApproved}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
            }}
          >
            View Patient Records →
          </button>
        </div>
      )}

      {/* STATE B — DENIED */}
      {approvalState === 'DENIED' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ fontSize: '56px', color: '#dc2626' }}>❌</div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626', margin: '0 0 6px' }}>
              Access Denied
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
              <strong>{patient?.fullName || 'Patient'}</strong> declined your access request.
            </p>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              If this is a medical emergency, use Emergency Access.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onDenied}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={onSwitchEmergency}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Switch to Emergency Access
            </button>
          </div>
        </div>
      )}

      {/* STATE C — EXPIRED */}
      {approvalState === 'EXPIRED' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ fontSize: '56px', color: '#64748b' }}>⏰</div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#475569', margin: '0 0 6px' }}>
              Request Expired
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              No response received within 10 minutes.
            </p>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              Would you like to send another request?
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onDenied}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setSecondsLeft(600);
                setApprovalState('WAITING');
              }}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Resend Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
