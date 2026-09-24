import { CheckIcon } from './icons';
import styles from './CheckboxField.module.css';

export default function CheckboxField({
  label,
  checked,
  onChange,
  name,
  className = '',
}) {
  return (
    <label className={`${styles.row} ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={styles.native}
      />
      <span className={`${styles.box} ${checked ? styles.checked : ''}`}>
        <CheckIcon />
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
