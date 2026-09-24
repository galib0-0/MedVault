import { useState } from 'react';
import {
  SearchIcon,
  FileTextIcon,
  MicroscopeIcon,
  StickyNoteIcon,
  ImageIcon,
  BillingIcon,
  SparklesIcon,
  HourglassIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowRightIcon,
  UploadIcon,
} from '../../../components/icons.jsx';
import styles from '../patient.module.css';

const FILTERS = ['All Records', 'Lab Reports', 'Prescriptions', 'X-Rays / Scans', 'Discharge Summaries', 'Bills'];

const TYPE_ICONS = {
  'Lab Reports': MicroscopeIcon,
  Prescriptions: StickyNoteIcon,
  'X-Rays / Scans': ImageIcon,
  'Discharge Summaries': FileTextIcon,
  'Medical Bills': BillingIcon,
};

function StatusBadge({ status, critical }) {
  if (status === 'ready') {
    return (
      <span className={`${styles.statusBadge} ${styles.ready}`}>
        <SparklesIcon /> AI Summary Ready
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className={`${styles.statusBadge} ${styles.processing}`}>
        <HourglassIcon /> AI Summary Processing
      </span>
    );
  }
  return (
    <span className={`${styles.statusBadge} ${styles.none}`}>
      <CheckCircleIcon /> Uploaded
    </span>
  );
}

export default function RecordsSection({ records = [], loading = false, onViewAll, onUpload }) {
  const [filter, setFilter] = useState('All Records');
  const [query, setQuery] = useState('');

  const filtered = records.filter((r) => {
    const matchType = filter === 'All Records' || r.type === filter || (filter === 'Bills' && r.type === 'Medical Bills');
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.doctor.toLowerCase().includes(q) ||
      r.hospital.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  return (
    <section className={styles.card} id="records">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>My Medical Records</h3>
          <p className={styles.cardSub}>Recent documents uploaded to your secure vault.</p>
        </div>
        <button type="button" className={styles.smBtn} onClick={onViewAll}>
          View All Records
        </button>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.searchRow}>
        <span className={styles.searchIcon}>
          <SearchIcon />
        </span>
        <input
          type="search"
          className={styles.search}
          placeholder="Search by document or doctor…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className={styles.recordList}>
        {filtered.map((r) => {
          const TypeIcon = TYPE_ICONS[r.type] || FileTextIcon;
          return (
            <li key={r.id} className={styles.record}>
              <span className={`${styles.recordIcon} ${r.critical ? styles.recordIconCritical : ''}`}>
                <TypeIcon />
              </span>
              <div className={styles.recordMain}>
                <div className={styles.recordName}>
                  <strong>{r.name}</strong>
                  {r.critical && (
                    <span className={styles.criticalTag} title="Contains critical finding">
                      Critical
                    </span>
                  )}
                </div>
                <p>
                  {r.type} · {r.hospital}
                </p>
                <p className={styles.recordSub}>Uploaded {r.date} · {r.doctor}</p>
                <StatusBadge status={r.aiStatus} critical={r.critical} />
              </div>
              <button type="button" className={styles.viewBtn}>
                <EyeIcon /> View Record
              </button>
            </li>
          );
        })}
        {loading && (
          <li className={styles.emptyState}>
            <strong className={styles.emptyTitle}>Loading your records…</strong>
          </li>
        )}
        {!loading && records.length === 0 && (
          <li className={styles.emptyState}>
            <strong className={styles.emptyTitle}>No medical records yet</strong>
            <p className={styles.emptyText}>
              Upload your first lab report, prescription or scan and MedVault AI will summarize
              it for you.
            </p>
            <button type="button" className={styles.smBtn} onClick={onUpload}>
              <UploadIcon /> Upload a document
            </button>
          </li>
        )}
        {!loading && records.length > 0 && filtered.length === 0 && (
          <li className={styles.emptyState}>
            No records match your filters — try a different search.
          </li>
        )}
      </ul>

      <button type="button" className={styles.fullLink} onClick={onViewAll}>
        View full medical history <ArrowRightIcon />
      </button>
    </section>
  );
}