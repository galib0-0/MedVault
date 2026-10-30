import { useState } from 'react';
import { GoogleIcon, XCloseIcon } from './icons';
import { useToast } from './Toast';
import styles from './GoogleSetupModal.module.css';

export default function GoogleSetupModal({ open, onClose, onSaved }) {
  const toast = useToast();
  const [clientId, setClientId] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    const clean = clientId.trim();
    if (!clean) {
      toast('Please enter your Google OAuth Client ID.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/save-google-client-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clean }),
      });

      if (!res.ok) {
        throw new Error('Failed to save Client ID to server configuration.');
      }

      toast('Google Client ID configured successfully! Refreshing to activate...', 'success');
      if (onSaved) onSaved(clean);
      onClose();
      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast(
        'Could not save automatically. Please paste VITE_GOOGLE_CLIENT_ID=' + clean + ' into frontend/.env.',
        'info'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="google-setup-title">
        <div className={styles.header}>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <XCloseIcon />
          </button>
          <div className={styles.googleHeader}>
            <GoogleIcon />
            <h3 id="google-setup-title">Connect Google Cloud OAuth</h3>
          </div>
          <p className={styles.sub}>
            To open the authentic Google Sign-In popup (accounts.google.com) showing your browser's saved Gmail accounts, MedVault requires an OAuth 2.0 Web Client ID.
          </p>
        </div>

        <div className={styles.body}>
          <ol className={styles.stepsList}>
            <li>
              Go to <strong>Google Cloud Console</strong> &rarr; <em>APIs &amp; Services</em> &rarr; <em>Credentials</em>.
            </li>
            <li>
              Click <strong>+ CREATE CREDENTIALS</strong> &rarr; <strong>OAuth client ID</strong> &rarr; Select <strong>Web application</strong>.
            </li>
            <li>
              Under <strong>Authorized JavaScript origins</strong>, add:
              <br />
              <code>http://localhost:5173</code> and <code>http://localhost:5000</code>
            </li>
            <li>
              Copy the generated <strong>Client ID</strong> (ends in <code>.apps.googleusercontent.com</code>) and paste it below:
            </li>
          </ol>

          <form onSubmit={handleSave}>
            <div className={styles.inputGroup}>
              <label htmlFor="clientIdInput">Google OAuth Web Client ID</label>
              <input
                id="clientIdInput"
                type="text"
                placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={saving || !clientId.trim()}>
                {saving ? 'Saving...' : 'Activate Google Sign-In'}
              </button>
            </div>
          </form>

          <div className={styles.footerHint}>
            💡 <strong>Quick Note</strong>: You can also simply reply with your Client ID in the chat, and the AI will configure both <code>frontend/.env</code> and <code>backend/.env</code> for you instantly!
          </div>
        </div>
      </div>
    </div>
  );
}
