import React, { useState, useEffect } from 'react';
import { useAccess } from '../../context/AccessContext';
import Logo from '../Logo';

/**
 * OTPApprovalPopup Component
 * Google 2-Step Verification style real-time prompt for patient authorization.
 * Displays immediate Allow / Deny options with zero OTP required.
 */
export default function OTPApprovalPopup() {
  const { pendingOtpRequest, approveRoutineOtp, denyRoutineOtp } = useAccess();
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes
  const [isProcessing, setIsProcessing] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!pendingOtpRequest || pendingOtpRequest.status !== 'PENDING') return;

    setSecondsLeft(600);
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
  }, [pendingOtpRequest?.id, pendingOtpRequest?.status]);

  if (!pendingOtpRequest) return null;

  const formatMmSs = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const percentage = (secondsLeft / 600) * 100;

  const handleAllow = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await approveRoutineOtp();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await denyRoutineOtp();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Dim backdrop to give it high-priority Google 2-Step prompt focus */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9998,
          animation: 'fadeIn 0.25s ease-out forwards',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '92%',
          maxWidth: '430px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(15, 23, 42, 0.08)',
          zIndex: 9999,
          padding: '24px',
          animation: 'promptPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          fontFamily: 'inherit',
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes promptPop { 
            0% { transform: translate(-50%, -46%) scale(0.92); opacity: 0; } 
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 
          }
        `}</style>

        {/* SUCCESS / APPROVED STATE */}
        {pendingOtpRequest.status === 'APPROVED' ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                fontSize: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a', margin: '0 0 6px' }}>
              Access Allowed
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 8px', lineHeight: '1.4' }}>
              <strong>{pendingOtpRequest.doctorName}</strong> can now view your medical records in real time.
            </p>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
              Logged to your permanent security access history.
            </span>
          </div>
        ) : pendingOtpRequest.status === 'DENIED' ? (
          /* DENIED STATE */
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                fontSize: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)',
              }}
            >
              ✕
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', margin: '0 0 6px' }}>
              Access Denied
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', margin: 0, lineHeight: '1.4' }}>
              You denied access to <strong>{pendingOtpRequest.doctorName}</strong>. The doctor has been notified.
            </p>
          </div>
        ) : (
          /* GOOGLE 2-STEP AUTH PROMPT STATE (NO OTP) */
          <div>
            {/* Security Top Badge & Logo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Logo style={{ height: '26px' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.04em' }}>
                  SECURITY PROMPT
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#2563eb',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    display: 'inline-block',
                    boxShadow: '0 0 8px #2563eb',
                  }}
                />
                Live 2-Step Auth
              </span>
            </div>

            {/* Prompt Heading (Google Style) */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '38px', marginBottom: '4px' }}>🛡️</div>
              <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                Allow medical record access?
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                A doctor is requesting permission to open your health records.
              </p>
            </div>

            {/* Doctor Info Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    flexShrink: 0,
                  }}
                >
                  🩺
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {pendingOtpRequest.doctorName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {pendingOtpRequest.doctorSpecialty} • {pendingOtpRequest.hospitalName}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#15803d',
                  fontWeight: '700',
                  background: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                ✓ Verified Medical Practitioner
              </div>
            </div>

            {/* Request Specifics */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '13px',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Purpose:</span>
                <strong style={{ color: '#0f172a' }}>{pendingOtpRequest.purpose}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Duration:</span>
                <strong style={{ color: '#0f172a' }}>{pendingOtpRequest.duration}</strong>
              </div>
              {pendingOtpRequest.notes && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '6px', marginTop: '2px' }}>
                  <span style={{ color: '#64748b' }}>Notes:</span>
                  <span style={{ color: '#0f172a', fontStyle: 'italic', maxWidth: '65%', textAlign: 'right' }}>
                    {pendingOtpRequest.notes}
                  </span>
                </div>
              )}
            </div>

            {/* Security Caution Notice */}
            <div
              style={{
                fontSize: '11px',
                color: '#92400e',
                background: '#fef3c7',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #fde68a',
                marginBottom: '16px',
                lineHeight: '1.45',
              }}
            >
              ⚠️ <strong>Only tap Allow</strong> if you are currently in an active consultation with this doctor.
            </div>

            {/* Timer countdown progress bar */}
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}
              >
                <span>Prompt expires in:</span>
                <strong style={{ color: secondsLeft < 120 ? '#dc2626' : '#2563eb' }}>
                  {formatMmSs(secondsLeft)}
                </strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: secondsLeft < 120 ? '#dc2626' : '#2563eb',
                    transition: 'width 1s linear',
                  }}
                />
              </div>
            </div>

            {/* 2-Step Action Buttons: DENY / ALLOW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDeny}
                style={{
                  background: '#ffffff',
                  color: '#dc2626',
                  border: '1.5px solid #fca5a5',
                  padding: '13px 16px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, transform 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#fef2f2')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                ✕ Deny
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleAllow}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px 16px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                  transition: 'background 0.2s, transform 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#15803d')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#16a34a')}
              >
                ✓ Allow
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
