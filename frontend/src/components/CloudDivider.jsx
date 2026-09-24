import styles from './CloudDivider.module.css';

export default function CloudDivider({ variant = 'vertical' }) {
  if (variant === 'horizontal') {
    return (
      <svg
        className={styles.horizontal}
        viewBox="0 0 400 50"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <circle cx="30" cy="16" r="24" fill="#fff" />
        <circle cx="95" cy="40" r="26" fill="#fff" />
        <circle cx="160" cy="14" r="22" fill="#fff" />
        <circle cx="235" cy="42" r="28" fill="#fff" />
        <circle cx="300" cy="16" r="24" fill="#fff" />
        <circle cx="375" cy="40" r="24" fill="#fff" />
      </svg>
    );
  }

  return (
    <svg
      className={styles.vertical}
      viewBox="0 0 90 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <circle cx="48" cy="18" r="22" fill="#fff" />
      <circle cx="82" cy="60" r="26" fill="#fff" />
      <circle cx="38" cy="100" r="24" fill="#fff" />
      <circle cx="80" cy="150" r="26" fill="#fff" />
      <circle cx="52" cy="190" r="20" fill="#fff" />
    </svg>
  );
}
