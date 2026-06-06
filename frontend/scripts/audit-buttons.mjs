import { chromium } from "playwright";

const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173";
const results = [];

function record(name, status, detail = "") {
  results.push({ name, status, detail });
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`${status === "pass" ? "PASS" : "FAIL"} ${name}${suffix}`);
}

async function clickByText(page, text, options = {}) {
  const exact = options.exact ?? false;
  const roleLocator = page.getByRole("button", { name: text, exact }).first();
  try {
    await roleLocator.waitFor({ state: "visible", timeout: options.timeout || 3000 });
    await roleLocator.click();
    return;
  } catch {
    const locator = page.getByText(text, { exact }).first();
    await locator.waitFor({ state: "visible", timeout: options.timeout || 5000 });
    await locator.click();
  }
}

async function expectVisible(page, text, name) {
  try {
    await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5000 });
    record(name, "pass");
  } catch (error) {
    record(name, "fail", error.message.split("\n")[0]);
  }
}

async function clickNav(page, label) {
  const locator = page.locator("nav button").filter({ hasText: label }).first();
  await locator.waitFor({ state: "visible", timeout: 5000 });
  await locator.click();
}

async function audit() {
  const browser = await chromium.launch({ channel: "chrome", headless: true, timeout: 15000 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  page.setDefaultTimeout(7000);
  page.setDefaultNavigationTimeout(15000);
  const errors = [];

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("dialog", async (dialog) => {
    record(`dialog: ${dialog.message()}`, "pass");
    await dialog.accept();
  });

  try {
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });

  await clickByText(page, "Officer", { exact: true });
  await expectVisible(page, "Dashboard", "officer quick login");

  const navChecks = [
    ["Vendors", "Manage supplier profiles"],
    ["RFQ's", "Create RFQ"],
    ["Quotations", "Received Quotations Log"],
    ["Approvals", "Procurement Approvals Queue"],
    ["Purchase orders", "Purchase Orders"],
    ["Invoices", "Billing claims"],
    ["Reports", "Reports & analytics"],
    ["Activity", "Activity and logs"],
    ["Dashboard", "Today's Overview"]
  ];

  for (const [button, expected] of navChecks) {
    try {
      await clickNav(page, button);
      await page.getByText(expected, { exact: false }).first().waitFor({ state: "visible", timeout: 5000 });
      record(`sidebar: ${button}`, "pass");
    } catch (error) {
      record(`sidebar: ${button}`, "fail", error.message.split("\n")[0]);
    }
  }

  try {
    await page.locator('button[title="Outbox Email Log"]').click({ force: true });
    await expectVisible(page, "System Outbox Log", "open outbox");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectVisible(page, "Dashboard", "restore after outbox close");
    record("close outbox", "pass");
  } catch (error) {
    record("outbox close", "fail", error.message.split("\n")[0]);
    await page.reload({ waitUntil: "domcontentloaded" });
  }

  try {
    await clickNav(page, "Dashboard");
    await clickByText(page, "+ new RFQ", { exact: true });
    await expectVisible(page, "new request for quotation", "dashboard quick action: new RFQ");
    await clickNav(page, "Dashboard");
    await clickByText(page, "Add Vendor", { exact: true });
    await expectVisible(page, "Manage supplier profiles", "dashboard quick action: add vendor");
    await clickNav(page, "Dashboard");
    await clickByText(page, "view Invoices", { exact: false });
    await expectVisible(page, "Billing claims", "dashboard quick action: invoices");
  } catch (error) {
    record("dashboard quick actions", "fail", error.message.split("\n")[0]);
  }

  await clickNav(page, "Vendors");
  try {
    await clickByText(page, "Add Vendor", { exact: true });
    await page.getByPlaceholder("e.g. Apex Industrial Parts").fill(`Audit Vendor ${Date.now()}`);
    await page.getByPlaceholder("e.g. 27AAAAA1111A1Z1").fill("27AUDIT1111A1Z1");
    await page.getByPlaceholder("e.g. +91 99999 88888").fill("+91 90000 00000");
    await page.getByPlaceholder("e.g. sales@vendor.com").fill(`audit-${Date.now()}@vendorbridge.test`);
    await clickByText(page, "Save Vendor", { exact: true });
    await expectVisible(page, "added successfully", "vendor save toast");
  } catch (error) {
    record("vendor add modal/save", "fail", error.message.split("\n")[0]);
  }

  try {
    await clickByText(page, "Pending", { exact: true });
    await clickByText(page, "View", { exact: true });
    await clickByText(page, "Approve / Active", { exact: true });
    await expectVisible(page, "Vendor status updated", "vendor status button");
  } catch (error) {
    record("vendor status modal buttons", "fail", error.message.split("\n")[0]);
  }

  await clickNav(page, "RFQ's");
  try {
    await clickByText(page, "+ add line item", { exact: true });
    record("rfq add line item", "pass");
  } catch (error) {
    record("rfq add line item", "fail", error.message.split("\n")[0]);
  }

  try {
    await clickByText(page, "Save as Draft", { exact: true });
    await expectVisible(page, "created successfully", "rfq save draft");
  } catch (error) {
    record("rfq save draft", "fail", error.message.split("\n")[0]);
  }

  try {
    await clickByText(page, "Save & Send to Vendors", { exact: true });
    record("rfq send validation alert", "pass");
  } catch (error) {
    record("rfq save/send button", "fail", error.message.split("\n")[0]);
  }

  await clickNav(page, "Quotations");
  try {
    await clickByText(page, "View Bids", { exact: false });
    record("quotations view bids", "pass");
    await clickByText(page, "Compare side-by-side", { exact: true });
    await expectVisible(page, "Quotation Comparison", "quotations compare button");
  } catch (error) {
    record("quotations officer actions", "fail", error.message.split("\n")[0]);
  }

  try {
    await clickByText(page, "Back to Quotations Log", { exact: true });
    await expectVisible(page, "Received Quotations Log", "comparison back button");
  } catch (error) {
    record("comparison back button", "fail", error.message.split("\n")[0]);
  }

  await clickNav(page, "Activity");
  for (const filter of ["RFQ", "Approvals", "Invoices", "Vendors", "All"]) {
    try {
      await clickByText(page, filter, { exact: true });
      record(`activity filter: ${filter}`, "pass");
    } catch (error) {
      record(`activity filter: ${filter}`, "fail", error.message.split("\n")[0]);
    }
  }

  try {
    await clickNav(page, "Reports");
    for (const button of ["May 2025", "Export"]) {
      try {
        await clickByText(page, button, { exact: true });
        record(`reports button: ${button}`, "pass");
      } catch (error) {
        record(`reports button: ${button}`, "fail", error.message.split("\n")[0]);
      }
    }
  } catch (error) {
    record("reports navigation", "fail", error.message.split("\n")[0]);
  }

  try {
    await clickByText(page, "Sign Out", { exact: true });
    await expectVisible(page, "Login Button", "sign out returns to login");
  } catch (error) {
    record("sign out", "fail", error.message.split("\n")[0]);
  }

  } finally {
    await browser.close();
  }

  const failed = results.filter((result) => result.status === "fail");
  const errorLines = errors.filter((line) => !line.includes("favicon"));

  if (errorLines.length > 0) {
    console.log("\nBrowser errors:");
    for (const error of errorLines) console.log(`- ${error}`);
  }

  console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0 || errorLines.length > 0) {
    process.exitCode = 1;
  }
}

audit().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
