import { useRef, useState } from 'react';
import {
  UploadIcon,
  CheckCircleIcon,
  HourglassIcon,
  SparklesIcon,
  FileTextIcon,
  MicroscopeIcon,
  ImageIcon,
  StickyNoteIcon,
  BillingIcon,
  AlertIcon,
} from '../../../components/icons.jsx';
import { useToast } from '../../../components/Toast.jsx';
import { uploadRecord, getRecords } from '../../../lib/records';
import styles from './UploadCard.module.css';

const CATEGORIES = [
  { id: 'lab', label: 'Lab Reports', icon: MicroscopeIcon },
  { id: 'prescription', label: 'Prescriptions', icon: StickyNoteIcon },
  { id: 'xray', label: 'X-Rays / Scans', icon: ImageIcon },
  { id: 'discharge', label: 'Discharge Summaries', icon: FileTextIcon },
  { id: 'bill', label: 'Medical Bills', icon: BillingIcon },
  { id: 'other', label: 'Other', icon: FileTextIcon },
];

const STATUS_STEPS = [
  { label: 'Uploading document…' },
  { label: 'Processing medical report…' },
  { label: 'AI summary being generated…' },
  { label: 'Summary ready', done: true },
];

export default function UploadCard({ onComplete, onError }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [category, setCategory] = useState('lab');
  const [fileName, setFileName] = useState(null);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const startUpload = async (file) => {
    if (!file || busy) return;
    setFileName(file.name);
    setError(null);
    setStep(0);
    setBusy(true);

    let record;
    try {
      record = await uploadRecord({ file, category });
    } catch (err) {
      setStep(-1);
      setFileName(null);
      setBusy(false);
      setError(err.message || 'Upload failed.');
      if (onError) onError(err);
      else toast(err.message || 'Upload failed.', 'error');
      return;
    }

    setStep(1);
    const cat = CATEGORIES.find((c) => c.id === category);

    const poll = async () => {
      try {
        const records = await getRecords();
        const latest = records.find((r) => r.id === record.id) || records[0];
        if (latest && latest.aiStatus === 'ready') {
          setStep(STATUS_STEPS.length - 1);
          setBusy(false);
          toast(`"${file.name}" uploaded — AI summary is ready.`, 'success');
          if (onComplete) {
            onComplete({
              id: record.id,
              name: file.name,
              type: file.type,
              size: file.size,
              category: cat ? cat.label : 'Other Documents',
            });
          }
          return;
        }
        if (latest && latest.aiStatus === 'failed') {
          setStep(STATUS_STEPS.length - 1);
          setBusy(false);
          toast(`"${file.name}" uploaded, but AI summarization failed.`, 'info');
          if (onComplete) onComplete({ id: record.id, name: file.name, type: file.type, size: file.size, category: cat ? cat.label : 'Other Documents' });
          return;
        }
        window.setTimeout(poll, 2500);
      } catch {
        setStep(1);
        window.setTimeout(poll, 2500);
      }
    };

    setStep(2);
    window.setTimeout(poll, 2500);
  };

  const onFiles = (list) => {
    const file = list && list[0];
    startUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onFiles(e.dataTransfer.files);
  };

  const active = STATUS_STEPS[step === -1 ? 0 : step];

  return (
    <section className={styles.card} aria-label="Upload medical document">
      <div className={styles.head}>
        <div>
          <h2>Upload New Medical Document</h2>
          <p>
            Upload lab reports, prescriptions, X-rays, discharge summaries, bills, and other
            medical documents. MedVault AI will summarize them for easy understanding.
          </p>
        </div>
        <span className={styles.secure}>
          <CheckCircleIcon /> Encrypted &amp; private
        </span>
      </div>

      <div
        className={`${styles.drop} ${dragOver ? styles.dropOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current && inputRef.current.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload medical document"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
          hidden
          disabled={busy}
          onChange={(e) => onFiles(e.target.files)}
        />
        <span className={styles.dropIcon}>
          <UploadIcon />
        </span>
        <strong>Drag &amp; drop your document here</strong>
        <span className={styles.dropSub}>
          or <em>browse files</em> — PDF, images up to 25 MB
        </span>
        <button type="button" className={styles.browseBtn} onClick={() => !busy && inputRef.current && inputRef.current.click()}>
          Browse Files
        </button>
      </div>

      <div className={styles.chips}>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              className={`${styles.chip} ${category === c.id ? styles.chipActive : ''}`}
              onClick={() => setCategory(c.id)}
              disabled={busy}
            >
              <Icon />
              {c.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>
            <AlertIcon />
          </span>
          {error}
        </div>
      )}

      {fileName && !error && (
        <div className={styles.status}>
          <div className={styles.statusRow}>
            <span className={styles.statusIcon}>
              {active.done ? <CheckCircleIcon /> : <HourglassIcon />}
            </span>
            <div className={styles.statusBody}>
              <strong>{fileName}</strong>
              <span>{active.label}</span>
            </div>
            <span className={active.done ? styles.pillDone : styles.pillBusy}>
              {active.done ? (
                'Ready'
              ) : (
                <>
                  <SparklesIcon /> Processing
                </>
              )}
            </span>
          </div>
          <div className={styles.track}>
            <div
              className={styles.trackFill}
              style={{ width: `${step === -1 ? 0 : ((step + 1) / STATUS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
