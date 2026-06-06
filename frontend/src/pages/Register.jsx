import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UserPlus, ArrowLeft } from 'lucide-react';

const Register = () => {
  const { registerUser, setActiveTab } = useContext(AppContext);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Officer', // Default role
    country: 'India',
    additional_info: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.email) return;
    registerUser(formData);
    setActiveTab('login');
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle} className="card">
        {/* Header Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('login')} 
            style={backBtnStyle}
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </div>

        {/* Photo Circle Placeholder matching Screen 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={photoCircleStyle}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Photo</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.75rem' }}>Registration Screen</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Create your ERP account profile</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Row 1: First Name & Last Name */}
          <div style={nameRowStyle}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>First Name</label>
              <input 
                type="text" 
                name="first_name"
                className="form-control" 
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Last Name</label>
              <input 
                type="text" 
                name="last_name"
                className="form-control" 
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Email Address & Phone Number */}
          <div style={nameRowStyle}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Phone Number</label>
              <input 
                type="text" 
                name="phone"
                className="form-control" 
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3: Role & Country */}
          <div style={nameRowStyle}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Role (Admin, officer)</label>
              <select 
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Officer">Procurement Officer</option>
                <option value="Manager">Manager / Approver</option>
                <option value="Vendor">External Vendor</option>
                <option value="Admin">ERP Admin</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Country</label>
              <input 
                type="text" 
                name="country"
                className="form-control"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 4: Additional Info */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Additional Information ....</label>
            <textarea 
              name="additional_info"
              className="form-control" 
              placeholder="Additional Information ...."
              value={formData.additional_info}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}>
            <UserPlus size={18} />
            <span>Register</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* Styles */
const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100%',
  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
  padding: '2rem 0'
};

const formCardStyle = {
  width: '460px',
  padding: '2.5rem',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
};

const photoCircleStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  border: '2px dashed var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.02)'
};

const backBtnStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.8rem',
  fontWeight: '600',
  padding: 0
};

const nameRowStyle = {
  display: 'flex',
  gap: '1rem'
};

export default Register;
