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
            qualifications AS qualification,
            experience_years AS experience,
            CAST(consultation_fee AS decimal(18,2)) AS fee,
            availability,
            shift_start AS shiftStart,
            shift_end AS shiftEnd,
            status
          FROM doctors
          WHERE doctor_id = @id
        `);

      if (!result.recordset || result.recordset.length === 0) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      return res.status(200).json(result.recordset[0]);
    }

    if (req.method === "PUT") {
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

      const availabilityDays = Array.isArray(days) ? days.join(", ") : days || "";

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
      await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`DELETE FROM doctors WHERE doctor_id = @id;`);

      return res.status(200).json({ success: true, deletedId: id });
    }

    res.setHeader("Allow", "GET, PUT, DELETE");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/doctors/[id] error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
