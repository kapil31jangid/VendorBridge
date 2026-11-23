import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  LayoutDashboard, Users, FileText, Coins, ClipboardCheck,
  Receipt, History, BarChart3, LogOut, FileCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',       label: 'Dashboard',       icon: LayoutDashboard,  roles: ['Officer','Manager','Admin','Vendor'] },
  { key: 'vendors',         label: 'Vendors',         icon: Users,            roles: ['Officer','Admin','Manager'] },
  { key: 'rfqs',            label: "RFQ's",           icon: FileText,         roles: ['Officer','Admin','Manager','Vendor'] },
  { key: 'quotations',      label: 'Quotations',      icon: Coins,            roles: ['Officer','Manager','Admin','Vendor'] },
  { key: 'approvals',       label: 'Approvals',       icon: ClipboardCheck,   roles: ['Officer','Manager','Admin'] },
  { key: 'purchase-orders', label: 'Purchase orders', icon: FileCheck,        roles: ['Officer','Manager','Admin','Vendor'] },
  { key: 'invoices',        label: 'Invoices',        icon: Receipt,          roles: ['Officer','Manager','Admin','Vendor'] },
  { key: 'reports',         label: 'Reports',         icon: BarChart3,        roles: ['Officer','Manager','Admin'] },
  { key: 'activity',        label: 'Activity',        icon: History,          roles: ['Officer','Manager','Admin'] },
];

const Sidebar = () => {
  const { currentUser, activeTab, setActiveTab, logout } = useContext(AppContext);
  if (!currentUser) return null;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="sidebar-container" aria-label="Primary Navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-mark">VB</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            VendorBridge
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Procurement ERP
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.key || (item.key === 'quotations' && activeTab === 'quotation-comparison');
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} strokeWidth={isActive ? 2.1 : 1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role indicator & Sign out */}
      <div className="sidebar-footer">
        <div className="sidebar-user-meta">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.first_name} {currentUser.last_name || ''}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {currentUser.role}
            </div>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
            {currentUser.role}
          </span>
        </div>

        <button type="button" onClick={logout} className="sidebar-logout-btn">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
