import sql from "mssql";
import type { config as SqlConfig } from "mssql";

const connectionString = process.env.DB_CONNECTION_STRING;
const server = process.env.DB_SERVER || "localhost";
const port = parseInt(process.env.DB_PORT || "1433");
const database = process.env.DB_NAME || "medixora";
const user = process.env.DB_USER || "sa";
const password = process.env.DB_PASSWORD || "YourPassword123!";
const trustCert = (process.env.DB_TRUST_SERVER_CERT || "false").toLowerCase() === "true";

let config: SqlConfig | string;
if (connectionString) {
  config = connectionString;
  console.log(`[DB] Using connection string from env`);
} else {
  config = {
    server,
    port,
    database,
    authentication: {
      type: "default",
      options: {
        userName: user,
        password,
      },
    },
    options: {
      trustServerCertificate: trustCert,
      encrypt: true,
      connectTimeout: 15000,
    },
  };

  console.log(`[DB] Connecting to ${server}:${port}/${database}`);
}

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  // Return the cached pool only if it is still connected
  if (pool?.connected) return pool;

  // If the old pool exists but is no longer connected, clean it up
  if (pool) {
    try { await pool.close(); } catch { /* already closed */ }
    pool = null;
  }

  pool = new sql.ConnectionPool(config);

  // Auto-clear the cached reference when the connection drops unexpectedly
  pool.on("error", (err) => {
    console.error("[DB] Pool error — connection will be re-created on next request:", err.message);
    pool = null;
  });

  await pool.connect();
  return pool;
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };
