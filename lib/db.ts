import sql from "mssql";
import type { config as SqlConfig } from "mssql";

const server = process.env.DB_SERVER || "localhost";
const port = parseInt(process.env.DB_PORT || "1433");
const database = process.env.DB_NAME || "medixora";
const user = process.env.DB_USER || "sa";
const password = process.env.DB_PASSWORD || "YourPassword123!";

const config: SqlConfig = {
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
    trustServerCertificate: true,
    encrypt: false,
    connectTimeout: 15000,
  },
};

console.log(`[DB] Connecting to ${server}:${port}/${database}`);

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool) return pool;

  pool = new sql.ConnectionPool(config);
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
