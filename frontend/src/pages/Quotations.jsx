import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Coins, Eye, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

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

  const loggedVendor = vendors.find(v => v.email.toLowerCase() === currentUser?.email?.toLowerCase());

  // --- VENDOR FLOW ---
  const vendorRFQs = rfqs.filter(rfq =>
    rfq.status === 'Active' &&
    loggedVendor &&
    rfq.assigned_vendors.includes(loggedVendor.id)
  );

  const hasSubmitted = (rfqId) => {
    return quotations.some(q => q.rfq_id === rfqId && q.vendor_id === loggedVendor?.id);
  };

  const startBid = (rfq) => {
    setSelectedRfqForBid(rfq);
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
      delivery_days: parseInt(deliveryDays, 10),
      payment_terms: paymentTerms,
      items: bidItems
    });

    setSelectedRfqForBid(null);
  };

  // --- OFFICER FLOW ---
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

  const subtotal = calculateSubtotal();
  const gstAmount = calculateGstAmount(subtotal);
  const grandTotal = subtotal + gstAmount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* VENDOR INTERFACE */}
      {currentUser.role === 'Vendor' && (
        <>
          {!selectedRfqForBid ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Vendor Bidding Board</h1>
                  <p className="page-subtitle">Review assigned RFQs and submit competitive quotations</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {vendorRFQs.length === 0 ? (
                  <div className="card empty-state">
                    <FileText size={28} color="var(--text-muted)" />
                    <div className="empty-state-title">No assigned RFQs</div>
                    <div className="empty-state-desc">No active RFQs have been assigned to your vendor profile yet.</div>
                  </div>
                ) : (
                  vendorRFQs.map(rfq => {
                    const alreadyBid = hasSubmitted(rfq.id);
                    return (
                      <div key={rfq.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rfq.title}</h3>
                            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              RFQ #{rfq.id} · {rfq.category}
                            </p>
                          </div>
                          <div>
                            {alreadyBid ? (
                              <span className="badge badge-success">
                                <CheckCircle2 size={12} />
                                <span>Bid Submitted</span>
                              </span>
                            ) : (
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => startBid(rfq)}>
                                Submit Quotation
                              </button>
                            )}
                          </div>
                        </div>

                        <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)' }}>{rfq.description}</p>

                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>Deadline:</span>
                            <span className="tabular-nums" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {new Date(rfq.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>Line Items:</span>
                            <span className="tabular-nums" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {rfq.items.length} item{rfq.items.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Bid Submission Form matching Screen 6 wireframe */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Submit Quotation</h1>
                  <p className="page-subtitle">
                    RFQ: {selectedRfqForBid.title} — Deadline {new Date(selectedRfqForBid.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <form onSubmit={handleBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* RFQ Summary */}
                <div className="card" style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem 1.25rem' }}>
                  <div className="section-eyebrow" style={{ marginBottom: '0.3rem' }}>RFQ Summary</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {selectedRfqForBid.items.map(i => `${i.item_name} × ${i.quantity}`).join(', ')} — Category: {selectedRfqForBid.category}
                  </p>
                </div>

                {/* Your Quotation Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h2 className="section-heading">Your Quotation</h2>
                  <div className="card-flush">
                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th style={{ width: '90px' }}>Qty</th>
                            <th style={{ width: '150px' }}>Unit Price ($)</th>
                            <th style={{ width: '140px', textAlign: 'right' }}>Total ($)</th>
                            <th style={{ width: '140px' }}>Delivery (Days)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bidItems.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 500 }}>{item.item_name}</td>
                              <td className="tabular-nums">{item.quantity}</td>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                <input
                                  type="number"
                                  className="form-control tabular-nums"
                                  value={item.unit_price || ''}
                                  onChange={e => handlePriceChange(idx, e.target.value)}
                                  placeholder="0.00"
                                  min="0"
                                  style={{ minHeight: '32px', padding: '0.3rem 0.6rem' }}
                                />
                              </td>
                              <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                                ${item.total.toLocaleString()}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                <input
                                  type="number"
                                  className="form-control tabular-nums"
                                  value={deliveryDays}
                                  onChange={e => setDeliveryDays(e.target.value)}
                                  min="1"
                                  style={{ minHeight: '32px', padding: '0.3rem 0.6rem' }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Bottom Two-Column Tax/Notes & Summary */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div className="form-group">
                        <label htmlFor="quote-gst">Tax / GST %</label>
                        <input
                          id="quote-gst"
                          type="number"
                          className="form-control tabular-nums"
                          value={gstPercent}
                          onChange={e => setGstPercent(parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          style={{ maxWidth: '160px' }}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="quote-terms">Notes / Payment Terms</label>
                        <textarea
                          id="quote-terms"
                          className="form-control"
                          value={paymentTerms}
                          onChange={e => setPaymentTerms(e.target.value)}
                          placeholder="e.g. Payment terms: 30 days net"
                          rows={3}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary">
                          Submit Quotation
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setSelectedRfqForBid(null)}>
                          Save Draft
                        </button>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', maxWidth: '340px', width: '100%', marginLeft: 'auto' }}>
                      <div className="section-eyebrow" style={{ marginBottom: '0.875rem' }}>Pricing Summary</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        <span>Subtotal</span>
                        <span className="tabular-nums" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>${subtotal.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        <span>GST ({gstPercent}%)</span>
                        <span className="tabular-nums" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>${gstAmount.toLocaleString()}</span>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <span>Grand Total</span>
                        <span className="tabular-nums">${grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* OFFICER / MANAGER / ADMIN INTERFACE */}
      {currentUser.role !== 'Vendor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Received Quotations</h1>
              <p className="page-subtitle">Review vendor bid submissions and launch side-by-side price comparisons</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeComparisonRFQs.length === 0 ? (
              <div className="card empty-state">
                <Coins size={28} color="var(--text-muted)" />
                <div className="empty-state-title">No quotations received</div>
                <div className="empty-state-desc">Vendor bid submissions for active RFQs will appear here.</div>
              </div>
            ) : (
              activeComparisonRFQs.map(rfq => {
                const receivedQuotes = getQuotationsForRFQ(rfq.id);
                const isExpanded = selectedRfqForView === rfq.id;
                return (
                  <div key={rfq.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rfq.title}</h3>
                        <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          RFQ #{rfq.id} · {rfq.category} · Deadline {new Date(rfq.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className={`badge ${rfq.status === 'Approved' ? 'badge-success' : 'badge-info'}`}>
                          {rfq.status}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedRfqForView(isExpanded ? null : rfq.id)}
                        >
                          <Eye size={13} />
                          <span>{isExpanded ? 'Hide Bids' : `View Bids (${receivedQuotes.length})`}</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            window.selectedRfqForComparison = rfq.id;
                            setActiveTab('quotation-comparison');
                          }}
                        >
                          <span>Compare Side-by-Side</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <div className="card-flush">
                          <div className="table-responsive">
                            <table className="custom-table">
                              <thead>
                                <tr>
                                  <th>Vendor</th>
                                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                                  <th style={{ textAlign: 'right' }}>GST</th>
                                  <th style={{ textAlign: 'right' }}>Grand Total</th>
                                  <th>Delivery</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {receivedQuotes.map(q => (
                                  <tr key={q.id}>
                                    <td style={{ fontWeight: 500 }}>{getVendorName(q.vendor_id)}</td>
                                    <td className="tabular-nums" style={{ textAlign: 'right' }}>${q.subtotal.toLocaleString()}</td>
                                    <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>${q.gst_amount.toLocaleString()}</td>
                                    <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>${q.grand_total.toLocaleString()}</td>
                                    <td className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{q.delivery_days} days</td>
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

export default Quotations;
