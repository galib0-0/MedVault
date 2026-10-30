import { api, tokenFromSession } from './api';

export async function getRecords() {
  const token = tokenFromSession();
  const data = await api('/records', { token });
  return data.records || [];
}

export async function uploadRecord({ file, category }) {
  const token = tokenFromSession();
  const form = new FormData();
  form.append('file', file);
  if (category) form.append('category', category);

  let res;
  try {
    res = await fetch('/api/records', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Upload failed.');
    err.status = res.status;
    throw err;
  }
  return data.record;
}

export async function getPendingAccessRequest() {
  const token = tokenFromSession();
  if (!token) return null;
  try {
    const data = await api('/records/access-requests/pending', { token });
    return data.request || null;
  } catch {
    return null;
  }
}

export async function respondToAccessRequest(requestId, action) {
  const token = tokenFromSession();
  return api(`/records/access-requests/${requestId}/respond`, {
    method: 'POST',
    token,
    body: { action },
  });
}

export async function translateRecordSummary({ text, language, recordId }) {
  const token = tokenFromSession();
  return api('/records/translate', {
    method: 'POST',
    token,
    body: { text, language, recordId },
  });
}

export async function syncMedications(recordId) {
  const token = tokenFromSession();
  return api(`/records/${recordId}/sync-medications`, {
    method: 'POST',
    token,
  });
}


