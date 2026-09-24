import { HourglassIcon, CheckCircleIcon, AlertIcon } from './icons';
import styles from './VerificationBadge.module.css';

const STATUS_MAP = {
  PENDING: { label: 'Verification Pending', cls: 'pending', Icon: HourglassIcon },
  VERIFIED: { label: 'Verified Medical Practitioner', cls: 'verified', Icon: CheckCircleIcon },
  REJECTED: { label: 'Verification Rejected', cls: 'rejected', Icon: AlertIcon },
  SUSPENDED: { label: 'Account Suspended', cls: 'rejected', Icon: AlertIcon },
  EXPIRED: { label: 'Verification Expired', cls: 'rejected', Icon: AlertIcon },
};

export default function VerificationBadge({ status = 'PENDING', size = 'md' }) {
  const { label, cls, Icon } = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return (
    <span className={`${styles.badge} ${styles[cls]} ${styles[size]}`}>
      <Icon />
      {label}
    </span>
  );
}
