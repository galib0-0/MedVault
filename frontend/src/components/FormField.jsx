import { useId, useState } from 'react';
import { EyeIcon, EyeOffIcon, CheckIcon } from './icons';
import styles from './FormField.module.css';

export default function FormField({
  as = 'input',
  type = 'text',
  label,
  name,
  value,
  options = [],
  placeholder,
  required,
  error,
  valid,
  hint,
  onChange,
  onBlur,
  min,
  max,
  maxLength,
  rows,
  autoComplete,
  className = '',
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword ? (show ? 'text' : 'password') : type;
  const hasCheck = !!valid;
  const hasEye = isPassword;

  const commonProps = {
    id,
    name,
    value,
    placeholder,
    required,
    onChange,
    onBlur,
    min,
    max,
    maxLength,
    autoComplete,
    className: styles.input,
    'aria-invalid': !!error || undefined,
  };

  let control;
  if (as === 'select') {
    control = (
      <select {...commonProps} value={value || ''}>
        <option value="" disabled hidden>
          {placeholder || 'Select...'}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea {...commonProps} rows={rows || 3} />;
  } else {
    control = <input {...commonProps} type={actualType} />;
  }

  const wrapClass = [
    styles.wrap,
    error ? styles.hasError : '',
    hasCheck ? styles.hasCheck : '',
    hasEye ? styles.hasEye : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required && <span className={styles.asterisk}>*</span>}
        </label>
      )}
      <div className={wrapClass}>
        {control}
        {hasCheck && (
          <span className={styles.check} aria-hidden="true">
            <CheckIcon />
          </span>
        )}
        {hasEye && (
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
        <span className={styles.underline} />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
