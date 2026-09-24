import {
  HeartPulseIcon,
  AlertIcon,
  PillIcon,
  ShieldIcon,
  PhoneIcon,
} from '../../../components/icons.jsx';
import styles from '../patient.module.css';

export default function EmergencyCard({ emergency = {}, onEdit }) {
  const bloodGroup = emergency.bloodGroup || '—';
  return (
    <section className={`${styles.card} ${styles.emergency}`} id="emergency">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Emergency Health Information</h3>
          <p className={styles.cardSub}>Quick access for doctors during an emergency.</p>
        </div>
        <button type="button" className={styles.ghostLink} onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className={styles.bloodRow}>
        <span className={styles.bloodGroup}>{bloodGroup}</span>
        <span className={styles.bloodLabel}>
          <HeartPulseIcon /> Blood Group
        </span>
      </div>

      <dl className={styles.infoList}>
        <div className={styles.infoItem}>
          <dt style={{ color: 'var(--danger)' }}>
            <AlertIcon /> Allergies
          </dt>
          <dd>{(emergency.allergies || []).join(', ') || 'None reported'}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt style={{ color: 'var(--success)' }}>
            <PillIcon /> Current Medication
          </dt>
          <dd>{(emergency.medications || []).join(', ') || 'None'}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt>
            <ShieldIcon /> Chronic Conditions
          </dt>
          <dd>
            {(emergency.chronicConditions || ['None reported']).join(', ')}
          </dd>
        </div>
        <div className={styles.infoItem}>
          <dt>
            <PhoneIcon /> Emergency Contact
          </dt>
          <dd>
            {emergency.emergencyContact
              ? `${emergency.emergencyContact.name}${emergency.emergencyContact.relation ? ` (${emergency.emergencyContact.relation})` : ''}${
                  emergency.emergencyContact.phone && emergency.emergencyContact.phone !== 'Not added'
                    ? ` — ${emergency.emergencyContact.phone}`
                    : ''
                }`
              : 'Not added'}
          </dd>
        </div>
      </dl>
    </section>
  );
}