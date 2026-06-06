import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Mail, ShieldCheck, User } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'ERP Dashboard',
  vendors: 'Vendor Directory',
  rfqs: 'Create RFQ',
  quotations: 'Quotations Portal',
  'quotation-comparison': 'Side-by-Side Comparison',
  approvals: 'Approvals Queue',
  'purchase-orders': 'Purchase Orders',
  invoices: 'Invoices',
  activity: 'Audit Trail Logs',
  reports: 'Analytics & Reports',
};

const Navbar = ({ onOpenInbox }) => {
  const { currentUser, activeTab, sentEmails } = useContext(AppContext);
  if (!currentUser) return null;

  return (
    <div style={navbarStyle}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {PAGE_TITLES[activeTab] || 'VendorBridge ERP'}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Email inbox button */}
        <button onClick={onOpenInbox} style={iconBtnStyle} title="Outbox Email Log">
          <Mail size={17} />
          {sentEmails.length > 0 && (
            <span style={badgeStyle}>{sentEmails.length}</span>
          )}
        </button>

        {/* Role */}
        <div style={rolePillStyle}>
          <ShieldCheck size={13} color="var(--primary)" />
          <span>{currentUser.role}</span>
        </div>

        {/* User */}
        <div style={userPillStyle}>
          <User size={13} color="var(--text-muted)" />
          <span>{currentUser.email}</span>
        </div>
      </div>
    </div>
  );
};

const navbarStyle = {
  height: '60px',
  flexShrink: 0,
  backgroundColor: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1.5rem',
};

const iconBtnStyle = {
  position: 'relative',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-color)',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-primary)',
  cursor: 'pointer',
};

const badgeStyle = {
  position: 'absolute',
  top: '-3px',
  right: '-3px',
  backgroundColor: 'var(--primary)',
  color: '#fff',
  fontSize: '0.6rem',
  fontWeight: 700,
  borderRadius: '50%',
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const rolePillStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  backgroundColor: 'rgba(99,102,241,0.1)',
  border: '1px solid rgba(99,102,241,0.2)',
  padding: '0.3rem 0.7rem',
  borderRadius: '999px',
  color: 'var(--primary)',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const userPillStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  padding: '0.3rem 0.7rem',
  borderRadius: '999px',
  color: 'var(--text-secondary)',
  fontSize: '0.78rem',
};

export default Navbar;
