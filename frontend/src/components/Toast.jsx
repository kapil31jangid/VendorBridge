import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const Toast = ({ toast }) => {
  if (!toast) return null;

  const { message, type } = toast;

  const icons = {
    success: <CheckCircle2 size={16} color="var(--color-success)" />,
    warning: <AlertTriangle size={16} color="var(--color-warning)" />,
    error: <XCircle size={16} color="var(--color-error)" />,
    info: <Info size={16} color="var(--color-info)" />
  };

  const borderAccent =
    type === 'success' ? 'var(--color-success)' :
    type === 'warning' ? 'var(--color-warning)' :
    type === 'error' ? 'var(--color-error)' :
    'var(--primary)';

  return (
    <div
      className="toast-container"
      role="status"
      aria-live="polite"
      style={{ borderLeftColor: borderAccent }}
    >
      <span style={{ display: 'flex', flexShrink: 0 }}>{icons[type] || icons.success}</span>
      <span style={{ fontSize: '0.84375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
        {message}
      </span>
    </div>
  );
};

export default Toast;
