import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  LayoutDashboard, Users, FileText, Coins, ClipboardCheck,
  Receipt, History, BarChart3, LogOut, ShieldCheck, FileCheck
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
    <div style={sidebarStyle}>
      {/* Logo */}
      <div style={logoStyle}>
        <div style={logoIconStyle}>VB</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>VendorBridge</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ERP SYSTEM</div>
        </div>
      </div>

      {/* Role badge */}
      <div style={roleBadgeContainerStyle}>
        <ShieldCheck size={13} color="var(--accent-teal)" />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {currentUser.role}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {currentUser.first_name}
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, marginTop: '0.5rem', overflowY: 'auto' }}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.key || (item.key === 'quotations' && activeTab === 'quotation-comparison');
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={isActive ? activeNavStyle : navItemStyle}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {isActive && <div style={activeDotStyle} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={logout} style={logoutBtnStyle}>
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

const sidebarStyle = {
  width: '220px',
  flexShrink: 0,
  backgroundColor: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.25rem 0.75rem',
  gap: '0.25rem',
  height: '100vh',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0 0.5rem 1rem 0.5rem',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '0.75rem',
};

const logoIconStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: 'rgba(99,102,241,0.15)',
  border: '1px solid var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: '0.9rem',
  color: 'var(--primary)',
  flexShrink: 0,
};

const roleBadgeContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  backgroundColor: 'rgba(20,184,166,0.06)',
  border: '1px solid rgba(20,184,166,0.15)',
  borderRadius: '6px',
  padding: '0.4rem 0.65rem',
  marginBottom: '0.75rem',
};

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  width: '100%',
  padding: '0.6rem 0.75rem',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: 'var(--text-secondary)',
  fontSize: '0.82rem',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.15s ease',
  position: 'relative',
};

const activeNavStyle = {
  ...navItemStyle,
  backgroundColor: 'rgba(99,102,241,0.1)',
  color: 'var(--primary)',
  fontWeight: 700,
};

const activeDotStyle = {
  position: 'absolute',
  right: '10px',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary)',
  boxShadow: '0 0 6px var(--primary)',
};

const logoutBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  width: '100%',
  padding: '0.6rem 0.75rem',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--color-error)',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '0.5rem',
};

export default Sidebar;
