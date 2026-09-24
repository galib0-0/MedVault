import { useState } from 'react';
import { StickyNoteIcon, CalendarIcon, SyringeIcon, CheckIcon, XCloseIcon } from '../../../components/icons.jsx';
import styles from '../patient.module.css';

const ICONS = {
  prescription: StickyNoteIcon,
  calendar: CalendarIcon,
  syringe: SyringeIcon,
};

export default function RemindersSection({ reminders = [] }) {
  const [active, setActive] = useState(reminders.map((r) => r.id));

  const dismiss = (id) => setActive((list) => list.filter((x) => x !== id));
  const complete = (id) => dismiss(id);

  if (active.length === 0) {
    return (
      <section className={styles.card} id="reminders">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>Reminders</h3>
            <p className={styles.cardSub}>You're all caught up. No pending reminders.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} id="reminders">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Reminders</h3>
          <p className={styles.cardSub}>Health to-dos that need your attention.</p>
        </div>
      </div>

      <ul className={styles.remList}>
        {reminders
          .filter((r) => active.includes(r.id))
          .map((r) => {
            const Icon = ICONS[r.icon] || CalendarIcon;
            return (
              <li key={r.id} className={`${styles.remItem} ${r.tone === 'warn' ? styles.remWarn : ''}`}>
                <span className={styles.remIcon}>
                  <Icon />
                </span>
                <p>{r.text}</p>
                <span className={styles.remActions}>
                  <button
                    type="button"
                    className={styles.remAction}
                    title="Mark as completed"
                    onClick={() => complete(r.id)}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.remAction}
                    title="Dismiss"
                    onClick={() => dismiss(r.id)}
                  >
                    <XCloseIcon />
                  </button>
                </span>
              </li>
            );
          })}
      </ul>
    </section>
  );
}