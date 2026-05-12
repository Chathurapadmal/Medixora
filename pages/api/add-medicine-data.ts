import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "../../lib/db";

/**
 * GET /api/add-medicine-data
 * Returns suppliers, categories, and next auto-generated medicine code
 * in a single round-trip so the add_medicine page can load instantly.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const pool = await getConnection();

    // Run all three queries in parallel for speed
    const [supplierResult, categoryResult, codeResult] = await Promise.all([
      pool.request().query(`
        SELECT supplier_name AS name
        FROM suppliers
        ORDER BY supplier_name
      `),
      pool.request().query(`
        SELECT DISTINCT category AS name
        FROM inventory
        WHERE category IS NOT NULL
          AND LTRIM(RTRIM(category)) <> ''
        ORDER BY category
      `),
      pool.request().query(`
        SELECT MAX(TRY_CAST(RIGHT(item_code, 3) AS INT)) AS maxCode
        FROM inventory
        WHERE item_code LIKE 'MED-%'
      `),
    ]);

    const suppliers = (supplierResult.recordset ?? [])
      .map((row: Record<string, unknown>) => String(row.name ?? ""))
      .filter(Boolean);

    const categories = (categoryResult.recordset ?? [])
      .map((row: Record<string, unknown>) => String(row.name ?? ""))
      .filter(Boolean);

    const maxCode = Number(codeResult.recordset?.[0]?.maxCode ?? 0);
    const defaultCode = `MED-${String(maxCode + 1).padStart(3, "0")}`;

    res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60");
    return res.status(200).json({ suppliers, categories, defaultCode });
  } catch (err: any) {
    console.error("/api/add-medicine-data error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
