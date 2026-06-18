import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

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

    if (req.method === "GET") {
      const result = await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`
          SELECT
            mr.record_id AS id,
            mr.patient_id AS patientId,
            p.patient_name AS patientName,
            mr.doctor_id AS doctorId,
            d.doctor_name AS doctorName,
            mr.visit_date AS visitDate,
            mr.diagnosis,
            mr.treatment,
            mr.prescription,
            mr.notes,
            mr.status,
            mr.created_at AS createdAt
          FROM dbo.medical_records mr
          LEFT JOIN dbo.patients p ON p.patient_id = mr.patient_id
          LEFT JOIN dbo.doctors  d ON d.doctor_id  = mr.doctor_id
          WHERE mr.record_id = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Medical record not found" });
      }

      return res.status(200).json(result.recordset[0]);
    }

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

    res.setHeader("Allow", "GET, DELETE, PATCH");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("/api/medical-records/[id] error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
