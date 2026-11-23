import { useContext, useState } from 'react';
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
      case 'dashboard':            return <Dashboard />;
      case 'vendors':              return <Vendors />;
      case 'rfqs':                 return <CreateRFQ />;
      case 'quotations':           return <Quotations />;
      case 'quotation-comparison': return <QuotationComparison onBackToQuotations={() => setActiveTab('quotations')} />;
      case 'approvals':            return <ApprovalPage />;
      case 'purchase-orders':      return <PurchaseOrders />;
      case 'invoices':             return <Invoices />;
      case 'activity':             return <ActivityLogs />;
      case 'reports':              return <Reports />;
      default:                     return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Navbar onOpenInbox={() => setInboxOpen(true)} />
        <main className="app-content">
          <div className="page-stack">
            {renderPage()}
          </div>
        </main>
      </div>

      {toast && <Toast toast={toast} />}
      <EmailInbox isOpen={inboxOpen} onClose={() => setInboxOpen(false)} />
    </div>
  );
};

export default App;
