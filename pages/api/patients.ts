import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

type PatientResponse = {
  patient_id?: number;
  patient_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  allergies?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type ResponseData = PatientResponse[] | PatientResponse | { error: string } | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      // Get all patients
      const result = await pool.request().query(`
        SELECT
          patient_id,
          patient_name,
          email,
          phone,
          CONVERT(varchar(10), date_of_birth, 23) AS date_of_birth,
          gender,
          address,
          emergency_contact,
          emergency_phone,
          blood_type,
          allergies,
          status,
          CONVERT(varchar(19), created_at, 121) AS created_at,
          CONVERT(varchar(19), updated_at, 121) AS updated_at
        FROM dbo.patients
        ORDER BY patient_id DESC
      `);

      return res.status(200).json(result.recordset || []);
    }

    if (req.method === "POST") {
      // Add new patient
      const {
        patient_name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        emergency_contact,
        emergency_phone,
        blood_type,
        allergies,
      } = req.body;

      if (!patient_name) {
        return res.status(400).json({ error: "Patient name is required" });
      }

      const result = await pool
        .request()
        .input("patient_name", sql.NVarChar, patient_name)
        .input("email", sql.NVarChar, email || null)
        .input("phone", sql.NVarChar, phone || null)
        .input("date_of_birth", sql.Date, date_of_birth ? new Date(date_of_birth) : null)
        .input("gender", sql.NVarChar, gender || null)
        .input("address", sql.NVarChar, address || null)
        .input("emergency_contact", sql.NVarChar, emergency_contact || null)
        .input("emergency_phone", sql.NVarChar, emergency_phone || null)
        .input("blood_type", sql.NVarChar, blood_type || null)
        .input("allergies", sql.NVarChar, allergies || null)
        .query(`
          INSERT INTO dbo.patients (
            patient_name, email, phone, date_of_birth, gender, address,
            emergency_contact, emergency_phone, blood_type, allergies
          )
          OUTPUT INSERTED.*
          VALUES (
            @patient_name, @email, @phone, @date_of_birth, @gender, @address,
            @emergency_contact, @emergency_phone, @blood_type, @allergies
          )
        `);

      return res.status(201).json({
        message: "Patient registered successfully",
        patient_id: result.recordset[0]?.patient_id,
      } as any);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("/api/patients error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
