import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Download, BarChart2 } from 'lucide-react';

const formatCompact = (amount) => {
  if (!amount || amount <= 0) return '$0';
  if (amount >= 100000) return `$${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toLocaleString()}`;
};

const Reports = () => {
  const { purchaseOrders, invoices, vendors, quotations, rfqs } = useContext(AppContext);

  const totalSpend = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
  const activeVendorsCount = vendors.filter(v => v.status === 'Active').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'Pending').length;
  const paidInvoicesCount = invoices.filter(i => i.status === 'Paid').length;
  const fulfillmentRate = invoices.length > 0
    ? Math.round((paidInvoicesCount / invoices.length) * 100)
    : purchaseOrders.length > 0
      ? 100
      : 0;

  // Compute spend by category from real invoices -> POs -> RFQs
  const categoryTotals = {};
  invoices.forEach(inv => {
    const po = purchaseOrders.find(p => p.id === inv.po_id);
    const rfq = po ? rfqs.find(r => r.id === po.rfq_id) : null;
    const category = rfq?.category || 'General';
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(inv.grand_total || 0);
  });

  const categoryRows = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const maxCategorySpend = categoryRows.length > 0
    ? Math.max(...categoryRows.map(c => c.amount))
    : 0;

  // Compute top vendors by spend from real purchase orders + quotations
  const vendorStatsMap = {};
  purchaseOrders.forEach(po => {
    const quot = quotations.find(q => q.id === po.quotation_id);
    if (!quot) return;
    const v = vendors.find(item => item.id === quot.vendor_id);
    const name = v ? v.name : `Vendor #${quot.vendor_id}`;
    if (!vendorStatsMap[name]) {
      vendorStatsMap[name] = { name, spend: 0, pos: 0 };
    }
    vendorStatsMap[name].spend += Number(quot.grand_total || 0);
    vendorStatsMap[name].pos += 1;
  });

  const topVendors = Object.values(vendorStatsMap).sort((a, b) => b.spend - a.spend);

  // Compute monthly trend from real invoice dates
  const monthlyMap = {};
  invoices.forEach(inv => {
    const d = new Date(inv.date || inv.created_at);
    if (Number.isNaN(d.getTime())) return;
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(inv.grand_total || 0);
  });
  const monthlySeries = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));
  const maxMonthlySpend = monthlySeries.length > 0 ? Math.max(...monthlySeries.map(m => m.amount)) : 0;

  const handleExport = () => {
    const lines = [
      'VendorBridge Procurement Report',
      `Total Spend,$${totalSpend.toLocaleString()}`,
      `Active Vendors,${activeVendorsCount}`,
      `POs Issued,${purchaseOrders.length}`,
      `Pending Invoices,${pendingInvoicesCount}`,
      '',
      'Top Vendors,Spend,POs',
      ...topVendors.map(v => `"${v.name}",${v.spend},${v.pos}`)
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vendorbridge-procurement-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <p className="page-subtitle">Live procurement insights computed from recorded purchase orders and invoices</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Four KPI Cards (Screen 11 order) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Spend</span>
          <span className="kpi-value" style={{ color: 'var(--primary)' }}>{formatCompact(totalSpend)}</span>
          <span className="kpi-sub tabular-nums">${totalSpend.toLocaleString()} total invoiced</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Active Vendors</span>
          <span className="kpi-value" style={{ color: 'var(--color-success)' }}>{activeVendorsCount}</span>
          <span className="kpi-sub tabular-nums">of {vendors.length} registered</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Settlement Rate</span>
          <span className="kpi-value">{fulfillmentRate}%</span>
          <span className="kpi-sub tabular-nums">{paidInvoicesCount} of {invoices.length} invoices settled</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Pending Invoices</span>
          <span className="kpi-value" style={{ color: pendingInvoicesCount > 0 ? 'var(--color-error)' : 'var(--text-primary)' }}>
            {pendingInvoicesCount}
          </span>
          <span className="kpi-sub">Open payment obligations</span>
        </div>
      </div>

      {/* Bottom Two-Column Layout */}
      <div className="reports-split">
        {/* Left Column: Spend by Category */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 className="section-eyebrow">Spend by Category</h2>

          {categoryRows.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <BarChart2 size={24} color="var(--text-muted)" />
              <div className="empty-state-title">No category spend recorded</div>
              <div className="empty-state-desc">Category totals will appear once invoices are generated.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categoryRows.map((item, idx) => {
                const pct = maxCategorySpend > 0 ? Math.round((item.amount / maxCategorySpend) * 100) : 0;
                const barColors = ['var(--primary)', 'var(--accent-teal)', '#0369a1', '#64748b'];
                return (
                  <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84375rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.category}</span>
                      <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColors[idx % barColors.length], borderRadius: 'var(--radius-full)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Top Vendors & Monthly Trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Vendors by Spend */}
          <div className="card-flush">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 className="section-eyebrow">Top Vendors by Spend</h2>
            </div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th style={{ textAlign: 'right' }}>Spend ($)</th>
                    <th style={{ textAlign: 'right' }}>POs</th>
                  </tr>
                </thead>
                <tbody>
                  {topVendors.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No vendor spend recorded yet.
                      </td>
                    </tr>
                  ) : (
                    topVendors.map(v => (
                      <tr key={v.name}>
                        <td style={{ fontWeight: 500 }}>{v.name}</td>
                        <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                          ${v.spend.toLocaleString()}
                        </td>
                        <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                          {v.pos}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 className="section-eyebrow">Monthly Trend</h2>
            {monthlySeries.length === 0 ? (
              <div style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
                No monthly invoice history available yet.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', height: '150px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1rem', backgroundColor: 'var(--bg-primary)' }}>
                {monthlySeries.map((d, i) => {
                  const pct = maxMonthlySpend > 0 ? Math.max(15, Math.round((d.amount / maxMonthlySpend) * 100)) : 15;
                  const isLatest = i === monthlySeries.length - 1;
                  return (
                    <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1, maxWidth: '72px', height: '100%', justifyContent: 'flex-end' }}>
                      <span className="tabular-nums" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {formatCompact(d.amount)}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          height: `${pct}%`,
                          backgroundColor: isLatest ? 'var(--primary)' : '#93c5fd',
                          borderRadius: '4px 4px 0 0'
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{d.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
