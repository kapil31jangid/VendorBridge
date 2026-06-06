# VendorBridge

VendorBridge is a procurement and vendor management ERP built for the hackathon problem statement. It supports vendor registration, RFQ creation, quotation submission, comparison, approvals, purchase orders, invoice generation, email dispatch logging, activity logs, and procurement analytics.

## Tech Stack

- Frontend: React, Vite, vanilla CSS, lucide-react
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT with role-based access control

## Project Structure

```text
VendorBridge/
  frontend/   React ERP client
  backend/    Express REST API and PostgreSQL database setup
```

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 18 or compatible

## Backend Setup

```powershell
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example` and fill in your local PostgreSQL password:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
DATA_PROVIDER=postgres
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-postgres-password
PGDATABASE=vendorbridge
```

Initialize the database:

```powershell
npm run db:init
```

Start the API:

```powershell
npm start
```

The API runs at:

```text
http://localhost:5000/api
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses this default API URL:

```text
http://localhost:5000/api
```

To override it, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Demo Accounts

All seeded users use:

```text
password123
```

Seeded users:

- `officer@vendorbridge.com` - Procurement Officer
- `manager@vendorbridge.com` - Manager / Approver
- `vendor1@infra.com` - Vendor
- `vendor2@techcore.com` - Vendor
- `admin@vendorbridge.com` - Admin

## Verification

Backend tests:

```powershell
cd backend
npm test
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Notes

- `backend/.env` is intentionally ignored and should not be committed.
- `backend/data/` is only for JSON fallback/testing and should not be committed.
- PostgreSQL initialization creates the `vendorbridge` database if needed, installs tables, adds immutable audit-log triggers, and inserts seed data.
