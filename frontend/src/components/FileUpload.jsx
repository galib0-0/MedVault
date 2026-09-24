import { useRef, useState } from 'react';
import { UploadIcon, FileIcon, XIcon, CheckIcon } from './icons';
import styles from './FileUpload.module.css';

export default function FileUpload({
  label,
  required,
  error,
  hint,
  file,
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
}) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  const open = () => ref.current && ref.current.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}>*</span>}
        </span>
        {file && !error && (
          <span className={styles.validBadge}>
            <CheckIcon /> Selected
          </span>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept={accept}
        className={styles.native}
        onChange={(e) => onChange(e.target.files && e.target.files[0])}
      />

      {file ? (
        <div
          className={`${styles.fileRow} ${error ? styles.hasError : ''}`}
        >
          <span className={styles.fileIcon}>
            <FileIcon />
          </span>
          <span className={styles.fileMeta}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </span>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onChange(null)}
            aria-label="Remove file"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`${styles.drop} ${error ? styles.hasError : ''} ${
            dragging ? styles.dragging : ''
          }`}
          onClick={open}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span className={styles.dropIcon}>
            <UploadIcon />
          </span>
          <span className={styles.dropText}>
            <strong>Click to upload</strong> or drag &amp; drop
          </span>
          <small>PDF, JPG or PNG &middot; up to 5 MB</small>
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
