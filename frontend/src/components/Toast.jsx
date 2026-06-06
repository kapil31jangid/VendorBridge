import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const Toast = ({ toast }) => {
  if (!toast) return null;

  const { message, type } = toast;

  const icons = {
    success: <CheckCircle2 size={18} color="var(--color-success)" />,
    warning: <AlertTriangle size={18} color="var(--color-warning)" />,
    error: <XCircle size={18} color="var(--color-error)" />,
    info: <Info size={18} color="var(--color-info)" />
  };

  const getBorderColor = () => {
    if (type === 'success') return 'var(--color-success)';
    if (type === 'warning') return 'var(--color-warning)';
    if (type === 'error') return 'var(--color-error)';
    return 'var(--primary)';
  };

  const toastStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: `1px solid ${getBorderColor()}`,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 10px rgba(99, 102, 241, 0.1)',
    animation: 'slideIn 0.3s ease forwards',
    maxWidth: '400px'
  };

  return (
    <div style={toastStyle}>
      {icons[type] || icons.success}
      <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)' }}>
        {message}
      </span>
    </div>
  );
};

export default Toast;
