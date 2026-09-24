import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import CloudDivider from '../components/CloudDivider';
import PillButton from '../components/PillButton';
import VerificationBadge from '../components/VerificationBadge';
import { LogoutIcon, InfoIcon } from '../components/icons';
import { getSession, signOut } from '../lib/auth';
import styles from './tempPage.module.css';

const FEATURES = [
  'Search Patient',
  'Emergency Access',
  'Authorized Records',
  'Access History',
  'Verification Status',
];

export default function DoctorTempPage() {
  const navigate = useNavigate();
  const session = getSession() || {};
  const name = session.name || 'Doctor';
  const hospital = session.hospitalName;
  const specialization = session.specialization;

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
          <h1>Doctor Space</h1>
          <p>Welcome, {name}.</p>
        </div>
        <div className={styles.cloudWrap}>
          <CloudDivider variant="horizontal" />
        </div>
      </header>

      <section className={styles.body}>
        <div className={styles.card}>
          <div className={styles.statusRow}>
            <VerificationBadge status={session.verificationStatus || 'PENDING'} size="lg" />
          </div>

          <div className={styles.idBox}>
            <span>
              {hospital || '—'} {specialization ? `· ${specialization}` : ''}
            </span>
          </div>

          <div className={styles.verifyNote}>
            <InfoIcon />
            <p>
              Your medical credentials are currently under verification.
              Patient-record access will be enabled after successful
              verification. This is a placeholder page for the Doctor role and
              will be replaced by the full Doctor Dashboard.
            </p>
          </div>

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
