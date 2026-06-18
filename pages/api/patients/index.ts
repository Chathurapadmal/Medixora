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
          p.patient_id        AS id,
          p.patient_name      AS name,
          p.email,
          p.phone,
          p.date_of_birth     AS dateOfBirth,
          p.gender,
          p.address,
          p.emergency_contact AS emergencyContact,
          p.emergency_phone   AS emergencyPhone,
          p.blood_type        AS bloodGroup,
          p.allergies,
          p.status,
          p.created_at        AS createdAt
        FROM patients p
        ORDER BY p.patient_id DESC`
      );

      return res.status(200).json(result.recordset || []);
    }

    if (req.method === "POST") {
      const {
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
        emergencyPhone,
        bloodGroup,
        allergies,
        medicalNotes,
        status,
      } = req.body as Record<string, any>;

      const request = pool.request();

      request.input("name",             sql.NVarChar,  name             || null);
      request.input("email",            sql.NVarChar,  email            || null);
      request.input("phone",            sql.NVarChar,  phone            || null);
      request.input("dateOfBirth",      sql.Date,      dateOfBirth      || null);
      request.input("gender",           sql.NVarChar,  gender           || null);
      request.input("address",          sql.NVarChar,  address          || null);
      request.input("emergencyContact", sql.NVarChar,  emergencyContact || null);
      request.input("emergencyPhone",   sql.NVarChar,  emergencyPhone   || null);
      request.input("bloodGroup",       sql.NVarChar,  bloodGroup       || null);
      request.input("allergies",        sql.NVarChar,  allergies        || null);
      request.input("status",           sql.NVarChar,  status           || "Active");

      const insertQuery = `
        INSERT INTO patients
          (
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
            status
          )
        VALUES
          (
            @name,
            @email,
            @phone,
            @dateOfBirth,
            @gender,
            @address,
            @emergencyContact,
            @emergencyPhone,
            @bloodGroup,
            @allergies,
            @status
          );

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
    console.error("/api/patients error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}