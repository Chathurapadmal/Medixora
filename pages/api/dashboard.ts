import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

type DashboardSummary = {
  staffAccounts: number;
  activeStaff: number;
  totalMedicines: number;
  lowStockMedicines: number;
  expiredMedicines: number;
  inventoryValue: number;
  totalSuppliers: number;
};

type DashboardInventoryItem = {
  id: number;
  name: string;
  category: string | null;
  supplier: string | null;
  stock: number;
  minimum: number;
  price: number;
  expiryDate: string | null;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Expired";
};

type DashboardResponse = {
  summary: DashboardSummary;
  recentInventory: DashboardInventoryItem[];
  lowStockItems: DashboardInventoryItem[];
};

async function tableExists(
  pool: Awaited<ReturnType<typeof getConnection>>,
  tableName: string
) {
  const result = await pool
    .request()
    .input("tableName", sql.NVarChar, tableName)
    .query(`
      SELECT CASE
        WHEN EXISTS (
          SELECT 1
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = @tableName
        ) THEN 1
        ELSE 0
      END AS existsFlag
    `);

  return Number(result.recordset?.[0]?.existsFlag ?? 0) === 1;
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function supplierColumnClause(hasSuppliersTable: boolean) {
  return hasSuppliersTable
    ? "s.supplier_name AS supplier,"
    : "CAST(NULL AS nvarchar(255)) AS supplier,";
}

function supplierJoinClause(hasSuppliersTable: boolean) {
  return hasSuppliersTable
    ? "LEFT JOIN dbo.suppliers s ON s.supplier_id = i.supplier_id"
    : "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const pool = await getConnection();
    const [usersTableExists, inventoryTableExists, suppliersTableExists] = await Promise.all([
      tableExists(pool, "users"),
      tableExists(pool, "inventory"),
      tableExists(pool, "suppliers"),
    ]);

    const summary: DashboardSummary = {
      staffAccounts: 0,
      activeStaff: 0,
      totalMedicines: 0,
      lowStockMedicines: 0,
      expiredMedicines: 0,
      inventoryValue: 0,
      totalSuppliers: 0,
    };

    // Run all queries in parallel instead of sequentially
    const queryPromises: Promise<any>[] = [];

    if (usersTableExists) {
      queryPromises.push(
        pool.request().query(`
          SELECT
            COUNT(1) AS staffAccounts,
            SUM(CASE WHEN LOWER([role]) IN ('admin', 'doctor', 'nurse', 'staff') AND LOWER(status) = 'active' THEN 1 ELSE 0 END) AS activeStaff
          FROM dbo.users
        `)
      );
    } else {
      queryPromises.push(Promise.resolve(null));
    }

    if (inventoryTableExists) {
      queryPromises.push(
        pool.request().query(`
          SELECT
            COUNT(1) AS totalMedicines,
            SUM(CASE WHEN COALESCE(stock_quantity, 0) > 0 AND COALESCE(stock_quantity, 0) < COALESCE(minimum_stock_level, 0) THEN 1 ELSE 0 END) AS lowStockMedicines,
            SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date < CAST(GETDATE() AS date) THEN 1 ELSE 0 END) AS expiredMedicines,
            CAST(SUM(COALESCE(stock_quantity, 0) * COALESCE(unit_price, 0)) AS decimal(18, 2)) AS inventoryValue
          FROM dbo.inventory
        `)
      );
    } else {
      queryPromises.push(Promise.resolve(null));
    }

    if (suppliersTableExists) {
      queryPromises.push(
        pool.request().query(`
          SELECT COUNT(1) AS totalSuppliers
          FROM dbo.suppliers
        `)
      );
    } else {
      queryPromises.push(Promise.resolve(null));
    }

    const recentInventoryQuery = inventoryTableExists
      ? `
          SELECT TOP 5
            i.medicine_id AS id,
            i.medicine_name AS name,
            i.category,
            ${supplierColumnClause(suppliersTableExists)}
            COALESCE(i.stock_quantity, 0) AS stock,
            COALESCE(i.minimum_stock_level, 0) AS minimum,
            CAST(COALESCE(i.unit_price, 0) AS decimal(18, 2)) AS price,
            CONVERT(varchar(10), i.expiry_date, 23) AS expiryDate,
            CASE
              WHEN i.expiry_date IS NOT NULL AND i.expiry_date < CAST(GETDATE() AS date) THEN 'Expired'
              WHEN COALESCE(i.stock_quantity, 0) <= 0 THEN 'Out of Stock'
              WHEN COALESCE(i.stock_quantity, 0) < COALESCE(i.minimum_stock_level, 0) THEN 'Low Stock'
              ELSE 'In Stock'
            END AS status
          FROM dbo.inventory i
          ${supplierJoinClause(suppliersTableExists)}
          ORDER BY i.medicine_id DESC
        `
      : "";

    const lowStockQuery = inventoryTableExists
      ? `
          SELECT TOP 5
            i.medicine_id AS id,
            i.medicine_name AS name,
            i.category,
            ${supplierColumnClause(suppliersTableExists)}
            COALESCE(i.stock_quantity, 0) AS stock,
            COALESCE(i.minimum_stock_level, 0) AS minimum,
            CAST(COALESCE(i.unit_price, 0) AS decimal(18, 2)) AS price,
            CONVERT(varchar(10), i.expiry_date, 23) AS expiryDate,
            CASE
              WHEN COALESCE(i.stock_quantity, 0) <= 0 THEN 'Out of Stock'
              ELSE 'Low Stock'
            END AS status
          FROM dbo.inventory i
          ${supplierJoinClause(suppliersTableExists)}
          WHERE COALESCE(i.stock_quantity, 0) <= COALESCE(i.minimum_stock_level, 0)
          ORDER BY COALESCE(i.stock_quantity, 0) ASC, i.medicine_id DESC
        `
      : "";

    if (recentInventoryQuery) {
      queryPromises.push(pool.request().query(recentInventoryQuery));
    } else {
      queryPromises.push(Promise.resolve(null));
    }

    if (lowStockQuery) {
      queryPromises.push(pool.request().query(lowStockQuery));
    } else {
      queryPromises.push(Promise.resolve(null));
    }

    // Execute all queries in parallel
    const [usersResult, inventoryResult, suppliersResult, recentInventoryResult, lowStockResult] = 
      await Promise.all(queryPromises);

    if (usersResult?.recordset) {
      summary.staffAccounts = toNumber(usersResult.recordset[0]?.staffAccounts);
      summary.activeStaff = toNumber(usersResult.recordset[0]?.activeStaff);
    }

    if (inventoryResult?.recordset) {
      summary.totalMedicines = toNumber(inventoryResult.recordset[0]?.totalMedicines);
      summary.lowStockMedicines = toNumber(inventoryResult.recordset[0]?.lowStockMedicines);
      summary.expiredMedicines = toNumber(inventoryResult.recordset[0]?.expiredMedicines);
      summary.inventoryValue = toNumber(inventoryResult.recordset[0]?.inventoryValue);
    }

    if (suppliersResult?.recordset) {
      summary.totalSuppliers = toNumber(suppliersResult.recordset[0]?.totalSuppliers);
    }

    const recentInventory: DashboardInventoryItem[] = 
      (recentInventoryResult?.recordset ?? []) as DashboardInventoryItem[];

    const lowStockItems: DashboardInventoryItem[] = 
      (lowStockResult?.recordset ?? []) as DashboardInventoryItem[];

    return res.status(200).json({
      summary,
      recentInventory,
      lowStockItems,
    });
  } catch (err: unknown) {
    console.error("/api/dashboard error", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to load dashboard data",
    });
  }
}
