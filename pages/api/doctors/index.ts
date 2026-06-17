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
          d.status
        FROM doctors d
        ORDER BY d.doctor_id DESC`
      );

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
        status,
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
            @status
          );

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
        status,
      } = req.body as Record<string, any>;

      if (!id) {
        return res.status(400).json({ error: "Doctor ID is required" });
      }

      const availabilityDays = Array.isArray(days) ? days.join(", ") : (days || "");

      const request = pool.request();

      request.input("id", sql.Int, Number(id));
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
      request.input("status", sql.NVarChar, status || "Active");

      const updateQuery = `
        UPDATE doctors
        SET
          doctor_name = @name,
          email = @email,
          phone = @phone,
          specialization = @specialization,
          qualifications = @qualification,
          experience_years = @experience,
          consultation_fee = @fee,
          availability = @availability,
          shift_start = @shiftStart,
          shift_end = @shiftEnd,
          status = @status
        WHERE doctor_id = @id;
      `;

      await request.query(updateQuery);

      return res.status(200).json({ success: true, updatedId: id });
    }

    if (req.method === "DELETE") {
      const id = req.body.id || req.query.id;
      if (!id) {
        return res.status(400).json({ error: "Doctor ID is required" });
      }

      await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`DELETE FROM doctors WHERE doctor_id = @id;`);

      return res.status(200).json({ success: true, deletedId: id });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/doctors error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}