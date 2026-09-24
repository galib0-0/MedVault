import styles from './PillButton.module.css';

export default function PillButton({
  variant = 'primary',
  type = 'button',
  full = false,
  disabled = false,
  children,
  onClick,
  className = '',
}) {
  const cls = [
    styles.btn,
    variant === 'secondary' ? styles.secondary : styles.primary,
    full ? styles.full : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
    >
      {children}
    </button>
  );
}
