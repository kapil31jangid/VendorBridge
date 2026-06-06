import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, Check, AlertCircle, TrendingDown, Star } from 'lucide-react';

const QuotationComparison = ({ onBackToQuotations }) => {
  const { rfqs, quotations, vendors, processApproval, currentUser, setActiveTab, showToast, logActivity } = useContext(AppContext);
  const [selectedRfqId, setSelectedRfqId] = useState(null);

  // Read global/temporary comparison variable if set by Quotations page
  useEffect(() => {
    if (window.selectedRfqForComparison) {
      setSelectedRfqId(window.selectedRfqForComparison);
      // Clean up global variable
      delete window.selectedRfqForComparison;
    } else if (rfqs.length > 0 && !selectedRfqId) {
      // Default to first RFQ that has quotations
      const firstWithQuotes = rfqs.find(r => quotations.some(q => q.rfq_id === r.id));
      if (firstWithQuotes) {
        setSelectedRfqId(firstWithQuotes.id);
      }
    }
  }, [rfqs, quotations]);

  // RFQ Object details
  const rfq = rfqs.find(r => r.id === selectedRfqId);
  // Get all quotations for this RFQ
  const rfqQuotations = quotations.filter(q => q.rfq_id === selectedRfqId && q.status === 'Submitted');

  // Identify lowest grand total for green highlighting
  const lowestTotal = rfqQuotations.length > 0 
    ? Math.min(...rfqQuotations.map(q => q.grand_total))
    : null;

  const getVendorDetails = (vendorId) => {
    return vendors.find(v => v.id === vendorId);
  };

  const handleSelectVendor = (quotationId) => {
    const q = quotations.find(item => item.id === quotationId);
    if (!q) return;

    // Transition to comparison state for RFQ
    rfq.status = 'Comparison';

    // Seed approval state in AppContext and switch to approval view
    window.selectedRfqForApproval = rfq.id;
    window.selectedQuotationForApproval = q.id;

    logActivity('Vendor Selected for Approval', 'RFQ', `Quotation #${q.id} (Vendor: ${getVendorDetails(q.vendor_id)?.name}) selected for L1/L2 approval workflow`);
    showToast(`Quotation selected. Initiating L1 review chain.`);
    
    // Switch to approvals tab
    setActiveTab('approvals');
  };

  // RFQ Dropdown options (only show RFQs that have quotations)
  const availableRfqs = rfqs.filter(r => quotations.some(q => q.rfq_id === r.id));

  return (
    <div style={wrapperStyle}>
      {/* Header Link */}
      <div style={headerStyle}>
        <button className="btn btn-secondary btn-sm" onClick={onBackToQuotations}>
          <ArrowLeft size={14} />
          <span>Back to Quotations Log</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select RFQ to Compare:</span>
          <select 
            value={selectedRfqId || ''} 
            onChange={e => setSelectedRfqId(parseInt(e.target.value))}
            style={rfqSelectStyle}
          >
            <option value="">-- Select RFQ --</option>
            {availableRfqs.map(r => (
              <option key={r.id} value={r.id}>
                #{r.id} - {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!rfq ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Please select an RFQ from the dropdown to compare received bids.</p>
        </div>
      ) : (
        <div>
          {/* RFQ Description Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quotation Comparison</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.4rem' }}>
              RFQ: {rfq.title.toLowerCase()} - {rfqQuotations.length} quotations received
            </p>
          </div>

          {/* Grid Layout Comparison Card */}
          {rfqQuotations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Check size={40} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
              <p>Quotations for this RFQ are already processed, or no pending bids exist.</p>
            </div>
          ) : (
            <div>

              <div style={comparisonGridWrapperStyle}>
                {/* Comparison Table Grid */}
                <table style={comparisonTableStyle}>
                  <thead>
                    <tr>
                      <th style={criteriaColStyle}>Criteria</th>
                      {rfqQuotations.map(q => {
                        const vendor = getVendorDetails(q.vendor_id);
                        const isLowest = q.grand_total === lowestTotal;
                        return (
                          <th key={q.id} style={isLowest ? lowestHeaderStyle : vendorHeaderStyle}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{vendor?.name} {isLowest && '(Lowest)'}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Criteria 1: Grand Total */}
                    <tr>
                      <td style={criteriaLabelStyle}>Grand Total</td>
                      {rfqQuotations.map(q => {
                        const isLowest = q.grand_total === lowestTotal;
                        return (
                          <td key={q.id} style={isLowest ? lowestPriceTdStyle : priceTdStyle}>
                            {q.grand_total.toLocaleString()}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Criteria 3: GST Amount */}
                    <tr>
                      <td style={criteriaLabelStyle}>GST %</td>
                      {rfqQuotations.map(q => {
                        const isLowest = q.grand_total === lowestTotal;
                        return (
                          <td key={q.id} style={isLowest ? lowestValTdStyle : valTdStyle}>
                            {q.gst_percent}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Criteria 4: Delivery Timeline */}
                    <tr>
                      <td style={criteriaLabelStyle}>Delivery (days)</td>
                      {rfqQuotations.map(q => {
                        const isLowest = q.grand_total === lowestTotal;
                        return (
                          <td key={q.id} style={isLowest ? lowestValTdStyle : valTdStyle}>
                            {q.delivery_days}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Criteria 6: Vendor Rating */}
                    <tr>
                      <td style={criteriaLabelStyle}>Vendor rating</td>
                      {rfqQuotations.map(q => {
                        const vendor = getVendorDetails(q.vendor_id);
                        const isLowest = q.grand_total === lowestTotal;
                        return (
                          <td key={q.id} style={isLowest ? lowestValTdStyle : valTdStyle}>
                            {vendor?.rating.toFixed(1)}/5
                          </td>
                        );
                      })}
                    </tr>

                    {/* Criteria 5: Payment Terms */}
                    <tr>
                      <td style={criteriaLabelStyle}>Payment terms</td>
                      {rfqQuotations.map(q => {
                        const isLowest = q.grand_total === lowestTotal;
                        return (
                          <td key={q.id} style={isLowest ? lowestValTdStyle : valTdStyle}>
                            {q.payment_terms}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Actions Row */}
                    <tr>
                      <td style={criteriaLabelStyle}></td>
                      {rfqQuotations.map(q => {
                        const isLowest = q.grand_total === lowestTotal;
                        return (
                          <td key={q.id} style={isLowest ? lowestActionTdStyle : actionTdStyle}>
                            <button 
                              className="btn btn-outline"
                              onClick={() => handleSelectVendor(q.id)}
                              style={isLowest ? bottomButtonLowestStyle : bottomButtonStyle}
                            >
                              <span>{isLowest ? 'Select & Approve' : 'Select'}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={helperLabelStyle}>
                Green = lowest price, selecting vendor initiates the approval workflow.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* Styles */
const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid var(--border-color)',
  flexWrap: 'wrap',
  gap: '1rem'
};

const rfqSelectStyle = {
  padding: '0.4rem 0.8rem',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  outline: 'none',
  minWidth: '220px'
};

const itemBadgeStyle = {
  fontSize: '0.75rem',
  padding: '0.25rem 0.6rem',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-secondary)'
};

const helperLabelStyle = {
  fontSize: '0.8rem',
  color: '#ff4d4d',
  marginTop: '1rem',
  textAlign: 'left'
};

const comparisonGridWrapperStyle = {
  overflowX: 'auto',
  backgroundColor: 'var(--bg-card)',
  border: 'var(--glass-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)'
};

const comparisonTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'center'
};

const criteriaColStyle = {
  width: '220px',
  textAlign: 'left',
  padding: '1.25rem',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
  borderRight: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)'
};

const vendorHeaderStyle = {
  padding: '1.25rem',
  borderBottom: '1px solid var(--border-color)',
  borderRight: '1px solid var(--border-color)',
  minWidth: '180px'
};

const lowestHeaderStyle = {
  ...vendorHeaderStyle,
  backgroundColor: '#0a5c1a',
  border: '2px solid white',
  borderBottom: 'none',
  borderTopLeftRadius: 'var(--radius-md)',
  borderTopRightRadius: 'var(--radius-md)'
};

const criteriaLabelStyle = {
  textAlign: 'center',
  padding: '1.25rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-color)',
  fontSize: '0.85rem'
};

const valTdStyle = {
  padding: '1.25rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-color)',
  borderLeft: '1px solid var(--border-color)',
  fontSize: '0.85rem'
};

const lowestValTdStyle = {
  ...valTdStyle,
  backgroundColor: '#0a5c1a',
  borderLeft: '2px solid white',
  borderRight: '2px solid white',
  borderBottom: 'none'
};

const priceTdStyle = {
  ...valTdStyle,
  fontSize: '0.95rem'
};

const lowestPriceTdStyle = {
  ...priceTdStyle,
  backgroundColor: '#0a5c1a',
  borderLeft: '2px solid white',
  borderRight: '2px solid white',
  borderBottom: 'none'
};

const lowestBadgeStyle = {
  display: 'none'
};

const actionTdStyle = {
  padding: '1.25rem',
  borderLeft: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)'
};

const lowestActionTdStyle = {
  ...actionTdStyle,
  backgroundColor: '#0a5c1a',
  borderLeft: '2px solid white',
  borderRight: '2px solid white',
  borderBottom: '2px solid white',
  borderBottomLeftRadius: 'var(--radius-md)',
  borderBottomRightRadius: 'var(--radius-md)'
};

const bottomButtonStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  padding: '0.4rem 1.5rem',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer'
};

const bottomButtonLowestStyle = {
  border: '1px solid white',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'transparent',
  color: 'white',
  padding: '0.4rem 1.5rem',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer'
};

export default QuotationComparison;
