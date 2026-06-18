import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'inventory'
    `);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
