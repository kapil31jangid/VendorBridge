import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FileCheck, ArrowLeft, Printer, Download, Mail, CheckCircle2 } from 'lucide-react';

const Invoices = () => {
  const {
    purchaseOrders,
    invoices,
    quotations,
    vendors,
    payInvoice,
    sendEmail
  } = useContext(AppContext);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
  const selectedPO = selectedInvoice ? purchaseOrders.find(po => po.id === selectedInvoice.po_id) : null;
  const selectedQuotation = selectedPO ? quotations.find(q => q.id === selectedPO.quotation_id) : null;
  const vendor = selectedQuotation ? vendors.find(v => v.id === selectedQuotation.vendor_id) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const capture = document.getElementById('invoice-document-capture');
    if (!capture || !selectedInvoice) return;
    const element = document.createElement('a');
    const file = new Blob([capture.innerText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedInvoice.invoice_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendEmail = () => {
    if (!vendor || !selectedInvoice || !selectedPO) return;

    const emailBody = `
      Dear ${vendor.name},<br/><br/>
      Invoice <strong>${selectedInvoice.invoice_number}</strong> for Purchase Order <strong>${selectedPO.po_number}</strong> is processed.<br/>
      <strong>Grand Total:</strong> $${selectedInvoice.grand_total.toLocaleString()}<br/>
      <strong>Payment Status:</strong> ${selectedInvoice.status}<br/>
      <strong>Due Date:</strong> ${selectedInvoice.due_date}<br/><br/>
      Please review details inside the ERP portal.<br/><br/>
      Best Regards,<br/>
      Procurement Team, VendorBridge.
    `;

    sendEmail(vendor.email, `Invoice Notification - ${selectedInvoice.invoice_number}`, emailBody);
  };

  const getVendorName = (vendorId) => {
    const v = vendors.find(vend => vend.id === vendorId);
    return v ? v.name : 'Unknown Vendor';
  };

  const poDateStr = selectedPO ? new Date(selectedPO.date || selectedPO.created_at).toLocaleDateString() : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* INVOICE DETAIL VIEW */}
      {selectedInvoice && selectedPO && selectedQuotation && vendor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Back & Actions */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ paddingLeft: 0, marginBottom: '0.35rem', height: 'auto' }}
                onClick={() => setSelectedInvoiceId(null)}
              >
                <ArrowLeft size={14} />
                <span>Back to Invoices</span>
              </button>
              <h1 className="page-title">Purchase Order &amp; Invoice</h1>
              <p className="page-subtitle">
                <span className="tabular-nums">{selectedPO.po_number}</span> · Auto-generated upon L2 approval
              </p>
            </div>

            <div className="page-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownloadPDF}>
                <Download size={14} />
                <span>Download PDF</span>
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSendEmail}>
                <Mail size={14} />
                <span>Email Invoice</span>
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div id="invoice-document-capture" className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Bill To & Vendor Details */}
            <div className="grid-2" style={{ gap: '2rem' }}>
              <div>
                <div className="section-eyebrow" style={{ marginBottom: '0.4rem' }}>Bill To</div>
                <div style={docTextStyle}>
                  <strong style={{ color: 'var(--text-primary)' }}>VendorBridge Corp Ltd</strong><br />
                  123 Business Park, Ahmedabad<br />
                  GSTIN: <code>253834384FB</code>
                </div>
              </div>
              <div>
                <div className="section-eyebrow" style={{ marginBottom: '0.4rem' }}>Vendor</div>
                <div style={docTextStyle}>
                  <strong style={{ color: 'var(--text-primary)' }}>{vendor.name}</strong><br />
                  {vendor.category} · {vendor.contact_no}<br />
                  GSTIN: <code>{vendor.gst_no || 'N/A'}</code>
                </div>
              </div>
            </div>

            {/* Metadata Row */}
            <div className="grid-2" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.84375rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>PO Number: </span>
                  <strong className="tabular-nums">{selectedPO.po_number}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>PO Date: </span>
                  <span className="tabular-nums">{poDateStr}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.84375rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Invoice Date: </span>
                  <span className="tabular-nums">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Due Date: </span>
                  <span className="tabular-nums">{new Date(selectedInvoice.due_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="card-flush">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Qty</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ width: '140px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{item.item_name}</td>
                        <td className="tabular-nums" style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td className="tabular-nums" style={{ textAlign: 'right' }}>${item.unit_price.toLocaleString()}</td>
                        <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>${item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <td colSpan="3" style={{ textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500, borderBottom: 'none', paddingBottom: '0.35rem' }}>Subtotal</td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600, borderBottom: 'none', paddingBottom: '0.35rem' }}>
                        ${selectedInvoice.subtotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <td colSpan="3" style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.78125rem', borderBottom: 'none', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>CGST (9%)</td>
                      <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.78125rem', borderBottom: 'none', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
                        ${(selectedInvoice.gst_amount / 2).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <td colSpan="3" style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.78125rem', borderBottom: '1px solid var(--border-color)', paddingTop: '0.2rem', paddingBottom: '0.75rem' }}>SGST (9%)</td>
                      <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.78125rem', borderBottom: '1px solid var(--border-color)', paddingTop: '0.2rem', paddingBottom: '0.75rem' }}>
                        ${(selectedInvoice.gst_amount / 2).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9375rem', borderBottom: 'none' }}>Grand Total</td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', borderBottom: 'none' }}>
                        ${selectedInvoice.grand_total.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Status & Action Bar */}
          <div className="card no-print" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Payment Status:</span>
              <span className={`badge ${selectedInvoice.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                {selectedInvoice.status === 'Paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>

            {selectedInvoice.status !== 'Paid' && (
              <button
                type="button"
                className="btn btn-teal btn-sm"
                onClick={() => payInvoice(selectedInvoice.id)}
              >
                <CheckCircle2 size={14} />
                <span>Mark as Paid</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* INVOICE REGISTRY LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Invoices</h1>
              <p className="page-subtitle">Billing statements, tax breakdowns, and payment settlement tracking</p>
            </div>
          </div>

          <div className="card-flush">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Associated PO</th>
                    <th>Vendor</th>
                    <th>Date Generated</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Grand Total</th>
                    <th>Payment Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-state">
                          <FileCheck size={28} color="var(--text-muted)" />
                          <div className="empty-state-title">No invoices generated</div>
                          <div className="empty-state-desc">Invoices appear automatically once a purchase order is finalized.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => {
                      const associatedPO = purchaseOrders.find(po => po.id === inv.po_id);
                      const quotation = associatedPO ? quotations.find(q => q.id === associatedPO.quotation_id) : null;

                      return (
                        <tr key={inv.id}>
                          <td className="tabular-nums" style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                          <td className="tabular-nums" style={{ fontWeight: 500, color: 'var(--primary)' }}>
                            {associatedPO ? associatedPO.po_number : 'N/A'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{getVendorName(quotation?.vendor_id)}</td>
                          <td className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{new Date(inv.date).toLocaleDateString()}</td>
                          <td className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                          <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                            ${inv.grand_total.toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceId(inv.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              View Invoice
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

const docTextStyle = {
  fontSize: '0.84375rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.6
};

export default Invoices;
