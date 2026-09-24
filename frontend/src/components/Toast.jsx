import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircleIcon, AlertIcon, InfoIcon } from './icons';
import styles from './Toast.module.css';

const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const iconFor = (type) => {
    if (type === 'success') return <CheckCircleIcon />;
    if (type === 'error') return <AlertIcon />;
    return <InfoIcon />;
  };

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className={styles.viewport} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type] || ''}`}
          >
            <span className={styles.icon}>{iconFor(t.type)}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
