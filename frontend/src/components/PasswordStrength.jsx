import { passwordStrength } from '../lib/validation';
import styles from './PasswordStrength.module.css';

const LABELS = [
  ['Too short', 'weak'],
  ['Weak', 'weak'],
  ['Fair', 'fair'],
  ['Good', 'good'],
  ['Strong', 'strong'],
  ['Very strong', 'strong'],
];

export default function PasswordStrength({ value, className = '' }) {
  if (!value) return null;
  const score = passwordStrength(value);
  const [label, level] = LABELS[score];
  const filled = Math.max(1, Math.min(3, Math.ceil((score / 5) * 3)));

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div className={styles.bars} aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`${styles.bar} ${i <= filled ? styles[level] : ''}`}
          />
        ))}
      </div>
      <span className={`${styles.label} ${styles[level]}`}>{label}</span>
    </div>
  );
}
