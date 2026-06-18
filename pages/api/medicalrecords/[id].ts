import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Record ID is required" });
  }

  try {
    const pool = await getConnection();

    if (req.method === "DELETE") {
      await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`DELETE FROM dbo.medical_records WHERE record_id = @id`);

      return res.status(200).json({ message: "Record deleted successfully" });
    }

    if (req.method === "PATCH") {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      await pool.request()
        .input("id", sql.Int, Number(id))
        .input("status", sql.NVarChar(50), status)
        .query(`
          UPDATE dbo.medical_records 
          SET status = @status, updated_at = SYSUTCDATETIME()
          WHERE record_id = @id
        `);

      return res.status(200).json({ message: "Status updated successfully" });
    }

    res.setHeader("Allow", "DELETE, PATCH");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("/api/medicalrecords/[id] error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
