import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ClipboardCheck, FileText, CheckCircle2, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';

const ApprovalPage = () => {
  const { 
    rfqs, 
    quotations, 
    vendors, 
    approvals, 
    processApproval, 
    currentUser, 
    users 
  } = useContext(AppContext);

  const [activeRfqId, setActiveRfqId] = useState(null);
  const [activeQuotationId, setActiveQuotationId] = useState(null);
  const [remarks, setRemarks] = useState('');

  // Load from global window variable if set by comparison page
  useEffect(() => {
    if (window.selectedRfqForApproval && window.selectedQuotationForApproval) {
      setActiveRfqId(window.selectedRfqForApproval);
      setActiveQuotationId(window.selectedQuotationForApproval);
      
      // Clean up globals
      delete window.selectedRfqForApproval;
      delete window.selectedQuotationForApproval;
    }
  }, []);

  const rfq = rfqs.find(r => r.id === activeRfqId);
  const quotation = quotations.find(q => q.id === activeQuotationId);
  const vendor = quotation ? vendors.find(v => v.id === quotation.vendor_id) : null;

  // Find L1 approval for this quotation (if exists)
  const l1Approval = approvals.find(a => a.quotation_id === activeQuotationId && a.step === 'L1');
  const currentStep = l1Approval ? 'L2' : 'L1';

  // Fetch queue of quotations currently awaiting L1 or L2 review
  // Officer can review L1. Managers can approve L2.
  const approvalQueue = quotations.filter(q => q.status === 'Submitted');

  const getVendorName = (vendorId) => {
    const v = vendors.find(vend => vend.id === vendorId);
    return v ? v.name : 'Unknown Vendor';
  };

  const getRfqTitle = (rfqId) => {
    const r = rfqs.find(item => item.id === rfqId);
    return r ? r.title : 'Unknown RFQ';
  };

  const getUserName = (userId) => {
    const u = users.find(item => item.id === userId);
    return u ? `${u.first_name} ${u.last_name}` : 'System Reviewer';
  };

  const handleAction = (status) => {
    if (!activeRfqId || !activeQuotationId) return;
    
    processApproval(activeRfqId, activeQuotationId, currentStep, status, remarks);
    
    // Clear and return to queue
    setRemarks('');
    setActiveRfqId(null);
    setActiveQuotationId(null);
  };

  return (
    <div style={wrapperStyle}>
      {/* 1. VIEW ACTIVE APPROVAL FLOW */}
      {rfq && quotation && vendor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div style={activeHeaderStyle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Approval Workflow</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
              RFQ: {rfq.title.toLowerCase()} - Vendor: {vendor.name} - {quotation.grand_total.toLocaleString()}
            </p>
          </div>

          {/* Workflow Progress Timeline */}
          <div className="card">
            <h3 style={sectionTitleStyle}>Workflow Status Tracker</h3>
            <div style={timelineContainerStyle}>
              {[
                { label: '1. Submitted', completed: true, active: false },
                { label: '2. L1 Review', completed: !!l1Approval, active: currentStep === 'L1' },
                { label: '3. L2 Approval', completed: false, active: currentStep === 'L2' },
                { label: '4. Generate PO', completed: false, active: false }
              ].map((s, idx) => (
                <div key={idx} style={timelineStepStyle}>
                  <div style={timelineCircleStyle(s.completed, s.active)}>
                    {s.completed ? '✓' : idx + 1}
                  </div>
                  <span style={timelineLabelStyle(s.completed || s.active)}>{s.label}</span>
                  {idx < 3 && <div style={timelineConnectorStyle(s.completed)} />}
                </div>
              ))}
            </div>
          </div>

          {/* Details Layout Grid */}
          <div style={splitGridStyle}>
            
            {/* Left Panel: Approval Chain Log & Actions */}
            <div style={leftPanelStyle}>
              {/* Historical Logs */}
              <div style={{ flex: 1 }}>
                <h3 style={sectionTitleStyle}>APPROVAL CHAIN</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  
                  {/* System Log */}
                  <div style={logRowStyle}>
                    <div style={logIconStyle(true)}>✓</div>
                    <div>
                      <p style={logUserStyle}>System Dispatcher</p>
                      <p style={logActionStyle}>RFQ Published</p>
                      <p style={logDateStyle}>{new Date(rfq.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* L1 Log */}
                  {l1Approval ? (
                    <div style={logRowStyle}>
                      <div style={logIconStyle(true)}>✓</div>
                      <div>
                        <p style={logUserStyle}>{getUserName(l1Approval.processed_by)} (Procurement head)</p>
                        <p style={logActionStyle}>Approved on {new Date(l1Approval.processed_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={logRowStyle}>
                      <div style={logIconStyle(false, true)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div>
                        <p style={logUserStyle}>Rahul Mehta (Procurement head)</p>
                        <p style={logActionStyle}>Awaiting</p>
                        <p style={logDateStyle}>Assigned {new Date(rfq.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {/* L2 Log */}
                  <div style={logRowStyle}>
                    <div style={logIconStyle(false, l1Approval)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div>
                      <p style={logUserStyle}>Priya Shah (finance manager)</p>
                      <p style={logActionStyle}>Awaiting</p>
                      <p style={logDateStyle}>Assigned {new Date(rfq.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls Panel */}
              <div style={{ marginTop: '2rem' }}>
                <p style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>Approval Remarks</p>
                {((currentStep === 'L1' && currentUser.role === 'Officer') || 
                  (currentStep === 'L2' && currentUser.role === 'Manager') ||
                  (currentUser.role === 'Admin')) ? (
                  <div>
                    <textarea 
                      className="form-control" 
                      placeholder="Add your comments or conditions...."
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      rows={4}
                      style={{backgroundColor: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', width: '100%', borderRadius: 'var(--radius-md)', padding: '1rem', resize: 'none'}}
                    />
                  </div>
                ) : (
                  <div style={warningBoxStyle}>
                    <AlertCircle size={16} color="var(--color-warning)" />
                    <span>
                      Unauthorized. Awaiting review from: 
                      <strong> {currentStep === 'L1' ? 'Procurement Officer' : 'Manager / Approver'}</strong>.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Quotation Details Card */}
            <div style={rightPanelStyle}>
              <div style={{ height: '100%' }}>
                <h3 style={sectionTitleStyle}>QUOTATIONS SUMMARY</h3>
                
                <div style={summaryBoxStyle}>
                  <div style={summaryRowStyle}>
                    <span>Vendor:</span>
                    <span>{vendor.name}</span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span>Total:</span>
                    <span>{quotation.grand_total.toLocaleString()}</span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span>Delivery:</span>
                    <span>{quotation.delivery_days} days</span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span>Rating:</span>
                    <span>{vendor.rating}/5</span>
                  </div>
                </div>

                {((currentStep === 'L1' && currentUser.role === 'Officer') || 
                  (currentStep === 'L2' && currentUser.role === 'Manager') ||
                  (currentUser.role === 'Admin')) && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button className="btn btn-outline" style={bottomButtonStyle} onClick={() => handleAction('Approved')}>
                      Approve
                    </button>
                    <button className="btn btn-outline" style={bottomButtonStyle} onClick={() => handleAction('Rejected')}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* 2. VIEW APPROVAL QUEUE LIST */
        <div>
          <div style={headerStyle}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Procurement Approvals Queue</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Monitor and authorize pending procurement requests.</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem', padding: 0 }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>RFQ Description</th>
                    <th>Submitting Vendor</th>
                    <th>Grand Total</th>
                    <th>Active Stage</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalQueue.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3.5rem' }}>
                        <ClipboardCheck size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No procurement requests are awaiting approval. Queue empty.</p>
                      </td>
                    </tr>
                  ) : (
                    approvalQueue.map(q => {
                      const associatedL1 = approvals.find(a => a.quotation_id === q.id && a.step === 'L1');
                      const activeStage = associatedL1 ? 'L2 Review' : 'L1 Review';
                      
                      return (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 600 }}>{getRfqTitle(q.rfq_id)}</td>
                          <td>{getVendorName(q.vendor_id)}</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${q.grand_total.toLocaleString()}</td>
                          <td>
                            <span className="badge badge-info">{activeStage}</span>
                          </td>
                          <td>
                            <span className="badge badge-warning">Awaiting Decision</span>
                          </td>
                          <td>
                            <button 
                              onClick={() => {
                                setActiveRfqId(q.rfq_id);
                                setActiveQuotationId(q.id);
                              }}
                              className="btn btn-teal btn-sm"
                            >
                              <span>Review Bid</span>
                              <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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

const activeHeaderStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '1.5rem'
};

const sectionTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-secondary)',
  marginBottom: '1rem'
};

const timelineContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 0'
};

const timelineStepStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: 1,
  position: 'relative'
};

const timelineCircleStyle = (isPassed, isActive) => ({
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  backgroundColor: isPassed ? 'var(--primary)' : 'var(--bg-tertiary)',
  border: isActive ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  color: isPassed ? '#fff' : 'var(--text-muted)'
});

const timelineLabelStyle = (isActive) => ({
  fontSize: '0.8rem',
  fontWeight: isActive ? '700' : '500',
  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
});

const timelineConnectorStyle = (isPassed) => ({
  flex: 1,
  height: '2px',
  backgroundColor: isPassed ? 'var(--primary)' : 'var(--border-color)',
  margin: '0 0.5rem'
});

const splitGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.25fr 1fr',
  gap: '1.5rem'
};

const leftPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const rightPanelStyle = {};

const logRowStyle = {
  display: 'flex',
  gap: '1rem',
  position: 'relative'
};

const logIconStyle = (isPassed, isActive) => ({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
  border: isPassed ? '1px solid var(--color-success)' : isActive ? '1px solid var(--color-warning)' : '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  color: isPassed ? 'var(--color-success)' : isActive ? 'var(--color-warning)' : 'var(--text-muted)',
  flexShrink: 0
});

const logUserStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-primary)'
};

const logActionStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  marginTop: '0.15rem'
};

const logDateStyle = {
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  marginTop: '0.25rem'
};

const remarksBubbleStyle = {
  display: 'flex',
  gap: '0.35rem',
  backgroundColor: 'var(--bg-primary)',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.75rem',
  fontStyle: 'italic',
  color: 'var(--text-secondary)',
  marginTop: '0.4rem',
  border: '1px solid var(--border-color)'
};

const warningBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: 'rgba(245, 158, 11, 0.05)',
  border: '1px solid rgba(245, 158, 11, 0.15)',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8rem',
  color: 'var(--color-warning)',
  marginTop: '1rem'
};

const summaryBoxStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem'
};

const bottomButtonStyle = {
  border: '1px solid var(--text-primary)',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  padding: '0.5rem 2rem',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer',
  minWidth: '120px'
};

export default ApprovalPage;
