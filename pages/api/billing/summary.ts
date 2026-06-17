import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

type BillingSummaryResponse = {
  todaysCollections: number;
  avgBillValue: number;
};

const candidateTableNames = [
  "bills",
  "invoices",
  "billing",
  "billing_records",
  "payments",
  "patient_bills",
  "sales",
];

const amountColumns = [
  "total_amount",
  "grand_total",
  "bill_amount",
  "amount_due",
  "amount",
  "total",
  "net_total",
];

const dateColumns = [
  "created_at",
  "created_on",
  "date",
  "bill_date",
  "invoice_date",
  "paid_at",
  "transaction_date",
];

async function tableExists(pool: Awaited<ReturnType<typeof getConnection>>, tableName: string) {
  const result = await pool
    .request()
    .input("tableName", sql.NVarChar, tableName)
    .query(`
      SELECT CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = @tableName
      ) THEN 1 ELSE 0 END AS existsFlag
    `);

  return Number(result.recordset?.[0]?.existsFlag ?? 0) === 1;
}

async function findBillingTable(pool: Awaited<ReturnType<typeof getConnection>>) {
  for (const name of candidateTableNames) {
    if (await tableExists(pool, name)) {
      return name;
    }
  }

  const result = await pool.request().query(`
    SELECT TOP 1 TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo'
      AND (TABLE_NAME LIKE '%bill%' OR TABLE_NAME LIKE '%invoice%')
      AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `);

  return result.recordset?.[0]?.TABLE_NAME ?? null;
}

async function findColumn(pool: Awaited<ReturnType<typeof getConnection>>, tableName: string, candidates: string[]) {
  const request = pool.request().input("tableName", sql.NVarChar, tableName);
  candidates.forEach((name, index) => request.input(`col${index}`, sql.NVarChar, name));

  const values = candidates.map((_, index) => `@col${index}`).join(", ");
  const query = `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = @tableName
      AND COLUMN_NAME IN (${values})
    ORDER BY CHARINDEX(COLUMN_NAME, '${candidates.join(",")}')
  `;

  const result = await request.query(query);
  return result.recordset?.[0]?.COLUMN_NAME ?? null;
}

function escapeIdentifier(name: string) {
  return `[${name.replace(/]/g, "]]" )}]`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BillingSummaryResponse | { error: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const pool = await getConnection();
    const billingTable = await findBillingTable(pool);

    if (!billingTable) {
      return res.status(200).json({ todaysCollections: 0, avgBillValue: 0 });
    }

    const amountColumn = await findColumn(pool, billingTable, amountColumns);
    const dateColumn = await findColumn(pool, billingTable, dateColumns);

    if (!amountColumn) {
      return res.status(200).json({ todaysCollections: 0, avgBillValue: 0 });
    }

    const amountIdentifier = escapeIdentifier(amountColumn);
    const tableIdentifier = escapeIdentifier(billingTable);
    const avgQuery = `CAST(ISNULL(AVG(TRY_CAST(${amountIdentifier} AS DECIMAL(18, 2))), 0) AS DECIMAL(18, 2)) AS avgBillValue`;
    const todayQuery = dateColumn
      ? `CAST(ISNULL(SUM(CASE WHEN CONVERT(date, ${escapeIdentifier(dateColumn)}) = CAST(GETDATE() AS date) THEN TRY_CAST(${amountIdentifier} AS DECIMAL(18, 2)) ELSE 0 END), 0) AS DECIMAL(18, 2)) AS todaysCollections`
      : `0 AS todaysCollections`;

    const query = `
      SELECT
        ${todayQuery},
        ${avgQuery}
      FROM dbo.${tableIdentifier}
    `;

    const result = await pool.request().query(query);
    const record = result.recordset?.[0] ?? { todaysCollections: 0, avgBillValue: 0 };

    return res.status(200).json({
      todaysCollections: Number(record.todaysCollections ?? 0),
      avgBillValue: Number(record.avgBillValue ?? 0),
    });
  } catch (error: unknown) {
    console.error("/api/billing/summary error", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to load billing summary",
    });
  }
}
