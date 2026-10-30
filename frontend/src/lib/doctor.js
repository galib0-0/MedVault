import { api, tokenFromSession } from './api';

export async function searchPatients(query) {
  const token = tokenFromSession();
  return api(`/doctor/patients/search?q=${encodeURIComponent(query)}`, { token });
}

export async function requestEmergencyAccess({ patientId, medvaultId, reason, customExplanation }) {
  const token = tokenFromSession();
  return api('/doctor/emergency-access', {
    method: 'POST',
    token,
    body: { patientId, medvaultId, reason, customExplanation },
  });
}

export async function getPatientRecords(patientId) {
  const token = tokenFromSession();
  return api(`/doctor/patients/${patientId}/records`, { token });
}

export async function addDoctorNote(patientId, { note, category }) {
  const token = tokenFromSession();
  return api(`/doctor/patients/${patientId}/notes`, {
    method: 'POST',
    token,
    body: { note, category },
  });
}

export async function getDoctorNotes(patientId) {
  const token = tokenFromSession();
  return api(`/doctor/patients/${patientId}/notes`, { token });
}

export async function createAccessRequest({ patientId, medvaultId, purpose, notes, duration }) {
  const token = tokenFromSession();
  return api('/doctor/access-requests', {
    method: 'POST',
    token,
    body: { patientId, medvaultId, purpose, notes, duration },
  });
}

export async function checkAccessRequestStatus(requestId) {
  const token = tokenFromSession();
  return api(`/doctor/access-requests/${requestId}/status`, { token });
}

export async function cancelAccessRequest(requestId) {
  const token = tokenFromSession();
  return api(`/doctor/access-requests/${requestId}/cancel`, {
    method: 'POST',
    token,
  });
}

