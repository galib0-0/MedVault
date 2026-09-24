import { useId } from 'react';
import styles from './Logo.module.css';

export default function Logo({ withText = false, className = '' }) {
  const id = useId();
  return (
    <div className={`mv-logo ${styles.wrap} ${className}`}>
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60A5FA" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="48" fill="#ffffff" />
        <circle cx="48" cy="48" r="43" fill="none" stroke="#E0E7FF" strokeWidth="2" />
        <path
          d="M48 19 L66 26.5 V44 C66 57.5 58.5 67.5 48 72.5 C37.5 67.5 30 57.5 30 44 V26.5 Z"
          fill={`url(#${id})`}
        />
        <path
          d="M43.5 31.5 h9 v11.5 h11.5 v9 H52.5 V63.5 h-9 v-11.5 H32 v-9 h11.5 Z"
          fill="#ffffff"
        />
        <circle cx="77" cy="23" r="4.5" fill="#93C5FD" />
        <path
          d="M70 28.5 C74.5 33 80 31 82.5 27"
          fill="none"
          stroke="#BFDBFE"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {withText && (
        <span className={styles.text}>
          MedVault <em>AI</em>
        </span>
      )}
    </div>
  );
}
