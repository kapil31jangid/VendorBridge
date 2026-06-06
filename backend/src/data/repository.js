import bcrypt from "bcryptjs";
import { isPostgresMode } from "../config/env.js";
import { query, withTransaction } from "../db/pool.js";
import { ensureDb, nextId, readDb, sanitizeUser, updateDb } from "../store.js";

const collectionMap = {
  users: "users",
  vendors: "vendors",
  rfqs: "rfqs",
  quotations: "quotations",
  approvals: "approvals",
  "purchase-orders": "purchaseOrders",
  invoices: "invoices",
  "activity-logs": "activityLogs",
  emails: "emails"
};

const tableMap = {
  users: "users",
  vendors: "vendors",
  approvals: "approvals",
  "purchase-orders": "purchase_orders",
  invoices: "invoices",
  "activity-logs": "activity_logs",
  emails: "sent_emails"
};

function toNumber(value) {
  if (value === null || value === undefined) return value;
  const number = Number(value);
  return Number.isNaN(number) ? value : number;
}

function normalizeMoney(row) {
  return {
    ...row,
    gst_percent: toNumber(row.gst_percent),
    subtotal: toNumber(row.subtotal),
    gst_amount: toNumber(row.gst_amount),
    grand_total: toNumber(row.grand_total),
    rating: toNumber(row.rating)
  };
}

function sortByNewest(rows, field) {
  return [...rows].sort((a, b) => new Date(b[field]) - new Date(a[field]));
}

async function jsonListResource(name) {
  const db = await readDb();
  const collection = db[collectionMap[name]];

  if (name === "users") return collection.map(sanitizeUser);
  if (name === "activity-logs") return sortByNewest(collection, "timestamp");
  if (name === "emails") return sortByNewest(collection, "created_at");

  return collection;
}

async function postgresListRfqs() {
  const rfqs = (await query("SELECT * FROM rfqs ORDER BY id")).rows;
  const items = (await query("SELECT * FROM rfq_items ORDER BY id")).rows;
  const vendors = (await query("SELECT * FROM rfq_vendors ORDER BY rfq_id, vendor_id")).rows;

  return rfqs.map((rfq) => ({
    ...rfq,
    items: items
      .filter((item) => item.rfq_id === rfq.id)
      .map((item) => ({ ...item, quantity: toNumber(item.quantity) })),
    assigned_vendors: vendors
      .filter((vendor) => vendor.rfq_id === rfq.id)
      .map((vendor) => vendor.vendor_id)
  }));
}

async function postgresListQuotations() {
  const quotations = (await query("SELECT * FROM quotations ORDER BY id")).rows;
  const items = (await query("SELECT * FROM quotation_items ORDER BY id")).rows;

  return quotations.map((quotation) => ({
    ...normalizeMoney(quotation),
    items: items
      .filter((item) => item.quotation_id === quotation.id)
      .map((item) => ({
        ...item,
        quantity: toNumber(item.quantity),
        unit_price: toNumber(item.unit_price),
        total: toNumber(item.total)
      }))
  }));
}

async function postgresListResource(name) {
  if (name === "rfqs") return postgresListRfqs();
  if (name === "quotations") return postgresListQuotations();

  if (name === "users") {
    const users = (await query("SELECT * FROM users ORDER BY id")).rows;
    return users.map(sanitizeUser);
  }

  if (name === "purchase-orders") {
    return (await query("SELECT *, created_at::date AS date FROM purchase_orders ORDER BY id")).rows;
  }

  if (name === "activity-logs") {
    return (await query("SELECT * FROM activity_logs ORDER BY timestamp DESC")).rows;
  }

  if (name === "emails") {
    return (await query("SELECT *, 'Sent' AS status FROM sent_emails ORDER BY created_at DESC")).rows;
  }

  const tableName = tableMap[name];
  const rows = (await query(`SELECT * FROM ${tableName} ORDER BY id`)).rows;
  return rows.map(normalizeMoney);
}

export async function ensureRepository() {
  if (isPostgresMode()) {
    await query("SELECT 1");
    return;
  }

  await ensureDb();
}

export async function getProviderName() {
  return isPostgresMode() ? "postgres" : "json";
}

export async function listResource(name) {
  return isPostgresMode() ? postgresListResource(name) : jsonListResource(name);
}

export async function findUserByEmail(email) {
  if (isPostgresMode()) {
    const { rows } = await query("SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1", [email]);
    return rows[0] || null;
  }

  const db = await readDb();
  return db.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
}

export async function findUserById(id) {
  if (isPostgresMode()) {
    const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] || null;
  }

  const db = await readDb();
  return db.users.find((user) => Number(user.id) === Number(id)) || null;
}

export async function createUser(payload) {
  const password = payload.password || "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  if (isPostgresMode()) {
    return withTransaction(async (client) => {
      const existing = await client.query("SELECT id FROM users WHERE lower(email) = lower($1)", [payload.email]);
      if (existing.rows.length > 0) {
        const error = new Error("A user with this email already exists.");
        error.status = 409;
        throw error;
      }

      const { rows } = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, country, additional_info)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          payload.first_name,
          payload.last_name || "",
          payload.email,
          passwordHash,
          payload.phone || "",
          payload.role,
          payload.country || "India",
          payload.additional_info || null
        ]
      );

      const createdUser = rows[0];

      if (createdUser.role === "Vendor") {
        await client.query(
          `INSERT INTO vendors (user_id, name, category, gst_no, contact_no, email, status, rating, payment_terms)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            createdUser.id,
            `${createdUser.first_name} ${createdUser.last_name} Enterprises`,
            "Services",
            `27XXXXX${String(createdUser.id).slice(-4)}1Z1`,
            createdUser.phone || "",
            createdUser.email,
            "Pending",
            4,
            "30 Days Net"
          ]
        );
      }

      return createdUser;
    });
  }

  let createdUser;
  await updateDb((db) => {
    const exists = db.users.some((user) => user.email.toLowerCase() === String(payload.email).toLowerCase());
    if (exists) {
      const error = new Error("A user with this email already exists.");
      error.status = 409;
      throw error;
    }

    createdUser = {
      id: nextId(db.users, 1),
      first_name: payload.first_name,
      last_name: payload.last_name || "",
      email: payload.email,
      password,
      password_hash: passwordHash,
      phone: payload.phone || "",
      role: payload.role,
      country: payload.country || "India",
      additional_info: payload.additional_info || ""
    };

    db.users.push(createdUser);

    if (createdUser.role === "Vendor") {
      db.vendors.push({
        id: nextId(db.vendors, 101),
        user_id: createdUser.id,
        name: `${createdUser.first_name} ${createdUser.last_name} Enterprises`,
        category: "Services",
        gst_no: `27XXXXX${String(createdUser.id).slice(-4)}1Z1`,
        contact_no: createdUser.phone || "",
        email: createdUser.email,
        status: "Pending",
        rating: 4,
        payment_terms: "30 Days Net"
      });
    }

    return db;
  });

  return createdUser;
}

async function postgresGetRfq(id) {
  const rfqs = await postgresListRfqs();
  return rfqs.find((rfq) => Number(rfq.id) === Number(id));
}

async function postgresGetQuotation(id) {
  const quotations = await postgresListQuotations();
  return quotations.find((quotation) => Number(quotation.id) === Number(id));
}

async function postgresCreateRfq(payload) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO rfqs (title, description, category, deadline, status, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, CURRENT_TIMESTAMP))
       RETURNING *`,
      [payload.title, payload.description || "", payload.category || "", payload.deadline || null, payload.status || "Draft", payload.created_by || null, payload.created_at || null]
    );

    const rfq = rows[0];

    for (const item of payload.items || []) {
      await client.query(
        `INSERT INTO rfq_items (rfq_id, item_name, quantity, unit)
         VALUES ($1,$2,$3,$4)`,
        [rfq.id, item.item_name, item.quantity, item.unit || ""]
      );
    }

    for (const vendorId of payload.assigned_vendors || []) {
      await client.query(
        `INSERT INTO rfq_vendors (rfq_id, vendor_id)
         VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [rfq.id, vendorId]
      );
    }

    return {
      ...rfq,
      items: payload.items || [],
      assigned_vendors: payload.assigned_vendors || []
    };
  });
}

async function postgresCreateQuotation(payload) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO quotations (rfq_id, vendor_id, gst_percent, subtotal, gst_amount, grand_total, delivery_days, payment_terms, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10, CURRENT_TIMESTAMP))
       RETURNING *`,
      [
        payload.rfq_id,
        payload.vendor_id,
        payload.gst_percent ?? 18,
        payload.subtotal || 0,
        payload.gst_amount || 0,
        payload.grand_total || 0,
        payload.delivery_days || 0,
        payload.payment_terms || "",
        payload.status || "Submitted",
        payload.created_at || null
      ]
    );

    const quotation = rows[0];

    for (const item of payload.items || []) {
      await client.query(
        `INSERT INTO quotation_items (quotation_id, item_name, quantity, unit_price, total)
         VALUES ($1,$2,$3,$4,$5)`,
        [quotation.id, item.item_name, item.quantity, item.unit_price, item.total]
      );
    }

    return {
      ...normalizeMoney(quotation),
      items: payload.items || []
    };
  });
}

async function postgresCreateGeneric(name, payload) {
  if (name === "users") return sanitizeUser(await createUser(payload));
  if (name === "rfqs") return postgresCreateRfq(payload);
  if (name === "quotations") return postgresCreateQuotation(payload);

  if (name === "vendors") {
    const { rows } = await query(
      `INSERT INTO vendors (user_id, name, category, gst_no, contact_no, email, status, rating, payment_terms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [payload.user_id || null, payload.name, payload.category || "", payload.gst_no || "", payload.contact_no || "", payload.email || "", payload.status || "Pending", payload.rating || 4, payload.payment_terms || ""]
    );
    return normalizeMoney(rows[0]);
  }

  if (name === "approvals") {
    const { rows } = await query(
      `INSERT INTO approvals (rfq_id, quotation_id, step, status, remarks, processed_by, processed_at)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, CURRENT_TIMESTAMP))
       RETURNING *`,
      [payload.rfq_id, payload.quotation_id, payload.step, payload.status, payload.remarks || "", payload.processed_by || null, payload.processed_at || null]
    );
    return rows[0];
  }

  if (name === "purchase-orders") {
    const poNumber = payload.po_number || `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
    const { rows } = await query(
      `INSERT INTO purchase_orders (po_number, rfq_id, quotation_id, created_by, created_at)
       VALUES ($1,$2,$3,$4,COALESCE($5, CURRENT_TIMESTAMP))
       RETURNING *, created_at::date AS date`,
      [poNumber, payload.rfq_id, payload.quotation_id, payload.created_by || null, payload.created_at || null]
    );
    return rows[0];
  }

  if (name === "invoices") {
    const { rows } = await query(
      `INSERT INTO invoices (po_id, invoice_number, date, due_date, subtotal, gst_amount, grand_total, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, CURRENT_TIMESTAMP))
       RETURNING *`,
      [payload.po_id, payload.invoice_number, payload.date, payload.due_date, payload.subtotal || 0, payload.gst_amount || 0, payload.grand_total || 0, payload.status || "Pending", payload.created_at || null]
    );
    return normalizeMoney(rows[0]);
  }

  if (name === "activity-logs") {
    const { rows } = await query(
      `INSERT INTO activity_logs (user_id, action, category, details, timestamp)
       VALUES ($1,$2,$3,$4,COALESCE($5, CURRENT_TIMESTAMP))
       RETURNING *`,
      [payload.user_id || null, payload.action, payload.category, payload.details || "", payload.timestamp || null]
    );
    return rows[0];
  }

  if (name === "emails") {
    const { rows } = await query(
      `INSERT INTO sent_emails (recipient, subject, html_content, created_at)
       VALUES ($1,$2,$3,COALESCE($4, CURRENT_TIMESTAMP))
       RETURNING *, 'Sent' AS status`,
      [payload.recipient, payload.subject, payload.html_content || "", payload.created_at || null]
    );
    return rows[0];
  }

  const error = new Error(`Unsupported resource: ${name}`);
  error.status = 404;
  throw error;
}

export async function createResource(name, payload) {
  if (isPostgresMode()) return postgresCreateGeneric(name, payload);

  let created;
  await updateDb((db) => {
    const collection = db[collectionMap[name]];
    created = {
      ...payload,
      id: payload?.id ?? nextId(collection, 1)
    };

    if (name === "purchase-orders") {
      created.po_number ||= `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(created.id).padStart(3, "0")}`;
      created.date ||= new Date().toISOString().split("T")[0];
      created.created_at ||= new Date().toISOString();
    }

    if (name === "invoices") {
      created.invoice_number ||= `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(created.id).padStart(3, "0")}`;
      created.created_at ||= new Date().toISOString();
    }

    if (name === "activity-logs") created.timestamp ||= new Date().toISOString();
    if (name === "emails") {
      created.status ||= "Sent";
      created.created_at ||= new Date().toISOString();
    }

    collection.push(created);
    return db;
  });

  return name === "users" ? sanitizeUser(created) : created;
}

export async function updateVendorStatus(id, status) {
  if (isPostgresMode()) {
    const { rows } = await query("UPDATE vendors SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
    if (!rows[0]) {
      const error = new Error("Vendor not found.");
      error.status = 404;
      throw error;
    }
    return normalizeMoney(rows[0]);
  }

  let vendor;
  await updateDb((db) => {
    vendor = db.vendors.find((entry) => String(entry.id) === String(id));
    if (!vendor) {
      const error = new Error("Vendor not found.");
      error.status = 404;
      throw error;
    }
    vendor.status = status;
    return db;
  });
  return vendor;
}

export async function updateRfqStatus(id, status) {
  if (isPostgresMode()) {
    const { rows } = await query("UPDATE rfqs SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
    if (!rows[0]) {
      const error = new Error("RFQ not found.");
      error.status = 404;
      throw error;
    }
    return postgresGetRfq(id);
  }

  let rfq;
  await updateDb((db) => {
    rfq = db.rfqs.find((entry) => String(entry.id) === String(id));
    if (!rfq) {
      const error = new Error("RFQ not found.");
      error.status = 404;
      throw error;
    }
    rfq.status = status;
    return db;
  });
  return rfq;
}

export async function updateQuotationStatus(id, status) {
  if (isPostgresMode()) {
    const { rows } = await query("UPDATE quotations SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
    if (!rows[0]) {
      const error = new Error("Quotation not found.");
      error.status = 404;
      throw error;
    }
    return postgresGetQuotation(id);
  }

  let quotation;
  await updateDb((db) => {
    quotation = db.quotations.find((entry) => String(entry.id) === String(id));
    if (!quotation) {
      const error = new Error("Quotation not found.");
      error.status = 404;
      throw error;
    }
    quotation.status = status;
    return db;
  });
  return quotation;
}

export async function selectQuotation(id) {
  if (isPostgresMode()) {
    return withTransaction(async (client) => {
      const selectedResult = await client.query("SELECT * FROM quotations WHERE id = $1", [id]);
      const selected = selectedResult.rows[0];
      if (!selected) {
        const error = new Error("Quotation not found.");
        error.status = 404;
        throw error;
      }

      await client.query(
        "UPDATE quotations SET status = CASE WHEN id = $1 THEN 'Selected' ELSE 'Rejected' END WHERE rfq_id = $2",
        [selected.id, selected.rfq_id]
      );
      await client.query("UPDATE rfqs SET status = 'Approved' WHERE id = $1", [selected.rfq_id]);

      const items = (await client.query("SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY id", [selected.id])).rows;
      return {
        ...normalizeMoney({ ...selected, status: "Selected" }),
        items: items.map((item) => ({
          ...item,
          quantity: toNumber(item.quantity),
          unit_price: toNumber(item.unit_price),
          total: toNumber(item.total)
        }))
      };
    });
  }

  let selected;
  await updateDb((db) => {
    selected = db.quotations.find((entry) => String(entry.id) === String(id));
    if (!selected) {
      const error = new Error("Quotation not found.");
      error.status = 404;
      throw error;
    }

    db.quotations.forEach((quotation) => {
      if (quotation.rfq_id === selected.rfq_id) {
        quotation.status = quotation.id === selected.id ? "Selected" : "Rejected";
      }
    });

    const rfq = db.rfqs.find((entry) => entry.id === selected.rfq_id);
    if (rfq) rfq.status = "Approved";
    return db;
  });
  return selected;
}

export async function payInvoice(id) {
  if (isPostgresMode()) {
    const { rows } = await query("UPDATE invoices SET status = 'Paid' WHERE id = $1 RETURNING *", [id]);
    if (!rows[0]) {
      const error = new Error("Invoice not found.");
      error.status = 404;
      throw error;
    }
    return normalizeMoney(rows[0]);
  }

  let invoice;
  await updateDb((db) => {
    invoice = db.invoices.find((entry) => String(entry.id) === String(id));
    if (!invoice) {
      const error = new Error("Invoice not found.");
      error.status = 404;
      throw error;
    }
    invoice.status = "Paid";
    invoice.paid_at = new Date().toISOString();
    return db;
  });
  return invoice;
}

export async function sendEmail(payload) {
  return createResource("emails", {
    ...payload,
    status: "Sent",
    created_at: payload.created_at || new Date().toISOString()
  });
}

export async function getInvoiceById(id) {
  if (isPostgresMode()) {
    const { rows } = await query("SELECT * FROM invoices WHERE id = $1", [id]);
    return rows[0] ? normalizeMoney(rows[0]) : null;
  }

  const db = await readDb();
  return db.invoices.find((entry) => String(entry.id) === String(id)) || null;
}

export async function getPurchaseOrderById(id) {
  if (isPostgresMode()) {
    const { rows } = await query("SELECT *, created_at::date AS date FROM purchase_orders WHERE id = $1", [id]);
    return rows[0] || null;
  }

  const db = await readDb();
  return db.purchaseOrders.find((entry) => String(entry.id) === String(id)) || null;
}

export async function analyticsSummary() {
  if (isPostgresMode()) {
    const { rows } = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM rfqs WHERE status IN ('Active', 'Comparison', 'L2 Review')) AS "activeRfqs",
        (SELECT COUNT(*)::int FROM vendors WHERE status = 'Active') AS "activeVendors",
        (SELECT COUNT(*)::int FROM quotations WHERE status = 'Submitted') AS "pendingApprovals",
        (SELECT COUNT(*)::int FROM invoices WHERE status = 'Pending') AS "pendingInvoices",
        COALESCE((SELECT SUM(grand_total)::numeric FROM invoices), 0) AS "totalSpend"
    `);

    return {
      ...rows[0],
      totalSpend: toNumber(rows[0].totalSpend)
    };
  }

  const db = await readDb();
  return {
    activeRfqs: db.rfqs.filter((rfq) => ["Active", "Comparison", "L2 Review"].includes(rfq.status)).length,
    activeVendors: db.vendors.filter((vendor) => vendor.status === "Active").length,
    pendingApprovals: db.quotations.filter((quotation) => quotation.status === "Submitted").length,
    pendingInvoices: db.invoices.filter((invoice) => invoice.status === "Pending").length,
    totalSpend: db.invoices.reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0)
  };
}
