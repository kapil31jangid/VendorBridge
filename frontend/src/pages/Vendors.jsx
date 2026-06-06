import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Search, Eye, X, Filter } from 'lucide-react';

const Vendors = () => {
  const { vendors, addVendor, logActivity, showToast } = useContext(AppContext);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Form states for new vendor
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Infrastructure',
    gst_no: '',
    contact_no: '',
    email: '',
    payment_terms: '30 Days Net'
  });

  const handleInputChange = (e) => {
    setNewVendor({ ...newVendor, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.gst_no || !newVendor.email) {
      showToast('Please fill out all mandatory fields.', 'error');
      return;
    }
    addVendor(newVendor);
    setNewVendor({
      name: '',
      category: 'Infrastructure',
      gst_no: '',
      contact_no: '',
      email: '',
      payment_terms: '30 Days Net'
    });
    setIsAddOpen(false);
  };

  // Modify vendor status helper
  const updateVendorStatus = (vendorId, nextStatus) => {
    // Modify in-place for local state demonstration
    const v = vendors.find(vend => vend.id === vendorId);
    if (v) {
      v.status = nextStatus;
      logActivity('Vendor Status Updated', 'Vendor', `Vendor '${v.name}' status updated to ${nextStatus}`);
      showToast(`Vendor status updated to ${nextStatus}.`);
      setSelectedVendor(null);
    }
  };

  // Filtering Logic
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.gst_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && vendor.status === activeTab;
  });

  // Count tab metrics
  const getCount = (status) => {
    if (status === 'All') return vendors.length;
    return vendors.filter(v => v.status === status).length;
  };

  return (
    <div style={wrapperStyle}>
      {/* Page Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Vendors</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage supplier profiles and registrations</p>
        </div>
        <button className="btn btn-teal" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={filterBarContainerStyle}>
        {/* Search */}
        <div style={searchContainerStyle}>
          <Search size={16} color="var(--text-muted)" style={searchIconStyle} />
          <input 
            type="text" 
            placeholder="Search bar ...... search by name, gst number, category..."
            className="form-control"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={tabContainerStyle}>
        {['All', 'Active', 'Pending', 'Blocked'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? activeTabStyle : tabStyle}
          >
            <span>{tab}</span>
            <span style={tabBadgeStyle(activeTab === tab)}>{getCount(tab)}</span>
          </button>
        ))}
      </div>

      {/* Vendors Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>GST no.</th>
                <th>contact no.</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    No vendors found matching selection criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</td>
                    <td>{vendor.category}</td>
                    <td><code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{vendor.gst_no}</code></td>
                    <td>{vendor.contact_no}</td>
                    <td>
                      <span className={`badge ${
                        vendor.status === 'Active' ? 'badge-success' :
                        vendor.status === 'Pending' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedVendor(vendor)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Vendor */}
      {isAddOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle} className="card">
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register New Vendor</h3>
              <button onClick={() => setIsAddOpen(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Vendor Business Name *</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="e.g. Apex Industrial Parts"
                  className="form-control"
                  value={newVendor.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={formGridStyle}>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    name="category"
                    className="form-control"
                    value={newVendor.category}
                    onChange={handleInputChange}
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Technology">Technology</option>
                    <option value="Office Furniture">Office Furniture</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Services">Services</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>GST Number *</label>
                  <input 
                    type="text" 
                    name="gst_no"
                    placeholder="e.g. 27AAAAA1111A1Z1"
                    className="form-control"
                    value={newVendor.gst_no}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={formGridStyle}>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input 
                    type="text" 
                    name="contact_no"
                    placeholder="e.g. +91 99999 88888"
                    className="form-control"
                    value={newVendor.contact_no}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="e.g. sales@vendor.com"
                    className="form-control"
                    value={newVendor.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Payment Terms</label>
                <input 
                  type="text" 
                  name="payment_terms"
                  placeholder="e.g. 30 Days Net, Immediate, 45 Days Net"
                  className="form-control"
                  value={newVendor.payment_terms}
                  onChange={handleInputChange}
                />
              </div>

              <div style={modalFooterStyle}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View/Edit Vendor Details */}
      {selectedVendor && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle} className="card">
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Vendor profile: {selectedVendor.name}</h3>
              <button onClick={() => setSelectedVendor(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={vendorDetailsGridStyle}>
              <div>
                <p style={detailLabelStyle}>Category</p>
                <p style={detailValueStyle}>{selectedVendor.category}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>GST Registration</p>
                <p style={detailValueStyle}><code>{selectedVendor.gst_no}</code></p>
              </div>
              <div>
                <p style={detailLabelStyle}>Contact Number</p>
                <p style={detailValueStyle}>{selectedVendor.contact_no}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Email Address</p>
                <p style={detailValueStyle}>{selectedVendor.email}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Payment Terms</p>
                <p style={detailValueStyle}>{selectedVendor.payment_terms}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Performance Rating</p>
                <p style={{ ...detailValueStyle, color: 'var(--color-warning)' }}>★ {selectedVendor.rating.toFixed(1)} / 5.0</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <p style={{ ...detailLabelStyle, marginBottom: '0.5rem' }}>Update Business Status</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => updateVendorStatus(selectedVendor.id, 'Active')}
                  className="btn btn-teal btn-sm"
                  disabled={selectedVendor.status === 'Active'}
                >
                  Approve / Active
                </button>
                <button 
                  onClick={() => updateVendorStatus(selectedVendor.id, 'Pending')}
                  className="btn btn-secondary btn-sm"
                  disabled={selectedVendor.status === 'Pending'}
                >
                  Set to Pending
                </button>
                <button 
                  onClick={() => updateVendorStatus(selectedVendor.id, 'Blocked')}
                  className="btn btn-danger btn-sm"
                  disabled={selectedVendor.status === 'Blocked'}
                >
                  Block Vendor
                </button>
              </div>
            </div>

            <div style={{ ...modalFooterStyle, marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedVendor(null)}>Close</button>
            </div>
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

const filterBarContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const searchContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flex: 1
};

const searchIconStyle = {
  position: 'absolute',
  left: '12px'
};

const tabContainerStyle = {
  display: 'flex',
  gap: '0.5rem',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.5rem'
};

const tabStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: 'transparent',
  border: 'none',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  fontSize: '0.85rem',
  fontWeight: '600',
  borderRadius: 'var(--radius-sm)',
  transition: 'all 0.15s ease',
  outline: 'none'
};

const activeTabStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  border: 'none',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  color: 'var(--primary)',
  fontSize: '0.85rem',
  fontWeight: '700',
  borderRadius: 'var(--radius-sm)',
  transition: 'all 0.15s ease',
  outline: 'none'
};

const tabBadgeStyle = (isActive) => ({
  fontSize: '0.7rem',
  padding: '0.1rem 0.4rem',
  borderRadius: 'var(--radius-full)',
  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
  color: isActive ? 'white' : 'var(--text-muted)'
});

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(5, 5, 10, 0.75)',
  backdropFilter: 'blur(4px)',
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem'
};

const modalContentStyle = {
  width: '560px',
  maxWidth: '95%',
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: 'var(--bg-secondary)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.75rem',
  marginBottom: '0.5rem'
};

const closeBtnStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer'
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem'
};

const modalFooterStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  marginTop: '1rem',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '0.75rem'
};

const vendorDetailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.25rem',
  marginTop: '1rem'
};

const detailLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  marginBottom: '0.15rem'
};

const detailValueStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
  fontWeight: '500'
};

export default Vendors;
