import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import CloudDivider from '../components/CloudDivider';
import PillButton from '../components/PillButton';
import { LogoutIcon, InfoIcon, ShieldIcon } from '../components/icons';
import { getSession, signOut } from '../lib/auth';
import styles from './tempPage.module.css';

const FEATURES = [
  'Medical Records',
  'AI Medical Summaries',
  'Emergency Profile',
  'Medications & Allergies',
  'Vaccinations',
  'Pediatric Profiles',
  'Doctor Access History',
  'Privacy & Security',
];

export default function PatientTempPage() {
  const navigate = useNavigate();
  const session = getSession() || {};
  const name = session.name || 'Patient';
  const medvaultId = session.medvaultId || 'Not available';

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Logo className={styles.logo} withText />
          <button className={styles.signOut} onClick={handleSignOut}>
            <LogoutIcon /> Sign out
          </button>
        </div>
        <div className={styles.headerMid}>
          <span className={styles.chip}>Temporary Page</span>
          <h1>Patient Space</h1>
          <p>Welcome, {name}.</p>
        </div>
        <div className={styles.cloudWrap}>
          <CloudDivider variant="horizontal" />
        </div>
      </header>

      <section className={styles.body}>
        <div className={styles.card}>
          <div className={styles.idBox}>
            <span>MedVault ID</span>
            <strong>{medvaultId}</strong>
          </div>

          <p className={styles.note}>
            This is a placeholder page for the Patient role. The full Patient
            Dashboard &mdash; medical records, AI summaries, emergency profile,
            vaccinations and more &mdash; will replace it soon.
          </p>

          <div className={styles.grid}>
            {FEATURES.map((f) => (
              <div className={styles.tile} key={f}>
                <InfoIcon />
                {f}
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <PillButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </PillButton>
          </div>
        </div>
      </section>
    </main>
  );
}
