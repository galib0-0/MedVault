const keyFor = (email) => `medvault_uploads_${(email || '').trim().toLowerCase()}`;

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getUploads(email) {
  try {
    const list = JSON.parse(localStorage.getItem(keyFor(email)));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeUploads(email, list) {
  localStorage.setItem(keyFor(email), JSON.stringify(list));
}

export function addUpload(email, { name, type, size, category, aiStatus = 'ready' }) {
  const list = getUploads(email);
  const record = {
    id: Date.now(),
    name,
    type: category || type || 'Other Documents',
    doctor: 'Added by you',
    hospital: 'MedVault Records',
    date: todayLabel(),
    aiStatus,
    critical: false,
    size,
  };
  const next = [record, ...list];
  writeUploads(email, next);
  return record;
}