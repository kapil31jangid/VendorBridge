import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Plus, Upload } from 'lucide-react';

const fallbackRfqVendors = [
  { id: 101, name: 'Infra Supplies Ltd', status: 'Active' },
  { id: 102, name: 'TechCore IT Solutions', status: 'Active' },
  { id: 103, name: 'Office Need Co', status: 'Active' }
];

const CreateRFQ = () => {
  const { vendors, createRFQ, setActiveTab } = useContext(AppContext);

  // Form State
  const [rfqDetails, setRfqDetails] = useState({
    title: '',
    category: 'Furniture',
    deadline: '',
    description: ''
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, item_name: 'Ergonomic chair', quantity: 25, unit: 'NOS' },
    { id: 2, item_name: 'Standing desks', quantity: 10, unit: 'NOS' }
  ]);

  const [assignedVendorIds, setAssignedVendorIds] = useState([]);

  const vendorOptions = vendors.length > 0 ? vendors : fallbackRfqVendors;
  const assignedVendors = vendorOptions.filter(vendor => assignedVendorIds.some(id => String(id) === String(vendor.id)));
  const availableVendors = vendorOptions.filter(vendor => !assignedVendorIds.some(id => String(id) === String(vendor.id)));

  const handleDetailChange = (e) => {
    setRfqDetails({ ...rfqDetails, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), item_name: '', quantity: 1, unit: 'NOS' }]);
  };

  const toggleVendorSelection = (vendorId) => {
    if (assignedVendorIds.some(id => String(id) === String(vendorId))) {
      setAssignedVendorIds(assignedVendorIds.filter(id => String(id) !== String(vendorId)));
    } else {
      setAssignedVendorIds([...assignedVendorIds, vendorId]);
    }
  };

  const addNextVendor = () => {
    const nextVendor = availableVendors.find(vendor => vendor.status !== 'Blocked') || availableVendors[0];
    if (!nextVendor) {
      alert(assignedVendorIds.length > 0 ? 'All vendors are already assigned.' : 'No vendor records are available.');
      return;
    }

    toggleVendorSelection(nextVendor.id);
  };

  const handleDispatch = (status = 'Active') => {
    if (assignedVendorIds.length === 0 && status === 'Active') {
      alert('Please assign at least one vendor before publishing.');
      return;
    }

    createRFQ({
      title: rfqDetails.title,
      description: rfqDetails.description,
      category: rfqDetails.category,
      deadline: rfqDetails.deadline,
      status,
      items: lineItems,
      assigned_vendors: assignedVendorIds
    });

    setActiveTab('rfqs');
  };

  const steps = [
    { num: 1, label: 'RFQ Details', active: true },
    { num: 2, label: 'Line Items & Vendors', active: lineItems.length > 0 && assignedVendors.length > 0 },
    { num: 3, label: 'Publish', active: false }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Create RFQ</h1>
          <p className="page-subtitle">Define requirements, line items, and invited vendors for a new request for quotation</p>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                <div
                  className="tabular-nums"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-full)',
                    border: step.active ? '1px solid var(--primary)' : '1px solid var(--border-strong)',
                    backgroundColor: step.active ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: step.active ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {step.num}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: step.active ? 600 : 500, color: step.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Form Content - Two Columns */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="rfq-split">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div className="form-group">
              <label htmlFor="rfq-title">RFQ Title *</label>
              <input
                id="rfq-title"
                type="text"
                name="title"
                placeholder="e.g. Office Furniture Procurement Q2"
                className="form-control"
                value={rfqDetails.title}
                onChange={handleDetailChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rfq-category">Category</label>
              <input
                id="rfq-category"
                type="text"
                name="category"
                placeholder="Furniture"
                className="form-control"
                value={rfqDetails.category}
                onChange={handleDetailChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rfq-deadline">Submission Deadline *</label>
              <input
                id="rfq-deadline"
                type="text"
                name="deadline"
                placeholder="15 June 2025"
                className="form-control"
                value={rfqDetails.deadline}
                onChange={handleDetailChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rfq-desc">Description</label>
              <textarea
                id="rfq-desc"
                name="description"
                placeholder="Ergonomic chairs and standing desks for 3rd floor"
                className="form-control"
                value={rfqDetails.description}
                onChange={handleDetailChange}
                rows={4}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', maxWidth: '280px' }}>
              <button type="button" className="btn btn-primary" onClick={() => handleDispatch('Active')}>
                Save &amp; Send to Vendors
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => handleDispatch('Draft')}>
                Save as Draft
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Line Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-eyebrow">Line Items</h2>
                <button type="button" onClick={addLineItem} className="btn btn-secondary btn-sm">
                  <Plus size={13} />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="card-flush">
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ width: '90px' }}>Qty</th>
                        <th style={{ width: '90px' }}>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ padding: '0.45rem 0.625rem' }}>
                            <input
                              type="text"
                              className="form-control"
                              value={item.item_name}
                              placeholder="Item description"
                              onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                              style={{ minHeight: '32px', padding: '0.3rem 0.5rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.45rem 0.625rem' }}>
                            <input
                              type="number"
                              className="form-control tabular-nums"
                              value={item.quantity}
                              onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                              style={{ minHeight: '32px', padding: '0.3rem 0.5rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.45rem 0.625rem' }}>
                            <input
                              type="text"
                              className="form-control"
                              value={item.unit}
                              onChange={e => handleItemChange(index, 'unit', e.target.value)}
                              style={{ minHeight: '32px', padding: '0.3rem 0.5rem' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Assign Vendors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <h2 className="section-eyebrow">Assign Vendors</h2>
              <div style={assignedVendorsBoxStyle}>
                {assignedVendors.length > 0 ? assignedVendors.map(vendor => (
                  <div key={vendor.id} style={assignedVendorTagStyle}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{vendor.name}</span>
                    <button
                      type="button"
                      style={tagRemoveBtnStyle}
                      onClick={() => toggleVendorSelection(vendor.id)}
                      aria-label={`Remove ${vendor.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No vendors assigned yet.
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: 'fit-content' }}
                onClick={addNextVendor}
              >
                <Plus size={13} />
                <span>Add Vendor</span>
              </button>
            </div>

            {/* Attachments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <h2 className="section-eyebrow">Attachments</h2>
              <div style={attachmentBoxStyle}>
                <Upload size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Drag &amp; drop specification files or click to upload
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  PDF, XLSX, or DOCX up to 10 MB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const assignedVendorsBoxStyle = {
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  minHeight: '56px'
};

const assignedVendorTagStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.84375rem',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  padding: '0.4rem 0.65rem'
};

const tagRemoveBtnStyle = {
  color: 'var(--text-muted)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px',
  borderRadius: 'var(--radius-sm)'
};

const attachmentBoxStyle = {
  border: '1px dashed var(--border-strong)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--bg-primary)',
  padding: '1.75rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.35rem',
  textAlign: 'center'
};

export default CreateRFQ;
