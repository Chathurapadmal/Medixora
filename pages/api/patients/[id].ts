import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = parseInt(req.query.id as string, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid patient ID" });
  }

  try {
    const pool = await getConnection();

    /* ── GET single patient ── */
    if (req.method === "GET") {
      const request = pool.request();
      request.input("id", sql.Int, id);

      const result = await request.query(`
        SELECT
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
        WHERE p.patient_id = @id
      `);

      const patient = result.recordset?.[0];
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      return res.status(200).json(patient);
    }

    /* ── DELETE patient ── */
    if (req.method === "DELETE") {
      const request = pool.request();
      request.input("id", sql.Int, id);

      await request.query(`DELETE FROM patients WHERE patient_id = @id`);

      return res.status(200).json({ deleted: true });
    }

    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error(`/api/patients/${id} error`, err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}