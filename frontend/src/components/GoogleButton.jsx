import { GoogleIcon } from './icons';
import styles from './GoogleButton.module.css';

export default function GoogleButton({ children = 'Continue with Google', onClick }) {
  return (
    <button type="button" className={styles.btn} onClick={onClick}>
      <GoogleIcon />
      {children}
    </button>
  );
}
