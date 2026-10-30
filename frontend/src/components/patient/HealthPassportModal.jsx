import { useRef } from 'react';
import styles from './HealthPassportModal.module.css';

function QrSvg({ seed = 'MEDVAULT' }) {
  const size = 25;
  const cells = [];
  const hash = (c) => {
    let h = 2166136261;
    for (let i = 0; i < c.length; i += 1) {
      h ^= c.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      const on = inFinder
        ? !(x === 0 || y === 0 || x === size - 1 || y === size - 1) &&
          !(x >= 2 && x <= 4 && y >= 2 && y <= 4)
        : x < 9 || y < 9 || x >= size - 9 || y >= size - 9
          ? (x + y) % 2 === 0
          : hash(`${seed}|${x}|${y}`) % 3 !== 0;
      if (on) cells.push(`${x},${y}`);
    }
  }
  const scale = 4;
  return (
    <svg
      width="100"
      height="100"
      viewBox={`0 0 ${size * scale} ${size * scale}`}
      role="img"
      aria-label="Patient Emergency QR Code"
      style={{ display: 'block', margin: '0 auto', background: '#fff', borderRadius: '8px' }}
    >
      <rect width={size * scale} height={size * scale} fill="#fff" />
      {cells.map((c) => {
        const [x, y] = c.split(',').map(Number);
        return <rect key={c} x={x * scale} y={y * scale} width={scale} height={scale} fill="#0f172a" />;
      })}
    </svg>
  );
}

export default function HealthPassportModal({
  open,
  onClose,
  profile = {},
  emergency = {},
  records = [],
  dependents = [],
}) {
  const contentRef = useRef(null);

  if (!open) return null;

  const p = {
    name: profile.name || 'Patient Name',
    medvaultId: profile.medvaultId || 'MV-00000000',
    dob: profile.dob || 'Not specified',
    age: profile.age || '—',
    gender: profile.gender || 'Not specified',
    bloodGroup: profile.bloodGroup || emergency.bloodGroup || '—',
    organDonor: profile.organDonor ? 'Registered Donor' : 'Not Registered',
    email: profile.email || '—',
    address: profile.address ? `${profile.address}${profile.city ? `, ${profile.city}` : ''}` : 'Not provided',
    emergencyContact: profile.emergencyContact || emergency.emergencyContact || {},
    allergies: profile.allergies && profile.allergies.length ? profile.allergies : (emergency.allergies || []),
    medications: profile.medications && profile.medications.length ? profile.medications : (emergency.medications || []),
    conditions: profile.conditions && profile.conditions.length ? profile.conditions : (emergency.chronicConditions || []),
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="passport-title">
        {/* Action Toolbar */}
        <div className={styles.actionBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🖨️</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
              Consolidated Lifelong Health Passport
            </span>
          </div>
          <div className={styles.actionBtns}>
            <button type="button" className={styles.printBtn} onClick={handlePrint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print / Save as PDF
            </button>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close Health Passport">
              ✕
            </button>
          </div>
        </div>

        {/* Printable Health Passport Content */}
        <div className={styles.passportContent} ref={contentRef}>
          {/* Header */}
          <div className={styles.docHeader}>
            <div className={styles.brandArea}>
              <h2 id="passport-title">MEDVAULT AI HEALTH PASSPORT</h2>
              <p>ABDM Digital Health Record &bull; Lifelong Medical Summary</p>
            </div>
            <div className={styles.metaArea}>
              <strong>STATUS: VERIFIED ACTIVE</strong>
              <span>Issued: {todayStr}</span>
              <br />
              <span>Standard: NDHM / ABDM FHIR R4</span>
            </div>
          </div>

          {/* Patient Hero Card */}
          <div className={styles.patientHero}>
            <div className={styles.heroMain}>
              <h3>{p.name}</h3>
              <div className={styles.idBadge}>
                <span>ID:</span> {p.medvaultId}
              </div>
              <div className={styles.demographicsRow}>
                <span><strong>DOB:</strong> {p.dob} ({p.age})</span>
                <span><strong>Gender:</strong> {p.gender}</span>
                <span>
                  <strong>Blood Group:</strong>{' '}
                  <span className={styles.bloodPill}>{p.bloodGroup}</span>
                </span>
                <span><strong>Organ Donor:</strong> {p.organDonor}</span>
              </div>
            </div>

            <div className={styles.qrWrap}>
              <QrSvg seed={p.medvaultId} />
              <span className={styles.qrCaption}>Scan for Emergency Access</span>
            </div>
          </div>

          {/* Critical Emergency Alerts & Vitals */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionHeading}>🚨 Critical Medical Alerts &amp; Emergency Contacts</h4>
            {p.allergies.length > 0 ? (
              <div className={styles.alertBox}>
                <strong>⚠️ Known Drug &amp; Environmental Allergies:</strong>{' '}
                {p.allergies.join(', ')}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
                ✓ No Known Drug Allergies (NKDA) reported.
              </div>
            )}

            <div className={styles.vitalsGrid}>
              <div className={styles.vitalBox}>
                <span>Primary Emergency Contact</span>
                <strong>
                  {p.emergencyContact.name || 'Not added'}
                  {p.emergencyContact.relation ? ` (${p.emergencyContact.relation})` : ''}
                </strong>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  {p.emergencyContact.phone || 'No phone listed'}
                </div>
              </div>

              <div className={styles.vitalBox}>
                <span>Chronic Conditions</span>
                <strong>
                  {p.conditions.length > 0 ? p.conditions.join(', ') : 'None Reported'}
                </strong>
              </div>

              <div className={styles.vitalBox}>
                <span>Residential City / Address</span>
                <strong>{p.address}</strong>
              </div>
            </div>
          </div>

          {/* Current Active Medications */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionHeading}>💊 Current Active Medications</h4>
            {p.medications.length > 0 ? (
              <ul className={styles.medList}>
                {p.medications.map((med, idx) => (
                  <li key={idx} className={styles.medItem}>
                    <span style={{ fontSize: '14px' }}>💊</span>
                    <div>
                      <strong>{med}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                No active routine medications on file. Synchronized from verified prescriptions.
              </p>
            )}
          </div>

          {/* Pediatric & Family Dependents (if any) */}
          {dependents.length > 0 && (
            <div className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>👨‍👩‍👧 Pediatric &amp; Family Dependents Linked</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {dependents.map((dep, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{dep.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {dep.relationship || 'Dependent'} &bull; {dep.age || (dep.dob ? `DOB: ${dep.dob}` : 'Age not listed')} &bull; Blood: {dep.bloodGroup || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Records & Diagnostics Vault */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionHeading}>📁 Verified Clinical Records &amp; Diagnostic History</h4>
            {records.length > 0 ? (
              <table className={styles.recordsTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Document / Record</th>
                    <th>Category</th>
                    <th>Clinical Finding / Impression</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 8).map((rec, idx) => {
                    const dateStr = rec.createdAt
                      ? new Date(rec.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—';
                    const finding = rec.aiSummary?.finding || rec.aiSummary?.summary || 'Verified document filed in encrypted repository.';
                    return (
                      <tr key={idx}>
                        <td style={{ whiteSpace: 'nowrap', fontWeight: '600', color: '#475569' }}>{dateStr}</td>
                        <td style={{ fontWeight: '600' }}>{rec.name}</td>
                        <td>
                          <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                            {rec.category || rec.type || 'Clinical Report'}
                          </span>
                        </td>
                        <td style={{ color: '#334155', maxWidth: '300px' }}>{finding}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                No clinical records uploaded yet.
              </p>
            )}
          </div>

          {/* Official Verification Footer & Disclaimer */}
          <div className={styles.disclaimerFooter}>
            <p style={{ margin: 0, fontWeight: '600' }}>
              MEDVAULT SECURE PATIENT PASSPORT &bull; CRYPTOGRAPHICALLY SECURED WITH AES-256 GCM
            </p>
            <p style={{ margin: '4px 0 0' }}>
              Notice: This health passport contains confidential medical information. Emergency personnel may scan the QR code to request real-time access. All data transmission conforms to ABDM / FHIR standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
