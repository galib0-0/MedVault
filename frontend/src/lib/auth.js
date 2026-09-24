import { api } from './api';

const SESSION_KEY = 'medvault_session';

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function fileMeta(file) {
  if (!file || typeof file === 'string') return null;
  return { name: file.name, type: file.type, size: file.size };
}

function sessionFrom(user, token) {
  return {
    token,
    email: user.email,
    name: user.fullName || user.name,
    fullName: user.fullName,
    role: user.role,
    verificationStatus: user.verificationStatus,
    medvaultId: user.medvaultId,
    profile: user.profile || {},
    hospitalName: user.profile?.hospitalName,
    specialization: user.profile?.specialization,
  };
}

export async function signupPatient(payload) {
  const data = await api('/auth/signup/patient', {
    method: 'POST',
    body: payload,
  });
  const session = sessionFrom(data.user, data.token);
  write(SESSION_KEY, session);
  return session;
}

export async function signupDoctor(payload) {
  const body = {
    ...payload,
    profilePhoto: fileMeta(payload.profilePhoto),
    registrationCertificate: fileMeta(payload.registrationCertificate),
    degreeCertificate: fileMeta(payload.degreeCertificate),
    professionalId: fileMeta(payload.professionalId),
  };
  const data = await api('/auth/signup/doctor', {
    method: 'POST',
    body,
  });
  const session = sessionFrom(data.user, data.token);
  write(SESSION_KEY, session);
  return session;
}

export async function login({ email, password }) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  const session = sessionFrom(data.user, data.token);
  write(SESSION_KEY, session);
  return session;
}

export async function updateProfile(payload) {
  const session = getSession();
  const data = await api('/auth/me/profile', {
    method: 'PATCH',
    body: payload,
    token: session ? session.token : undefined,
  });
  const next = sessionFrom(data.user, session.token);
  write(SESSION_KEY, next);
  return next;
}

export function getSession() {
  return read(SESSION_KEY);
}

export function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}