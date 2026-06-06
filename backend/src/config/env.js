import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "vendorbridge-dev-secret",
  dataProvider: process.env.DATA_PROVIDER || (process.env.PGHOST ? "postgres" : "json"),
  pg: {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
  }
};

export function isPostgresMode() {
  return env.dataProvider === "postgres";
}
