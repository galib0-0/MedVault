import { PlusIcon, ArrowRightIcon, BadgeCheckIcon, UsersIcon } from '../../../components/icons.jsx';
import styles from '../patient.module.css';

export default function DependentsSection({ dependents = [], onAdd }) {
  if (dependents.length === 0) {
    return (
      <section className={styles.card} id="dependents">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>My Family / Dependents</h3>
            <p className={styles.cardSub}>Manage profiles for your children and family.</p>
          </div>
        </div>
        <div className={styles.emptySoft}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}>
            <UsersIcon />
          </span>
          <strong className={styles.emptyTitle}>No dependents added</strong>
          <p className={styles.emptyText}>
            Add profiles for your children or family members to keep their records, vaccinations
            and emergency info organised.
          </p>
          <button type="button" className={styles.smBtn} onClick={onAdd}>
            <PlusIcon /> Add Dependent
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} id="dependents">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>My Family / Dependents</h3>
          <p className={styles.cardSub}>Manage profiles for your children and family.</p>
        </div>
        <button type="button" className={styles.smBtn} onClick={onAdd}>
          <PlusIcon /> Add Dependent
        </button>
      </div>

      <div className={styles.depGrid}>
        {dependents.map((d) => (
          <div className={styles.depCard} key={d.id}>
            <div className={styles.depTop}>
              <span className={styles.depAvatar}>{d.name.charAt(0)}</span>
              <BadgeCheckIcon />
            </div>
            <strong className={styles.depName}>{d.name}</strong>
            <p className={styles.depMeta}>
              {d.relation} · Age {d.age}
            </p>
            <div className={styles.depStats}>
              <span>
                <strong>{d.bloodGroup}</strong> Blood Group
              </span>
              <span>
                <strong>{d.records}</strong> Records
              </span>
              <span>
                <strong>
                  {d.vaccinations.completed}/{d.vaccinations.completed + d.vaccinations.pending}
                </strong> Vaccines
              </span>
            </div>
            <button type="button" className={styles.depView}>
              View Profile <ArrowRightIcon />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}