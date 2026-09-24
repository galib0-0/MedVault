import { useState } from 'react';
import {
  AlertIcon,
  SparklesIcon,
  FileTextIcon,
  ChevronDownIcon,
  InfoIcon,
  UploadIcon,
} from '../../../components/icons.jsx';
import styles from '../patient.module.css';
import MarkdownBody from './MarkdownBody';

const LANGS = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'];

export default function AISummaryCard({ aiSummary = null, onUpload }) {
  const [lang, setLang] = useState('English');
  const [open, setOpen] = useState(false);

  if (!aiSummary) {
    return (
      <section className={styles.card} id="summary">
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>Latest AI Summary</h3>
            <p className={styles.cardSub}>Understand your reports in plain language.</p>
          </div>
        </div>
        <div className={styles.emptySoft}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}>
            <SparklesIcon />
          </span>
          <strong className={styles.emptyTitle}>No AI summary yet</strong>
          <p className={styles.emptyText}>
            Upload a medical document and MedVault AI will generate an easy-to-understand
            summary, flag critical findings and summarize it in your preferred language.
          </p>
          <button type="button" className={styles.smBtn} onClick={onUpload}>
            <UploadIcon /> Upload your first document
          </button>
        </div>
      </section>
    );
  }

  const findingType = aiSummary.findingType === 'critical' ? 'critical' : 'warning';

  return (
    <section className={styles.card} id="summary">
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Latest AI Summary</h3>
          <p className={styles.cardSub}>{aiSummary.reportName} · generated {aiSummary.generatedAt}</p>
        </div>

        <div className={styles.topActionsGroup} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {aiSummary.fileUrl && (
            <a
              href={aiSummary.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.smBtn}
              style={{ textDecoration: 'none' }}
            >
              <FileTextIcon /> View Original Document
            </a>
          )}

          <div className={styles.langWrap}>
          <button
            type="button"
            className={styles.langSelect}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {lang}
            <ChevronDownIcon />
          </button>
          {open && (
            <ul className={styles.langMenu} role="listbox">
              {LANGS.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    className={l === lang ? styles.langActive : ''}
                    onClick={() => {
                      setLang(l);
                      setOpen(false);
                    }}
                  >
                    {l}
                    {l === lang && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>

      {aiSummary.report ? (
        <MarkdownBody content={aiSummary.report} />
      ) : (
        <>
          <div className={styles.summaryBody}>
            <p>{aiSummary.summary}</p>
          </div>
          <div className={`${styles.finding} ${findingType === 'warning' ? styles.findingWarn : styles.findingCrit}`}>
            <span className={styles.findingIcon}>
              <AlertIcon />
            </span>
            <div>
              <strong>{aiSummary.finding}</strong>
              <p>{aiSummary.recommendation}</p>
            </div>
          </div>
        </>
      )}

      <p className={styles.disclaimer}>{aiSummary.disclaimer}</p>
    </section>
  );
}