import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { TrendingUp, DollarSign, FileCheck, Users } from 'lucide-react';

const Reports = () => {
  const { purchaseOrders, invoices, vendors, quotations, rfqs } = useContext(AppContext);

  const totalSpend = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
  const paidInvoices = invoices.filter(i => i.status === 'Paid').length;
  const pendingInvoices = invoices.filter(i => i.status === 'Pending').length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const totalRfqs = rfqs.length;
  const totalQuotations = quotations.length;

  const spendByMonth = [
    { month: 'Jan', amount: 85000 },
    { month: 'Feb', amount: 120000 },
    { month: 'Mar', amount: 95000 },
    { month: 'Apr', amount: 140000 },
    { month: 'May', amount: 190000 },
    { month: 'Jun', amount: totalSpend > 0 ? totalSpend : 230000 },
  ];
  const maxAmount = Math.max(...spendByMonth.map(d => d.amount));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports & analytics</h1>
          <p style={{ fontSize: '1rem', marginTop: '0.4rem' }}>Procurement Insights- may 2025</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={topButtonStyle}>May 2025</button>
          <button className="btn btn-outline" style={topButtonStyle}>Export</button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', maxWidth: '800px' }}>
        <div style={{ ...kpiCardStyle, borderColor: '#4da6ff' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4da6ff' }}>12.4 L</div>
          <div style={{ fontSize: '0.85rem', color: '#4da6ff', marginTop: '0.5rem' }}>total spend</div>
        </div>
        <div style={{ ...kpiCardStyle, borderColor: '#0a5c1a' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0a5c1a' }}>28</div>
          <div style={{ fontSize: '0.85rem', color: '#0a5c1a', marginTop: '0.5rem' }}>Active vendors</div>
        </div>
        <div style={{ ...kpiCardStyle, borderColor: '#d97706' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>94%</div>
          <div style={{ fontSize: '0.85rem', color: '#d97706', marginTop: '0.5rem' }}>PO Fulfillment</div>
        </div>
        <div style={{ ...kpiCardStyle, borderColor: '#ff4d4d' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff4d4d' }}>3</div>
          <div style={{ fontSize: '0.85rem', color: '#ff4d4d', marginTop: '0.5rem' }}>overdue invoices</div>
        </div>
      </div>

      {/* Bottom Layout */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', backgroundColor: '#fff', color: '#000', padding: '2rem', borderRadius: 'var(--radius-md)' }}>
        {/* Left Column: SPEND BY CATEGORY */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>SPEND BY CATEGORY</h3>
          
          <div style={categoryRowStyle}>
            <div style={categoryHeaderStyle}>
              <span>IT Hardware</span>
              <span>₹4.8L</span>
            </div>
            <div style={progressBgStyle}><div style={{...progressFillStyle, width: '45%', backgroundColor: '#0056b3'}}></div></div>
          </div>
          
          <div style={categoryRowStyle}>
            <div style={categoryHeaderStyle}>
              <span>Furniture</span>
              <span>₹3.2L</span>
            </div>
            <div style={progressBgStyle}><div style={{...progressFillStyle, width: '30%', backgroundColor: '#14b8a6'}}></div></div>
          </div>

          <div style={categoryRowStyle}>
            <div style={categoryHeaderStyle}>
              <span>Stationery</span>
              <span>₹2.1L</span>
            </div>
            <div style={progressBgStyle}><div style={{...progressFillStyle, width: '20%', backgroundColor: '#f59e0b'}}></div></div>
          </div>

          <div style={categoryRowStyle}>
            <div style={categoryHeaderStyle}>
              <span>Logistics</span>
              <span>₹2.3L</span>
            </div>
            <div style={progressBgStyle}><div style={{...progressFillStyle, width: '22%', backgroundColor: '#ef4444'}}></div></div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Vendors */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: '1rem' }}>TOP VENDORS BY SPEND</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#333' }}>Vendor</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#333' }}>Spend (₹)</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#333' }}>POs</th>
                </tr>
              </thead>
              <tbody style={{ border: '1px solid #e5e7eb' }}>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>TechCore Ltd</td>
                  <td style={{ padding: '0.75rem 1rem' }}>4,20,000</td>
                  <td style={{ padding: '0.75rem 1rem' }}>6</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>Infra Supplies</td>
                  <td style={{ padding: '0.75rem 1rem' }}>3,10,000</td>
                  <td style={{ padding: '0.75rem 1rem' }}>4</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>FastLog</td>
                  <td style={{ padding: '0.75rem 1rem' }}>1,90,000</td>
                  <td style={{ padding: '0.75rem 1rem' }}>3</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Monthly Trend */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: '1rem' }}>MONTHLY TREND</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '0.5rem' }}>
              {[
                { month: 'Dec', h: '30%' },
                { month: 'Jan', h: '45%' },
                { month: 'Feb', h: '35%' },
                { month: 'Mar', h: '60%' },
                { month: 'Apr', h: '55%' },
                { month: 'May', h: '80%' },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: d.h, backgroundColor: d.month === 'May' ? '#0056b3' : '#b3d4f5', borderRadius: '4px 4px 0 0' }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const topButtonStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  padding: '0.4rem 1.5rem',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer'
};

const kpiCardStyle = {
  flex: 1,
  border: '1px solid',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent'
};

const categoryRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem'
};

const categoryHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: '#333'
};

const progressBgStyle = {
  width: '100%',
  height: '8px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  overflow: 'hidden'
};

const progressFillStyle = {
  height: '100%',
  borderRadius: '4px'
};

export default Reports;
