import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      const { id } = req.query;

      if (id) {
        const result = await pool.request()
          .input("id", sql.Int, Number(id))
          .query(
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
            WHERE mr.record_id = @id`
          );

        if (result.recordset.length === 0) {
          return res.status(404).json({ error: "Record not found" });
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

    if (req.method === "PUT") {
      const {
        id,
        patientId,
        doctorId,
        visitDate,
        diagnosis,
        treatment,
        prescription,
        notes,
        status,
      } = req.body as Record<string, any>;

      if (!id) return res.status(400).json({ error: "Missing record ID" });

      const request = pool.request();
      request.input("id", sql.Int, Number(id));
      request.input("patientId", sql.Int, patientId ? Number(patientId) : null);
      request.input("doctorId", sql.Int, doctorId ? Number(doctorId) : null);
      request.input("visitDate", sql.DateTime2, visitDate ? new Date(visitDate) : new Date());
      request.input("diagnosis", sql.NVarChar, diagnosis || null);
      request.input("treatment", sql.NVarChar, treatment || null);
      request.input("prescription", sql.NVarChar, prescription || null);
      request.input("notes", sql.NVarChar, notes || null);
      request.input("status", sql.NVarChar, status || "Completed");

      const updateQuery = `
        UPDATE dbo.medical_records
        SET 
          patient_id = @patientId,
          doctor_id = @doctorId,
          visit_date = @visitDate,
          diagnosis = @diagnosis,
          treatment = @treatment,
          prescription = @prescription,
          notes = @notes,
          status = @status
        WHERE record_id = @id;
      `;

      await request.query(updateQuery);

      return res.status(200).json({ message: "Record updated successfully" });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing record ID" });

      const request = pool.request();
      request.input("id", sql.Int, Number(id));

      await request.query(`DELETE FROM dbo.medical_records WHERE record_id = @id`);

      return res.status(200).json({ message: "Record deleted successfully" });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/medical-records error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}