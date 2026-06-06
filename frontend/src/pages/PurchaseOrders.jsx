import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FileCheck, ArrowLeft, Printer, Download, Mail, Calendar, ShieldCheck, Landmark } from 'lucide-react';

const PurchaseOrders = () => {
  const { 
    purchaseOrders, 
    invoices, 
    rfqs, 
    quotations, 
    vendors, 
    sendEmail, 
    currentUser 
  } = useContext(AppContext);

  const [selectedPoId, setSelectedPoId] = useState(null);

  const selectedPO = purchaseOrders.find(po => po.id === selectedPoId);
  const selectedInvoice = selectedPO ? invoices.find(inv => inv.po_id === selectedPO.id) : null;
  const selectedRfq = selectedPO ? rfqs.find(r => r.id === selectedPO.rfq_id) : null;
  const selectedQuotation = selectedPO ? quotations.find(q => q.id === selectedPO.quotation_id) : null;
  const vendor = selectedQuotation ? vendors.find(v => v.id === selectedQuotation.vendor_id) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.createElement("a");
    const file = new Blob([document.getElementById('po-document-capture').innerText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedPO.po_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendEmail = () => {
    if (!vendor) return;
    
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
    <div style={wrapperStyle}>
      {/* PO DETAIL VIEW */}
      {selectedPO && selectedQuotation && vendor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header Action Menu */}
          <div className="card no-print" style={actionsCardStyle}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPoId(null)}>
              <ArrowLeft size={14} />
              <span>Back to PO Registry</span>
            </button>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
                <Printer size={14} />
                <span>Print PO</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadPDF}>
                <Download size={14} />
                <span>Download PO</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSendEmail}>
                <Mail size={14} />
                <span>Email PO to Vendor</span>
              </button>
            </div>
          </div>

          {/* Formatted PO Document */}
          <div className="card" id="po-document-capture" style={invoiceDocumentCardStyle}>
            <div style={docHeaderStyle}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>VendorBridge ERP</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Purchase Order</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>PURCHASE ORDER</h2>
                <span className="badge badge-success" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
                  DISPATCHED
                </span>
              </div>
            </div>

            {/* Address Blocks Grid */}
            <div style={addressGridStyle}>
              <div>
                <h4 style={addressHeaderStyle}>ISSUED BY (Organization)</h4>
                <p style={addressBodyStyle}>
                  <strong>VendorBridge Corp Ltd</strong><br/>
                  742 Datacenter Parkway<br/>
                  Mumbai, Maharashtra, 400001<br/>
                  GST: 27AAAAVB9999Z1Z<br/>
                  Email: procurement@vendorbridge.com
                </p>
              </div>
              <div>
                <h4 style={addressHeaderStyle}>VENDOR DETAILS</h4>
                <p style={addressBodyStyle}>
                  <strong>{vendor.name}</strong><br/>
                  Category: {vendor.category}<br/>
                  GST: {vendor.gst_no}<br/>
                  Contact: {vendor.contact_no}<br/>
                  Email: {vendor.email}
                </p>
              </div>
            </div>

            {/* Metadata Section */}
            <div style={metaGridStyle}>
              <div>
                <span style={metaLabelStyle}>PO Number</span>
                <span style={metaValueStyle}>{selectedPO.po_number}</span>
              </div>
              <div>
                <span style={metaLabelStyle}>PO Date</span>
                <span style={metaValueStyle}>{new Date(selectedPO.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span style={metaLabelStyle}>Linked RFQ</span>
                <span style={metaValueStyle}>#{selectedPO.rfq_id}</span>
              </div>
              <div>
                <span style={metaLabelStyle}>Delivery Terms</span>
                <span style={metaValueStyle}>{selectedQuotation.delivery_days} Days</span>
              </div>
              <div>
                <span style={metaLabelStyle}>Payment Terms</span>
                <span style={metaValueStyle}>{selectedQuotation.payment_terms}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <h4 style={itemTableHeaderStyle}>ORDERED LINE ITEMS</h4>
            <div className="table-responsive">
              <table className="custom-table" style={{ border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Unit Price ($)</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Total ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>${item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Calculation Bottom Rows */}
                  <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                    <td colSpan="2" style={{ borderBottom: 'none' }}></td>
                    <td style={{ fontWeight: 600, textAlign: 'right', borderBottom: 'none' }}>Subtotal:</td>
                    <td style={{ fontWeight: 700, textAlign: 'right', borderBottom: 'none' }}>
                      ${selectedQuotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ borderBottom: 'none' }}></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', borderBottom: 'none' }}>CGST (9.0%):</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', borderBottom: 'none' }}>
                      ${(selectedQuotation.gst_amount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ borderBottom: 'none' }}></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', borderBottom: 'none' }}>SGST (9.0%):</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', borderBottom: 'none' }}>
                      ${(selectedQuotation.gst_amount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                    <td colSpan="2"></td>
                    <td style={{ textAlign: 'right' }}>Grand Total:</td>
                    <td style={{ textAlign: 'right' }}>
                      ${selectedQuotation.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PO Footer Notes */}
            <div style={docFooterStyle}>
              <Landmark size={18} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-primary)' }}>PURCHASE ORDER INSTRUCTIONS</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Please deliver goods to the organization's address within the specified delivery target. Reference this PO number on all shipping labels and invoices.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REGISTRY LIST VIEW */
        <div>
          <div style={headerStyle}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Purchase Orders</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Issued procurement orders dispatched to suppliers.</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem', padding: 0 }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Associated RFQ</th>
                    <th>Vendor Business</th>
                    <th>Date Generated</th>
                    <th>Delivery Target</th>
                    <th>Grand Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3.5rem' }}>
                        <FileCheck size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No Purchase Orders are generated yet.</p>
                      </td>
                    </tr>
                  ) : (
                    purchaseOrders.map(po => {
                      const quotation = quotations.find(q => q.id === po.quotation_id);
                      const rfq = rfqs.find(r => r.id === po.rfq_id);
                      
                      return (
                        <tr key={po.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{po.po_number}</td>
                          <td style={{ fontWeight: 600 }}>{rfq ? rfq.title : `RFQ #${po.rfq_id}`}</td>
                          <td>{getVendorName(quotation?.vendor_id)}</td>
                          <td>{new Date(po.created_at).toLocaleDateString()}</td>
                          <td>{quotation ? `${quotation.delivery_days} Days` : 'N/A'}</td>
                          <td style={{ fontWeight: 700 }}>
                            ${quotation ? quotation.grand_total.toLocaleString() : '0'}
                          </td>
                          <td>
                            <button 
                              onClick={() => setSelectedPoId(po.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              <span>View PO</span>
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

const actionsCardStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1.25rem',
  backgroundColor: 'var(--bg-secondary)',
  flexWrap: 'wrap',
  gap: '1rem'
};

const invoiceDocumentCardStyle = {
  padding: '3rem',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const docHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  borderBottom: '2px solid var(--primary)',
  paddingBottom: '1rem'
};

const addressGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '3rem'
};

const addressHeaderStyle = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.25rem'
};

const addressBodyStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.5
};

const metaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '1rem',
  backgroundColor: 'var(--bg-primary)',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)'
};

const metaLabelStyle = {
  display: 'block',
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  marginBottom: '0.2rem'
};

const metaValueStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--text-primary)'
};

const itemTableHeaderStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--primary)',
  marginTop: '0.5rem'
};

const docFooterStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start',
  marginTop: '2rem',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  padding: '0.85rem 1.25rem',
  borderRadius: 'var(--radius-md)'
};

export default PurchaseOrders;
