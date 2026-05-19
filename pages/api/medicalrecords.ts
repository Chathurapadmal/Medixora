import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

type MedicalRecordResponse = {
  record_id?: number;
  patient_id?: number;
  patient_name?: string;
  doctor_id?: number;
  doctor_name?: string;
  visit_date?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  status?: string;
  created_at?: string;
};

type ResponseData =
  | MedicalRecordResponse[]
  | MedicalRecordResponse
  | { error: string }
  | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      // Get all medical records with patient and doctor names
      const result = await pool.request().query(`
        SELECT
          mr.record_id,
          mr.patient_id,
          p.patient_name,
          mr.doctor_id,
          d.doctor_name,
          CONVERT(varchar(19), mr.visit_date, 121) AS visit_date,
          mr.diagnosis,
          mr.treatment,
          mr.prescription,
          mr.notes,
          mr.status,
          CONVERT(varchar(19), mr.created_at, 121) AS created_at
        FROM dbo.medical_records mr
        LEFT JOIN dbo.patients p ON p.patient_id = mr.patient_id
        LEFT JOIN dbo.doctors d ON d.doctor_id = mr.doctor_id
        ORDER BY mr.visit_date DESC
      `);

      return res.status(200).json(result.recordset || []);
    }

    if (req.method === "POST") {
      // Create new medical record
      const { patient_id, doctor_id, diagnosis, treatment, prescription, notes } = req.body;

      if (!patient_id) {
        return res.status(400).json({ error: "Patient ID is required" });
      }

      const result = await pool
        .request()
        .input("patient_id", sql.Int, patient_id)
        .input("doctor_id", sql.Int, doctor_id || null)
        .input("diagnosis", sql.NVarChar(sql.MAX), diagnosis || null)
        .input("treatment", sql.NVarChar(sql.MAX), treatment || null)
        .input("prescription", sql.NVarChar(sql.MAX), prescription || null)
        .input("notes", sql.NVarChar(sql.MAX), notes || null)
        .query(`
          INSERT INTO dbo.medical_records (
            patient_id, doctor_id, diagnosis, treatment, prescription, notes
          )
          OUTPUT INSERTED.*
          VALUES (
            @patient_id, @doctor_id, @diagnosis, @treatment, @prescription, @notes
          )
        `);

      return res.status(201).json({
        message: "Medical record created successfully",
        record_id: result.recordset[0]?.record_id,
      } as any);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("/api/medicalrecords error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
