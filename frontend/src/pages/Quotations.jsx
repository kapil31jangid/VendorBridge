import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Coins, Eye, CheckCircle2, ChevronRight, FileText, Calendar, DollarSign, Send } from 'lucide-react';

const Quotations = () => {
  const { 
    rfqs, 
    vendors, 
    quotations, 
    currentUser, 
    submitQuotation, 
    setActiveTab 
  } = useContext(AppContext);

  // Vendor Bidding State
  const [selectedRfqForBid, setSelectedRfqForBid] = useState(null);
  const [bidItems, setBidItems] = useState([]);
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [paymentTerms, setPaymentTerms] = useState('30 Days Net');
  const [gstPercent, setGstPercent] = useState(18);

  // Officer Selection state
  const [selectedRfqForView, setSelectedRfqForView] = useState(null);

  // Identify Vendor Id linked to current logged-in user
  const loggedVendor = vendors.find(v => v.email.toLowerCase() === currentUser?.email?.toLowerCase());

  // --- VENDOR FLOW ---
  // List RFQs assigned to this vendor
  const vendorRFQs = rfqs.filter(rfq => 
    rfq.status === 'Active' && 
    loggedVendor && 
    rfq.assigned_vendors.includes(loggedVendor.id)
  );

  // Check if vendor already submitted quotation for an RFQ
  const hasSubmitted = (rfqId) => {
    return quotations.some(q => q.rfq_id === rfqId && q.vendor_id === loggedVendor?.id);
  };

  const startBid = (rfq) => {
    setSelectedRfqForBid(rfq);
    // Initialize bid items with rfq item properties
    setBidItems(rfq.items.map(item => ({
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: 0,
      total: 0
    })));
  };

  const handlePriceChange = (index, val) => {
    const updated = [...bidItems];
    const price = parseFloat(val) || 0;
    updated[index].unit_price = price;
    updated[index].total = updated[index].quantity * price;
    setBidItems(updated);
  };

  const calculateSubtotal = () => bidItems.reduce((sum, item) => sum + item.total, 0);
  const calculateGstAmount = (subtotal) => (subtotal * gstPercent) / 100;

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (bidItems.some(item => item.unit_price <= 0)) {
      alert('Please enter valid unit prices for all items.');
      return;
    }

    const sub = calculateSubtotal();
    const gstAmt = calculateGstAmount(sub);
    const grand = sub + gstAmt;

    submitQuotation({
      rfq_id: selectedRfqForBid.id,
      vendor_id: loggedVendor.id,
      gst_percent: gstPercent,
      subtotal: sub,
      gst_amount: gstAmt,
      grand_total: grand,
      delivery_days: parseInt(deliveryDays),
      payment_terms: paymentTerms,
      items: bidItems
    });

    setSelectedRfqForBid(null);
  };

  // --- OFFICER FLOW ---
  // List RFQs that have received at least 1 quotation
  const activeComparisonRFQs = rfqs.filter(rfq => 
    quotations.some(q => q.rfq_id === rfq.id)
  );

  const getQuotationsForRFQ = (rfqId) => {
    return quotations.filter(q => q.rfq_id === rfqId);
  };

  const getVendorName = (vendorId) => {
    const v = vendors.find(vend => vend.id === vendorId);
    return v ? v.name : 'Unknown Vendor';
  };

  return (
    <div style={wrapperStyle}>
      {/* VENDOR INTERFACE */}
      {currentUser.role === 'Vendor' && (
        <>
          {!selectedRfqForBid ? (
            <div>
              <div style={headerStyle}>
                <div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Vendor Bidding Board</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Review assigned RFQs and submit bid pricing.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {vendorRFQs.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <FileText size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No active RFQs have been assigned to your vendor profile.</p>
                  </div>
                ) : (
                  vendorRFQs.map(rfq => {
                    const alreadyBid = hasSubmitted(rfq.id);
                    return (
                      <div key={rfq.id} className="card" style={rfqCardStyle}>
                        <div style={rfqHeaderRowStyle}>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rfq.title}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                              RFQ ID: #{rfq.id} | Category: {rfq.category}
                            </p>
                          </div>
                          <div>
                            {alreadyBid ? (
                              <div style={submittedBadgeStyle}>
                                <CheckCircle2 size={14} />
                                <span>Bid Submitted</span>
                              </div>
                            ) : (
                              <button className="btn btn-teal btn-sm" onClick={() => startBid(rfq)}>
                                <Coins size={14} />
                                <span>Submit Quotation</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <p style={rfqDescStyle}>{rfq.description}</p>
                        
                        <div style={rfqMetaGridStyle}>
                          <div>
                            <span style={metaLabelStyle}>Deadline:</span>
                            <span style={metaValueStyle}>{new Date(rfq.deadline).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span style={metaLabelStyle}>Line Items:</span>
                            <span style={metaValueStyle}>{rfq.items.length} Product types</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Bid Submission Form matched to wireframe */
            <div>
              <div style={formHeaderStyle}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Submit Quotations</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
                    RFQ: office furniture procurement q2 - deadline 15 june 2025
                  </p>
                </div>
              </div>

              <form onSubmit={handleBidSubmit}>
                <div style={rfqSummaryBoxStyle}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>RFQ Summary</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ergonomic chair * 25, standing desk *10 - category furniture</p>
                </div>

                <h3 style={{ fontSize: '0.9rem', fontWeight: 500, margin: '1.5rem 0 0.5rem 0' }}>Your Quotation</h3>
                
                <div className="table-responsive" style={tableWrapperStyle}>
                  <table className="custom-table" style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit price</th>
                        <th>Total</th>
                        <th>Delivery ( days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={item.item_name}
                              readOnly
                              style={tableInputStyle}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control" 
                              value={item.quantity}
                              readOnly
                              style={tableInputStyle}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control" 
                              value={item.unit_price || ''}
                              onChange={e => handlePriceChange(idx, e.target.value)}
                              style={tableInputStyle}
                              min="0"
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={item.total.toLocaleString()}
                              readOnly
                              style={tableInputStyle}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control" 
                              value={deliveryDays}
                              onChange={e => setDeliveryDays(e.target.value)}
                              style={tableInputStyle}
                              min="1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <hr style={dividerStyle} />

                <div style={twoColGridStyle}>
                  <div style={leftColStyle}>
                    <div className="form-group">
                      <label style={labelStyle}>tax / GST %</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={`${gstPercent} %`}
                        onChange={e => setGstPercent(parseInt(e.target.value) || 0)}
                        style={inputStyle}
                      />
                    </div>

                    <div className="form-group">
                      <label style={labelStyle}>Note / terms</label>
                      <textarea 
                        className="form-control"
                        value={paymentTerms}
                        onChange={e => setPaymentTerms(e.target.value)}
                        placeholder="Payment terms: 20 days net..."
                        rows={4}
                        style={{...inputStyle, resize: 'none'}}
                      />
                    </div>

                    <div style={leftButtonsContainerStyle}>
                      <button type="submit" className="btn btn-outline" style={bottomButtonStyle}>
                        Submit Quotation
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => setSelectedRfqForBid(null)} style={bottomButtonStyle}>
                        Save Draft
                      </button>
                    </div>
                  </div>

                  <div style={rightColStyle}>
                    <div style={calcContainerStyle}>
                      <div style={calcRowStyle}>
                        <span>Subtotal</span>
                        <span>{calculateSubtotal().toLocaleString()}</span>
                      </div>
                      <div style={calcRowStyle}>
                        <span>GST (18%)</span>
                        <span>{calculateGstAmount(calculateSubtotal()).toLocaleString()}</span>
                      </div>
                      <hr style={{ borderColor: 'var(--text-secondary)', margin: '1rem 0' }} />
                      <div style={calcRowStyle}>
                        <span>Grand total</span>
                        <span>{(calculateSubtotal() + calculateGstAmount(calculateSubtotal())).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
          )}
        </>
      )}

      {/* OFFICER/ADMIN INTERFACE */}
      {currentUser.role !== 'Vendor' && (
        <div>
          <div style={headerStyle}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Received Quotations Log</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Review submissions from vendors and trigger side-by-side comparison.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {activeComparisonRFQs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Coins size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No vendor quotations have been received by the ERP yet.</p>
              </div>
            ) : (
              activeComparisonRFQs.map(rfq => {
                const receivedQuotes = getQuotationsForRFQ(rfq.id);
                return (
                  <div key={rfq.id} className="card" style={rfqCardStyle}>
                    <div style={rfqHeaderRowStyle}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{rfq.title}</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          RFQ ID: #{rfq.id} | Category: {rfq.category}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedRfqForView(selectedRfqForView === rfq.id ? null : rfq.id)}
                        >
                          <Eye size={13} />
                          <span>View Bids ({receivedQuotes.length})</span>
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            window.selectedRfqForComparison = rfq.id;
                            setActiveTab('quotation-comparison');
                          }}
                        >
                          <span>Compare side-by-side</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ ...rfqMetaGridStyle, marginTop: '1rem' }}>
                      <div>
                        <span style={metaLabelStyle}>Deadline:</span>
                        <span style={metaValueStyle}>{new Date(rfq.deadline).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span style={metaLabelStyle}>Status:</span>
                        <span className={`badge ${rfq.status === 'Approved' ? 'badge-success' : 'badge-info'}`}>
                          {rfq.status}
                        </span>
                      </div>
                    </div>

                    {/* Quotation Details sub-panel dropdown */}
                    {selectedRfqForView === rfq.id && (
                      <div style={quotesDropdownStyle}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                          Bids Received Summary:
                        </h4>
                        <div className="table-responsive">
                          <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                            <thead>
                              <tr>
                                <th>Vendor</th>
                                <th>Subtotal</th>
                                <th>GST (18%)</th>
                                <th>Grand Total</th>
                                <th>Delivery</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {receivedQuotes.map(q => (
                                <tr key={q.id}>
                                  <td style={{ fontWeight: 600 }}>{getVendorName(q.vendor_id)}</td>
                                  <td>${q.subtotal.toLocaleString()}</td>
                                  <td>${q.gst_amount.toLocaleString()}</td>
                                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${q.grand_total.toLocaleString()}</td>
                                  <td>{q.delivery_days} days</td>
                                  <td>
                                    <span className={`badge ${
                                      q.status === 'Selected' ? 'badge-success' :
                                      q.status === 'Rejected' ? 'badge-error' : 'badge-warning'
                                    }`}>
                                      {q.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
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
  borderBottom: '1px solid var(--border-color)'
};

const rfqCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const rfqHeaderRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem'
};

const rfqDescStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.4
};

const rfqMetaGridStyle = {
  display: 'flex',
  gap: '2rem',
  fontSize: '0.8rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.03)',
  paddingTop: '0.75rem',
  marginTop: '0.25rem'
};

const metaLabelStyle = {
  color: 'var(--text-muted)',
  marginRight: '0.4rem'
};

const metaValueStyle = {
  fontWeight: '600',
  color: 'var(--text-secondary)'
};

const submittedBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  color: 'var(--color-success)',
  backgroundColor: 'var(--color-success-bg)',
  fontSize: '0.75rem',
  fontWeight: '600',
  padding: '0.4rem 0.75rem',
  borderRadius: 'var(--radius-full)',
  border: '1px solid rgba(16, 185, 129, 0.3)'
};

const formHeaderStyle = {
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '1rem',
  marginBottom: '1.5rem'
};

const sectionTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-secondary)',
  marginBottom: '0.75rem'
};

const formFlexRowStyle = {
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap'
};

const calcContainerStyle = {
  alignSelf: 'flex-end',
  width: '320px',
  marginLeft: 'auto',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  padding: '1rem',
  borderRadius: 'var(--radius-md)',
  marginTop: '1.5rem'
};

const calcRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginBottom: '0.4rem'
};

const formFooterStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '1.5rem',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '1rem'
};

const quotesDropdownStyle = {
  marginTop: '1rem',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  padding: '1rem',
  borderRadius: 'var(--radius-md)'
};

const rfqSummaryBoxStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '1rem',
  marginBottom: '1rem'
};

const tableWrapperStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  marginBottom: '1rem'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableInputStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  width: '100%',
  outline: 'none',
  padding: '0'
};

const dividerStyle = {
  borderColor: 'var(--text-secondary)',
  opacity: 0.3,
  margin: '1.5rem 0'
};

const twoColGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem'
};

const leftColStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const rightColStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '500',
  marginBottom: '0.5rem',
  display: 'block'
};

const inputStyle = {
  backgroundColor: 'transparent',
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '0.6rem 1rem',
  color: 'var(--text-primary)',
  width: '100%',
  fontFamily: 'inherit'
};

const leftButtonsContainerStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '0.5rem'
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

export default Quotations;
