import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureRepository } from "./data/repository.js";

await ensureRepository();

const app = createApp();

app.listen(env.port, () => {
  console.log(`VendorBridge backend listening on http://localhost:${env.port}`);
});
