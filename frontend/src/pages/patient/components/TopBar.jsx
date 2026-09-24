import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  MenuIcon,
  ChevronDownIcon,
  LogoutIcon,
  UserIcon,
  SettingsIcon,
  SparklesIcon,
  FileTextIcon,
  ShieldIcon,
} from '../../../components/icons.jsx';
import { signOut } from '../../../lib/auth';
import { useAccess } from '../../../context/AccessContext';
import styles from '../patient.module.css';

const NOTIFS = [
  {
    id: 1,
    title: 'AI Summary Ready',
    sub: 'Your CBC Report summary is now available.',
    time: '2 hours ago',
    unread: true,
    tone: 'success',
  },
  {
    id: 2,
    title: 'Record Accessed',
    sub: 'Dr. Ravi Kumar accessed your medical profile.',
    time: 'Yesterday',
    unread: true,
    tone: 'info',
  },
  {
    id: 3,
    title: 'Prescription Uploaded',
    sub: 'Your prescription was added to records.',
    time: 'Aug 5, 2026',
    unread: false,
    tone: 'info',
  },
];

const ICONS = {
  success: SparklesIcon,
  info: FileTextIcon,
  access: ShieldIcon,
};

function NotificationRow({ n }) {
  const Icon = ICONS[n.tone] || FileTextIcon;
  return (
    <div className={`${styles.notifRow} ${n.unread ? styles.notifUnread : ''}`}>
      <span className={styles.notifIcon}>
        <Icon />
      </span>
      <div className={styles.notifBody}>
        <strong>{n.title}</strong>
        <p>{n.sub}</p>
        <time>{n.time}</time>
      </div>
      {n.unread && <span className={styles.unreadDot} aria-label="Unread" />}
    </div>
  );
}

export default function TopBar({ name, onMenu, onNavigate }) {
  const navigate = useNavigate();
  const { triggerSimulatedRequest } = useAccess();
  const [open, setOpen] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const first = (name || 'P').trim().charAt(0).toUpperCase();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className={styles.topbar}>
      <button type="button" className={`${styles.iconBtn} ${styles.menuBtn}`} onClick={onMenu} aria-label="Open menu">
        <MenuIcon />
      </button>

      <div className={styles.topbarTitle}>
        <h1>Hello, {name || 'Patient'}</h1>
        <p>Here’s your health at a glance.</p>
      </div>

      <div className={styles.topbarRight} ref={wrapRef}>
        {/* DEMO: Simulate incoming access request button */}
        <button
          type="button"
          onClick={triggerSimulatedRequest}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#1D4ED8',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          title="Simulate an incoming access request from Dr. Ravi Kumar"
        >
          <span>📲</span> Simulate Request
        </button>

        <div className={styles.anchorWrap}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnPad}`}
            aria-label="Notifications"
            onClick={() => setOpen(open === 'bell' ? null : 'bell')}
          >
            <BellIcon />
            <span className={styles.badgeDot}>3</span>
          </button>

          {open === 'bell' && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHead}>
                <strong>Notifications</strong>
                <button type="button" className={styles.ghostLink} onClick={() => onNavigate('notifications')}>
                  View all
                </button>
              </div>
              <div className={styles.notifList}>
                {NOTIFS.map((n) => (
                  <NotificationRow key={n.id} n={n} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.anchorWrap}>
          <button
            type="button"
            className={styles.avatarBtn}
            aria-label="Profile menu"
            onClick={() => setOpen(open === 'profile' ? null : 'profile')}
          >
            <span className={styles.avatarBase}>{first}</span>
            <ChevronDownIcon />
          </button>

          {open === 'profile' && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHead}>
                <strong>{name || 'Patient'}</strong>
              </div>
              <div className={styles.menuList}>
                <button type="button" className={styles.menuItem} onClick={() => onNavigate('profile')}>
                  <UserIcon /> My Profile
                </button>
                <button type="button" className={styles.menuItem} onClick={() => onNavigate('settings')}>
                  <SettingsIcon /> Settings
                </button>
                <button type="button" className={`${styles.menuItem} ${styles.menuDanger}`} onClick={handleSignOut}>
                  <LogoutIcon /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}