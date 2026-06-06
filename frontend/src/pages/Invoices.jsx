import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FileCheck, ArrowLeft, Printer, Download, Mail, DollarSign, Landmark } from 'lucide-react';

const Invoices = () => {
  const { 
    purchaseOrders, 
    invoices, 
    rfqs, 
    quotations, 
    vendors, 
    payInvoice, 
    sendEmail, 
    currentUser 
  } = useContext(AppContext);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
  const selectedPO = selectedInvoice ? purchaseOrders.find(po => po.id === selectedInvoice.po_id) : null;
  const selectedRfq = selectedPO ? rfqs.find(r => r.id === selectedPO.rfq_id) : null;
  const selectedQuotation = selectedPO ? quotations.find(q => q.id === selectedPO.quotation_id) : null;
  const vendor = selectedQuotation ? vendors.find(v => v.id === selectedQuotation.vendor_id) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.createElement("a");
    const file = new Blob([document.getElementById('invoice-document-capture').innerText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedInvoice.invoice_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendEmail = () => {
    if (!vendor) return;
    
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

  return (
    <div style={wrapperStyle}>
      {/* INVOICE DETAIL VIEW */}
      {selectedInvoice && selectedPO && selectedQuotation && vendor ? (
        <div>
          {/* Header Action Menu */}
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInvoiceId(null)} style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Purchase Order & Invoice</h1>
              <p style={{ fontSize: '1rem', marginTop: '0.4rem' }}>{selectedPO.po_number}-auto-generated after approval</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={topButtonStyle} onClick={handleDownloadPDF}>Download PDF</button>
              <button className="btn btn-outline" style={topButtonStyle} onClick={handlePrint}>Print</button>
              <button className="btn btn-outline" style={topButtonStyle} onClick={handleSendEmail}>Email invoice</button>
            </div>
          </div>

          <div id="invoice-document-capture">
            <div style={detailBoxStyle}>
              <div style={detailRowStyle}>
                <div style={detailColStyle}>
                  <p style={detailLabelStyle}>Bill to:</p>
                  <p style={detailTextStyle}>
                    your Organization Name<br/>
                    123 business park, ahmedabad<br/>
                    GSTIN:253834384FB
                  </p>
                </div>
                <div style={detailColStyle}>
                  <p style={detailLabelStyle}>Vendor</p>
                  <p style={detailTextStyle}>
                    {vendor.name.toLowerCase()}<br/>
                    456, industrial estate, surat<br/>
                    GSTIN: {vendor.gst_no || '343434DB4523'}
                  </p>
                </div>
              </div>
              
              <hr style={separatorStyle} />
              
              <div style={detailRowStyle}>
                <div style={detailColStyle}>
                  <p style={detailTextStyle}>PO Number: {selectedPO.po_number}</p>
                  <p style={detailTextStyle}>PO date: {new Date(selectedPO.date).toLocaleDateString()}</p>
                </div>
                <div style={detailColStyle}>
                  <p style={detailTextStyle}>invoice date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  <p style={detailTextStyle}>Due date: {new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'center' }}>Unit price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'left' }}>{item.item_name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'center' }}>{item.unit_price}</td>
                      <td style={{ textAlign: 'right' }}>{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr><td colSpan="4" style={{ padding: 0 }}><hr style={{ margin: 0, opacity: 0.3, borderColor: 'var(--text-primary)' }}/></td></tr>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Subtotal</td>
                    <td style={{ textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{selectedInvoice.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>CGST(9%)</td>
                    <td style={{ textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{(selectedInvoice.gst_amount / 2).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SGST(9%)</td>
                    <td style={{ textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{(selectedInvoice.gst_amount / 2).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right' }}>Grand total</td>
                    <td style={{ textAlign: 'right' }}>{selectedInvoice.grand_total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>status:</span>
              <span style={{
                backgroundColor: selectedInvoice.status === 'Paid' ? '#0a5c1a' : '#5c3a0a',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                {selectedInvoice.status === 'Paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
            {selectedInvoice.status !== 'Paid' && (
              <button 
                onClick={() => payInvoice(selectedInvoice.id)} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4da6ff',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit'
                }}
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      ) : (
        /* REGISTRY LIST VIEW */
        <div>
          <div style={headerStyle}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Invoices</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Billing claims and invoice summaries from vendors.</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem', padding: 0 }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Associated PO</th>
                    <th>Vendor Business</th>
                    <th>Date Generated</th>
                    <th>Due Date</th>
                    <th>Grand Total</th>
                    <th>Payment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3.5rem' }}>
                        <FileCheck size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No procurement invoices are generated yet.</p>
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => {
                      const associatedPO = purchaseOrders.find(po => po.id === inv.po_id);
                      const quotation = associatedPO ? quotations.find(q => q.id === associatedPO.quotation_id) : null;
                      
                      return (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700 }}>{inv.invoice_number}</td>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            {associatedPO ? associatedPO.po_number : 'N/A'}
                          </td>
                          <td>{getVendorName(quotation?.vendor_id)}</td>
                          <td>{new Date(inv.date).toLocaleDateString()}</td>
                          <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700 }}>
                            ${inv.grand_total.toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => setSelectedInvoiceId(inv.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              <span>View Invoice</span>
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

/* Styles matching index.css design tokens */
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

const topButtonStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  padding: '0.4rem 1rem',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer'
};

const detailBoxStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  marginBottom: '1rem'
};

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '2rem'
};

const detailColStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const detailLabelStyle = {
  fontSize: '0.9rem',
  fontWeight: '500'
};

const detailTextStyle = {
  fontSize: '0.85rem',
  lineHeight: '1.6'
};

const separatorStyle = {
  borderColor: 'var(--text-primary)',
  opacity: 0.3,
  margin: 0
};

const tableWrapperStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.85rem'
};

export default Invoices;
