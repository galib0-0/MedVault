import React, { useState, useEffect } from 'react';
import { useAccess } from '../../context/AccessContext';
import Logo from '../Logo';

/**
 * OTPApprovalPopup Component
 * Microsoft/Google Authenticator style floating bottom-right popup for patient in-app OTP authorization.
 */
export default function OTPApprovalPopup() {
  const { pendingOtpRequest, approveRoutineOtp, denyRoutineOtp } = useAccess();
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes
  const [confirmDeny, setConfirmDeny] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!pendingOtpRequest || pendingOtpRequest.status !== 'PENDING') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingOtpRequest]);

  if (!pendingOtpRequest) return null;

  const formatMmSs = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const percentage = (secondsLeft / 600) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '380px',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.1)',
        zIndex: 9999,
        padding: '20px',
        animation: 'slideInRight 0.3s ease-out forwards',
        fontFamily: 'inherit',
      }}
    >
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* SUCCESS STATE */}
      {pendingOtpRequest.status === 'APPROVED' ? (
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div style={{ fontSize: '48px', color: '#16a34a', marginBottom: '8px' }}>✅</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a', margin: '0 0 4px' }}>
            Access Approved
          </h3>
          <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 4px' }}>
            <strong>{pendingOtpRequest.doctorName}</strong> can now view your records.
          </p>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            You will be notified when the session ends.
          </span>
        </div>
      ) : pendingOtpRequest.status === 'DENIED' ? (
        /* DENIED STATE */
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div style={{ fontSize: '48px', color: '#dc2626', marginBottom: '8px' }}>❌</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626', margin: '0 0 4px' }}>
            Access Denied
          </h3>
          <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
            <strong>{pendingOtpRequest.doctorName}</strong> has been notified.
          </p>
        </div>
      ) : (
        /* PENDING REQUEST STATE */
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Logo style={{ height: '24px' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Record Access Request</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} /> 🔴 New Request
            </span>
          </div>

          {/* Doctor Info Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
              👨‍⚕️ {pendingOtpRequest.doctorName}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
              {pendingOtpRequest.doctorSpecialty} • {pendingOtpRequest.hospitalName}
            </div>
            <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 6px', borderRadius: '6px' }}>
              Verified Medical Practitioner ✅
            </span>
          </div>

          {/* Details */}
          <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
            <div>📋 <strong>Purpose:</strong> {pendingOtpRequest.purpose}</div>
            <div>⏱️ <strong>Estimated Duration:</strong> {pendingOtpRequest.duration}</div>
            <div>📅 <strong>Requested at:</strong> {pendingOtpRequest.requestedAt}</div>
          </div>

          {/* OTP Display Box */}
          <div
            style={{
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '12px',
              boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.4)',
            }}
          >
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Your Access Code
            </span>
            <div style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '0.3em', margin: '8px 0', color: '#60a5fa' }}>
              {pendingOtpRequest.otpCode.slice(0, 3)} {pendingOtpRequest.otpCode.slice(3)}
            </div>
            <span style={{ fontSize: '10px', color: '#cbd5e1' }}>
              Share this code with the doctor only if you recognize this request
            </span>
          </div>

          {/* Warning text */}
          <div style={{ fontSize: '11px', color: '#d97706', background: '#fffbe8', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef3c7', marginBottom: '12px', lineHeight: '1.4' }}>
            ⚠️ Never share this code if you didn't initiate this appointment. MedVault AI staff will never ask for this code.
          </div>

          {/* Timer */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
              <span>Code expires in:</span>
              <strong style={{ color: '#dc2626' }}>{formatMmSs(secondsLeft)}</strong>
            </div>
            <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${percentage}%`, height: '100%', background: '#dc2626', transition: 'width 1s linear' }} />
            </div>
          </div>

          {/* Confirmation step for Deny */}
          {confirmDeny ? (
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#991b1b', margin: '0 0 10px', fontWeight: '600' }}>
                Deny this request? The doctor will be notified.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setConfirmDeny(false)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={denyRoutineOtp}
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Yes, Deny
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={approveRoutineOtp}
                style={{
                  width: '100%',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                }}
              >
                ✅ Approve — Share Code with Doctor
              </button>

              <button
                type="button"
                onClick={() => setConfirmDeny(true)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ❌ Deny Access
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
