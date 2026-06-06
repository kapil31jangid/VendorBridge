import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedData } from "./seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "db.json");

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

export async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(cloneSeed(), null, 2));
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  return data;
}

export async function updateDb(updater) {
  const data = await readDb();
  const next = await updater(data);
  await writeDb(next);
  return next;
}

export function nextId(collection, fallbackStart = 1) {
  const maxId = collection.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  return maxId > 0 ? maxId + 1 : fallbackStart;
}

export function sanitizeUser(user) {
  const { password, password_hash, ...safeUser } = user;
  return safeUser;
}
