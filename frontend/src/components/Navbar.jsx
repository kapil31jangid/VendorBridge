import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Mail } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  vendors: 'Vendors',
  rfqs: 'Request for Quotation',
  quotations: 'Quotations',
  'quotation-comparison': 'Quotation Comparison',
  approvals: 'Approvals',
  'purchase-orders': 'Purchase Orders',
  invoices: 'Invoices',
  activity: 'Activity & Audit Trail',
  reports: 'Reports & Analytics',
};

const Navbar = ({ onOpenInbox }) => {
  const { currentUser, activeTab, sentEmails } = useContext(AppContext);
  if (!currentUser) return null;

  const initials = `${currentUser.first_name?.[0] || ''}${currentUser.last_name?.[0] || ''}`.toUpperCase() || 'VB';

  return (
    <header className="navbar-container">
      <div className="navbar-title">
        {PAGE_TITLES[activeTab] || 'VendorBridge'}
      </div>

      <div className="navbar-right">
        <button
          type="button"
          onClick={onOpenInbox}
          className="navbar-icon-btn"
          title="System Outbox Log"
          aria-label="Open System Outbox Log"
        >
          <Mail size={16} />
          {sentEmails.length > 0 && (
            <span className="navbar-badge tabular-nums">{sentEmails.length}</span>
          )}
        </button>

        <div className="navbar-divider" />

        <div className="navbar-user-block">
          <div className="navbar-avatar" aria-hidden="true">{initials}</div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {currentUser.email}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
