export function required(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export function isIndianMobile(value) {
  return /^[6-9]\d{9}$/.test(String(value).replace(/\s/g, ''));
}

export function isPinCode(value) {
  return /^[1-9]\d{5}$/.test(String(value).trim());
}

export function isPassword(value) {
  const v = String(value);
  return v.length >= 8 && /[a-zA-Z]/.test(v) && /\d/.test(v);
}

export function passwordStrength(value) {
  const v = String(value);
  let score = 0;
  if (v.length >= 8) score += 1;
  if (v.length >= 12) score += 1;
  if (/[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;
  return score;
}

export function isDateOfBirth(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (d > now) return false;
  const age = (now - d) / (365.25 * 24 * 3600 * 1000);
  return age >= 0 && age <= 120;
}

export function isNotFutureDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return d <= new Date();
}

export function isYear(value) {
  const y = Number(value);
  if (!/^\d{4}$/.test(String(value).trim())) return false;
  const max = new Date().getFullYear();
  return y >= 1950 && y <= max;
}

export function isRegistrationNumber(value) {
  return /^[A-Za-z0-9][A-Za-z0-9/\- ]{3,19}$/.test(String(value).trim());
}

export function matches(a, b) {
  return String(a) === String(b);
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function isAllowedFileType(file) {
  if (!file) return false;
  return ALLOWED_FILE_TYPES.includes(file.type);
}

export function isFileSizeOk(file, maxMb = 5) {
  if (!file) return false;
  return file.size <= maxMb * 1024 * 1024;
}
