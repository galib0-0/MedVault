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
  TrashIcon,
  AlertIcon,
} from '../../../components/icons.jsx';
import { deleteRecord } from '../../../lib/records';
import { useToast } from '../../../components/Toast';
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

export default function RecordsSection({
  records = [],
  loading = false,
  onViewAll,
  onUpload,
  selectedRecordId = null,
  onSelectRecord,
  onDelete,
}) {
  const toast = useToast();
  const [filter, setFilter] = useState('All Records');
  const [query, setQuery] = useState('');
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = records.filter((r) => {
    const matchType =
      filter === 'All Records' ||
      r.type === filter ||
      (filter === 'Bills' && r.type === 'Medical Bills');
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.doctor.toLowerCase().includes(q) ||
      r.hospital.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await deleteRecord(recordToDelete.id || recordToDelete._id);
      toast(`"${recordToDelete.name}" was deleted successfully.`, 'success');
      const deletedId = recordToDelete.id || recordToDelete._id;
      setRecordToDelete(null);
      if (onDelete) {
        onDelete(deletedId);
      }
    } catch (err) {
      toast(err.message || 'Failed to delete record.', 'error');
    } finally {
      setDeleting(false);
    }
  };

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
          const isSelected = selectedRecordId && String(selectedRecordId) === String(r.id || r._id);
          const TypeIcon = TYPE_ICONS[r.type] || FileTextIcon;
          return (
            <li
              key={r.id || r._id}
              className={styles.record}
              onClick={() => onSelectRecord && onSelectRecord(r)}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? '#2563eb' : undefined,
                backgroundColor: isSelected ? '#f8faff' : undefined,
                boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : undefined,
                transition: 'all 0.15s ease',
              }}
            >
              <span className={`${styles.recordIcon} ${r.critical ? styles.recordIconCritical : ''}`}>
                <TypeIcon />
              </span>
              <div className={styles.recordMain}>
                <div className={styles.recordName}>
                  <strong>{r.name}</strong>
                  {isSelected && (
                    <span
                      style={{
                        fontSize: '11px',
                        background: '#2563eb',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '700',
                      }}
                    >
                      Active View
                    </span>
                  )}
                  {r.critical && (
                    <span className={styles.criticalTag} title="Contains critical finding">
                      Critical
                    </span>
                  )}
                </div>
                <p>
                  {r.type} · {r.hospital}
                </p>
                <p className={styles.recordSub}>
                  Uploaded {r.date} · {r.doctor}
                </p>
                <StatusBadge status={r.aiStatus} critical={r.critical} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  className={styles.viewBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRecord) onSelectRecord(r);
                  }}
                  style={{
                    backgroundColor: isSelected ? '#2563eb' : undefined,
                    color: isSelected ? '#ffffff' : undefined,
                    borderColor: isSelected ? '#2563eb' : undefined,
                  }}
                  title="View saved AI summary for this record"
                >
                  <EyeIcon /> {isSelected ? 'Viewing' : 'View Summary'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecordToDelete(r);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid #fee2e2',
                    backgroundColor: '#fff',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.borderColor = '#fee2e2';
                  }}
                  title="Delete this document and its AI summary"
                  aria-label={`Delete ${r.name}`}
                >
                  <TrashIcon style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
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

      {/* Confirmation Modal for Safe Deletion */}
      {recordToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => !deleting && setRecordToDelete(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertIcon style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  Delete Medical Record?
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', margin: '0 0 20px' }}>
              Are you sure you want to delete <strong>{recordToDelete.name}</strong>? This will permanently
              delete the uploaded file, the vault database entry, and its associated AI summary.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setRecordToDelete(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <TrashIcon style={{ width: '15px', height: '15px' }} />
                {deleting ? 'Deleting…' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}