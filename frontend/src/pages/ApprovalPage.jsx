import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ClipboardCheck, AlertCircle, ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';

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

  useEffect(() => {
    if (window.selectedRfqForApproval && window.selectedQuotationForApproval) {
      setActiveRfqId(window.selectedRfqForApproval);
      setActiveQuotationId(window.selectedQuotationForApproval);
      delete window.selectedRfqForApproval;
      delete window.selectedQuotationForApproval;
    }
  }, []);

  const rfq = rfqs.find(r => r.id === activeRfqId);
  const quotation = quotations.find(q => q.id === activeQuotationId);
  const vendor = quotation ? vendors.find(v => v.id === quotation.vendor_id) : null;

  const l1Approval = approvals.find(a => a.quotation_id === activeQuotationId && a.step === 'L1');
  const currentStep = l1Approval ? 'L2' : 'L1';

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
    setRemarks('');
    setActiveRfqId(null);
    setActiveQuotationId(null);
  };

  const canApproveCurrentStep =
    (currentStep === 'L1' && currentUser.role === 'Officer') ||
    (currentStep === 'L2' && currentUser.role === 'Manager') ||
    currentUser.role === 'Admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. ACTIVE APPROVAL WORKFLOW VIEW */}
      {rfq && quotation && vendor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div className="page-header">
            <div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ paddingLeft: 0, marginBottom: '0.35rem', height: 'auto' }}
                onClick={() => {
                  setActiveRfqId(null);
                  setActiveQuotationId(null);
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to Approvals Queue</span>
              </button>
              <h1 className="page-title">Approval Workflow</h1>
              <p className="page-subtitle">
                RFQ: {rfq.title} · Vendor: {vendor.name} ·{' '}
                <strong className="tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  ${quotation.grand_total.toLocaleString()}
                </strong>
              </p>
            </div>
            <span className="badge badge-info">{currentStep} Review Pending</span>
          </div>

          {/* Workflow Progress Timeline */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div className="section-eyebrow" style={{ marginBottom: '0.875rem' }}>Workflow Status Tracker</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: '1. Submitted', completed: true, active: false },
                { label: '2. L1 Review', completed: !!l1Approval, active: currentStep === 'L1' },
                { label: '3. L2 Approval', completed: false, active: currentStep === 'L2' },
                { label: '4. Generate PO', completed: false, active: false }
              ].map((s, idx) => (
                <React.Fragment key={s.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      className="tabular-nums"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: s.completed ? 'var(--color-success)' : s.active ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: s.completed || s.active ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.725rem',
                        fontWeight: 600
                      }}
                    >
                      {s.completed ? <Check size={13} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: s.completed || s.active ? 600 : 500, color: s.completed || s.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div style={{ flex: 1, minWidth: '24px', height: '1.5px', backgroundColor: s.completed ? 'var(--color-success-border)' : 'var(--border-color)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Two-Column Approval Split */}
          <div className="approval-split">
            {/* Left Panel: Approval Chain & Remarks */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 className="section-eyebrow" style={{ marginBottom: '1rem' }}>Approval Chain</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* System Log */}
                  <div style={logRowStyle}>
                    <div style={logIconStyle('done')}><Check size={12} /></div>
                    <div>
                      <div style={logUserStyle}>System Dispatcher</div>
                      <div style={logActionStyle}>RFQ Published</div>
                      <div className="tabular-nums" style={logDateStyle}>{new Date(rfq.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* L1 Log */}
                  {l1Approval ? (
                    <div style={logRowStyle}>
                      <div style={logIconStyle('done')}><Check size={12} /></div>
                      <div>
                        <div style={logUserStyle}>{getUserName(l1Approval.processed_by)} (Procurement Head)</div>
                        <div style={logActionStyle}>Approved at L1 stage</div>
                        <div className="tabular-nums" style={logDateStyle}>{new Date(l1Approval.processed_at).toLocaleString()}</div>
                        {l1Approval.remarks && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.78125rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.45rem 0.65rem' }}>
                            &ldquo;{l1Approval.remarks}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={logRowStyle}>
                      <div style={logIconStyle('pending')}><Clock size={12} /></div>
                      <div>
                        <div style={logUserStyle}>Procurement Officer (L1)</div>
                        <div style={logActionStyle}>Awaiting L1 review</div>
                        <div className="tabular-nums" style={logDateStyle}>Assigned {new Date(rfq.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}

                  {/* L2 Log */}
                  <div style={logRowStyle}>
                    <div style={logIconStyle(l1Approval ? 'pending' : 'idle')}><Clock size={12} /></div>
                    <div>
                      <div style={logUserStyle}>Finance Manager (L2)</div>
                      <div style={logActionStyle}>{l1Approval ? 'Awaiting L2 authorization' : 'Pending L1 completion'}</div>
                      <div className="tabular-nums" style={logDateStyle}>Assigned {new Date(rfq.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <label htmlFor="approval-remarks" className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Approval Remarks
                </label>
                {canApproveCurrentStep ? (
                  <textarea
                    id="approval-remarks"
                    className="form-control"
                    placeholder="Add review notes, pricing justification, or approval conditions..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    rows={4}
                  />
                ) : (
                  <div style={warningBoxStyle}>
                    <AlertCircle size={16} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                    <span>
                      Awaiting authorization from:{' '}
                      <strong>{currentStep === 'L1' ? 'Procurement Officer' : 'Manager / Approver'}</strong>.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Quotation Summary & Actions */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem', height: 'fit-content' }}>
              <div>
                <h2 className="section-eyebrow" style={{ marginBottom: '1rem' }}>Quotation Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={summaryRowStyle}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vendor</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span className="tabular-nums" style={{ fontWeight: 500 }}>${quotation.subtotal.toLocaleString()}</span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span style={{ color: 'var(--text-secondary)' }}>GST ({quotation.gst_percent}%)</span>
                    <span className="tabular-nums" style={{ fontWeight: 500 }}>${quotation.gst_amount.toLocaleString()}</span>
                  </div>
                  <div style={{ ...summaryRowStyle, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Grand Total</span>
                    <span className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${quotation.grand_total.toLocaleString()}
                    </span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span style={{ color: 'var(--text-secondary)' }}>Delivery Target</span>
                    <span className="tabular-nums" style={{ fontWeight: 500 }}>{quotation.delivery_days} days</span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span style={{ color: 'var(--text-secondary)' }}>Payment Terms</span>
                    <span style={{ fontWeight: 500 }}>{quotation.payment_terms}</span>
                  </div>
                  <div style={summaryRowStyle}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vendor Rating</span>
                    <span className="tabular-nums" style={{ fontWeight: 500 }}>{Number(vendor.rating || 0).toFixed(1)} / 5.0</span>
                  </div>
                </div>
              </div>

              {canApproveCurrentStep && (
                <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-teal"
                    style={{ flex: 1 }}
                    onClick={() => handleAction('Approved')}
                  >
                    Approve ({currentStep})
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline"
                    style={{ flex: 1 }}
                    onClick={() => handleAction('Rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 2. APPROVAL QUEUE LIST */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Approvals Queue</h1>
              <p className="page-subtitle">Monitor and authorize pending L1 and L2 procurement requests</p>
            </div>
          </div>

          <div className="card-flush">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>RFQ Description</th>
                    <th>Submitting Vendor</th>
                    <th style={{ textAlign: 'right' }}>Grand Total</th>
                    <th>Active Stage</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalQueue.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <ClipboardCheck size={28} color="var(--text-muted)" />
                          <div className="empty-state-title">Approval queue is empty</div>
                          <div className="empty-state-desc">No procurement requests are currently awaiting review.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    approvalQueue.map(q => {
                      const associatedL1 = approvals.find(a => a.quotation_id === q.id && a.step === 'L1');
                      const activeStage = associatedL1 ? 'L2 Review' : 'L1 Review';

                      return (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 500 }}>{getRfqTitle(q.rfq_id)}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{getVendorName(q.vendor_id)}</td>
                          <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                            ${q.grand_total.toLocaleString()}
                          </td>
                          <td>
                            <span className="badge badge-info">{activeStage}</span>
                          </td>
                          <td>
                            <span className="badge badge-warning">Awaiting Decision</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRfqId(q.rfq_id);
                                setActiveQuotationId(q.id);
                              }}
                              className="btn btn-primary btn-sm"
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

const logRowStyle = {
  display: 'flex',
  gap: '0.875rem',
  alignItems: 'flex-start'
};

const logIconStyle = (state) => ({
  width: '24px',
  height: '24px',
  borderRadius: 'var(--radius-full)',
  backgroundColor:
    state === 'done' ? 'var(--color-success-bg)' :
    state === 'pending' ? 'var(--color-warning-bg)' : 'var(--bg-tertiary)',
  border: `1px solid ${
    state === 'done' ? 'var(--color-success-border)' :
    state === 'pending' ? 'var(--color-warning-border)' : 'var(--border-color)'
  }`,
  color:
    state === 'done' ? 'var(--color-success)' :
    state === 'pending' ? 'var(--color-warning)' : 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: '1px'
});

const logUserStyle = {
  fontSize: '0.84375rem',
  fontWeight: 600,
  color: 'var(--text-primary)'
};

const logActionStyle = {
  fontSize: '0.8125rem',
  color: 'var(--text-secondary)',
  marginTop: '0.1rem'
};

const logDateStyle = {
  fontSize: '0.725rem',
  color: 'var(--text-muted)',
  marginTop: '0.15rem'
};

const warningBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  backgroundColor: 'var(--color-warning-bg)',
  border: '1px solid var(--color-warning-border)',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8125rem',
  color: 'var(--color-warning)'
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.84375rem'
};

export default ApprovalPage;
