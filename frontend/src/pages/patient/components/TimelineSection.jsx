import { FileIcon, MapPinIcon, ChevronRightIcon, ActivityIcon } from '../../../components/icons.jsx';
import styles from '../patient.module.css';

export default function TimelineSection({ timeline = [], onExplore }) {
  if (timeline.length === 0) {
    return (
      <section className={styles.card} id="timeline">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>Health Timeline</h3>
            <p className={styles.cardSub}>Your medical journey, year by year.</p>
          </div>
        </div>
        <div className={styles.emptySoft}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}>
            <ActivityIcon />
          </span>
          <strong className={styles.emptyTitle}>Timeline is empty</strong>
          <p className={styles.emptyText}>
            As you upload doctors&rsquo; visits, reports and prescriptions, they&rsquo;ll appear
            here as a timeline of your health journey.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} id="timeline">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Health Timeline</h3>
          <p className={styles.cardSub}>Your medical journey, year by year.</p>
        </div>
        <button type="button" className={styles.ghostLink} onClick={onExplore}>
          Explore
        </button>
      </div>

      <div className={styles.timeline}>
        {timeline.map((group) => (
          <div className={styles.tGroup} key={group.year}>
            <span className={styles.tYear}>{group.year}</span>
            <div className={styles.tItems}>
              {group.items.map((item, idx) => (
                <div className={styles.tItem} key={item.id}>
                  <span className={styles.tDot} />
                  {idx < group.items.length - 1 && <span className={styles.tLine} />}
                  <div className={styles.tContent}>
                    <strong>{item.title}</strong>
                    <span>
                      <FileIcon /> {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={styles.fullLink}>
        <MapPinIcon /> Filter by year, condition or doctor <ChevronRightIcon />
      </button>
    </section>
  );
}