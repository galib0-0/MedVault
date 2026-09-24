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
