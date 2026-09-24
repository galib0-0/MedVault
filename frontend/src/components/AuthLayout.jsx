import Logo from './Logo';
import CloudDivider from './CloudDivider';
import styles from './AuthLayout.module.css';

export default function AuthLayout({
  children,
  formTitle,
  formSubtitle,
  wide = false,
}) {
  return (
    <main className={styles.page}>
      <div className={`${styles.card} ${wide ? styles.cardWide : ''}`}>
        <aside className={styles.brandPanel}>
          <p className={styles.welcome}>Welcome to</p>
          <div className={styles.brandCenter}>
            <Logo />
            <h1 className={styles.brandName}>
              MedVault <span>AI</span>
            </h1>
            <p className={styles.brandSub}>
              Your lifelong medical records, secured in one place. AI-powered
              summaries in your language, and verified emergency access for
              doctors.
            </p>
          </div>
          <p className={styles.brandFooter}>
            PATIENT CARE &middot; DOCTOR TRUST &middot; &copy; 2026
          </p>
          <div className={styles.cloudWrap}>
            <CloudDivider variant="vertical" />
          </div>
          <div className={styles.cloudWrapH}>
            <CloudDivider variant="horizontal" />
          </div>
        </aside>
        <section className={styles.formPanel}>
          <div className={styles.formInner}>
            {formTitle && <h2 className={styles.formTitle}>{formTitle}</h2>}
            {formSubtitle && (
              <p className={styles.formSubtitle}>{formSubtitle}</p>
            )}
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
