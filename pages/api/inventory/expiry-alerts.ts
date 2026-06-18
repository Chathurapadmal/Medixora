import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "../../../lib/db";

/**
 * GET /api/inventory/expiry-alerts
 * Returns inventory items that are expired or expiring within 30 days.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT
        i.medicine_id AS id,
        i.medicine_name AS name,
        i.category AS category,
        i.item_code AS batchNo,
        i.stock_quantity AS quantity,
        CONVERT(varchar(10), i.expiry_date, 23) AS expiryDate,
        CAST(i.unit_price AS decimal(18, 2)) AS price,
        i.stock_quantity AS stock,
        s.supplier_name AS supplier
      FROM inventory i
      LEFT JOIN suppliers s ON s.supplier_id = i.supplier_id
      WHERE i.expiry_date IS NOT NULL
        AND i.expiry_date < DATEADD(day, 30, CAST(GETDATE() AS date))
      ORDER BY i.expiry_date ASC, i.medicine_id DESC
    `);

    res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60");
    return res.status(200).json(result.recordset || []);
  } catch (err: any) {
    console.error("/api/inventory/expiry-alerts error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
