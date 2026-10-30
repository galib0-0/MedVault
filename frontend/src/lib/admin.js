import { api, tokenFromSession } from './api';

export async function getAdminDoctors(status) {
  const token = tokenFromSession();
  const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
  return api(`/admin/doctors${query}`, { token });
}

export async function verifyDoctor(doctorId, { status, notes }) {
  const token = tokenFromSession();
  return api(`/admin/doctors/${doctorId}/verify`, {
    method: 'PATCH',
    token,
    body: { status, notes },
  });
}

export async function getAdminAuditLogs() {
  const token = tokenFromSession();
  return api('/admin/audit-logs', { token });
}
