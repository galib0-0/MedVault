import { GoogleIcon } from './icons';
import styles from './GoogleButton.module.css';

export default function GoogleButton({ children = 'Continue with Google', onClick, disabled = false }) {
  return (
    <button type="button" className={styles.btn} onClick={onClick} disabled={disabled}>
      <GoogleIcon />
      {children}
    </button>
  );
}
