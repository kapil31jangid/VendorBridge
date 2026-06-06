export const seedData = {
  users: [
    { id: 1, first_name: "Amit", last_name: "Sharma", email: "officer@vendorbridge.com", password: "password123", role: "Officer", country: "India", phone: "+91 98765 43210" },
    { id: 2, first_name: "Priya", last_name: "Shah", email: "manager@vendorbridge.com", password: "password123", role: "Manager", country: "India", phone: "+91 99988 77766" },
    { id: 3, first_name: "Rajesh", last_name: "Kumar", email: "vendor1@infra.com", password: "password123", role: "Vendor", vendorId: 101, country: "India", phone: "+91 88877 66655" },
    { id: 4, first_name: "Sunita", last_name: "Patel", email: "admin@vendorbridge.com", password: "password123", role: "Admin", country: "India", phone: "+91 77766 55544" },
    { id: 5, first_name: "Vikram", last_name: "Singh", email: "vendor2@techcore.com", password: "password123", role: "Vendor", vendorId: 102, country: "India", phone: "+91 91122 33344" }
  ],
  vendors: [
    { id: 101, name: "Infra Supplies Ltd", category: "Infrastructure", gst_no: "27AAAAA1111A1Z1", contact_no: "+91 88877 66655", email: "vendor1@infra.com", status: "Active", rating: 4.8, payment_terms: "30 Days Net" },
    { id: 102, name: "TechCore IT Solutions", category: "Technology", gst_no: "27BBBBB2222B2Z2", contact_no: "+91 91122 33344", email: "vendor2@techcore.com", status: "Active", rating: 4.5, payment_terms: "15 Days Net" },
    { id: 103, name: "Office Need Co", category: "Office Furniture", gst_no: "27CCCCC3333C3Z3", contact_no: "+91 77788 99900", email: "sales@officeneeds.com", status: "Active", rating: 4.2, payment_terms: "Immediate" },
    { id: 104, name: "EcoPack Solutions", category: "Packaging", gst_no: "27DDDDD4444D4Z4", contact_no: "+91 66677 88899", email: "contact@ecopack.com", status: "Pending", rating: 3.9, payment_terms: "45 Days Net" },
    { id: 105, name: "LogiLink Logistics", category: "Services", gst_no: "27EEEEE5555E5Z5", contact_no: "+91 55544 33322", email: "info@logilink.com", status: "Blocked", rating: 3.5, payment_terms: "Advance" }
  ],
  rfqs: [
    {
      id: 201,
      title: "Ergonomic Seating & Standing Desks",
      description: "Procurement of ergonomic workspace setups for the new engineering floor. Required high durability.",
      category: "Office Furniture",
      deadline: "2026-06-20",
      status: "Active",
      created_by: 1,
      created_at: "2026-06-05T10:00:00Z",
      items: [
        { id: 1, item_name: "Ergonomic Mesh Chair", quantity: 25, unit: "Units" },
        { id: 2, item_name: "Motorized Standing Desk", quantity: 10, unit: "Units" }
      ],
      assigned_vendors: [101, 102, 103]
    },
    {
      id: 202,
      title: "Server Rack Upgrade Hardware",
      description: "Enterprise SSDs and switches to upgrade our core datacenter racks.",
      category: "Technology",
      deadline: "2026-06-15",
      status: "Comparison",
      created_by: 1,
      created_at: "2026-06-01T09:00:00Z",
      items: [
        { id: 3, item_name: "2TB NVMe Enterprise SSD", quantity: 15, unit: "Units" },
        { id: 4, item_name: "24-Port Managed POE Switch", quantity: 3, unit: "Units" }
      ],
      assigned_vendors: [102]
    }
  ],
  quotations: [
    {
      id: 301,
      rfq_id: 202,
      vendor_id: 102,
      gst_percent: 18,
      subtotal: 195000,
      gst_amount: 35100,
      grand_total: 230100,
      delivery_days: 7,
      payment_terms: "15 Days Net",
      status: "Submitted",
      created_at: "2026-06-03T14:30:00Z",
      items: [
        { id: 10, item_name: "2TB NVMe Enterprise SSD", quantity: 15, unit_price: 11000, total: 165000 },
        { id: 11, item_name: "24-Port Managed POE Switch", quantity: 3, unit_price: 10000, total: 30000 }
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
      payment_terms: "30 Days Net",
      status: "Submitted",
      created_at: "2026-06-05T16:00:00Z",
      items: [
        { id: 20, item_name: "Ergonomic Mesh Chair", quantity: 25, unit_price: 5000, total: 125000 },
        { id: 21, item_name: "Motorized Standing Desk", quantity: 10, unit_price: 9000, total: 90000 }
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
      payment_terms: "15 Days Net",
      status: "Submitted",
      created_at: "2026-06-05T17:15:00Z",
      items: [
        { id: 22, item_name: "Ergonomic Mesh Chair", quantity: 25, unit_price: 5500, total: 137500 },
        { id: 23, item_name: "Motorized Standing Desk", quantity: 10, unit_price: 9250, total: 92500 }
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
      payment_terms: "Immediate",
      status: "Submitted",
      created_at: "2026-06-06T09:00:00Z",
      items: [
        { id: 24, item_name: "Ergonomic Mesh Chair", quantity: 25, unit_price: 4600, total: 115000 },
        { id: 25, item_name: "Motorized Standing Desk", quantity: 10, unit_price: 9000, total: 90000 }
      ]
    }
  ],
  approvals: [
    {
      id: 401,
      rfq_id: 202,
      quotation_id: 301,
      step: "L1",
      status: "Approved",
      remarks: "Price matches benchmark, vendor rating is excellent.",
      processed_by: 2,
      processed_at: "2026-06-04T11:00:00Z"
    }
  ],
  purchaseOrders: [
    {
      id: 501,
      po_number: "PO-20260604-001",
      rfq_id: 202,
      quotation_id: 301,
      date: "2026-06-04",
      created_by: 1,
      created_at: "2026-06-04T12:00:00Z"
    }
  ],
  invoices: [
    {
      id: 601,
      po_id: 501,
      invoice_number: "INV-20260604-001",
      date: "2026-06-04",
      due_date: "2026-06-19",
      subtotal: 195000,
      gst_amount: 35100,
      grand_total: 230100,
      status: "Pending",
      created_at: "2026-06-04T12:05:00Z"
    }
  ],
  activityLogs: [
    { id: 901, user_id: 1, action: "Quotation selected", category: "Approval", details: "Infra supplies pvt ltd selected for office furniture Q2", timestamp: "2025-05-23T21:15:00Z" },
    { id: 902, user_id: 2, action: "Approval pending", category: "Approvals", details: "PO-2024 awaiting L2 approval by priya shah", timestamp: "2025-05-22T09:15:00Z" },
    { id: 903, user_id: 1, action: "RFQ published", category: "RFQ", details: "office furniture Q2 sent to 3 vendors", timestamp: "2025-05-19T10:00:00Z" },
    { id: 904, user_id: 4, action: "Vendor added", category: "Vendors", details: "FastLog transport registered and pending verifications", timestamp: "2025-05-18T15:20:00Z" }
  ],
  emails: [
    {
      id: 701,
      recipient: "vendor2@techcore.com",
      subject: "Purchase Order Dispatched: PO-20260604-001",
      html_content: "Dear TechCore IT Solutions, Please find attached PO-20260604-001 for server hardware.",
      status: "Sent",
      created_at: "2026-06-04T12:01:00Z"
    }
  ]
};
