import sql from "mssql";
import type { config as SqlConfig } from "mssql";

<<<<<<< HEAD
const connectionString = process.env.DB_CONNECTION_STRING;
=======
>>>>>>> 938c88d3dc73f1657f793ea6c5ccff50893f11a4
const server = process.env.DB_SERVER || "localhost";
const port = parseInt(process.env.DB_PORT || "1433");
const database = process.env.DB_NAME || "medixora";
const user = process.env.DB_USER || "sa";
const password = process.env.DB_PASSWORD || "YourPassword123!";
<<<<<<< HEAD
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
=======

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
>>>>>>> 938c88d3dc73f1657f793ea6c5ccff50893f11a4

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
