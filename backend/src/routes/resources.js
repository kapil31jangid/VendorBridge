import express from "express";
import { createResource, getInvoiceById, getPurchaseOrderById, listResource } from "../data/repository.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const resourceRouter = express.Router();

for (const routeName of ["users", "vendors", "rfqs", "quotations", "approvals", "purchase-orders", "invoices", "activity-logs", "emails"]) {
  resourceRouter.get(`/${routeName}`, requireAuth, async (_req, res) => {
    res.json(await listResource(routeName));
  });

  const writeMiddleware =
    routeName === "users"
      ? [requireAuth, requireRole("Admin")]
      : routeName === "vendors"
        ? [requireAuth, requireRole("Admin", "Officer")]
        : routeName === "rfqs"
          ? [requireAuth, requireRole("Admin", "Officer")]
          : routeName === "quotations"
            ? [requireAuth, requireRole("Vendor", "Admin")]
            : routeName === "approvals"
              ? [requireAuth, requireRole("Officer", "Manager", "Admin")]
              : [requireAuth];

  resourceRouter.post(`/${routeName}`, ...writeMiddleware, async (req, res) => {
    res.status(201).json(await createResource(routeName, req.body));
  });
}

resourceRouter.get("/activity", requireAuth, async (_req, res) => {
  res.json(await listResource("activity-logs"));
});

resourceRouter.get("/documents/invoices/:id", requireAuth, async (req, res) => {
  const invoice = await getInvoiceById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found." });
  }
  res.json(invoice);
});

resourceRouter.get("/documents/purchase-orders/:id", requireAuth, async (req, res) => {
  const purchaseOrder = await getPurchaseOrderById(req.params.id);
  if (!purchaseOrder) {
    return res.status(404).json({ error: "Purchase order not found." });
  }
  res.json(purchaseOrder);
});
