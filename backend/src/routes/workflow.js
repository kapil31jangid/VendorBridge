import express from "express";
import {
  analyticsSummary,
  payInvoice,
  selectQuotation,
  sendEmail,
  updateQuotationStatus,
  updateRfqStatus,
  updateVendorStatus
} from "../data/repository.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const workflowRouter = express.Router();

workflowRouter.put("/vendors/:id/status", requireAuth, requireRole("Admin", "Officer"), async (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  res.json(await updateVendorStatus(req.params.id, status));
});

workflowRouter.put("/rfqs/:id/status", requireAuth, requireRole("Admin", "Officer", "Manager"), async (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  res.json(await updateRfqStatus(req.params.id, status));
});

workflowRouter.put("/quotations/:id/status", requireAuth, requireRole("Admin", "Officer", "Manager"), async (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  res.json(await updateQuotationStatus(req.params.id, status));
});

workflowRouter.post("/quotations/:id/select", requireAuth, requireRole("Admin", "Officer", "Manager"), async (req, res) => {
  res.json(await selectQuotation(req.params.id));
});

workflowRouter.put("/invoices/:id/pay", requireAuth, requireRole("Admin", "Officer", "Manager"), async (_req, res) => {
  res.json(await payInvoice(_req.params.id));
});

workflowRouter.post("/emails/send", requireAuth, async (req, res) => {
  const payload = req.body || {};
  if (!payload.recipient || !payload.subject) {
    return res.status(400).json({ error: "recipient and subject are required." });
  }

  res.status(201).json(await sendEmail(payload));
});

workflowRouter.get("/analytics/summary", requireAuth, async (_req, res) => {
  res.json(await analyticsSummary());
});
