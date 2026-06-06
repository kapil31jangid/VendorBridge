import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Set to true to seed the ERP with mock data for standalone/offline presentation.
// Set to false to start with clean database/API connection.
const USE_MOCK_DATA = false;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'vendorbridge.token';
const USER_STORAGE_KEY = 'vendorbridge.user';

export const AppProvider = ({ children }) => {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Toasts Alert State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // State definitions (initial empty or seeded based on USE_MOCK_DATA)
  const [users, setUsers] = useState(USE_MOCK_DATA ? MOCK_USERS : []);
  const [vendors, setVendors] = useState(USE_MOCK_DATA ? MOCK_VENDORS : []);
  const [rfqs, setRfqs] = useState(USE_MOCK_DATA ? MOCK_RFQS : []);
  const [quotations, setQuotations] = useState(USE_MOCK_DATA ? MOCK_QUOTATIONS : []);
  const [approvals, setApprovals] = useState(USE_MOCK_DATA ? MOCK_APPROVALS : []);
  const [purchaseOrders, setPurchaseOrders] = useState(USE_MOCK_DATA ? MOCK_POS : []);
  const [invoices, setInvoices] = useState(USE_MOCK_DATA ? MOCK_INVOICES : []);
  const [activityLogs, setActivityLogs] = useState(USE_MOCK_DATA ? MOCK_LOGS : []);
  const [sentEmails, setSentEmails] = useState(USE_MOCK_DATA ? MOCK_EMAILS : []);

  // Helper: Centralized API call handler
  const apiFetch = async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...options.headers,
        },
        ...options,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server responded with status ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`API: Connection to ${endpoint} failed. Falling back to frontend state.`, err.message);
      return null;
    }
  };

  useEffect(() => {
    if (authToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [authToken]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  // Fetch initial data from the PostgreSQL API endpoints on load
  useEffect(() => {
    if (USE_MOCK_DATA || !authToken) return;

    const loadAllData = async () => {
      setIsLoading(true);
      
      const dbUsers = await apiFetch('/users');
      if (dbUsers) setUsers(dbUsers);

      const dbVendors = await apiFetch('/vendors');
      if (dbVendors) setVendors(dbVendors);

      const dbRfqs = await apiFetch('/rfqs');
      if (dbRfqs) setRfqs(dbRfqs);

      const dbQuotations = await apiFetch('/quotations');
      if (dbQuotations) setQuotations(dbQuotations);

      const dbApprovals = await apiFetch('/approvals');
      if (dbApprovals) setApprovals(dbApprovals);

      const dbPOs = await apiFetch('/purchase-orders');
      if (dbPOs) setPurchaseOrders(dbPOs);

      const dbInvoices = await apiFetch('/invoices');
      if (dbInvoices) setInvoices(dbInvoices);

      const dbLogs = await apiFetch('/activity-logs');
      if (dbLogs) setActivityLogs(dbLogs);

      const dbEmails = await apiFetch('/emails');
      if (dbEmails) setSentEmails(dbEmails);

      setIsLoading(false);
    };

    loadAllData();
  }, [authToken]);

  useEffect(() => {
    if (USE_MOCK_DATA || !authToken || currentUser) return;

    const restoreSession = async () => {
      const sessionResult = await apiFetch('/auth/me');
      if (sessionResult?.user) {
        setCurrentUser(sessionResult.user);
      }
    };

    restoreSession();
  }, [authToken, currentUser]);

  // Helper: Log Activity (PostgreSQL triggers will guarantee database-level immutability)
  const logActivity = async (action, category, details, userId = currentUser?.id || 1, tokenOverride = authToken) => {
    const newLog = {
      id: Date.now(),
      user_id: userId,
      action,
      category,
      details,
      timestamp: new Date().toISOString()
    };

    if (!tokenOverride) {
      setActivityLogs(prev => [newLog, ...prev]);
      return;
    }

    const serverResult = await apiFetch('/activity-logs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenOverride}`
      },
      body: JSON.stringify(newLog)
    });

    const savedLog = serverResult || newLog;
    setActivityLogs(prev => [savedLog, ...prev]);
  };

  // Auth Functions
  const login = async (email, password) => {
    // Attempt authentication with backend API endpoint
    const authResult = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (authResult && authResult.user) {
      if (authResult.token) {
        setAuthToken(authResult.token);
      }
      setCurrentUser(authResult.user);
      logActivity('User Logged In', 'Auth', `User ${authResult.user.first_name} ${authResult.user.last_name} (${authResult.user.role}) logged in`, authResult.user.id, authResult.token);
      showToast(`Welcome back, ${authResult.user.first_name}!`);
      return true;
    }

    // Fallback authentication check against local state or seed data
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) ||
                 MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setAuthToken('');
      logActivity('User Logged In', 'Auth', `User ${user.first_name} ${user.last_name} (${user.role}) logged in (Offline Fallback)`, user.id);
      showToast(`Welcome back, ${user.first_name}! (Offline Mode)`);
      return true;
    }

    showToast('Invalid login credentials.', 'error');
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Logged Out', 'Auth', `User ${currentUser.first_name} logged out`, currentUser.id);
      setCurrentUser(null);
      setAuthToken('');
      setActiveTab('login');
      showToast('Logged out successfully.');
    }
  };

  const registerUser = async (userData) => {
    const newId = Date.now();
    const newUser = { id: newId, ...userData };

    const serverResult = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(newUser)
    });

    const savedUser = serverResult?.user || serverResult || newUser;
    setUsers(prev => [...prev, savedUser]);
    
    // If user registers as a Vendor, automatically create vendor record
    if (userData.role === 'Vendor' && !serverResult?.user) {
      const newVendorId = 100 + newId;
      const newVendor = {
        id: newVendorId,
        name: `${userData.first_name} ${userData.last_name} Enterprises`,
        category: 'Services',
        gst_no: `27XXXXX${String(newId).slice(-4)}1Z1`,
        contact_no: userData.phone,
        email: userData.email,
        status: 'Pending',
        rating: 4.0,
        payment_terms: '30 Days Net'
      };

      await apiFetch('/vendors', {
        method: 'POST',
        body: JSON.stringify(newVendor)
      });
      setVendors(prev => [...prev, newVendor]);
    }

    logActivity('User Registered', 'Auth', `New user ${savedUser.first_name} registered as ${savedUser.role}`, savedUser.id);
    showToast('Registration successful! You can now log in.');
    return true;
  };

  // Vendor Functions
  const addVendor = async (vendorData) => {
    const newVendor = {
      id: Date.now(),
      rating: 4.0,
      status: 'Pending',
      ...vendorData
    };

    const serverResult = await apiFetch('/vendors', {
      method: 'POST',
      body: JSON.stringify(newVendor)
    });

    const savedVendor = serverResult || newVendor;
    setVendors(prev => [...prev, savedVendor]);
    logActivity('Vendor Added', 'Vendor', `Vendor '${savedVendor.name}' registered manually`, currentUser?.id);
    showToast(`Vendor '${savedVendor.name}' added successfully.`);
  };

  const updateVendorStatus = async (vendorId, nextStatus) => {
    const serverResult = await apiFetch(`/vendors/${vendorId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    });

    setVendors(prev => prev.map(vendor => {
      if (vendor.id !== vendorId) return vendor;
      return serverResult || { ...vendor, status: nextStatus };
    }));

    const updatedVendor = vendors.find(vendor => vendor.id === vendorId);
    if (updatedVendor) {
      logActivity('Vendor Status Updated', 'Vendor', `Vendor '${updatedVendor.name}' status updated to ${nextStatus}`, currentUser?.id);
    }
    showToast(`Vendor status updated to ${nextStatus}.`);
  };

  // RFQ Functions
  const createRFQ = async (rfqData) => {
    const newRfqId = 200 + rfqs.length + 1;
    const newRfq = {
      id: newRfqId,
      status: 'Active',
      created_by: currentUser?.id || 1,
      created_at: new Date().toISOString(),
      ...rfqData
    };

    const serverResult = await apiFetch('/rfqs', {
      method: 'POST',
      body: JSON.stringify(newRfq)
    });

    const savedRfq = serverResult || newRfq;
    setRfqs(prev => [...prev, savedRfq]);
    logActivity('RFQ Published', 'RFQ', `RFQ #${savedRfq.id}: "${savedRfq.title}" published`, currentUser?.id);
    showToast(`RFQ #${savedRfq.id} created successfully.`);
  };

  // Quotation Submission
  const submitQuotation = async (quotationData) => {
    const newQuotId = 300 + quotations.length + 1;
    const newQuotation = {
      id: newQuotId,
      status: 'Submitted',
      created_at: new Date().toISOString(),
      ...quotationData
    };

    const serverResult = await apiFetch('/quotations', {
      method: 'POST',
      body: JSON.stringify(newQuotation)
    });

    const savedQuotation = serverResult || newQuotation;
    setQuotations(prev => [...prev, savedQuotation]);
    logActivity('Quotation Submitted', 'Quotation', `Quotation #${savedQuotation.id} submitted for RFQ #${savedQuotation.rfq_id}`, currentUser?.id);
    showToast(`Quotation submitted successfully! ID: #${savedQuotation.id}`);
  };

  // Approval Process (Workflow L1/L2)
  const processApproval = async (rfqId, quotationId, step, status, remarks) => {
    const newApprovalId = 400 + approvals.length + 1;
    const newApproval = {
      id: newApprovalId,
      rfq_id: rfqId,
      quotation_id: quotationId,
      step,
      status,
      remarks,
      processed_by: currentUser?.id || 2,
      processed_at: new Date().toISOString()
    };

    const serverResult = await apiFetch('/approvals', {
      method: 'POST',
      body: JSON.stringify(newApproval)
    });

    const savedApproval = serverResult || newApproval;
    setApprovals(prev => [...prev, savedApproval]);

    if (status === 'Rejected') {
      // API endpoints updates (POST/PUT handles this on the backend; fallback updates states below)
      await apiFetch(`/quotations/${quotationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected' })
      });
      await apiFetch(`/rfqs/${rfqId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Active' })
      });

      setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'Rejected' } : q));
      setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Active' } : r));
      logActivity(`${step} Approval Rejected`, 'Approval', `Quotation #${quotationId} rejected. Remarks: "${remarks}"`, currentUser?.id);
      showToast(`Quotation #${quotationId} rejected.`, 'error');
    } else {
      if (step === 'L1') {
        await apiFetch(`/rfqs/${rfqId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'L2 Review' })
        });
        setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'L2 Review' } : r));
        logActivity('L1 Approval Approved', 'Approval', `Quotation #${quotationId} approved at L1 stage.`, currentUser?.id);
        showToast(`L1 approved for Quotation #${quotationId}.`);
      } else if (step === 'L2') {
        // L2 approved -> Triggers generation of PO and Invoice
        await apiFetch(`/quotations/${quotationId}/select`, { method: 'POST' });
        
        setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'Selected' } : q.rfq_id === rfqId ? { ...q, status: 'Rejected' } : q));
        setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Approved' } : r));
        
        logActivity('L2 Approval Approved', 'Approval', `Quotation #${quotationId} approved at L2.`, currentUser?.id);
        
        const quot = quotations.find(q => q.id === quotationId);
        if (quot) {
          const poId = 500 + purchaseOrders.length + 1;
          const poNum = `PO-20260606-${String(poId).slice(-3)}`;
          const newPO = {
            id: poId,
            po_number: poNum,
            rfq_id: rfqId,
            quotation_id: quotationId,
            date: new Date().toISOString().split('T')[0],
            created_by: currentUser?.id || 1,
            created_at: new Date().toISOString()
          };

          await apiFetch('/purchase-orders', {
            method: 'POST',
            body: JSON.stringify(newPO)
          });
          setPurchaseOrders(prev => [...prev, newPO]);
          logActivity('PO Generated', 'PO', `PO #${poNum} created`, currentUser?.id);

          const invId = 600 + invoices.length + 1;
          const invNum = `INV-20260606-${String(invId).slice(-3)}`;
          const newInvoice = {
            id: invId,
            po_id: poId,
            invoice_number: invNum,
            date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: quot.subtotal,
            gst_amount: quot.gst_amount,
            grand_total: quot.grand_total,
            status: 'Pending',
            created_at: new Date().toISOString()
          };

          await apiFetch('/invoices', {
            method: 'POST',
            body: JSON.stringify(newInvoice)
          });
          setInvoices(prev => [...prev, newInvoice]);
          logActivity('Invoice Created', 'Invoice', `Invoice #${invNum} generated`, currentUser?.id);
          showToast(`L2 Approved! PO & Invoice created.`, 'success');
        }
      }
    }
  };

  // Mark invoice as paid
  const payInvoice = async (invoiceId) => {
    const serverResult = await apiFetch(`/invoices/${invoiceId}/pay`, {
      method: 'PUT'
    });

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        logActivity('Invoice Paid', 'Invoice', `Invoice ${inv.invoice_number} paid`, currentUser?.id);
        return { ...inv, status: 'Paid' };
      }
      return inv;
    }));
    showToast('Invoice has been marked as Paid!');
  };

  // Email notification dispatch
  const sendEmail = async (recipient, subject, htmlContent) => {
    const newEmail = {
      id: Date.now(),
      recipient,
      subject,
      html_content: htmlContent,
      created_at: new Date().toISOString()
    };

    const serverResult = await apiFetch('/emails/send', {
      method: 'POST',
      body: JSON.stringify(newEmail)
    });

    const savedEmail = serverResult || newEmail;
    setSentEmails(prev => [savedEmail, ...prev]);
    logActivity('Email Notification Dispatched', 'Invoice', `Email sent to ${recipient}`, currentUser?.id);
    showToast(`Email dispatched to ${recipient}!`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        toast,
        showToast,
        users,
        vendors,
        rfqs,
        quotations,
        approvals,
        purchaseOrders,
        invoices,
        activityLogs,
        sentEmails,
        isLoading,
        login,
        logout,
        registerUser,
        addVendor,
        createRFQ,
        submitQuotation,
        processApproval,
        payInvoice,
        sendEmail,
        updateVendorStatus,
        logActivity
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Seed Mock Data Arrays (available in code when USE_MOCK_DATA is toggled to true)
const MOCK_USERS = [
  { id: 1, first_name: 'Amit', last_name: 'Sharma', email: 'officer@vendorbridge.com', role: 'Officer', country: 'India', phone: '+91 98765 43210' },
  { id: 2, first_name: 'Priya', last_name: 'Shah', email: 'manager@vendorbridge.com', role: 'Manager', country: 'India', phone: '+91 99988 77766' },
  { id: 3, first_name: 'Rajesh', last_name: 'Kumar', email: 'vendor1@infra.com', role: 'Vendor', vendorId: 101, country: 'India', phone: '+91 88877 66655' },
  { id: 4, first_name: 'Sunita', last_name: 'Patel', email: 'admin@vendorbridge.com', role: 'Admin', country: 'India', phone: '+91 77766 55544' },
  { id: 5, first_name: 'Vikram', last_name: 'Singh', email: 'vendor2@techcore.com', role: 'Vendor', vendorId: 102, country: 'India', phone: '+91 91122 33344' }
];

const MOCK_VENDORS = [
  { id: 101, name: 'Infra Supplies Ltd', category: 'Infrastructure', gst_no: '27AAAAA1111A1Z1', contact_no: '+91 88877 66655', email: 'vendor1@infra.com', status: 'Active', rating: 4.8, payment_terms: '30 Days Net' },
  { id: 102, name: 'TechCore IT Solutions', category: 'Technology', gst_no: '27BBBBB2222B2Z2', contact_no: '+91 91122 33344', email: 'vendor2@techcore.com', status: 'Active', rating: 4.5, payment_terms: '15 Days Net' },
  { id: 103, name: 'Office Need Co', category: 'Office Furniture', gst_no: '27CCCCC3333C3Z3', contact_no: '+91 77788 99900', email: 'sales@officeneeds.com', status: 'Active', rating: 4.2, payment_terms: 'Immediate' },
  { id: 104, name: 'EcoPack Solutions', category: 'Packaging', gst_no: '27DDDDD4444D4Z4', contact_no: '+91 66677 88899', email: 'contact@ecopack.com', status: 'Pending', rating: 3.9, payment_terms: '45 Days Net' },
  { id: 105, name: 'LogiLink Logistics', category: 'Services', gst_no: '27EEEEE5555E5Z5', contact_no: '+91 55544 33322', email: 'info@logilink.com', status: 'Blocked', rating: 3.5, payment_terms: 'Advance' }
];

const MOCK_RFQS = [
  {
    id: 201,
    title: 'Ergonomic Seating & Standing Desks',
    description: 'Procurement of ergonomic workspace setups for the new engineering floor. Required high durability.',
    category: 'Office Furniture',
    deadline: '2026-06-20',
    status: 'Active',
    created_by: 1,
    created_at: '2026-06-05T10:00:00Z',
    items: [
      { id: 1, item_name: 'Ergonomic Mesh Chair', quantity: 25, unit: 'Units' },
      { id: 2, item_name: 'Motorized Standing Desk', quantity: 10, unit: 'Units' }
    ],
    assigned_vendors: [101, 102, 103]
  },
  {
    id: 202,
    title: 'Server Rack Upgrade Hardware',
    description: 'Enterprise SSDs and switches to upgrade our core datacenter racks.',
    category: 'Technology',
    deadline: '2026-06-15',
    status: 'Comparison',
    created_by: 1,
    created_at: '2026-06-01T09:00:00Z',
    items: [
      { id: 3, item_name: '2TB NVMe Enterprise SSD', quantity: 15, unit: 'Units' },
      { id: 4, item_name: '24-Port Managed POE Switch', quantity: 3, unit: 'Units' }
    ],
    assigned_vendors: [102]
  }
];

const MOCK_QUOTATIONS = [
  {
    id: 301,
    rfq_id: 202,
    vendor_id: 102,
    gst_percent: 18,
    subtotal: 195000,
    gst_amount: 35100,
    grand_total: 230100,
    delivery_days: 7,
    payment_terms: '15 Days Net',
    status: 'Submitted',
    created_at: '2026-06-03T14:30:00Z',
    items: [
      { id: 10, item_name: '2TB NVMe Enterprise SSD', quantity: 15, unit_price: 11000, total: 165000 },
      { id: 11, item_name: '24-Port Managed POE Switch', quantity: 3, unit_price: 10000, total: 30000 }
    ]
  },
  {
    id: 302,
    rfq_id: 201,
    vendor_id: 101,
    gst_percent: 18,
    subtotal: 215000,
    gst_amount: 38700,
    grand_total: 253700,
    delivery_days: 12,
    payment_terms: '30 Days Net',
    status: 'Submitted',
    created_at: '2026-06-05T16:00:00Z',
    items: [
      { id: 20, item_name: 'Ergonomic Mesh Chair', quantity: 25, unit_price: 5000, total: 125000 },
      { id: 21, item_name: 'Motorized Standing Desk', quantity: 10, unit_price: 9000, total: 90000 }
    ]
  },
  {
    id: 303,
    rfq_id: 201,
    vendor_id: 102,
    gst_percent: 18,
    subtotal: 230000,
    gst_amount: 41400,
    grand_total: 271400,
    delivery_days: 8,
    payment_terms: '15 Days Net',
    status: 'Submitted',
    created_at: '2026-06-05T17:15:00Z',
    items: [
      { id: 22, item_name: 'Ergonomic Mesh Chair', quantity: 25, unit_price: 5500, total: 137500 },
      { id: 23, item_name: 'Motorized Standing Desk', quantity: 10, unit_price: 9250, total: 92500 }
    ]
  },
  {
    id: 304,
    rfq_id: 201,
    vendor_id: 103,
    gst_percent: 18,
    subtotal: 205000,
    gst_amount: 36900,
    grand_total: 241900,
    delivery_days: 15,
    payment_terms: 'Immediate',
    status: 'Submitted',
    created_at: '2026-06-06T09:00:00Z',
    items: [
      { id: 24, item_name: 'Ergonomic Mesh Chair', quantity: 25, unit_price: 4600, total: 115000 },
      { id: 25, item_name: 'Motorized Standing Desk', quantity: 10, unit_price: 9000, total: 90000 }
    ]
  }
];

const MOCK_APPROVALS = [
  {
    id: 401,
    rfq_id: 202,
    quotation_id: 301,
    step: 'L1',
    status: 'Approved',
    remarks: 'Price matches benchmark, vendor rating is excellent.',
    processed_by: 2,
    processed_at: '2026-06-04T11:00:00Z'
  }
];

const MOCK_POS = [
  {
    id: 501,
    po_number: 'PO-20260604-001',
    rfq_id: 202,
    quotation_id: 301,
    created_by: 1,
    created_at: '2026-06-04T12:00:00Z'
  }
];

const MOCK_INVOICES = [
  {
    id: 601,
    po_id: 501,
    invoice_number: 'INV-20260604-001',
    date: '2026-06-04',
    due_date: '2026-06-19',
    subtotal: 195000,
    gst_amount: 35100,
    grand_total: 230100,
    status: 'Pending',
    created_at: '2026-06-04T12:05:00Z'
  }
];

const MOCK_LOGS = [
  { id: 901, user_id: 1, action: 'Quotation selected', category: 'Approval', details: 'Infra supplies pvt ltd selected for office furniture Q2', timestamp: '2025-05-23T21:15:00Z' },
  { id: 902, user_id: 2, action: 'Approval pending', category: 'Approvals', details: 'PO-2024 awaiting L2 approval by priya shah', timestamp: '2025-05-22T09:15:00Z' },
  { id: 903, user_id: 1, action: 'RFQ published', category: 'RFQ', details: 'office furniture Q2 sent to 3 vendors', timestamp: '2025-05-19T10:00:00Z' },
  { id: 904, user_id: 4, action: 'Vendor added', category: 'Vendors', details: 'FastLog transport registered and pending verifications', timestamp: '2025-05-18T15:20:00Z' }
];

const MOCK_EMAILS = [
  {
    id: 701,
    recipient: 'vendor2@techcore.com',
    subject: 'Purchase Order Dispatched: PO-20260604-001',
    html_content: 'Dear TechCore IT Solutions, Please find attached PO-20260604-001 for server hardware.',
    created_at: '2026-06-04T12:01:00Z'
  }
];
