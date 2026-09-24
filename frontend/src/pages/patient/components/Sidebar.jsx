import {
  HomeIcon,
  FileIcon,
  SparklesIcon,
  ActivityIcon,
  SyringeIcon,
  UsersIcon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
} from '../../../components/icons.jsx';
import Logo from '../../../components/Logo';

import styles from '../patient.module.css';

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: HomeIcon },
  { id: 'records', label: 'My Records', icon: FileIcon },
  { id: 'summary', label: 'AI Summaries', icon: SparklesIcon },
  { id: 'timeline', label: 'Health Timeline', icon: ActivityIcon },
  { id: 'vaccinations', label: 'Vaccinations', icon: SyringeIcon },
  { id: 'dependents', label: 'Dependents', icon: UsersIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'access-history', label: 'Access History', icon: ActivityIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ active, onNavigate, onSignOut, open, onClose, name }) {
  return (
    <>
      {open && <div className={styles.scrim} onClick={onClose} aria-hidden="true" />}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <Logo withText />
        </div>

        <nav className={styles.navList} aria-label="Patient dashboard">
          <span className={styles.navLabel}>Menu</span>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${active === item.id ? styles.navActive : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <span className={styles.userChipAvatar}>{name.charAt(0)}</span>
            <div>
              <strong>{name}</strong>
              <span>MedVault Account</span>
            </div>
          </div>
          <button type="button" className={styles.signOutBtn} onClick={onSignOut}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}