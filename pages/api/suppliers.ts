import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = await getConnection();
    
    if (req.method === "GET") {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = "SELECT * FROM suppliers";
      let countQuery = "SELECT COUNT(*) as total FROM suppliers";

      if (search) {
        query += ` WHERE supplier_name LIKE '%${search}%' OR contact_person LIKE '%${search}%' OR category LIKE '%${search}%'`;
        countQuery += ` WHERE supplier_name LIKE '%${search}%' OR contact_person LIKE '%${search}%' OR category LIKE '%${search}%'`;
      }

      query += ` ORDER BY created_at DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

      const countResult = await pool.request().query(countQuery);
      const result = await pool.request().query(query);

      return res.status(200).json({
        data: result.recordset || [],
        total: countResult.recordset[0]?.total || 0,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    }

    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/suppliers error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
