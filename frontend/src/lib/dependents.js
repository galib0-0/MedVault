import { api, tokenFromSession } from './api';

export async function getDependents() {
  const token = tokenFromSession();
  return api('/dependents', { token });
}

export async function createDependent(payload) {
  const token = tokenFromSession();
  return api('/dependents', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateDependent(dependentId, payload) {
  const token = tokenFromSession();
  return api(`/dependents/${dependentId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function updateVaccination(dependentId, vacId, payload) {
  const token = tokenFromSession();
  return api(`/dependents/${dependentId}/vaccinations/${vacId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function transitionIndependent(dependentId) {
  const token = tokenFromSession();
  return api(`/dependents/${dependentId}/transition-independent`, {
    method: 'POST',
    token,
  });
}

export async function deleteDependent(dependentId) {
  const token = tokenFromSession();
  return api(`/dependents/${dependentId}`, {
    method: 'DELETE',
    token,
  });
}
