import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Doctor ID is required" });
  }

  try {
    const pool = await getConnection();

    if (req.method === "GET") {
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
    }

    if (req.method === "PATCH") {
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
      } = req.body;

      const availabilityDays = Array.isArray(days) ? days.join(", ") : days;

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
      request.input("room", sql.NVarChar, room || null);
      request.input("status", sql.NVarChar, status || null);

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

      return res.status(200).json({ message: "Doctor updated successfully" });
    }

    if (req.method === "DELETE") {
      await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`DELETE FROM doctors WHERE doctor_id = @id`);

      return res.status(200).json({ message: "Doctor deleted successfully" });
    }

    res.setHeader("Allow", "GET, PATCH, DELETE");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/doctors/[id] error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
