import {
  FileTextIcon,
  StethoscopeIcon,
  UploadIcon,
  SparklesIcon,
} from '../../../components/icons.jsx';
import styles from '../patient.module.css';

export default function StatCards({ quickStats = {} }) {
  const processing = quickStats.aiProcessing || 0;
  return (
    <section className={styles.stats} aria-label="Quick statistics">
      <div className={styles.statCard}>
        <span className={`${styles.statIcon} ${styles.toneBlue}`}>
          <FileTextIcon />
        </span>
        <div className={styles.statText}>
          <strong>{quickStats.totalRecords} Records</strong>
          <span>Total medical documents</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <span className={`${styles.statIcon} ${styles.toneTeal}`}>
          <StethoscopeIcon />
        </span>
        <div className={styles.statText}>
          <strong>{quickStats.lastDoctor || '—'}</strong>
          <span>
            {quickStats.lastDoctorSpecialty || 'Doctor'} · {quickStats.lastDoctorVisit || '—'}
          </span>
        </div>
      </div>

      <div className={styles.statCard}>
        <span className={`${styles.statIcon} ${styles.toneAmber}`}>
          <UploadIcon />
        </span>
        <div className={styles.statText}>
          <strong>{quickStats.lastUpload || '—'}</strong>
          <span>Uploaded {quickStats.lastUploadAgo || '—'}</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <span className={`${styles.statIcon} ${styles.toneGreen}`}>
          <SparklesIcon />
        </span>
        <div className={styles.statText}>
          <strong>{quickStats.aiReady || 0} Ready</strong>
          <span>{processing > 0 ? `+ ${processing} Summary Processing` : 'AI summaries'}</span>
        </div>
      </div>
    </section>
  );
}