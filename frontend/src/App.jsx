import React, { useContext, useState } from 'react';
import { AppContext } from './context/AppContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import EmailInbox from './components/EmailInbox';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import CreateRFQ from './pages/CreateRFQ';
import Quotations from './pages/Quotations';
import QuotationComparison from './pages/QuotationComparison';
import ApprovalPage from './pages/ApprovalPage';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';

const App = () => {
  const { currentUser, activeTab, setActiveTab, toast } = useContext(AppContext);
  const [inboxOpen, setInboxOpen] = useState(false);

  // Show auth screens when not logged in
  if (!currentUser) {
    if (activeTab === 'register') return <Register />;
    return <Login />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':        return <Dashboard />;
      case 'vendors':          return <Vendors />;
      case 'rfqs':             return <CreateRFQ />;
      case 'quotations':       return <Quotations />;
      case 'quotation-comparison': return <QuotationComparison onBackToQuotations={() => setActiveTab('quotations')} />;
      case 'approvals':        return <ApprovalPage />;
      case 'purchase-orders':  return <PurchaseOrders />;
      case 'invoices':         return <Invoices />;
      case 'activity':         return <ActivityLogs />;
      case 'reports':          return <Reports />;
      default:                 return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar onOpenInbox={() => setInboxOpen(true)} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {renderPage()}
        </div>
      </div>

      {/* Global overlays */}
      {toast && <Toast toast={toast} />}
      <EmailInbox isOpen={inboxOpen} onClose={() => setInboxOpen(false)} />
    </div>
  );
};

export default App;
