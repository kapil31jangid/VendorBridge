import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const { login, setActiveTab } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    login(email, password);
  };

  // Shortcut login helper for demo presentations
  const quickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    login(demoEmail, 'password123');
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        {/* Product Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem', textAlign: 'center' }}>
          <div style={brandMarkStyle}>VB</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginTop: '0.875rem', color: 'var(--text-primary)' }}>
            Sign in to VendorBridge
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Enterprise Procurement &amp; Vendor Management
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="login-email">Work Email</label>
            <div style={inputContainerStyle}>
              <Mail size={15} color="var(--text-muted)" style={inputIconStyle} />
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="login-password">Password</label>
            <div style={inputContainerStyle}>
              <Lock size={15} color="var(--text-muted)" style={inputIconStyle} />
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '40px', marginTop: '0.25rem' }}
          >
            Sign In
          </button>
        </form>

        <div style={footerStyle}>
          <span style={{ color: 'var(--text-secondary)' }}>New procurement member? </span>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            style={linkButtonStyle}
          >
            Create account
          </button>
        </div>

        {/* Quick Demo Logins Panel */}
        <div style={demoBoxStyle}>
          <div style={demoHeaderStyle}>Demo Access</div>
          <div style={demoGridStyle}>
            <button type="button" onClick={() => quickLogin('officer@vendorbridge.com')} className="btn btn-secondary btn-sm">
              Officer
            </button>
            <button type="button" onClick={() => quickLogin('manager@vendorbridge.com')} className="btn btn-secondary btn-sm">
              Manager
            </button>
            <button type="button" onClick={() => quickLogin('vendor1@infra.com')} className="btn btn-secondary btn-sm">
              Vendor (Infra)
            </button>
            <button type="button" onClick={() => quickLogin('admin@vendorbridge.com')} className="btn btn-secondary btn-sm">
              Admin
            </button>
          </div>
        </div>
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
  padding: '1.5rem'
};

const formCardStyle = {
  width: '410px',
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

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIconStyle = {
  position: 'absolute',
  left: '0.75rem',
  pointerEvents: 'none'
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '1.25rem',
  fontSize: '0.8125rem'
};

const linkButtonStyle = {
  color: 'var(--primary)',
  fontWeight: 600,
  fontSize: '0.8125rem'
};

const demoBoxStyle = {
  marginTop: '1.5rem',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '1.25rem'
};

const demoHeaderStyle = {
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'center',
  marginBottom: '0.75rem'
};

const demoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '0.5rem'
};

export default Login;
