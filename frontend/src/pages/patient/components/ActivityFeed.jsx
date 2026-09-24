import {
  UploadIcon,
  SparklesIcon,
  StethoscopeIcon,
  StickyNoteIcon,
  InfoIcon,
  ArrowRightIcon,
  FileTextIcon,
} from '../../../components/icons.jsx';
import styles from '../patient.module.css';

const ICONS = {
  upload: UploadIcon,
  sparkles: SparklesIcon,
  doctor: StethoscopeIcon,
  prescription: StickyNoteIcon,
  edit: InfoIcon,
};

export default function ActivityFeed({ activity = [] }) {
  if (activity.length === 0) {
    return (
      <section className={styles.card} id="activity">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>Recent Activity</h3>
            <p className={styles.cardSub}>A transparent log of who accessed your records.</p>
          </div>
        </div>
        <div className={styles.emptySoft}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}>
            <FileTextIcon />
          </span>
          <strong className={styles.emptyTitle}>No activity yet</strong>
          <p className={styles.emptyText}>
            Your uploads and any record access will appear here so you always know who saw
            your information.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} id="activity">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <p className={styles.cardSub}>What happened with your records.</p>
        </div>
        <button type="button" className={styles.ghostLink}>
          View all
        </button>
      </div>

      <ul className={styles.activityList}>
        {activity.map((a) => {
          const Icon = ICONS[a.icon] || InfoIcon;
          return (
            <li key={a.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>
                <Icon />
              </span>
              <div className={styles.activityText}>
                <p>{a.text}</p>
                <span>{a.time}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.fullLink}>
        Open access log <ArrowRightIcon />
      </button>
    </section>
  );
}