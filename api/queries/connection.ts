import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: MySql2Database<typeof fullSchema>;
let poolInstance: Pool;

/** Parse connection limits from DATABASE_URL query params or use defaults */
function getPoolConfig() {
  // Conservative defaults for Railway free-tier MySQL (~10-20 max connections)
  // If 2 instances run during deploy, 5 each = 10 total (within limit)
  const maxConnections = 5;
  const queueLimit = 10;
  const connectTimeout = 10000;
  const idleTimeout = 60000;
  return {
    connectionLimit: maxConnections,
    queueLimit,
    connectTimeout,
    idleTimeout,
    enableKeepAlive: true,
  };
}

export function getDb() {
  if (!instance) {
    poolInstance = createPool({ uri: env.databaseUrl, ...getPoolConfig() });
    const drizzleAny: any = drizzle;
    instance = drizzleAny(poolInstance, { schema: fullSchema, mode: "default" }) as MySql2Database<typeof fullSchema>;
  }
  return instance;
}

export function getPool() {
  if (!poolInstance) {
    getDb(); // initialize pool
  }
  return poolInstance;
}
