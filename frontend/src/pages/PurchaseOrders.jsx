import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FileCheck, ArrowLeft, Printer, Download, Mail } from 'lucide-react';

const PurchaseOrders = () => {
  const {
    purchaseOrders,
    rfqs,
    quotations,
    vendors,
    sendEmail
  } = useContext(AppContext);

  const [selectedPoId, setSelectedPoId] = useState(null);

  const selectedPO = purchaseOrders.find(po => po.id === selectedPoId);
  const selectedQuotation = selectedPO ? quotations.find(q => q.id === selectedPO.quotation_id) : null;
  const vendor = selectedQuotation ? vendors.find(v => v.id === selectedQuotation.vendor_id) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const capture = document.getElementById('po-document-capture');
    if (!capture || !selectedPO) return;
    const element = document.createElement('a');
    const file = new Blob([capture.innerText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedPO.po_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendEmail = () => {
    if (!vendor || !selectedPO || !selectedQuotation) return;

    const emailBody = `
      Dear ${vendor.name},<br/><br/>
      Purchase Order <strong>${selectedPO.po_number}</strong> has been finalized and issued.<br/>
      <strong>Grand Total:</strong> $${selectedQuotation.grand_total.toLocaleString()}<br/>
      <strong>Delivery Target:</strong> ${selectedQuotation.delivery_days} days<br/><br/>
      Please review the details in the VendorBridge ERP portal.<br/><br/>
      Best Regards,<br/>
      Procurement Team, VendorBridge.
    `;

    sendEmail(vendor.email, `Purchase Order Dispatched - ${selectedPO.po_number}`, emailBody);
  };

  const getVendorName = (vendorId) => {
    const v = vendors.find(vend => vend.id === vendorId);
    return v ? v.name : 'Unknown Vendor';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* PO DETAIL VIEW */}
      {selectedPO && selectedQuotation && vendor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Toolbar */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedPoId(null)}>
              <ArrowLeft size={14} />
              <span>Back to Purchase Orders</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
                <Printer size={14} />
                <span>Print PO</span>
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownloadPDF}>
                <Download size={14} />
                <span>Download</span>
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSendEmail}>
                <Mail size={14} />
                <span>Email PO to Vendor</span>
              </button>
            </div>
          </div>

          {/* Official PO Document Surface */}
          <div className="card" id="po-document-capture" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid var(--text-primary)', paddingBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>VendorBridge Corp Ltd</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Official Purchase Order</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text-primary)' }}>
                  PURCHASE ORDER
                </div>
                <div style={{ marginTop: '0.35rem' }}>
                  <span className="badge badge-success">Dispatched</span>
                </div>
              </div>
            </div>

            {/* Address Blocks */}
            <div className="grid-2" style={{ gap: '2rem' }}>
              <div>
                <div className="section-eyebrow" style={{ marginBottom: '0.5rem' }}>Issued By</div>
                <div style={addressBodyStyle}>
                  <strong style={{ color: 'var(--text-primary)' }}>VendorBridge Corp Ltd</strong><br />
                  742 Datacenter Parkway<br />
                  Mumbai, Maharashtra, 400001<br />
                  GSTIN: <code>27AAAAVB9999Z1Z</code><br />
                  procurement@vendorbridge.com
                </div>
              </div>
              <div>
                <div className="section-eyebrow" style={{ marginBottom: '0.5rem' }}>Vendor Details</div>
                <div style={addressBodyStyle}>
                  <strong style={{ color: 'var(--text-primary)' }}>{vendor.name}</strong><br />
                  Category: {vendor.category}<br />
                  GSTIN: <code>{vendor.gst_no}</code><br />
                  Contact: {vendor.contact_no}<br />
                  {vendor.email}
                </div>
              </div>
            </div>

            {/* Metadata Strip */}
            <div className="doc-meta-grid" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem' }}>
              <div>
                <div style={metaLabelStyle}>PO Number</div>
                <div className="tabular-nums" style={metaValueStyle}>{selectedPO.po_number}</div>
              </div>
              <div>
                <div style={metaLabelStyle}>PO Date</div>
                <div className="tabular-nums" style={metaValueStyle}>{new Date(selectedPO.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={metaLabelStyle}>Linked RFQ</div>
                <div className="tabular-nums" style={metaValueStyle}>#{selectedPO.rfq_id}</div>
              </div>
              <div>
                <div style={metaLabelStyle}>Delivery Target</div>
                <div className="tabular-nums" style={metaValueStyle}>{selectedQuotation.delivery_days} Days</div>
              </div>
              <div>
                <div style={metaLabelStyle}>Payment Terms</div>
                <div style={metaValueStyle}>{selectedQuotation.payment_terms}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="section-eyebrow" style={{ marginBottom: '0.625rem' }}>Ordered Line Items</div>
              <div className="card-flush">
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th style={{ width: '90px', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '140px', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ width: '140px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 500 }}>{item.item_name}</td>
                          <td className="tabular-nums" style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td className="tabular-nums" style={{ textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
                          <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>${item.total.toLocaleString()}</td>
                        </tr>
                      ))}

                      <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <td colSpan="2" style={{ borderBottom: 'none' }} />
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500, borderBottom: 'none', paddingBottom: '0.35rem' }}>Subtotal</td>
                        <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600, borderBottom: 'none', paddingBottom: '0.35rem' }}>
                          ${selectedQuotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <td colSpan="2" style={{ borderBottom: 'none' }} />
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.78125rem', borderBottom: 'none', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>CGST (9.0%)</td>
                        <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.78125rem', borderBottom: 'none', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
                          ${(selectedQuotation.gst_amount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <td colSpan="2" style={{ borderBottom: '1px solid var(--border-color)' }} />
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.78125rem', borderBottom: '1px solid var(--border-color)', paddingTop: '0.2rem', paddingBottom: '0.75rem' }}>SGST (9.0%)</td>
                        <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.78125rem', borderBottom: '1px solid var(--border-color)', paddingTop: '0.2rem', paddingBottom: '0.75rem' }}>
                          ${(selectedQuotation.gst_amount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <td colSpan="2" style={{ borderBottom: 'none' }} />
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9375rem', borderBottom: 'none' }}>Grand Total</td>
                        <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', borderBottom: 'none' }}>
                          ${selectedQuotation.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Instructions */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Purchase Order Instructions</div>
              Please deliver goods to the organization&apos;s address within the specified delivery target. Reference this PO number on all shipping labels, packing slips, and invoices.
            </div>
          </div>
        </div>
      ) : (
        /* PO REGISTRY LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Purchase Orders</h1>
              <p className="page-subtitle">Issued procurement orders dispatched to approved suppliers</p>
            </div>
          </div>

          <div className="card-flush">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Associated RFQ</th>
                    <th>Vendor</th>
                    <th>Date Generated</th>
                    <th>Delivery Target</th>
                    <th style={{ textAlign: 'right' }}>Grand Total</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-state">
                          <FileCheck size={28} color="var(--text-muted)" />
                          <div className="empty-state-title">No purchase orders generated</div>
                          <div className="empty-state-desc">Purchase orders are automatically issued once L2 approval is completed.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    purchaseOrders.map(po => {
                      const quotation = quotations.find(q => q.id === po.quotation_id);
                      const rfq = rfqs.find(r => r.id === po.rfq_id);

                      return (
                        <tr key={po.id}>
                          <td className="tabular-nums" style={{ fontWeight: 600, color: 'var(--primary)' }}>{po.po_number}</td>
                          <td style={{ fontWeight: 500 }}>{rfq ? rfq.title : `RFQ #${po.rfq_id}`}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{getVendorName(quotation?.vendor_id)}</td>
                          <td className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{new Date(po.created_at).toLocaleDateString()}</td>
                          <td className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{quotation ? `${quotation.delivery_days} Days` : 'N/A'}</td>
                          <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                            ${quotation ? quotation.grand_total.toLocaleString() : '0'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedPoId(po.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              View PO
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const addressBodyStyle = {
  fontSize: '0.84375rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.6
};

const metaLabelStyle = {
  fontSize: '0.6875rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: 600,
  letterSpacing: '0.04em',
  marginBottom: '0.2rem'
};

const metaValueStyle = {
  fontSize: '0.84375rem',
  fontWeight: 600,
  color: 'var(--text-primary)'
};

export default PurchaseOrders;
