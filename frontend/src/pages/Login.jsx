import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { LogIn, Key, Mail } from 'lucide-react';

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
      <div style={formCardStyle} className="card">
        {/* Photo Circle Placeholder matching Screen 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={photoCircleStyle}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Photo</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.75rem' }}>VendorBridge</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Centralized Procurement ERP Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Username</label>
            <div style={inputContainerStyle}>
              <Mail size={16} color="var(--text-muted)" style={inputIconStyle} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="Username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <div style={inputContainerStyle}>
              <Key size={16} color="var(--text-muted)" style={inputIconStyle} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
            <LogIn size={18} />
            <span>Login Button</span>
          </button>
        </form>

        <div style={footerStyle}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>New procurement member? </span>
          <button 
            onClick={() => setActiveTab('register')} 
            style={linkButtonStyle}
          >
            Create account
          </button>
        </div>

        {/* Quick Demo Logins Panel */}
        <div style={demoBoxStyle}>
          <div style={demoHeaderStyle}>Demo Shortcuts (Hackathon Presentation)</div>
          <div style={demoGridStyle}>
            <button onClick={() => quickLogin('officer@vendorbridge.com')} style={demoBtnStyle}>
              Officer
            </button>
            <button onClick={() => quickLogin('manager@vendorbridge.com')} style={demoBtnStyle}>
              Manager
            </button>
            <button onClick={() => quickLogin('vendor1@infra.com')} style={demoBtnStyle}>
              Vendor (Infra)
            </button>
            <button onClick={() => quickLogin('admin@vendorbridge.com')} style={demoBtnStyle}>
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
  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)'
};

const formCardStyle = {
  width: '420px',
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

const logoContainerStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.35rem'
};

const logoIconStyle = {
  backgroundColor: 'rgba(99, 102, 241, 0.15)',
  border: '1px solid var(--primary)',
  borderRadius: 'var(--radius-lg)',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: 'var(--primary)',
  marginBottom: '0.5rem'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIconStyle = {
  position: 'absolute',
  left: '12px'
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '1.25rem',
  fontSize: '0.85rem'
};

const linkButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--primary)',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

const demoBoxStyle = {
  marginTop: '2rem',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '1.25rem'
};

const demoHeaderStyle = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--color-warning)',
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

const demoBtnStyle = {
  padding: '0.45rem',
  fontSize: '0.75rem',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  textAlign: 'center',
  fontWeight: '600',
  transition: 'all 0.15s ease',
  ':hover': {
    borderColor: 'var(--primary)',
    color: 'var(--text-primary)'
  }
};

export default Login;
