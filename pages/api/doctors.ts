import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

type DoctorResponse = {
  doctor_id?: number;
  doctor_name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  qualifications?: string;
  experience_years?: number;
  consultation_fee?: number;
  availability?: string;
  shift_start?: string;
  shift_end?: string;
  status?: string;
};

type ResponseData = DoctorResponse[] | DoctorResponse | { error: string } | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      // Get all doctors
      const result = await pool.request().query(`
        SELECT
          doctor_id,
          doctor_name,
          email,
          phone,
          specialization,
          qualifications,
          experience_years,
          consultation_fee,
          availability,
          shift_start,
          shift_end,
          status
        FROM dbo.doctors
        WHERE LOWER(status) = 'active' OR status IS NULL
        ORDER BY doctor_id DESC
      `);

      return res.status(200).json(result.recordset || []);
    }

    if (req.method === "POST") {
      // Add new doctor
      const {
        doctor_name,
        email,
        phone,
        specialization,
        qualifications,
        experience_years,
        consultation_fee,
        availability,
        shift_start,
        shift_end,
      } = req.body;

      if (!doctor_name) {
        return res.status(400).json({ error: "Doctor name is required" });
      }

      const result = await pool
        .request()
        .input("doctor_name", sql.NVarChar, doctor_name)
        .input("email", sql.NVarChar, email || null)
        .input("phone", sql.NVarChar, phone || null)
        .input("specialization", sql.NVarChar, specialization || null)
        .input("qualifications", sql.NVarChar, qualifications || null)
        .input("experience_years", sql.Int, experience_years ? Number(experience_years) : null)
        .input("consultation_fee", sql.Decimal(10, 2), consultation_fee ? Number(consultation_fee) : null)
        .input("availability", sql.NVarChar, availability || null)
        .input("shift_start", sql.NVarChar, shift_start || null)
        .input("shift_end", sql.NVarChar, shift_end || null)
        .query(`
          INSERT INTO dbo.doctors (
            doctor_name, email, phone, specialization, qualifications,
            experience_years, consultation_fee, availability, shift_start, shift_end, status
          )
          OUTPUT INSERTED.*
          VALUES (
            @doctor_name, @email, @phone, @specialization, @qualifications,
            @experience_years, @consultation_fee, @availability, @shift_start, @shift_end, 'active'
          )
        `);

      return res.status(201).json({
        message: "Doctor registered successfully",
        doctor_id: result.recordset[0]?.doctor_id,
      } as any);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("/api/doctors error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
