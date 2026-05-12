import sql from "mssql";
import type { config as SqlConfig } from "mssql";

/* ------------------------------------------------------------------ */
/*  Parse connection string into a proper config object so pool        */
/*  settings (min, max, idle timeout) are always applied.              */
/* ------------------------------------------------------------------ */

function parseConnectionString(cs: string): SqlConfig {
  const clean = cs.replace(/^"|"$/g, "");
  const parts = clean.split(";").reduce(
    (acc, part) => {
      const idx = part.indexOf("=");
      if (idx > 0) {
        const key = part.slice(0, idx).trim().toLowerCase();
        const val = part.slice(idx + 1).trim();
        acc[key] = val;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  return {
    server: parts["data source"] || parts["server"] || "localhost",
    database: parts["initial catalog"] || parts["database"] || "",
    user: parts["user id"] || parts["uid"] || "",
    password: parts["pwd"] || parts["password"] || "",
    options: {
      trustServerCertificate:
        (parts["trustservercertificate"] || "false").toLowerCase() === "true",
      encrypt: false,
      connectTimeout: 15000,
      requestTimeout: 15000,
    },
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 60000,
    },
  };
}

const connectionString = process.env.DB_CONNECTION_STRING;
const server = process.env.DB_SERVER || "localhost";
const port = parseInt(process.env.DB_PORT || "1433");
const database = process.env.DB_NAME || "medixora";
const user = process.env.DB_USER || "sa";
const password = process.env.DB_PASSWORD || "YourPassword123!";
const trustCert =
  (process.env.DB_TRUST_SERVER_CERT || "false").toLowerCase() === "true";

let config: SqlConfig;
if (connectionString) {
  config = parseConnectionString(connectionString);
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
      encrypt: false,
      connectTimeout: 15000,
      requestTimeout: 15000,
    },
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 60000,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Singleton connection pool (survives across API calls / HMR)       */
/* ------------------------------------------------------------------ */

const globalForDb = globalThis as unknown as {
  __mssqlPool?: sql.ConnectionPool;
  __mssqlPoolConnecting?: Promise<sql.ConnectionPool>;
};

export async function getConnection(): Promise<sql.ConnectionPool> {
  // Fast path — pool is cached and healthy
  if (globalForDb.__mssqlPool?.connected) {
    return globalForDb.__mssqlPool;
  }

  // If another caller is already connecting, wait for that instead of
  // creating a duplicate pool (prevents thundering-herd on cold start)
  if (globalForDb.__mssqlPoolConnecting) {
    return globalForDb.__mssqlPoolConnecting;
  }

  // Clean up a stale pool reference
  if (globalForDb.__mssqlPool) {
    try {
      await globalForDb.__mssqlPool.close();
    } catch {
      /* already closed */
    }
    globalForDb.__mssqlPool = undefined;
  }

  const connectPromise = (async () => {
    console.log("[DB] Creating new connection pool…");
    const newPool = new sql.ConnectionPool(config);

    newPool.on("error", (err) => {
      console.error(
        "[DB] Pool error — will re-create on next request:",
        err.message,
      );
      globalForDb.__mssqlPool = undefined;
    });

    await newPool.connect();
    console.log("[DB] Pool connected ✓");
    globalForDb.__mssqlPool = newPool;
    return newPool;
  })();

  globalForDb.__mssqlPoolConnecting = connectPromise;

  try {
    return await connectPromise;
  } finally {
    globalForDb.__mssqlPoolConnecting = undefined;
  }
}

export async function closeConnection(): Promise<void> {
  if (globalForDb.__mssqlPool) {
    await globalForDb.__mssqlPool.close();
    globalForDb.__mssqlPool = undefined;
  }
}

export { sql };
