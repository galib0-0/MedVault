import { PlusIcon, ArrowRightIcon, BadgeCheckIcon, UsersIcon } from '../../../components/icons.jsx';
import styles from '../patient.module.css';

export default function DependentsSection({ dependents = [], onAdd, onViewDependent }) {
  if (dependents.length === 0) {
    return (
      <section className={styles.card} id="dependents">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>My Family / Dependents</h3>
            <p className={styles.cardSub}>Manage pediatric profiles for your children and family.</p>
          </div>
        </div>
        <div className={styles.emptySoft}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}>
            <UsersIcon />
          </span>
          <strong className={styles.emptyTitle}>No dependents added</strong>
          <p className={styles.emptyText}>
            Add profiles for your children or family members to track immunization schedules, birth records,
            and pediatric health under parental supervision.
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
          <p className={styles.cardSub}>Manage pediatric profiles for your children and family.</p>
        </div>
        <button type="button" className={styles.smBtn} onClick={onAdd}>
          <PlusIcon /> Add Dependent
        </button>
      </div>

      <div className={styles.depGrid}>
        {dependents.map((d) => {
          const completedVac = d.vaccinations?.completed ?? 0;
          const pendingVac = d.vaccinations?.pending ?? 0;
          const totalVac = completedVac + pendingVac;

          return (
            <div
              className={styles.depCard}
              key={d.id || d._id}
              onClick={() => onViewDependent && onViewDependent(d)}
              style={{ cursor: onViewDependent ? 'pointer' : 'default' }}
            >
              <div className={styles.depTop}>
                <span className={styles.depAvatar}>{(d.name || d.fullName || 'C').charAt(0)}</span>
                {d.isIndependent ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <BadgeCheckIcon /> Independent
                  </span>
                ) : d.isAdulthood ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '3px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    🎂 18+ Adult
                  </span>
                ) : (
                  <BadgeCheckIcon />
                )}
              </div>
              <strong className={styles.depName}>{d.name || d.fullName}</strong>
              <p className={styles.depMeta}>
                {d.relation || d.relationship} · {typeof d.age === 'number' ? `Age ${d.age}` : d.age}
              </p>
              <div className={styles.depStats}>
                <span>
                  <strong>{d.bloodGroup || '—'}</strong> Blood Group
                </span>
                <span>
                  <strong>{d.records ?? 0}</strong> Records
                </span>
                <span>
                  <strong>
                    {totalVac > 0 ? `${completedVac}/${totalVac}` : '—'}
                  </strong> Vaccines
                </span>
              </div>
              <button
                type="button"
                className={styles.depView}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewDependent) onViewDependent(d);
                }}
              >
                View Profile <ArrowRightIcon />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}