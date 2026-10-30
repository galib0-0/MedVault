import { useState, useEffect } from 'react';
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
import { translateRecordSummary, syncMedications, reSummarizeRecord } from '../../../lib/records';
import { useToast } from '../../../components/Toast';

const LANGS = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi'];

export default function AISummaryCard({ aiSummary = null, onUpload }) {
  const toast = useToast();
  const [lang, setLang] = useState('English');
  const [open, setOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transError, setTransError] = useState('');
  const [syncingMeds, setSyncingMeds] = useState(false);
  const [reSummarizing, setReSummarizing] = useState(false);

  const handleReSummarize = async () => {
    if (!aiSummary?.id) return;
    setReSummarizing(true);
    try {
      await reSummarizeRecord(aiSummary.id);
      toast('Generating full AI summary with Google Gemini. Updating now...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (err) {
      toast(err.message || 'Failed to trigger Gemini summarization.', 'error');
      setReSummarizing(false);
    }
  };

  const handleSyncMeds = async () => {
    if (!aiSummary?.id) return;
    setSyncingMeds(true);
    try {
      const res = await syncMedications(aiSummary.id);
      toast(res.message || 'Medications synchronized to your health profile!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to sync medications.', 'error');
    } finally {
      setSyncingMeds(false);
    }
  };

  // Reset when document changes
  useEffect(() => {
    setLang('English');
    setTranslatedText(null);
    setTransError('');
  }, [aiSummary?.reportName]);

  const handleSelectLang = async (targetLang) => {
    setLang(targetLang);
    setOpen(false);
    setTransError('');

    if (targetLang === 'English') {
      setTranslatedText(null);
      return;
    }

    const textToTranslate = aiSummary?.report || aiSummary?.summary;
    if (!textToTranslate) return;

    setIsTranslating(true);
    try {
      const res = await translateRecordSummary({
        text: textToTranslate,
        language: targetLang,
        recordId: aiSummary?.id,
      });
      setTranslatedText(res.translated);
    } catch (err) {
      setTransError(`Translation to ${targetLang} failed: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

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
                    onClick={() => handleSelectLang(l)}
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

      {isTranslating ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1', margin: '14px 0' }}>
          <div style={{ fontSize: '28px', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>🔄</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1d4ed8', marginTop: '10px' }}>
            Translating medical report to {lang}...
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
            Powered by Google Gemini • Preserving clinical parameters and severity indicators
          </p>
        </div>
      ) : transError ? (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', margin: '14px 0' }}>
          ⚠️ {transError}
        </div>
      ) : aiSummary.isProcessing ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f0f9ff', borderRadius: '14px', border: '1.5px dashed #7dd3fc', margin: '14px 0' }}>
          <div style={{ fontSize: '32px', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }}>⚡</div>
          <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.8; } }`}</style>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0369a1', margin: '12px 0 6px' }}>
            AI Analysis in Progress...
          </h4>
          <p style={{ fontSize: '13px', color: '#0c4a6e', maxWidth: '480px', margin: '0 auto', lineHeight: '1.5' }}>
            MedVault AI is currently analyzing <strong>{aiSummary.reportName}</strong> using Google Gemini. Extracting clinical observations, laboratory values, and treatment guidance.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: '#0284c7', background: '#e0f2fe', padding: '6px 14px', borderRadius: '20px', fontWeight: '600' }}>
            <span style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⏳</span> Auto-updating in a few moments...
          </div>
        </div>
      ) : (
        <>
          {lang !== 'English' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', marginBottom: '12px' }}>
              🌐 Translated to {lang} via MedVault AI
            </div>
          )}

          {translatedText ? (
            <MarkdownBody content={translatedText} />
          ) : aiSummary.report ? (
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

              {aiSummary.id && (aiSummary.source === 'local' || aiSummary.source === 'error' || aiSummary.finding?.includes('unavailable') || aiSummary.finding?.includes('error')) && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                  borderRadius: '12px',
                  border: '1.5px solid #93c5fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div style={{ minWidth: '240px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>✨ MedVault AI Service Ready</span>
                    </strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0' }}>
                      Analyze complete laboratory parameters, reference ranges, and doctor impressions with Google Gemini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReSummarize}
                    disabled={reSummarizing}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: reSummarizing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {reSummarizing ? '⚡ Generating with Gemini...' : '⚡ Generate Full AI Summary with Gemini'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {aiSummary.medications && aiSummary.medications.length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>💊</span>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                Deciphered Prescription & Medication Schedule
              </strong>
            </div>
            {aiSummary.id && (
              <button
                type="button"
                onClick={handleSyncMeds}
                disabled={syncingMeds}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {syncingMeds ? 'Syncing...' : '➕ Sync to My Profile'}
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Medicine</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Dosage</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Frequency</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Food Timing</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {aiSummary.medications.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0f172a' }}>{m.name}</td>
                    <td style={{ padding: '8px 10px', color: '#334155' }}>{m.dosage || '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#1d4ed8', fontWeight: '600' }}>{m.frequency || '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#059669' }}>{m.timing || '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{m.duration || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className={styles.disclaimer}>{aiSummary.disclaimer}</p>
    </section>
  );
}