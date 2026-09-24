import { DownloadIcon, ShieldIcon, LockIcon, UserIcon } from '../../../components/icons.jsx';
import styles from '../patient.module.css';

function QrBlock({ seed = 'MEDVAULT' }) {
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
    <svg width="112" height="112" viewBox={`0 0 ${size * scale} ${size * scale}`} role="img" aria-label="Emergency QR code placeholder">
      <rect width={size * scale} height={size * scale} fill="#fff" />
      {cells.map((c) => {
        const [x, y] = c.split(',').map(Number);
        return <rect key={c} x={x * scale} y={y * scale} width={scale} height={scale} fill="#0f172a" />;
      })}
    </svg>
  );
}

export default function ProfileSection({ profile = {}, onEditProfile, onViewQr, onDownloadQr }) {
  const p = {
    name: profile.name || 'Patient',
    firstName: profile.firstName || 'P',
    medvaultId: profile.medvaultId || '—',
    email: profile.email || '',
    dob: profile.dob || 'Not added',
    age: profile.age || '',
    gender: profile.gender || 'Not added',
    bloodGroup: profile.bloodGroup || '—',
    organDonor: profile.organDonor,
    emergencyContact: profile.emergencyContact || {},
    address: profile.address || '',
  };
  const ageLabel = p.age || 'Not added';

  return (
    <section className={styles.card} id="profile">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>My Profile</h3>
          <p className={styles.cardSub}>Your identity and emergency access details.</p>
        </div>
        <div className={styles.profileHeadActions}>
          <button type="button" className={styles.smBtnOutline} onClick={onEditProfile}>
            Edit Profile
          </button>
          <span className={styles.securePill}>
            <LockIcon /> Controlled access
          </span>
        </div>
      </div>

      <div className={styles.profileLayout}>
        <div className={styles.profileMain}>
          <div className={styles.profileIdentity}>
            <span className={styles.avatarLarge}>{p.firstName.charAt(0)}</span>
            <div>
              <h4>{p.name}</h4>
              <p>
                <UserIcon /> {p.medvaultId}
              </p>
              <p className={styles.profileEmail}>{p.email}</p>
            </div>
          </div>

          <dl className={styles.profileGrid}>
            <div className={styles.profileItem}>
              <dt>Date of Birth</dt>
              <dd>{p.dob}</dd>
            </div>
            <div className={styles.profileItem}>
              <dt>Age</dt>
              <dd>{ageLabel}</dd>
            </div>
            <div className={styles.profileItem}>
              <dt>Gender</dt>
              <dd>{p.gender}</dd>
            </div>
            <div className={styles.profileItem}>
              <dt>Blood Group</dt>
              <dd>{p.bloodGroup}</dd>
            </div>
            <div className={styles.profileItem}>
              <dt>Emergency Contact</dt>
              <dd>
                {p.emergencyContact.name || 'Not added'}
                {p.emergencyContact.phone && p.emergencyContact.phone !== 'Not added'
                  ? ` · ${p.emergencyContact.phone}`
                  : ''}
              </dd>
            </div>
            <div className={styles.profileItem}>
              <dt>Organ Donor</dt>
              <dd>{p.organDonor ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.qrPanel}>
          <div className={styles.qrBox}>
            <QrBlock seed={profile.medvaultId || 'MEDVAULT'} />
          </div>
          <strong>Emergency QR</strong>
          <p>
            Lets authorized doctors securely view your emergency information and records.
          </p>
          <span className={styles.qrHint}>
            <ShieldIcon /> Secure &amp; controlled access
          </span>
          <div className={styles.qrActions}>
            <button type="button" className={styles.smBtn} onClick={onViewQr}>
              View My Emergency QR
            </button>
            <button type="button" className={styles.smBtnOutline} onClick={onDownloadQr}>
              <DownloadIcon /> Download
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}