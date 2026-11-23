import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

const QuotationComparison = ({ onBackToQuotations }) => {
  const { rfqs, quotations, vendors, setActiveTab, showToast, logActivity } = useContext(AppContext);
  const [selectedRfqId, setSelectedRfqId] = useState(null);

  useEffect(() => {
    if (window.selectedRfqForComparison) {
      setSelectedRfqId(window.selectedRfqForComparison);
      delete window.selectedRfqForComparison;
    } else if (rfqs.length > 0 && !selectedRfqId) {
      const firstWithQuotes = rfqs.find(r => quotations.some(q => q.rfq_id === r.id));
      if (firstWithQuotes) {
        setSelectedRfqId(firstWithQuotes.id);
      }
    }
  }, [rfqs, quotations, selectedRfqId]);

  const rfq = rfqs.find(r => r.id === selectedRfqId);
  const rfqQuotations = quotations.filter(q => q.rfq_id === selectedRfqId && q.status === 'Submitted');

  const lowestTotal = rfqQuotations.length > 0
    ? Math.min(...rfqQuotations.map(q => q.grand_total))
    : null;

  const getVendorDetails = (vendorId) => {
    return vendors.find(v => v.id === vendorId);
  };

  const handleSelectVendor = (quotationId) => {
    const q = quotations.find(item => item.id === quotationId);
    if (!q || !rfq) return;

    rfq.status = 'Comparison';
    window.selectedRfqForApproval = rfq.id;
    window.selectedQuotationForApproval = q.id;

    logActivity(
      'Vendor Selected for Approval',
      'RFQ',
      `Quotation #${q.id} (Vendor: ${getVendorDetails(q.vendor_id)?.name}) selected for L1/L2 approval workflow`
    );
    showToast('Quotation selected. Initiating L1 review chain.');
    setActiveTab('approvals');
  };

  const availableRfqs = rfqs.filter(r => quotations.some(q => q.rfq_id === r.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBackToQuotations}>
          <ArrowLeft size={14} />
          <span>Back to Quotations</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <label htmlFor="compare-rfq-select" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            RFQ:
          </label>
          <select
            id="compare-rfq-select"
            value={selectedRfqId || ''}
            onChange={e => setSelectedRfqId(parseInt(e.target.value, 10))}
            className="form-control"
            style={{ width: 'auto', minWidth: '240px', minHeight: '34px', padding: '0.3rem 0.75rem' }}
          >
            <option value="">Select an RFQ</option>
            {availableRfqs.map(r => (
              <option key={r.id} value={r.id}>
                #{r.id} — {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!rfq ? (
        <div className="card empty-state">
          <AlertCircle size={28} color="var(--text-muted)" />
          <div className="empty-state-title">No RFQ selected</div>
          <div className="empty-state-desc">Choose an RFQ from the selector above to compare vendor bids.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header */}
          <div>
            <h1 className="page-title">Quotation Comparison</h1>
            <p className="page-subtitle">
              RFQ: {rfq.title} · {rfqQuotations.length} active quotation{rfqQuotations.length === 1 ? '' : 's'} received
            </p>
          </div>

          {rfqQuotations.length === 0 ? (
            <div className="card empty-state">
              <Check size={28} color="var(--color-success)" />
              <div className="empty-state-title">No pending bids to compare</div>
              <div className="empty-state-desc">Quotations for this RFQ have already been processed or none are submitted yet.</div>
            </div>
          ) : (
            <div>
              <div className="card-flush">
                <div className="table-responsive">
                  <table style={comparisonTableStyle}>
                    <thead>
                      <tr>
                        <th style={criteriaHeaderStyle}>Criteria</th>
                        {rfqQuotations.map(q => {
                          const vendor = getVendorDetails(q.vendor_id);
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <th key={q.id} style={isLowest ? lowestHeaderStyle : vendorHeaderStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isLowest ? 'var(--color-success)' : 'var(--text-primary)' }}>
                                  {vendor?.name}
                                </span>
                                {isLowest && (
                                  <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>Lowest</span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={criteriaCellStyle}>Grand Total</td>
                        {rfqQuotations.map(q => {
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <td
                              key={q.id}
                              className="tabular-nums"
                              style={{
                                ...(isLowest ? lowestCellStyle : valueCellStyle),
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: isLowest ? 'var(--color-success)' : 'var(--text-primary)'
                              }}
                            >
                              ${q.grand_total.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td style={criteriaCellStyle}>Subtotal</td>
                        {rfqQuotations.map(q => {
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <td key={q.id} className="tabular-nums" style={isLowest ? lowestCellStyle : valueCellStyle}>
                              ${q.subtotal.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td style={criteriaCellStyle}>GST %</td>
                        {rfqQuotations.map(q => {
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <td key={q.id} className="tabular-nums" style={isLowest ? lowestCellStyle : valueCellStyle}>
                              {q.gst_percent}%
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td style={criteriaCellStyle}>Delivery (Days)</td>
                        {rfqQuotations.map(q => {
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <td key={q.id} className="tabular-nums" style={isLowest ? lowestCellStyle : valueCellStyle}>
                              {q.delivery_days} days
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td style={criteriaCellStyle}>Vendor Rating</td>
                        {rfqQuotations.map(q => {
                          const vendor = getVendorDetails(q.vendor_id);
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <td key={q.id} className="tabular-nums" style={isLowest ? lowestCellStyle : valueCellStyle}>
                              {vendor?.rating ? `${vendor.rating.toFixed(1)} / 5.0` : 'N/A'}
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td style={criteriaCellStyle}>Payment Terms</td>
                        {rfqQuotations.map(q => {
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <td key={q.id} style={isLowest ? lowestCellStyle : valueCellStyle}>
                              {q.payment_terms}
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td style={{ ...criteriaCellStyle, borderBottom: 'none' }} />
                        {rfqQuotations.map(q => {
                          const isLowest = q.grand_total === lowestTotal;
                          return (
                            <td
                              key={q.id}
                              style={{
                                ...(isLowest ? lowestCellStyle : valueCellStyle),
                                borderBottom: 'none',
                                padding: '1rem'
                              }}
                            >
                              <button
                                type="button"
                                className={isLowest ? 'btn btn-teal btn-sm' : 'btn btn-secondary btn-sm'}
                                onClick={() => handleSelectVendor(q.id)}
                              >
                                {isLowest ? 'Select & Approve' : 'Select'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                Green highlight indicates the lowest quoted total. Selecting a vendor initiates the L1/L2 approval workflow.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const comparisonTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'center',
  fontSize: '0.84375rem'
};

const criteriaHeaderStyle = {
  width: '190px',
  textAlign: 'left',
  padding: '0.875rem 1.25rem',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontSize: '0.725rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  borderBottom: '1px solid var(--border-color)',
  borderRight: '1px solid var(--border-color)'
};

const vendorHeaderStyle = {
  padding: '0.875rem 1.25rem',
  backgroundColor: 'var(--bg-primary)',
  borderBottom: '1px solid var(--border-color)',
  borderLeft: '1px solid var(--border-color)',
  minWidth: '180px'
};

const lowestHeaderStyle = {
  ...vendorHeaderStyle,
  backgroundColor: 'var(--color-success-bg)',
  borderLeft: '1px solid var(--color-success-border)',
  borderRight: '1px solid var(--color-success-border)',
  borderBottom: '1px solid var(--color-success-border)'
};

const criteriaCellStyle = {
  textAlign: 'left',
  padding: '0.875rem 1.25rem',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  borderBottom: '1px solid var(--border-color)',
  borderRight: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)'
};

const valueCellStyle = {
  padding: '0.875rem 1.25rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-color)',
  borderLeft: '1px solid var(--border-color)'
};

const lowestCellStyle = {
  ...valueCellStyle,
  backgroundColor: '#f7fee7',
  borderLeft: '1px solid var(--color-success-border)',
  borderRight: '1px solid var(--color-success-border)'
};

export default QuotationComparison;
