import cors from "cors";
import express from "express";
import { ensureRepository, getProviderName } from "./data/repository.js";
import { authRouter } from "./routes/auth.js";
import { resourceRouter } from "./routes/resources.js";
import { workflowRouter } from "./routes/workflow.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", async (_req, res) => {
    await ensureRepository();
    res.json({ ok: true, service: "vendorbridge-backend", provider: await getProviderName() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api", resourceRouter);
  app.use("/api", workflowRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error"
    });
  });

  return app;
}
