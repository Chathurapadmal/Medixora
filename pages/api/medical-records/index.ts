import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();
    const { id } = req.query;

    if (req.method === "GET") {
      if (id) {
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
      } else {
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

    if (req.method === "DELETE") {
      if (!id) return res.status(400).json({ error: "Record ID is required" });
      await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`DELETE FROM dbo.medical_records WHERE record_id = @id`);

      return res.status(200).json({ message: "Record deleted successfully" });
    }

    if (req.method === "PATCH") {
      if (!id) return res.status(400).json({ error: "Record ID is required" });
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

    res.setHeader("Allow", "GET, POST, DELETE, PATCH");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/medical-records error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}