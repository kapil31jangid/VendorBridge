import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, UserPlus, Receipt, BarChart2 } from 'lucide-react';

const formatCompactCurrency = (amount) => {
  if (!amount || amount <= 0) return '$0';
  if (amount >= 100000) return `$${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toLocaleString()}`;
};

const Dashboard = () => {
  const {
    rfqs,
    purchaseOrders,
    invoices,
    vendors,
    quotations,
    setActiveTab,
    currentUser
  } = useContext(AppContext);

  // Compute live metrics strictly from AppContext
  const activeRfqsCount = rfqs.filter(r => r.status === 'Active' || r.status === 'Comparison').length;
  const pendingApprovalsCount = quotations.filter(q => q.status === 'Submitted').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'Pending').length;
  const totalSpend = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);

  // Recent Purchase Orders from live state
  const poRows = [...purchaseOrders]
    .reverse()
    .slice(0, 5)
    .map((po, idx) => {
      const quot = quotations.find(q => q.id === po.quotation_id);
      const vend = vendors.find(v => v.id === quot?.vendor_id);
      const matchedInvoice = invoices.find(inv => inv.po_id === po.id);
      return {
        id: po.id,
        po_number: po.po_number || `PO-${idx + 1}`,
        vendor: vend ? vend.name : 'Unassigned Vendor',
        amount: quot ? Number(quot.grand_total || 0) : 0,
        status: matchedInvoice ? (matchedInvoice.status === 'Paid' ? 'Paid' : 'Pending') : 'Draft'
      };
    });

  // Compute real spend by category from invoices -> POs -> RFQs (or quotations)
  const categorySpendMap = {};
  invoices.forEach(inv => {
    const po = purchaseOrders.find(p => p.id === inv.po_id);
    const rfq = po ? rfqs.find(r => r.id === po.rfq_id) : null;
    const category = rfq?.category || 'General Procurement';
    categorySpendMap[category] = (categorySpendMap[category] || 0) + Number(inv.grand_total || 0);
  });

  // Also summarize quoted pipeline by category if invoices are sparse
  const categoryBreakdown = Object.entries(categorySpendMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const maxCategoryAmount = categoryBreakdown.length > 0
    ? Math.max(...categoryBreakdown.map(c => c.amount))
    : 0;

  // Group invoices by month for honest trend data
  const monthlySpendMap = {};
  invoices.forEach(inv => {
    const dateVal = inv.date || inv.created_at;
    if (!dateVal) return;
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return;
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    monthlySpendMap[key] = (monthlySpendMap[key] || 0) + Number(inv.grand_total || 0);
  });
  const monthlySeries = Object.entries(monthlySpendMap).map(([label, amount]) => ({ label, amount }));
  const maxMonthAmount = monthlySeries.length > 0 ? Math.max(...monthlySeries.map(m => m.amount)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner Header (Screen 3) */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {currentUser.role === 'Officer' ? 'Procurement Officer' : currentUser.role} — today&apos;s procurement overview
          </p>
        </div>
      </div>

      {/* Four KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Active RFQs</span>
          <span className="kpi-value">{activeRfqsCount}</span>
          <span className="kpi-sub">Open or under comparison</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Pending Approvals</span>
          <span className="kpi-value">{pendingApprovalsCount}</span>
          <span className="kpi-sub">Quotations awaiting review</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">POs This Month</span>
          <span className="kpi-value">{formatCompactCurrency(totalSpend)}</span>
          <span className="kpi-sub tabular-nums">{purchaseOrders.length} purchase order{purchaseOrders.length === 1 ? '' : 's'} issued</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Pending Invoices</span>
          <span className="kpi-value" style={{ color: pendingInvoicesCount > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
            {pendingInvoicesCount}
          </span>
          <span className="kpi-sub">Awaiting payment settlement</span>
        </div>
      </div>

      {/* Two-Column Middle Section: Recent Purchase Orders (Left) & Spending Trends (Right) */}
      <div className="dashboard-split">
        {/* Left: Recent Purchase Orders Table */}
        <div className="card-flush" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-heading">Recent Purchase Orders</h2>
            <button
              type="button"
              onClick={() => setActiveTab('purchase-orders')}
              className="btn btn-ghost btn-sm"
            >
              View all
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Vendor</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {poRows.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      No purchase orders have been issued yet.
                    </td>
                  </tr>
                ) : (
                  poRows.map(po => (
                    <tr key={po.id}>
                      <td className="tabular-nums" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {po.po_number}
                      </td>
                      <td>{po.vendor}</td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 500 }}>
                        ${po.amount.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${
                          po.status === 'Paid' ? 'badge-success' :
                          po.status === 'Pending' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Data-Driven Spending Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="section-heading">Spending Overview</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Based on recorded invoices
              </p>
            </div>
            <span className="tabular-nums" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ${totalSpend.toLocaleString()}
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <BarChart2 size={24} color="var(--text-muted)" />
              <div className="empty-state-title">No spending data yet</div>
              <div className="empty-state-desc">
                Spending trends will populate once purchase orders and invoices are recorded.
              </div>
            </div>
          ) : (
            <>
              {/* Spend by Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="section-eyebrow">By Category</div>
                {categoryBreakdown.map(item => {
                  const pct = maxCategoryAmount > 0 ? Math.round((item.amount / maxCategoryAmount) * 100) : 0;
                  return (
                    <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.category}</span>
                        <span className="tabular-nums" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-full)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Distribution (honest representation of available invoice periods) */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>Recorded Period Spend</div>
                {monthlySeries.length < 2 ? (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{monthlySeries[0]?.label || 'Current Period'}</span>
                    <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${(monthlySeries[0]?.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '96px', paddingTop: '0.5rem' }}>
                    {monthlySeries.map(m => {
                      const heightPct = maxMonthAmount > 0 ? Math.max(12, Math.round((m.amount / maxMonthAmount) * 100)) : 12;
                      return (
                        <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                          <div
                            title={`${m.label}: $${m.amount.toLocaleString()}`}
                            style={{ width: '100%', maxWidth: '36px', height: `${heightPct}%`, backgroundColor: 'var(--primary)', borderRadius: '3px 3px 0 0' }}
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Quick Actions Row */}
      {currentUser.role !== 'Vendor' && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setActiveTab('rfqs')} className="btn btn-primary">
            <Plus size={15} />
            <span>New RFQ</span>
          </button>
          <button type="button" onClick={() => setActiveTab('vendors')} className="btn btn-secondary">
            <UserPlus size={15} />
            <span>Add Vendor</span>
          </button>
          <button type="button" onClick={() => setActiveTab('invoices')} className="btn btn-secondary">
            <Receipt size={15} />
            <span>View Invoices</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
