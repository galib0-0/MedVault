import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import CloudDivider from '../components/CloudDivider';
import GoogleButton from '../components/GoogleButton';
import GoogleSetupModal from '../components/GoogleSetupModal';
import { promptGoogleLogin } from '../lib/googleAuth';
import { useToast } from '../components/Toast';
import { UserIcon, StethoscopeIcon, ArrowRightIcon, ShieldIcon } from '../components/icons';
import styles from './RoleSelectPage.module.css';

const CARDS = [
  {
    to: '/signup/patient',
    Icon: UserIcon,
    title: 'Patient',
    desc: 'Store and manage your lifelong medical records, receive AI-powered summaries in your language, and share emergency access with trusted doctors.',
    cta: 'Create patient account',
    badge: null,
  },
  {
    to: '/signup/doctor',
    Icon: StethoscopeIcon,
    title: 'Doctor / Medical Practitioner',
    desc: 'Submit your professional credentials for verification and get authorized emergency access to patient records.',
    cta: 'Create doctor account',
    badge: { icon: ShieldIcon, text: 'Professional verification required' },
    doctor: true,
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const session = await promptGoogleLogin({ role: 'PATIENT' });
      toast(`Welcome to MedVault! Signed up as ${session.fullName || session.email}.`, 'success');
      navigate('/patient');
    } catch (err) {
      if (err.code === 'MISSING_CLIENT_ID') {
        setShowSetupModal(true);
      } else {
        toast(err.message || 'Google Sign-Up was cancelled or failed.', 'error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <Logo withText />
          <p className={styles.heroKicker}>Secure · AI-powered · Lifelong records</p>
          <h1 className={styles.heroTitle}>Create your MedVault AI account</h1>
          <p className={styles.heroSub}>
            Choose the account type that fits you best.
          </p>
        </div>
        <div className={styles.cloudWrap}>
          <CloudDivider variant="horizontal" />
        </div>
      </header>

      <section className={styles.body}>
        <div className={styles.cards}>
          {CARDS.map(({ to, Icon, title, desc, cta, badge, doctor }) => (
            <Link
              key={to}
              to={to}
              className={`${styles.card} ${doctor ? styles.doctor : ''}`}
            >
              <span className={styles.icon}>
                <Icon />
              </span>
              {badge && (
                <span className={styles.badge}>
                  <badge.icon />
                  {badge.text}
                </span>
              )}
              <h2>{title}</h2>
              <p>{desc}</p>
              <span className={styles.cta}>
                {cta} <ArrowRightIcon />
              </span>
            </Link>
          ))}
        </div>

        <div style={{ maxWidth: '320px', margin: '24px auto 0' }}>
          <GoogleButton onClick={handleGoogleSignUp} disabled={googleLoading}>
            {googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}
          </GoogleButton>
        </div>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>

      <GoogleSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </main>
  );
}
