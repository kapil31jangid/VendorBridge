# VendorBridge Backend

Express REST API for the VendorBridge procurement ERP.

## Modes

The backend supports two persistence modes:

- `DATA_PROVIDER=json`: local JSON fallback for tests and demo runs.
- `DATA_PROVIDER=postgres`: PostgreSQL runtime using the schema initialized by `npm run db:init`.

## Setup

```powershell
npm install
```

Copy `.env.example` to `.env` and update values as needed.

For PostgreSQL:

```env
DATA_PROVIDER=postgres
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=vendorbridge
JWT_SECRET=replace-this-secret
```

Then initialize the database:

```powershell
npm run db:init
```

The init script creates the target database if missing, creates tables, installs the immutable `activity_logs` update/delete trigger, and inserts seed data when the users table is empty.

## Run

```powershell
npm start
```

Health check:

```text
GET /api/health
```

## Test

```powershell
npm test
```

