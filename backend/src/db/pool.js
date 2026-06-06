import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool(env.pg);
  }

  return pool;
}

export async function query(sql, params = []) {
  const activePool = getPool();
  return activePool.query(sql, params);
}

export async function withTransaction(work) {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

