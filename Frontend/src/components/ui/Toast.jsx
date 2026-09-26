import { useToast } from '../../hooks/useToast';
import './Toast.css';

const iconMap = {
  success: 'ri-checkbox-circle-fill',
  error: 'ri-error-warning-fill',
  warning: 'ri-alert-fill',
  info: 'ri-information-fill',
};

/**
 * Global toast container. Renders stacked toasts from ToastProvider context.
 * Place once in the app root (e.g., in App.jsx).
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <i className={iconMap[t.type] || iconMap.info}></i>
          <span className="toast-message">{t.message}</span>
          <button
            className="toast-dismiss"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
          >
            <i className="ri-close-line"></i>
          </button>
          {t.duration > 0 && (
            <div
              className="toast-progress"
              style={{ animationDuration: `${t.duration}ms` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
