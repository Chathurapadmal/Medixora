import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        user_id,
        username,
        email,
        [role],
        status,
        ISNULL(first_name, '') AS first_name,
        ISNULL(last_name,  '') AS last_name,
        ISNULL(avatar_url, '') AS avatar_url,
        FORMAT(created_at, 'MMM d, yyyy') AS joined_date
      FROM dbo.users
      ORDER BY user_id ASC
    `);

    return res.status(200).json({ success: true, staff: result.recordset });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "DB error";
    console.error("[settings/staff GET]", msg);
    return res.status(500).json({ message: msg });
  }
}
