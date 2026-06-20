import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();
    const { id, email } = req.query;

    if (req.method === "GET") {
      if (id) {
        const result = await pool.request()
          .input("id", sql.Int, Number(id))
          .query(`
            SELECT
              doctor_id AS id,
              doctor_name AS name,
              email,
              phone,
              specialization,
              qualifications,
              experience_years AS experience,
              CAST(consultation_fee AS decimal(18,2)) AS fee,
              availability,
              shift_start AS shiftStart,
              shift_end AS shiftEnd,
              room,
              status
            FROM doctors
            WHERE doctor_id = @id
          `);
        
        if (result.recordset.length === 0) {
          return res.status(404).json({ error: "Doctor not found" });
        }

        return res.status(200).json(result.recordset[0]);
      } else {
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
    }

    if (req.method === "POST") {
      const {
        name,
        email: bodyEmail,
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
      request.input("email", sql.NVarChar, bodyEmail || null);
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

      if (bodyEmail) {
        const plainPassword = password || "Password@123";
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        
        await pool.request()
          .input("username", sql.NVarChar, name || "Doctor User")
          .input("email", sql.NVarChar, bodyEmail)
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

    if (req.method === "PATCH") {
      if (!id) return res.status(400).json({ error: "Doctor ID is required" });
      const {
        name,
        email: bodyEmail,
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
      } = req.body;

      const availabilityDays = Array.isArray(days) ? days.join(", ") : days;

      const request = pool.request();
      request.input("id", sql.Int, Number(id));
      request.input("name", sql.NVarChar, name || null);
      request.input("email", sql.NVarChar, bodyEmail || null);
      request.input("phone", sql.NVarChar, phone || null);
      request.input("specialization", sql.NVarChar, specialization || null);
      request.input("qualification", sql.NVarChar, qualification || null);
      request.input("experience", sql.Int, Number(experience) || 0);
      request.input("fee", sql.Decimal(18, 2), fee ? Number(fee) : 0);
      request.input("availability", sql.NVarChar, availabilityDays || null);
      request.input("shiftStart", sql.NVarChar, shiftStart || null);
      request.input("shiftEnd", sql.NVarChar, shiftEnd || null);
      request.input("room", sql.NVarChar, room || null);
      request.input("status", sql.NVarChar, status || null);

      const oldEmailResult = await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`SELECT email FROM doctors WHERE doctor_id = @id`);
      const oldEmail = oldEmailResult.recordset[0]?.email;

      await request.query(`
        UPDATE doctors
        SET
          doctor_name = ISNULL(@name, doctor_name),
          email = ISNULL(@email, email),
          phone = ISNULL(@phone, phone),
          specialization = ISNULL(@specialization, specialization),
          qualifications = ISNULL(@qualification, qualifications),
          experience_years = ISNULL(@experience, experience_years),
          consultation_fee = ISNULL(@fee, consultation_fee),
          availability = ISNULL(@availability, availability),
          shift_start = ISNULL(@shiftStart, shift_start),
          shift_end = ISNULL(@shiftEnd, shift_end),
          room = ISNULL(@room, room),
          status = ISNULL(@status, status)
        WHERE doctor_id = @id
      `);

      if (oldEmail) {
        let passwordHash = null;
        if (password && password.trim() !== "") {
          passwordHash = await bcrypt.hash(password, 10);
        }

        await pool.request()
          .input("oldEmail", sql.NVarChar, oldEmail)
          .input("newEmail", sql.NVarChar, bodyEmail || oldEmail)
          .input("newName", sql.NVarChar, name || null)
          .input("newStatus", sql.NVarChar, status || null)
          .input("passwordHash", sql.NVarChar, passwordHash)
          .query(`
            UPDATE dbo.users
            SET 
              email = @newEmail,
              username = ISNULL(@newName, username),
              status = ISNULL(@newStatus, status),
              password_hash = ISNULL(@passwordHash, password_hash)
            WHERE email = @oldEmail AND [role] = 'Doctor'
          `);
      }

      return res.status(200).json({ message: "Doctor updated successfully" });
    }

    if (req.method === "DELETE") {
      if (!id) return res.status(400).json({ error: "Doctor ID is required" });
      const docResult = await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`SELECT email FROM doctors WHERE doctor_id = @id`);
      const docEmail = docResult.recordset[0]?.email;

      await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`DELETE FROM doctors WHERE doctor_id = @id`);

      if (docEmail) {
        await pool.request()
          .input("email", sql.NVarChar, docEmail)
          .query(`DELETE FROM dbo.users WHERE email = @email AND [role] = 'Doctor'`);
      }

      return res.status(200).json({ message: "Doctor deleted successfully" });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/doctors error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}