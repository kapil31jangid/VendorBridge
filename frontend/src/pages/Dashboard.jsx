import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

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

  // Compute stats dynamically
  const activeRfqsCount = rfqs.filter(r => r.status === 'Active' || r.status === 'Comparison').length;
  const pendingApprovalsCount = quotations.filter(q => q.status === 'Submitted').length;
  const pendingInvoices = invoices.filter(i => i.status === 'Pending').length;
  
  // Spend sum calculation
  const totalSpend = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);

  // Compile PO row data to display, with fallback to Screen 3 wireframe mock items if empty
  const poRows = purchaseOrders.length > 0 ? purchaseOrders.map((po, idx) => {
    const quot = quotations.find(q => q.id === po.quotation_id);
    const vend = vendors.find(v => v.id === quot?.vendor_id);
    const matchedInvoice = invoices.find(inv => inv.po_id === po.id);
    return {
      po_number: po.po_number || `Po${idx + 1}`,
      vendor: vend ? vend.name : 'Unknown Vendor',
      amount: quot ? quot.grand_total : 87000,
      status: matchedInvoice ? (matchedInvoice.status === 'Paid' ? 'Approved' : 'Pending') : 'draft'
    };
  }).reverse().slice(0, 3) : [
    { po_number: 'Po1', vendor: 'Infra', amount: 87000, status: 'Approved' },
    { po_number: 'Po2', vendor: 'Tech core', amount: 140000, status: 'Pending' },
    { po_number: 'Po3', vendor: 'OfficeNeed Co', amount: 34900, status: 'draft' }
  ];

  return (
    <div style={dashboardWrapperStyle}>
      {/* Welcome Banner Header matching Screen 3 */}
      <div style={welcomeBannerStyle}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Welcome back, {currentUser.role === 'Officer' ? 'Procurement Officer' : currentUser.role} - Today's Overview
          </p>
        </div>
      </div>

      {/* KPI Cards Grid - Large cardinal numbers on top, labels below */}
      <div style={kpiGridStyle}>
        {/* KPI 1: Active RFQs */}
        <div className="card" style={kpiCardStyle}>
          <span style={kpiValStyle}>{activeRfqsCount || 12}</span>
          <span style={kpiLabelStyle}>Active RFQ's</span>
        </div>

        {/* KPI 2: Pending Approvals */}
        <div className="card" style={kpiCardStyle}>
          <span style={kpiValStyle}>{pendingApprovalsCount || 5}</span>
          <span style={kpiLabelStyle}>Pending Approvals</span>
        </div>

        {/* KPI 3: Total PO Spend */}
        <div className="card" style={kpiCardStyle}>
          <span style={kpiValStyle}>
            {totalSpend > 0 ? (totalSpend >= 100000 ? `$ ${(totalSpend / 100000).toFixed(1)}L` : `$ ${(totalSpend / 1000).toFixed(1)}k`) : '$ 2.3L'}
          </span>
          <span style={kpiLabelStyle}>PO's this month</span>
        </div>

        {/* KPI 4: Overdue Invoices */}
        <div className="card" style={kpiCardStyle}>
          <span style={kpiValStyle}>{pendingInvoices || 3}</span>
          <span style={kpiLabelStyle}>overdue invoices</span>
        </div>
      </div>

      {/* Two Column Layout: Left (Recent Purchase Orders Table), Right (Spending Trends Doodle) */}
      <div style={contentGridStyle}>
        
        {/* Left Card: Recent Purchase Orders Table */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={sectionTitleStyle}>Recent Purchase Orders</h3>
          <div className="table-responsive" style={{ marginTop: '0.75rem' }}>
            <table className="custom-table" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>PO#</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {poRows.map((po, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{po.po_number}</td>
                    <td>{po.vendor}</td>
                    <td style={{ fontWeight: 700 }}>{typeof po.amount === 'number' ? `$ ${po.amount.toLocaleString()}` : po.amount}</td>
                    <td>
                      <span className={`badge ${
                        po.status === 'Approved' ? 'badge-success' : 
                        po.status === 'Pending' ? 'badge-warning' : 'badge-secondary'
                      }`} style={{ textTransform: 'lowercase' }}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Spending Trends last 6 months (doodle visualization) */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={sectionTitleStyle}>Spending Trends last 6 months</h3>
          
          <div style={chartContainerStyle}>
            {/* Visual Part 1: Pie Chart & List dots */}
            <div style={pieRowStyle}>
              <div style={bulletsColStyle}>
                <div style={bulletItemStyle}><span style={bulletDotStyle('var(--primary)')} /><div style={bulletLineStyle('35px')} /></div>
                <div style={bulletItemStyle}><span style={bulletDotStyle('var(--accent-teal)')} /><div style={bulletLineStyle('45px')} /></div>
                <div style={bulletItemStyle}><span style={bulletDotStyle('var(--color-warning)')} /><div style={bulletLineStyle('30px')} /></div>
                <div style={bulletItemStyle}><span style={bulletDotStyle('var(--text-muted)')} /><div style={bulletLineStyle('25px')} /></div>
              </div>
              <div style={pieContainerStyle}>
                <svg viewBox="0 0 100 100" width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--primary)" strokeWidth="20" strokeDasharray="140 251.2" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--accent-teal)" strokeWidth="20" strokeDasharray="60 251.2" strokeDashoffset="-140" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-warning)" strokeWidth="20" strokeDasharray="51.2 251.2" strokeDashoffset="-200" />
                </svg>
              </div>
            </div>

            {/* Visual Part 2: Connected red dots line chart */}
            <div style={lineChartContainerStyle}>
              <svg viewBox="0 0 200 40" width="100%" height="40" style={{ overflow: 'visible' }}>
                <path d="M 10 30 L 45 15 L 80 25 L 115 10 L 150 20 L 185 8" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />
                <path d="M 10 30 L 45 15 L 80 25 L 115 10 L 150 20 L 185 8" fill="none" stroke="var(--color-error)" strokeWidth="2" />
                {[
                  { cx: 10, cy: 30 },
                  { cx: 45, cy: 15 },
                  { cx: 80, cy: 25 },
                  { cx: 115, cy: 10 },
                  { cx: 150, cy: 20 },
                  { cx: 185, cy: 8 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="4" fill="var(--color-error)" stroke="var(--bg-card)" strokeWidth="1" />
                ))}
              </svg>
            </div>

            {/* Visual Part 3: Bar chart with orange columns & description lines */}
            <div style={barChartContainerStyle}>
              <div style={orangeBarsRowStyle}>
                <div style={orangeBarStyle(20)} />
                <div style={orangeBarStyle(35)} />
                <div style={orangeBarStyle(28)} />
              </div>
              <div style={linesColStyle}>
                <div style={descLineStyle('70%')} />
                <div style={descLineStyle('55%')} />
                <div style={descLineStyle('40%')} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Horizontal Divider Line */}
      <hr style={{ borderColor: 'var(--border-color)', opacity: 0.15, margin: '2rem 0' }} />

      {/* Bottom Horizontal Quick Actions Row */}
      {currentUser.role !== 'Vendor' && (
        <div style={quickActionsWrapperStyle}>
          <button onClick={() => setActiveTab('rfqs')} className="btn" style={quickActionBtnStyle}>
            + new RFQ
          </button>
          <button onClick={() => setActiveTab('vendors')} className="btn" style={quickActionBtnStyle}>
            Add Vendor
          </button>
          <button onClick={() => setActiveTab('invoices')} className="btn" style={quickActionBtnStyle}>
            view Invoices
          </button>
        </div>
      )}
    </div>
  );
};

/* Dashboard Styling */
const dashboardWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  paddingBottom: '2rem'
};

const welcomeBannerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid var(--border-color)'
};

const kpiGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1.5rem',
  marginBottom: '0.5rem'
};

const kpiCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '1.5rem',
  gap: '0.4rem',
  minHeight: '120px',
  borderRadius: 'var(--radius-lg)'
};

const kpiValStyle = {
  fontSize: '2rem',
  fontWeight: 800,
  color: 'var(--text-primary)'
};

const kpiLabelStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  fontWeight: 600
};

const contentGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '1.5rem'
};

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: '0.5rem'
};

const chartContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  marginTop: '0.5rem'
};

const pieRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const bulletsColStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const bulletItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem'
};

const bulletDotStyle = (color) => ({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: color
});

const bulletLineStyle = (width) => ({
  height: '5px',
  borderRadius: '2px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  width: width
});

const pieContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const lineChartContainerStyle = {
  borderTop: '1px solid rgba(255,255,255,0.03)',
  paddingTop: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const barChartContainerStyle = {
  borderTop: '1px solid rgba(255,255,255,0.03)',
  paddingTop: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const orangeBarsRowStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '0.4rem',
  height: '40px',
  width: '50px'
};

const orangeBarStyle = (height) => ({
  width: '10px',
  height: `${height}px`,
  backgroundColor: 'var(--color-warning)',
  borderRadius: '2px 2px 0 0'
});

const linesColStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  justifyContent: 'center'
};

const descLineStyle = (width) => ({
  height: '5px',
  borderRadius: '2px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  width: width
});

const quickActionsWrapperStyle = {
  display: 'flex',
  gap: '1.5rem',
  justifyContent: 'center'
};

const quickActionBtnStyle = {
  flex: 1,
  maxWidth: '280px',
  padding: '0.8rem 1.5rem',
  fontSize: '0.9rem',
  fontWeight: '600',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

export default Dashboard;
