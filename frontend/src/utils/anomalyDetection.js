/**
 * Anomaly Detection Engine for MedVault AI Post-Access Verification System
 * Analyzes access logs after sessions terminate to detect unauthorized or suspicious access patterns.
 * 
 * @param {Object} accessLog - The completed access log object
 * @returns {Object} { isFlagged: boolean, flagReasons: string[], riskScore: number, recommendation: string }
 */
export function analyzeAccess(accessLog = {}) {
  const flagReasons = [];
  let rawRiskScore = 0;

  // RULE 1 — High Volume Access (> 5 patients in 60 minutes)
  const accesses60Mins = accessLog.accessesLast60Mins || 0;
  if (accesses60Mins > 5) {
    flagReasons.push(`Unusual access volume: ${accesses60Mins} patients in 60 minutes`);
    rawRiskScore += 30;
  }

  // RULE 2 — Repeated Access (> 3 accesses to same patient in 24 hours)
  const accesses24Hrs = accessLog.accessesToPatientLast24Hrs || 0;
  if (accesses24Hrs > 3) {
    flagReasons.push(`Repeated access: ${accesses24Hrs} times in 24 hours`);
    rawRiskScore += 25;
  }

  // RULE 3 — Off-Hours Emergency (11 PM - 5 AM AND duration < 3 mins / 180s)
  const startTimeDate = accessLog.startTime ? new Date(accessLog.startTime) : null;
  const hour = startTimeDate ? startTimeDate.getHours() : 2; // Default 2 AM if missing
  const durationSecs = accessLog.durationSeconds || 80;
  const isOffHours = hour >= 23 || hour < 5;

  if (isOffHours && durationSecs < 180) {
    const minsStr = (durationSecs / 60).toFixed(1);
    flagReasons.push(`Off-hours emergency access with unusually short duration (${minsStr} minutes)`);
    rawRiskScore += 35;
  }

  // RULE 4 — Specialization Mismatch
  const restrictiveSpecialties = ['Dentist', 'Dermatologist', 'Ophthalmologist'];
  const restrictedRecordTypes = ['Cardiac Report', 'Neuro Report', 'Oncology Report'];
  const doctorSpec = accessLog.specialization || '';
  const accessedRecords = accessLog.recordsAccessed || [];

  const hasSpecMismatch =
    restrictiveSpecialties.includes(doctorSpec) &&
    accessedRecords.some((rec) =>
      restrictedRecordTypes.some((restricted) => rec.toLowerCase().includes(restricted.toLowerCase().replace(' report', '')))
    );

  if (hasSpecMismatch) {
    flagReasons.push(`Specialization mismatch: ${doctorSpec} accessed ${accessedRecords.join(', ')}`);
    rawRiskScore += 20;
  }

  // RULE 5 — Suspicious Session Duration (< 90 seconds)
  if (durationSecs < 90) {
    flagReasons.push(`Session too short: ${durationSecs} seconds (possible unauthorized probe)`);
    rawRiskScore += 40;
  }

  // RULE 6 — New Device or Unusual Location
  const device = accessLog.device || '';
  const location = accessLog.location || '';
  const lastCity = accessLog.lastKnownCity || '';

  const isNewDevice = device.toLowerCase().includes('new device');
  const isNewLocation = lastCity && location && lastCity.toLowerCase() !== location.toLowerCase();

  if (isNewDevice || isNewLocation) {
    flagReasons.push(`Access from new device or location: ${location || 'New Location'} vs ${lastCity || 'Registered City'}`);
    rawRiskScore += 30;
  }

  // Cap Risk Score at 100 max
  const riskScore = Math.min(100, rawRiskScore);
  const isFlagged = riskScore > 30;

  // Determine Recommendation
  let recommendation = '';
  if (riskScore <= 30) {
    recommendation = 'Access appears legitimate. No action required.';
  } else if (riskScore <= 60) {
    recommendation = 'Recommend admin review within 48 hours.';
  } else if (riskScore <= 80) {
    recommendation = 'Immediate admin review required. Patient notified.';
  } else {
    recommendation = 'Doctor access temporarily suspended pending review.';
  }

  return {
    isFlagged,
    flagReasons,
    riskScore,
    recommendation,
  };
}
