import React, { createContext, useContext, useState } from 'react';
import {
  DUMMY_DOCTOR_TRUST_SCORE,
  DUMMY_FLAGGED_ACCESSES,
  DUMMY_PATIENT_ACCESS_HISTORY,
  MOCK_DUMMY_PATIENT,
} from '../data/mockData';

const AccessContext = createContext(null);

export function AccessProvider({ children }) {
  // Session State
  const [sessionType, setSessionType] = useState('none'); // 'none' | 'emergency' | 'routine'
  const [activePatientSession, setActivePatientSession] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Trust Score State
  const [trustScore, setTrustScore] = useState(DUMMY_DOCTOR_TRUST_SCORE);

  // Pending OTP Access Request for Patient Popup
  const [pendingOtpRequest, setPendingOtpRequest] = useState(null);

  // Patient Access History List
  const [patientAccessHistory, setPatientAccessHistory] = useState(DUMMY_PATIENT_ACCESS_HISTORY);

  // Post Access Notification Popup for Patient
  const [postAccessNotification, setPostAccessNotification] = useState(null);

  // Flagged Access Review Queue for Admin
  const [flaggedQueue, setFlaggedQueue] = useState(DUMMY_FLAGGED_ACCESSES);

  // Trigger Simulated Routine Request (Manual Demo Button on Patient Dashboard)
  const triggerSimulatedRequest = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtpRequest({
      id: `otp-${Date.now()}`,
      otpCode: randomOtp,
      doctorName: 'Dr. Ravi Kumar',
      doctorSpecialty: 'Cardiologist',
      hospitalName: 'Apollo Hospitals, Hyderabad',
      purpose: 'Scheduled Consultation',
      duration: '30 minutes',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
    });
  };

  // Doctor initiates Routine Access Request
  const sendRoutineAccessRequest = (requestData) => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const req = {
      id: `otp-${Date.now()}`,
      otpCode: randomOtp,
      doctorName: requestData.doctorName || 'Dr. Medical Practitioner',
      doctorSpecialty: requestData.doctorSpecialty || 'Cardiologist',
      hospitalName: requestData.hospitalName || 'MedVault Medical Center',
      purpose: requestData.purpose || 'Scheduled Consultation',
      referringDoctor: requestData.referringDoctor || '',
      duration: requestData.duration || '30 minutes',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
      patient: requestData.patient || MOCK_DUMMY_PATIENT,
    };

    setPendingOtpRequest(req);
    return req;
  };

  // Patient approves OTP Request
  const approveRoutineOtp = () => {
    if (!pendingOtpRequest) return;

    setPendingOtpRequest((prev) => ({ ...prev, status: 'APPROVED' }));

    // Add entry to patient's Who Accessed My Records list
    const newEntry = {
      id: `acc-${Date.now()}`,
      accessType: 'Routine',
      doctorName: pendingOtpRequest.doctorName,
      specialty: pendingOtpRequest.doctorSpecialty,
      hospital: pendingOtpRequest.hospitalName,
      date: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: 'Ongoing',
      purpose: pendingOtpRequest.purpose,
      recordsViewedCount: 2,
      totalRecords: 12,
      status: 'Expected',
    };

    setPatientAccessHistory((prev) => [newEntry, ...prev]);

    // Auto-clear pending popup after 4s
    setTimeout(() => {
      setPendingOtpRequest(null);
    }, 4000);
  };

  // Patient denies OTP Request
  const denyRoutineOtp = () => {
    if (!pendingOtpRequest) return;
    setPendingOtpRequest((prev) => ({ ...prev, status: 'DENIED' }));

    setTimeout(() => {
      setPendingOtpRequest(null);
    }, 3000);
  };

  // End active session (routine or emergency)
  const endSession = (patient, type = 'routine', durationStr = '47 minutes') => {
    setActivePatientSession(null);
    setSessionType('none');

    // Trigger post-access notification to patient if emergency
    if (type === 'emergency') {
      setPostAccessNotification({
        id: `post-notif-${Date.now()}`,
        doctorName: 'Dr. Ravi Kumar',
        hospitalName: 'Apollo Hospitals, Hyderabad',
        dateTime: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        duration: durationStr,
        recordsViewedCount: 3,
      });
    }
  };

  // Patient reports unauthorized access
  const reportUnauthorizedAccess = (accessId, reason) => {
    setPatientAccessHistory((prev) =>
      prev.map((item) =>
        item.id === accessId ? { ...item, status: 'Reported', reportReason: reason } : item
      )
    );
  };

  // Admin updates flagged access status
  const updateFlaggedStatus = (flagId, action, note) => {
    setFlaggedQueue((prev) =>
      prev.map((item) => {
        if (item.id === flagId) {
          return {
            ...item,
            status:
              action === 'LEGITIMATE'
                ? 'LEGITIMATE'
                : action === 'WARNING'
                ? 'WARNING_ISSUED'
                : action === 'SUSPEND'
                ? 'SUSPENDED'
                : item.status,
            adminNote: note,
          };
        }
        return item;
      })
    );

    // Update Doctor Trust Score based on action
    if (action === 'LEGITIMATE') {
      setTrustScore((prev) => ({
        ...prev,
        score: Math.min(100, prev.score + 5),
        clearedFlags: prev.clearedFlags + 1,
      }));
    } else if (action === 'WARNING') {
      setTrustScore((prev) => ({
        ...prev,
        score: Math.max(0, prev.score - 10),
      }));
    } else if (action === 'SUSPEND') {
      setTrustScore((prev) => ({
        ...prev,
        score: 40,
        accessLevel: 'SUSPENDED',
      }));
    }
  };

  return (
    <AccessContext.Provider
      value={{
        sessionType,
        setSessionType,
        activePatientSession,
        setActivePatientSession,
        sessionSeconds,
        setSessionSeconds,
        trustScore,
        setTrustScore,
        pendingOtpRequest,
        setPendingOtpRequest,
        patientAccessHistory,
        setPatientAccessHistory,
        postAccessNotification,
        setPostAccessNotification,
        flaggedQueue,
        setFlaggedQueue,
        triggerSimulatedRequest,
        sendRoutineAccessRequest,
        approveRoutineOtp,
        denyRoutineOtp,
        endSession,
        reportUnauthorizedAccess,
        updateFlaggedStatus,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
}
