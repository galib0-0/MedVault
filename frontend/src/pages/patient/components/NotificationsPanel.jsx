import { useState } from 'react';
import {
  SparklesIcon,
  FileTextIcon,
  ShieldIcon,
  CheckIcon,
} from '../../../components/icons.jsx';
import styles from '../patient.module.css';

const ICONS = {
  success: SparklesIcon,
  info: FileTextIcon,
  access: ShieldIcon,
};

export default function NotificationsPanel({ notifications = [] }) {
  const [unread, setUnread] = useState(notifications.filter((n) => n.unread).length);

  const markAll = () => setUnread(0);

  if (notifications.length === 0) {
    return (
      <section className={styles.card} id="notifications">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>Notifications</h3>
            <p className={styles.cardSub}>Updates about your records.</p>
          </div>
        </div>
        <div className={styles.emptySoft}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}>
            <CheckIcon />
          </span>
          <strong className={styles.emptyTitle}>All caught up</strong>
          <p className={styles.emptyText}>
            Notifications about AI summaries, access and reminders will show up here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} id="notifications">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Notifications</h3>
          <p className={styles.cardSub}>{unread} unread updates.</p>
        </div>
        <button type="button" className={styles.ghostLink} onClick={markAll}>
          {unread > 0 ? 'Mark all read' : 'All caught up'}
        </button>
      </div>

      <ul className={styles.notifCardList}>
        {notifications.map((n) => {
          const Icon = ICONS[n.tone] || FileTextIcon;
          return (
            <li key={n.id} className={n.unread ? styles.notifUnread : ''}>
              <span className={styles.notifIcon}>
                <Icon />
              </span>
              <div className={styles.notifBody}>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <time>{n.time}</time>
              </div>
              {n.unread && <span className={styles.unreadDot} aria-label="Unread" />}
            </li>
          );
        })}
      </ul>

      {unread > 0 && (
        <button type="button" className={styles.fullLink} onClick={markAll}>
          <CheckIcon /> Mark all as read
        </button>
      )}
    </section>
  );
}