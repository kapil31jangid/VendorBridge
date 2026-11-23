import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { CheckCircle2, Clock, FileText, User, History } from 'lucide-react';

const FILTER_TABS = ['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'];

const matchesFilter = (category, activeFilter) => {
  if (activeFilter === 'All') return true;
  const cat = String(category || '').toLowerCase();
  const filter = activeFilter.toLowerCase();
  if (filter === 'approvals') return cat === 'approval' || cat === 'approvals';
  if (filter === 'invoices') return cat === 'invoice' || cat === 'invoices' || cat === 'po';
  if (filter === 'vendors') return cat === 'vendor' || cat === 'vendors';
  return cat === filter;
};

const ActivityLogs = () => {
  const { activityLogs } = useContext(AppContext);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredLogs = activityLogs.filter(log => matchesFilter(log.category, activeFilter));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity &amp; Logs</h1>
          <p className="page-subtitle">Immutable procurement audit trail across RFQs, approvals, invoices, and vendors</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar" role="tablist">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeFilter === tab}
            onClick={() => setActiveFilter(tab)}
            className={`tab-btn${activeFilter === tab ? ' active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Audit Trail List */}
      <div className="card-flush">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <History size={28} color="var(--text-muted)" />
            <div className="empty-state-title">No audit records</div>
            <div className="empty-state-desc">No activity logs match the selected category.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredLogs.map((log, idx) => {
              const isLast = idx === filteredLogs.length - 1;
              const action = String(log.action || 'Activity recorded');
              const actionLower = action.toLowerCase();
              const category = String(log.category || 'System');
              const details = String(log.details || '');
              const timestamp = log.timestamp || log.created_at || new Date().toISOString();

              let IconComp = History;
              let tone = { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border-color)' };

              if (actionLower.includes('selected') || actionLower.includes('approved') || actionLower.includes('paid')) {
                IconComp = CheckCircle2;
                tone = { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'var(--color-success-border)' };
              } else if (actionLower.includes('pending') || actionLower.includes('awaiting')) {
                IconComp = Clock;
                tone = { bg: 'var(--color-info-bg)', color: 'var(--color-info)', border: 'var(--color-info-border)' };
              } else if (actionLower.includes('published') || category.toLowerCase() === 'rfq') {
                IconComp = FileText;
                tone = { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: 'var(--color-warning-border)' };
              } else if (actionLower.includes('added') || actionLower.includes('registered') || category.toLowerCase().startsWith('vendor')) {
                IconComp = User;
                tone = { bg: 'var(--accent-teal-subtle)', color: 'var(--accent-teal)', border: 'var(--accent-teal-border)' };
              }

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-color)'
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: tone.bg,
                      border: `1px solid ${tone.border}`,
                      color: tone.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <IconComp size={15} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      <strong style={{ fontWeight: 600 }}>{action}</strong>
                      {details && <span style={{ color: 'var(--text-secondary)' }}> — {details}</span>}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {new Date(timestamp).toLocaleString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>

                  <span className="badge badge-neutral" style={{ flexShrink: 0 }}>
                    {category}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
