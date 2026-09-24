import { UserIcon, StethoscopeIcon } from './icons';
import styles from './RoleToggle.module.css';

export default function RoleToggle({ value, onChange }) {
  return (
    <div className={styles.toggle} role="tablist" aria-label="Account type">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'PATIENT'}
        className={value === 'PATIENT' ? styles.active : ''}
        onClick={() => onChange('PATIENT')}
      >
        <UserIcon />
        Patient
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'DOCTOR'}
        className={value === 'DOCTOR' ? styles.active : ''}
        onClick={() => onChange('DOCTOR')}
      >
        <StethoscopeIcon />
        Doctor
      </button>
    </div>
  );
}
