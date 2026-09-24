import { useEffect, useState } from 'react';
import * as demo from './data';
import { getRecords } from '../../lib/records';

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function fmtDate(value) {
  if (!value || value === 'Not added') return 'Not added';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function profileFromSession(session) {
  const p = session?.profile || {};
  const name = session?.name || '';
  return {
    name,
    firstName: name.split(' ')[0] || name,
    email: session?.email || '',
    medvaultId: session?.medvaultId || '—',
    dob: fmtDate(p.dob),
    gender: p.gender || 'Not added',
    mobile: p.mobile || 'Not added',
    bloodGroup: p.bloodGroup || '—',
    organDonor: p.organDonor === true,
    address: p.address || '',
    city: p.city || '',
    state: p.state || '',
    pinCode: p.pinCode || '',
    allergies: list(p.allergies),
    medications: list(p.medications),
    conditions: list(p.medicalConditions),
    emergencyContact: {
      name: p.emergencyContactName || 'Not added',
      relation: p.emergencyContactRelationship || '',
      phone: p.emergencyContactNumber || '',
    },
  };
}

function ageFromDob(dob) {
  if (!dob || dob === 'Not added') return '';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '';
  let age = new Date().getFullYear() - d.getFullYear();
  const m = new Date().getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) age -= 1;
  return `${age} years`;
}

function recordLabel(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function summaryFromRecord(record) {
  if (!record || !record.aiSummary) return null;
  return {
    reportName: record.name,
    generatedAt: recordLabel(record.createdAt),
    report: record.aiSummary.report || '',
    summary: record.aiSummary.summary || '',
    finding: record.aiSummary.finding || '',
    findingType: record.aiSummary.findingType === 'critical' ? 'critical' : 'warning',
    recommendation: record.aiSummary.recommendation || '',
    disclaimer: 'AI-generated summary for easier understanding. Please consult a qualified healthcare professional for medical advice.',
    source: record.aiSummary.source || 'gemini',
  };
}

export function usePatientData(session) {
  const isAdmin = session?.role === 'ADMIN';
  const [serverRecords, setServerRecords] = useState(null);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    if (isAdmin) {
      setServerRecords(null);
      return;
    }
    let mounted = true;
    getRecords()
      .then((records) => {
        if (mounted) setServerRecords(records);
      })
      .catch(() => {
        if (mounted) setServerRecords([]);
      });
    return () => {
      mounted = false;
    };
  }, [isAdmin, tick]);

  if (isAdmin) {
    return {
      isAdmin: true,
      recordsLoading: false,
      refresh,
      profile: demo.patient,
      emergency: demo.emergency,
      records: demo.records,
      quickStats: demo.quickStats,
      aiSummary: demo.aiSummary,
      dependents: demo.dependents,
      vaccinations: demo.vaccinations,
      timeline: demo.timeline,
      activity: demo.activity,
      notifications: demo.notifications,
      reminders: demo.reminders,
    };
  }

  const records = serverRecords === null ? [] : serverRecords;
  const recordsLoading = serverRecords === null;

  const readyCount = records.filter((r) => r.aiStatus === 'ready').length;
  const processingCount = records.filter((r) => r.aiStatus === 'processing').length;
  const last = records[0];
  const profile = profileFromSession(session);
  const age = ageFromDob(profile.dob);

  const latestReady = records.find((r) => r.aiStatus === 'ready');

  const activity = records.map((r) => ({
    id: `rec-${r.id}`,
    icon: 'upload',
    text: `You uploaded ${r.name}`,
    time: recordLabel(r.createdAt),
  }));
  if (activity.length > 0 && latestReady) {
    activity.unshift({
      id: 'ai-last',
      icon: 'sparkles',
      text: 'AI summary generated for your latest document',
      time: recordLabel(latestReady.createdAt),
    });
  }

  return {
    isAdmin: false,
    recordsLoading,
    refresh,
    profile: { ...profile, age },
    emergency: {
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      medications: profile.medications,
      chronicConditions: profile.conditions.length ? profile.conditions : ['None reported'],
      emergencyContact: profile.emergencyContact,
    },
    records,
    quickStats: {
      totalRecords: records.length,
      lastDoctor: '—',
      lastDoctorSpecialty: 'Yet to visit',
      lastDoctorVisit: '—',
      lastUpload: last ? last.name : 'No uploads yet',
      lastUploadAgo: last ? recordLabel(last.createdAt) : '—',
      aiReady: readyCount,
      aiProcessing: processingCount,
    },
    aiSummary: summaryFromRecord(latestReady),
    dependents: [],
    vaccinations: { overall: 0, items: [] },
    timeline: [],
    activity,
    notifications: [],
    reminders: [],
  };
}
