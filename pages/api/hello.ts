import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      IF COL_LENGTH('dbo.doctors', 'room') IS NULL
      BEGIN
        ALTER TABLE dbo.doctors ADD room NVARCHAR(50) NULL;
        SELECT 'Added room column' AS status;
      END
      ELSE
      BEGIN
        SELECT 'Column already exists' AS status;
      END
    `);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
