import { CheckCircleIcon, CalendarIcon, AlertIcon, PlusIcon, SyringeIcon } from '../../../components/icons.jsx';
import styles from '../patient.module.css';

const STATUS_LABEL = {
  completed: 'Completed',
  done: 'Completed',
  due: 'Due Now',
  upcoming: 'Upcoming',
};

export default function VaccinationSection({ vaccinations = { overall: 0, items: [] } }) {
  const items = vaccinations.items || [];

  if (items.length === 0) {
    return (
      <section className={styles.card} id="vaccinations">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>Vaccinations</h3>
            <p className={styles.cardSub}>Track your completed and upcoming vaccines.</p>
          </div>
        </div>
        <div className={styles.emptySoft}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}>
            <SyringeIcon />
          </span>
          <strong className={styles.emptyTitle}>No vaccination records</strong>
          <p className={styles.emptyText}>
            Your vaccination history and upcoming doses will be tracked here so you never miss
            one.
          </p>
          <button type="button" className={styles.smBtnOutline}>
            <PlusIcon /> Add vaccination record
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} id="vaccinations">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Vaccinations</h3>
          <p className={styles.cardSub}>Track your completed and upcoming vaccines.</p>
        </div>
        <button type="button" className={styles.ghostLink}>
          Manage schedule
        </button>
      </div>

      <div className={styles.vacProgress}>
        <div className={styles.vacProgressHead}>
          <span>Overall completion</span>
          <strong>{vaccinations.overall}%</strong>
        </div>
        <div className={styles.track}>
          <div className={styles.trackFillGreen} style={{ width: `${vaccinations.overall}%` }} />
        </div>
      </div>

      <ul className={styles.vacList}>
        {vaccinations.items.map((v) => {
          const done = v.status === 'completed' || v.status === 'done';
          const warn = v.status === 'due';
          return (
            <li key={v.id} className={styles.vacItem}>
              <span className={`${styles.vacTick} ${done ? styles.vacDone : warn ? styles.vacWarn : ''}`}>
                {done ? <CheckCircleIcon /> : warn ? <AlertIcon /> : <CalendarIcon />}
              </span>
              <div className={styles.vacBody}>
                <strong>{v.name}</strong>
                <span className={`${styles.vacStatus} ${warn ? styles.toneDanger : done ? styles.toneGreen : ''}`}>
                  {STATUS_LABEL[v.status]}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.fullLink}>
        <PlusIcon /> Add to vaccination record
      </button>
    </section>
  );
}