import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      const result = await pool.request().query(
        `SELECT
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
        ORDER BY mr.visit_date DESC`
      );

      return res.status(200).json(result.recordset || []);
    }

    if (req.method === "POST") {
      const {
        patientId,
        doctorId,
        visitDate,
        diagnosis,
        treatment,
        prescription,
        notes,
        status,
      } = req.body as Record<string, any>;

      const request = pool.request();

      request.input("patientId", sql.Int, patientId ? Number(patientId) : null);
      request.input("doctorId", sql.Int, doctorId ? Number(doctorId) : null);
      request.input("visitDate", sql.DateTime2, visitDate ? new Date(visitDate) : new Date());
      request.input("diagnosis", sql.NVarChar, diagnosis || null);
      request.input("treatment", sql.NVarChar, treatment || null);
      request.input("prescription", sql.NVarChar, prescription || null);
      request.input("notes", sql.NVarChar, notes || null);
      request.input("status", sql.NVarChar, status || "Completed");

      const insertQuery = `
        INSERT INTO dbo.medical_records
          (patient_id, doctor_id, visit_date, diagnosis, treatment, prescription, notes, status)
        VALUES
          (@patientId, @doctorId, @visitDate, @diagnosis, @treatment, @prescription, @notes, @status);

        SELECT SCOPE_IDENTITY() AS id;
      `;

      const result = await request.query(insertQuery);

      return res.status(201).json({
        insertedId: result.recordset?.[0]?.id ?? null,
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/medical-records error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}