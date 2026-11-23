import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Search, X } from 'lucide-react';

const Vendors = () => {
  const { vendors, addVendor, updateVendorStatus, showToast } = useContext(AppContext);

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

  const handleStatusUpdate = async (vendorId, nextStatus) => {
    if (typeof updateVendorStatus === 'function') {
      await updateVendorStatus(vendorId, nextStatus);
    }
    setSelectedVendor(null);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.gst_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && vendor.status === activeTab;
  });

  const getCount = (status) => {
    if (status === 'All') return vendors.length;
    return vendors.filter(v => v.status === status).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage supplier profiles, GST registrations, and approval status</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={15} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrap">
          <Search size={15} className="search-input-icon" />
          <input
            type="text"
            placeholder="Search by vendor name, GST number, or category..."
            className="form-control"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar" role="tablist">
        {['All', 'Active', 'Pending', 'Blocked'].map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
          >
            <span>{tab}</span>
            <span className="tab-count">{getCount(tab)}</span>
          </button>
        ))}
      </div>

      {/* Vendors Table */}
      <div className="card-flush">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>GST No.</th>
                <th>Contact No.</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
                    No vendors match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{vendor.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vendor.email}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{vendor.category}</td>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        {vendor.gst_no}
                      </code>
                    </td>
                    <td className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{vendor.contact_no}</td>
                    <td>
                      <span className={`badge ${
                        vendor.status === 'Active' ? 'badge-success' :
                        vendor.status === 'Pending' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedVendor(vendor)}
                        className="btn btn-secondary btn-sm"
                      >
                        View
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
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-vendor-title">
          <div className="modal-panel">
            <div className="modal-header">
              <h3 id="add-vendor-title" className="modal-title">Register New Vendor</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="modal-close-btn" aria-label="Close modal">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="vendor-name">Vendor Business Name *</label>
                  <input
                    id="vendor-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Apex Industrial Parts Ltd"
                    className="form-control"
                    value={newVendor.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '0.875rem' }}>
                  <div className="form-group">
                    <label htmlFor="vendor-category">Category *</label>
                    <select
                      id="vendor-category"
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
                    <label htmlFor="vendor-gst">GST Number *</label>
                    <input
                      id="vendor-gst"
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

                <div className="grid-2" style={{ gap: '0.875rem' }}>
                  <div className="form-group">
                    <label htmlFor="vendor-contact">Contact Number *</label>
                    <input
                      id="vendor-contact"
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
                    <label htmlFor="vendor-email">Email Address *</label>
                    <input
                      id="vendor-email"
                      type="email"
                      name="email"
                      placeholder="sales@vendor.com"
                      className="form-control"
                      value={newVendor.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="vendor-terms">Payment Terms</label>
                  <input
                    id="vendor-terms"
                    type="text"
                    name="payment_terms"
                    placeholder="e.g. 30 Days Net, Immediate, 45 Days Net"
                    className="form-control"
                    value={newVendor.payment_terms}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Vendor Profile */}
      {selectedVendor && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="vendor-profile-title">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h3 id="vendor-profile-title" className="modal-title">{selectedVendor.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor Profile &amp; Status</span>
              </div>
              <button type="button" onClick={() => setSelectedVendor(null)} className="modal-close-btn" aria-label="Close modal">
                <X size={17} />
              </button>
            </div>

            <div className="modal-body">
              <div className="grid-2" style={{ gap: '1.125rem' }}>
                <div>
                  <div style={detailLabelStyle}>Category</div>
                  <div style={detailValueStyle}>{selectedVendor.category}</div>
                </div>
                <div>
                  <div style={detailLabelStyle}>Status</div>
                  <div style={{ marginTop: '0.15rem' }}>
                    <span className={`badge ${
                      selectedVendor.status === 'Active' ? 'badge-success' :
                      selectedVendor.status === 'Pending' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {selectedVendor.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={detailLabelStyle}>GST Registration</div>
                  <div style={detailValueStyle}><code>{selectedVendor.gst_no}</code></div>
                </div>
                <div>
                  <div style={detailLabelStyle}>Contact Number</div>
                  <div className="tabular-nums" style={detailValueStyle}>{selectedVendor.contact_no}</div>
                </div>
                <div>
                  <div style={detailLabelStyle}>Email Address</div>
                  <div style={detailValueStyle}>{selectedVendor.email}</div>
                </div>
                <div>
                  <div style={detailLabelStyle}>Payment Terms</div>
                  <div style={detailValueStyle}>{selectedVendor.payment_terms}</div>
                </div>
                <div>
                  <div style={detailLabelStyle}>Performance Rating</div>
                  <div className="tabular-nums" style={{ ...detailValueStyle, fontWeight: 600 }}>
                    {Number(selectedVendor.rating || 0).toFixed(1)} / 5.0
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ ...detailLabelStyle, marginBottom: '0.625rem' }}>Update Vendor Status</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedVendor.id, 'Active')}
                    className="btn btn-teal btn-sm"
                    disabled={selectedVendor.status === 'Active'}
                  >
                    Approve / Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedVendor.id, 'Pending')}
                    className="btn btn-secondary btn-sm"
                    disabled={selectedVendor.status === 'Pending'}
                  >
                    Set to Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedVendor.id, 'Blocked')}
                    className="btn btn-danger-outline btn-sm"
                    disabled={selectedVendor.status === 'Blocked'}
                  >
                    Block Vendor
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedVendor(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const detailLabelStyle = {
  fontSize: '0.725rem',
  color: 'var(--text-muted)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.2rem'
};

const detailValueStyle = {
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  fontWeight: 500
};

export default Vendors;
