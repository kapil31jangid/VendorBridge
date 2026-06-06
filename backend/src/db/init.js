import bcrypt from "bcryptjs";
import pg from "pg";
import { env, isPostgresMode } from "../config/env.js";
import { seedData } from "../seed.js";

const { Pool } = pg;

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Officer', 'Manager', 'Vendor')),
  country VARCHAR(50),
  additional_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  gst_no VARCHAR(20),
  contact_no VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Pending', 'Blocked')),
  rating NUMERIC DEFAULT 0,
  payment_terms VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rfqs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  deadline DATE,
  status VARCHAR(20) DEFAULT 'Draft',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rfq_items (
  id SERIAL PRIMARY KEY,
  rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
  item_name VARCHAR(150),
  quantity NUMERIC,
  unit VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS rfq_vendors (
  rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  PRIMARY KEY (rfq_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS quotations (
  id SERIAL PRIMARY KEY,
  rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  gst_percent NUMERIC DEFAULT 18,
  subtotal NUMERIC,
  gst_amount NUMERIC,
  grand_total NUMERIC,
  delivery_days INTEGER,
  payment_terms VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id SERIAL PRIMARY KEY,
  quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
  item_name VARCHAR(150),
  quantity NUMERIC,
  unit_price NUMERIC,
  total NUMERIC
);

CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
  quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
  step VARCHAR(10) CHECK (step IN ('L1', 'L2')),
  status VARCHAR(20) CHECK (status IN ('Approved', 'Rejected')),
  remarks TEXT,
  processed_by INTEGER REFERENCES users(id),
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE,
  rfq_id INTEGER REFERENCES rfqs(id),
  quotation_id INTEGER REFERENCES quotations(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE,
  date DATE,
  due_date DATE,
  subtotal NUMERIC,
  gst_amount NUMERIC,
  grand_total NUMERIC,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  category VARCHAR(50),
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sent_emails (
  id SERIAL PRIMARY KEY,
  recipient VARCHAR(100),
  subject VARCHAR(200),
  html_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_log_update ON activity_logs;
CREATE TRIGGER prevent_log_update
BEFORE UPDATE ON activity_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

DROP TRIGGER IF EXISTS prevent_log_delete ON activity_logs;
CREATE TRIGGER prevent_log_delete
BEFORE DELETE ON activity_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
`;

async function seedIfEmpty(client) {
  const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM users");
  if (rows[0].count > 0) {
    return false;
  }

  for (const user of seedData.users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await client.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role, country, additional_info)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [user.id, user.first_name, user.last_name, user.email, passwordHash, user.phone, user.role, user.country, user.additional_info || null]
    );
  }

  for (const vendor of seedData.vendors) {
    await client.query(
      `INSERT INTO vendors (id, user_id, name, category, gst_no, contact_no, email, status, rating, payment_terms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [vendor.id, vendor.user_id || null, vendor.name, vendor.category, vendor.gst_no, vendor.contact_no, vendor.email, vendor.status, vendor.rating, vendor.payment_terms]
    );
  }

  for (const rfq of seedData.rfqs) {
    await client.query(
      `INSERT INTO rfqs (id, title, description, category, deadline, status, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [rfq.id, rfq.title, rfq.description, rfq.category, rfq.deadline, rfq.status, rfq.created_by, rfq.created_at]
    );
    for (const item of rfq.items) {
      await client.query(
        `INSERT INTO rfq_items (id, rfq_id, item_name, quantity, unit)
         VALUES ($1,$2,$3,$4,$5)`,
        [item.id, rfq.id, item.item_name, item.quantity, item.unit]
      );
    }
    for (const vendorId of rfq.assigned_vendors) {
      await client.query(
        `INSERT INTO rfq_vendors (rfq_id, vendor_id) VALUES ($1,$2)`,
        [rfq.id, vendorId]
      );
    }
  }

  for (const quotation of seedData.quotations) {
    await client.query(
      `INSERT INTO quotations (id, rfq_id, vendor_id, gst_percent, subtotal, gst_amount, grand_total, delivery_days, payment_terms, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [quotation.id, quotation.rfq_id, quotation.vendor_id, quotation.gst_percent, quotation.subtotal, quotation.gst_amount, quotation.grand_total, quotation.delivery_days, quotation.payment_terms, quotation.status, quotation.created_at]
    );
    for (const item of quotation.items) {
      await client.query(
        `INSERT INTO quotation_items (id, quotation_id, item_name, quantity, unit_price, total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [item.id, quotation.id, item.item_name, item.quantity, item.unit_price, item.total]
      );
    }
  }

  for (const approval of seedData.approvals) {
    await client.query(
      `INSERT INTO approvals (id, rfq_id, quotation_id, step, status, remarks, processed_by, processed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [approval.id, approval.rfq_id, approval.quotation_id, approval.step, approval.status, approval.remarks, approval.processed_by, approval.processed_at]
    );
  }

  for (const po of seedData.purchaseOrders) {
    await client.query(
      `INSERT INTO purchase_orders (id, po_number, rfq_id, quotation_id, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [po.id, po.po_number, po.rfq_id, po.quotation_id, po.created_by, po.created_at]
    );
  }

  for (const invoice of seedData.invoices) {
    await client.query(
      `INSERT INTO invoices (id, po_id, invoice_number, date, due_date, subtotal, gst_amount, grand_total, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [invoice.id, invoice.po_id, invoice.invoice_number, invoice.date, invoice.due_date, invoice.subtotal, invoice.gst_amount, invoice.grand_total, invoice.status, invoice.created_at]
    );
  }

  for (const log of seedData.activityLogs) {
    await client.query(
      `INSERT INTO activity_logs (id, user_id, action, category, details, timestamp)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [log.id, log.user_id, log.action, log.category, log.details, log.timestamp]
    );
  }

  for (const email of seedData.emails) {
    await client.query(
      `INSERT INTO sent_emails (id, recipient, subject, html_content, created_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [email.id, email.recipient, email.subject, email.html_content, email.created_at]
    );
  }

  return true;
}

async function main() {
  if (!isPostgresMode()) {
    console.log("DATA_PROVIDER is not set to postgres. Skipping PostgreSQL initialization.");
    return;
  }

  const maintenancePool = new Pool({
    ...env.pg,
    database: "postgres"
  });
  const maintenanceClient = await maintenancePool.connect();

  try {
    const { rows } = await maintenanceClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [env.pg.database]
    );

    if (rows.length === 0) {
      await maintenanceClient.query(`CREATE DATABASE ${quoteIdentifier(env.pg.database)}`);
      console.log(`Created PostgreSQL database '${env.pg.database}'.`);
    }
  } finally {
    maintenanceClient.release();
    await maintenancePool.end();
  }

  const pool = new Pool(env.pg);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(schemaSql);
    const seeded = await seedIfEmpty(client);
    await client.query("COMMIT");
    console.log(seeded ? "PostgreSQL schema created and seed data inserted." : "PostgreSQL schema verified; seed data already present.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
