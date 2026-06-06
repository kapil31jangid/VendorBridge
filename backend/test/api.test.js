import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.DATA_PROVIDER = "json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "data", "db.json");

let server;
let baseUrl;
let createApp;

test.beforeEach(async () => {
  await fs.rm(dbPath, { force: true });
});

test.before(async () => {
  ({ createApp } = await import("../src/app.js"));
  const app = createApp();
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}/api`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health endpoint responds", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
});

test("login succeeds for seeded hackathon user", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "officer@vendorbridge.com",
      password: "password123"
    })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.user.email, "officer@vendorbridge.com");
  assert.equal(body.user.password, undefined);
  assert.equal(typeof body.token, "string");
});

test("protected route rejects unauthenticated access", async () => {
  const response = await fetch(`${baseUrl}/vendors`);
  assert.equal(response.status, 401);
});

test("vendor status update persists", async () => {
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "officer@vendorbridge.com",
      password: "password123"
    })
  });
  const loginBody = await loginResponse.json();

  const response = await fetch(`${baseUrl}/vendors/104/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginBody.token}`
    },
    body: JSON.stringify({ status: "Active" })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "Active");

  const vendorsResponse = await fetch(`${baseUrl}/vendors`, {
    headers: {
      Authorization: `Bearer ${loginBody.token}`
    }
  });
  const vendors = await vendorsResponse.json();
  const vendor = vendors.find((entry) => entry.id === 104);
  assert.equal(vendor.status, "Active");
});
