import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const { registerUser, setActiveTab } = useContext(AppContext);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Officer',
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
      <div style={formCardStyle}>
        {/* Back Link */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="btn btn-ghost btn-sm"
            style={{ paddingLeft: 0, height: 'auto' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </button>
        </div>

        {/* Product Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={brandMarkStyle}>VB</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginTop: '0.875rem', color: 'var(--text-primary)' }}>
            Create an Account
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Register your VendorBridge procurement profile
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Row 1: First Name & Last Name */}
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-first">First Name</label>
              <input
                id="reg-first"
                type="text"
                name="first_name"
                className="form-control"
                placeholder="Amit"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-last">Last Name</label>
              <input
                id="reg-last"
                type="text"
                name="last_name"
                className="form-control"
                placeholder="Sharma"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Email Address & Phone Number */}
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="text"
                name="phone"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3: Role & Country */}
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
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
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-country">Country</label>
              <input
                id="reg-country"
                type="text"
                name="country"
                className="form-control"
                placeholder="India"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 4: Additional Info */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="reg-info">Additional Information</label>
            <textarea
              id="reg-info"
              name="additional_info"
              className="form-control"
              placeholder="Department, company details, or onboarding notes"
              value={formData.additional_info}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
          >
            Create Account
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
  backgroundColor: 'var(--bg-primary)',
  padding: '2rem 1.5rem'
};

const formCardStyle = {
  width: '480px',
  maxWidth: '100%',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-lg)',
  padding: '2rem',
  boxShadow: 'var(--shadow-sm)'
};

const brandMarkStyle = {
  width: '44px',
  height: '44px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--text-primary)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9375rem',
  fontWeight: 700,
  letterSpacing: '0.02em'
};

export default Register;
