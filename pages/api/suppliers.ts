import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = await getConnection();
    if (req.method === "GET") {
      const result = await pool
        .request()
        .query(`SELECT supplier_id AS id, supplier_name AS name FROM suppliers ORDER BY supplier_name`);
      return res.status(200).json(result.recordset || []);
    }

    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/suppliers error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
