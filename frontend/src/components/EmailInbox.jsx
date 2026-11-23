import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Mail } from 'lucide-react';

const EmailInbox = ({ isOpen, onClose }) => {
  const { sentEmails } = useContext(AppContext);
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="outbox-modal-title">
      <div className="modal-panel" style={{ width: '640px' }}>
        <div className="modal-header">
          <h3 id="outbox-modal-title" className="modal-title">System Outbox Log</h3>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={17} />
          </button>
        </div>

        <div style={{ padding: '0.625rem 1.25rem', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Transactional notifications (PO dispatches and invoice alerts) recorded by the platform.
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sentEmails.length === 0 ? (
            <div className="empty-state">
              <Mail size={28} color="var(--text-muted)" />
              <div className="empty-state-title">No emails dispatched</div>
              <div className="empty-state-desc">Outgoing PO and invoice emails will appear here once sent.</div>
            </div>
          ) : (
            sentEmails.map(email => (
              <div
                key={email.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>To: <strong style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{email.recipient}</strong></span>
                  <span className="tabular-nums">{new Date(email.created_at).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {email.subject}
                </div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1.55,
                  }}
                  dangerouslySetInnerHTML={{ __html: email.html_content }}
                />
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailInbox;
