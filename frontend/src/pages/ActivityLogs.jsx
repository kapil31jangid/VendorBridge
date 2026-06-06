import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, History, Search, Calendar, User, Info } from 'lucide-react';

const ActivityLogs = () => {
  const { activityLogs, users } = useContext(AppContext);
  const [activeFilter, setActiveFilter] = useState('All');

  const getUserName = (userId) => {
    const u = users.find(item => item.id === userId);
    return u ? `${u.first_name} ${u.last_name} (${u.role})` : 'System Dispatcher';
  };

  // Filtering logs
  const filteredLogs = activityLogs.filter(log => {
    if (activeFilter === 'All') return true;
    return log.category.toLowerCase() === activeFilter.toLowerCase();
  });

  const getBadgeClass = (category) => {
    const cat = category.toLowerCase();
    if (cat === 'auth') return 'badge-warning';
    if (cat === 'rfq') return 'badge-info';
    if (cat === 'approval') return 'badge-success';
    if (cat === 'invoice' || cat === 'po') return 'badge-success';
    return 'badge-secondary';
  };

  return (
    <div style={wrapperStyle}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Activity and logs</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.4rem' }}>Procurement audit trail</p>
      </div>

      {/* Filter Tabs */}
      <div style={tabContainerStyle}>
        {['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={activeFilter === tab ? activeTabStyle : tabStyle}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Logs List */}
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <History size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No audit trail records match this category.</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const isLast = idx === filteredLogs.length - 1;
            
            // Wireframe matching icons based on hardcoded examples or categories
            let IconComp = History;
            let iconColor = 'var(--text-primary)';
            const actionText = log.action.toLowerCase();
            
            if (actionText.includes('selected') || log.category === 'Approval' && log.action.includes('Approved')) {
              IconComp = ShieldCheck;
              iconColor = '#14b8a6'; // green
            } else if (actionText.includes('pending') || actionText.includes('awaiting')) {
              IconComp = History; // clock-like
              iconColor = '#3b82f6'; // blue
            } else if (actionText.includes('published') || log.category === 'RFQ') {
              IconComp = Info; // document-like
              iconColor = '#f59e0b'; // orange/white
            } else if (actionText.includes('added') || actionText.includes('registered') || log.category === 'Vendor') {
              IconComp = User;
              iconColor = '#ec4899'; // pink
            }

            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 0', borderBottom: isLast ? 'none' : '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${iconColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={18} color={iconColor} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {log.action} {log.details ? `- ${log.details.toLowerCase()}` : ''}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* Styles */
const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '1rem 0'
};

const tabContainerStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem'
};

const tabStyle = {
  backgroundColor: 'transparent',
  border: '1px solid var(--text-primary)',
  padding: '0.4rem 1.5rem',
  cursor: 'pointer',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  fontWeight: '500',
  borderRadius: 'var(--radius-md)',
  outline: 'none'
};

const activeTabStyle = {
  ...tabStyle,
  backgroundColor: 'rgba(59, 130, 246, 0.2)',
  borderColor: '#3b82f6',
  color: '#3b82f6'
};

export default ActivityLogs;
