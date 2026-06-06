import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Mail, Calendar, User } from 'lucide-react';

const EmailInbox = ({ isOpen, onClose }) => {
  const { sentEmails } = useContext(AppContext);
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>System Outbox Log</h3>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <div style={infoBannerStyle}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            All transactional emails (PO dispatch, invoice alerts) captured here for offline demo purposes.
          </p>
        </div>

        <div style={listStyle}>
          {sentEmails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Mail size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>No emails dispatched yet.</p>
            </div>
          ) : (
            sentEmails.map(email => (
              <div key={email.id} style={emailCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={12} /><span>To: {email.recipient}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={12} /><span>{new Date(email.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>{email.subject}</div>
                <div
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.6rem', borderRadius: '6px', fontFamily: 'monospace', whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: email.html_content }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(5,5,10,0.75)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' };
const modalStyle = { width: '640px', maxWidth: '95%', maxHeight: '80vh', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' };
const closeBtnStyle = { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const infoBannerStyle = { padding: '0.6rem 1.25rem', backgroundColor: 'rgba(99,102,241,0.05)', borderBottom: '1px solid var(--border-color)' };
const listStyle = { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const emailCardStyle = { backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' };

export default EmailInbox;
