import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X } from 'lucide-react';

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

  // Change basic detail handler
  const handleDetailChange = (e) => {
    setRfqDetails({ ...rfqDetails, [e.target.name]: e.target.value });
  };

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), item_name: '', quantity: 1, unit: 'NOS' }]);
  };

  // Vendor assignment
  const toggleVendorSelection = (vendorId) => {
    if (assignedVendorIds.includes(vendorId)) {
      setAssignedVendorIds(assignedVendorIds.filter(id => id !== vendorId));
    } else {
      setAssignedVendorIds([...assignedVendorIds, vendorId]);
    }
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

  return (
    <div style={wrapperStyle}>
      {/* Page Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create RFQ's</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>new request for quotation</p>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div style={stepsIndicatorContainerStyle}>
        <div style={stepContainerStyle}>
          <div style={stepCircleStyle(true)}>1</div>
          <div style={stepConnectorStyle} />
        </div>
        <div style={stepContainerStyle}>
          <div style={stepCircleStyle(false)}>2</div>
          <div style={stepConnectorStyle} />
        </div>
        <div style={stepContainerStyle}>
          <div style={stepCircleStyle(false)}>3</div>
        </div>
      </div>

      {/* Main Form Content - Two Columns */}
      <div style={twoColGridStyle}>
        
        {/* Left Column */}
        <div style={colStyle}>
          <div className="form-group">
            <label style={labelStyle}>RFQ's title*</label>
            <input 
              type="text" 
              name="title"
              placeholder="Office Furniture procurement Q2"
              className="form-control"
              value={rfqDetails.title}
              onChange={handleDetailChange}
              style={inputStyle}
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Category</label>
            <input 
              type="text" 
              name="category"
              placeholder="Furniture"
              className="form-control"
              value={rfqDetails.category}
              onChange={handleDetailChange}
              style={inputStyle}
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Deadline*</label>
            <input 
              type="text" 
              name="deadline"
              placeholder="15 June 2025"
              className="form-control"
              value={rfqDetails.deadline}
              onChange={handleDetailChange}
              style={inputStyle}
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Description</label>
            <textarea 
              name="description"
              placeholder="Ergonomic chairs and standing desks for 3rd floor"
              className="form-control"
              value={rfqDetails.description}
              onChange={handleDetailChange}
              rows={3}
              style={{...inputStyle, resize: 'none'}}
            />
          </div>

          <hr style={dividerStyle} />

          <div style={leftButtonsContainerStyle}>
            <button className="btn btn-outline" style={bottomButtonStyle} onClick={() => handleDispatch('Active')}>
              Save & Send to Vendors
            </button>
            <button className="btn btn-outline" style={bottomButtonStyle} onClick={() => handleDispatch('Draft')}>
              Save as Draft
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div style={colStyle}>
          
          <div style={sectionContainerStyle}>
            <h3 style={sectionTitleStyle}>Line items</h3>
            <div className="table-responsive" style={tableWrapperStyle}>
              <table className="custom-table" style={tableStyle}>
                <thead>
                  <tr>
                    <th>item</th>
                    <th>qty</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <input 
                          type="text" 
                          className="form-control"
                          value={item.item_name}
                          onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                          style={tableInputStyle}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-control"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          style={tableInputStyle}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control"
                          value={item.unit}
                          onChange={e => handleItemChange(index, 'unit', e.target.value)}
                          style={tableInputStyle}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addLineItem} className="btn btn-outline" style={smallButtonStyle}>
              + add line item
            </button>
          </div>

          <div style={sectionContainerStyle}>
            <h3 style={sectionTitleStyle}>ASSIGN VENDORS</h3>
            <div style={assignedVendorsBoxStyle}>
              <div style={assignedVendorTagStyle}>
                Infra Supplies Pvt ltd <button style={tagRemoveBtnStyle}><X size={12} /></button>
              </div>
              <div style={assignedVendorTagStyle}>
                Techcore LTD <button style={tagRemoveBtnStyle}><X size={12} /></button>
              </div>
            </div>
            <button className="btn btn-outline" style={{...smallButtonStyle, marginTop: '0.5rem', width: '100%', textAlign: 'left', display: 'block', border: '1px solid var(--text-secondary)'}}>
              + add vendor
            </button>
          </div>

          <div style={sectionContainerStyle}>
            <h3 style={sectionTitleStyle}>Attchements</h3>
            <div style={attachmentBoxStyle}>
              Drag & drop files or click to upload
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* Styles */
const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1rem 0'
};

const headerStyle = {
  marginBottom: '0.5rem'
};

const stepsIndicatorContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '2.5rem',
  padding: '0 1rem'
};

const stepContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  ':last-child': {
    flex: 'none'
  }
};

const stepCircleStyle = (isActive) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '1px solid var(--text-primary)',
  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '1rem',
  color: 'var(--text-primary)'
});

const stepConnectorStyle = {
  flex: 1,
  height: '1px',
  backgroundColor: 'var(--text-primary)',
  margin: '0 1rem'
};

const twoColGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '4rem',
  paddingLeft: '1rem'
};

const colStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem'
};

const labelStyle = {
  fontSize: '0.9rem',
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

const dividerStyle = {
  borderColor: 'var(--text-secondary)',
  opacity: 0.3,
  margin: '1.5rem 0'
};

const leftButtonsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '60%'
};

const bottomButtonStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  padding: '0.6rem 1rem',
  textAlign: 'center',
  fontWeight: '500'
};

const sectionContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  marginBottom: '0.5rem'
};

const sectionTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: '500',
  textTransform: 'uppercase'
};

const tableWrapperStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden'
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

const smallButtonStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  padding: '0.4rem 1rem',
  fontSize: '0.85rem',
  width: 'max-content'
};

const assignedVendorsBoxStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const assignedVendorTagStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.9rem'
};

const tagRemoveBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};

const attachmentBoxStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '2.5rem 1rem',
  textAlign: 'center',
  fontSize: '0.9rem',
  color: 'var(--text-primary)'
};

export default CreateRFQ;
