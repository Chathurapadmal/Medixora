import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      const { email } = req.query;

      let queryStr = `SELECT
          d.doctor_id AS id,
          d.doctor_name AS name,
          d.email,
          d.phone,
          d.specialization,
          d.qualifications,
          d.experience_years AS experienceYears,
          CAST(d.consultation_fee AS decimal(18,2)) AS consultationFee,
          d.availability,
          d.shift_start AS shiftStart,
          d.shift_end AS shiftEnd,
          d.room,
          d.status
        FROM doctors d`;

      const request = pool.request();
      
      if (email) {
        queryStr += ` WHERE d.email = @email`;
        request.input("email", sql.NVarChar, email);
      }

      queryStr += ` ORDER BY d.doctor_id DESC`;

      const result = await request.query(queryStr);

      return res.status(200).json(result.recordset || []);
    }

    if (req.method === "POST") {
      const {
        name,
        email,
        phone,
        specialization,
        qualification,
        experience,
        fee,
        days,
        shiftStart,
        shiftEnd,
        room,
        status,
        password,
      } = req.body as Record<string, any>;

      const availabilityDays = Array.isArray(days) ? days.join(", ") : "";

      const request = pool.request();

      request.input("name", sql.NVarChar, name || null);
      request.input("email", sql.NVarChar, email || null);
      request.input("phone", sql.NVarChar, phone || null);
      request.input("specialization", sql.NVarChar, specialization || null);
      request.input("qualification", sql.NVarChar, qualification || null);
      request.input("experience", sql.Int, Number(experience) || 0);
      request.input("fee", sql.Decimal(18, 2), fee ? Number(fee) : 0);
      request.input("availability", sql.NVarChar, availabilityDays || null);
      request.input("shiftStart", sql.NVarChar, shiftStart || null);
      request.input("shiftEnd", sql.NVarChar, shiftEnd || null);
      request.input("room", sql.NVarChar, room || null);
      request.input("status", sql.NVarChar, status || "Active");

      const insertQuery = `
        INSERT INTO doctors
          (
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
            room,
            status
          )
        VALUES
          (
            @name,
            @email,
            @phone,
            @specialization,
            @qualification,
            @experience,
            @fee,
            @availability,
            @shiftStart,
            @shiftEnd,
            @room,
            @status
          );

        SELECT SCOPE_IDENTITY() AS id;
      `;

      const result = await request.query(insertQuery);

      // Interconnect: Auto-create a user account for the doctor if email is provided
      if (email) {
        // Hash the provided password, or fallback to a default if not provided
        const plainPassword = password || "Password@123";
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        
        await pool.request()
          .input("username", sql.NVarChar, name || "Doctor User")
          .input("email", sql.NVarChar, email)
          .input("password_hash", sql.NVarChar, passwordHash)
          .input("role", sql.NVarChar, "Doctor")
          .input("status", sql.NVarChar, "active")
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = @email)
            BEGIN
              INSERT INTO dbo.users (username, email, password_hash, [role], status)
              VALUES (@username, @email, @password_hash, @role, @status)
            END
            ELSE
            BEGIN
              UPDATE dbo.users SET [role] = 'Doctor' WHERE email = @email
            END
          `);
      }

      return res.status(201).json({
        insertedId: result.recordset?.[0]?.id ?? null,
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/doctors error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}