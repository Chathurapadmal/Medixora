import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

type ResponseData = Record<string, unknown> | { error: string } | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const id = parseInt(req.query.id as string);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid appointment ID" });
  }

  try {
    const pool = await getConnection();

    /* ------------------------------------------------------------------ */
    /*  GET – single appointment                                           */
    /* ------------------------------------------------------------------ */
    if (req.method === "GET") {
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(`
          SELECT
            a.appointment_id,
            a.appointment_number,
            a.patient_id,
            p.patient_name,
            a.doctor_id,
            d.doctor_name,
            ISNULL(d.specialization, '') AS specialization,
            ISNULL(d.shift_start, '')    AS shift_start,
            ISNULL(d.shift_end, '')      AS shift_end,
            d.room,
            CAST(d.consultation_fee AS decimal(18,2)) AS consultationFee,
            CONVERT(varchar(10), a.appointment_date, 23) AS appointment_date,
            a.appointment_time,
            ISNULL(a.reason_for_visit, '') AS reason_for_visit,
            a.status,
            CONVERT(varchar(19), a.created_at, 121) AS created_at,
            CONVERT(varchar(19), a.updated_at, 121) AS updated_at
          FROM dbo.appointments a
          LEFT JOIN dbo.patients p ON p.patient_id = a.patient_id
          LEFT JOIN dbo.doctors  d ON d.doctor_id  = a.doctor_id
          WHERE a.appointment_id = @id
        `);

      if (!result.recordset.length) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      return res.status(200).json(result.recordset[0]);
    }

    /* ------------------------------------------------------------------ */
    /*  PUT – update appointment                                           */
    /* ------------------------------------------------------------------ */
    if (req.method === "PUT") {
      const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason_for_visit,
        status,
      } = req.body;

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("patient_id", sql.Int, patient_id ? parseInt(patient_id) : null)
        .input("doctor_id", sql.Int, doctor_id ? parseInt(doctor_id) : null)
        .input("appointment_date", sql.Date, appointment_date ? new Date(appointment_date) : null)
        .input("appointment_time", sql.NVarChar, appointment_time || null)
        .input("reason_for_visit", sql.NVarChar, reason_for_visit || null)
        .input("status", sql.NVarChar, status || null)
        .query(`
          UPDATE dbo.appointments SET
            patient_id        = COALESCE(@patient_id,        patient_id),
            doctor_id         = COALESCE(@doctor_id,         doctor_id),
            appointment_date  = COALESCE(@appointment_date,  appointment_date),
            appointment_time  = COALESCE(@appointment_time,  appointment_time),
            reason_for_visit  = COALESCE(@reason_for_visit,  reason_for_visit),
            status            = COALESCE(@status,            status),
            updated_at        = SYSUTCDATETIME()
          WHERE appointment_id = @id
        `);

      return res.status(200).json({ message: "Appointment updated successfully" });
    }

    /* ------------------------------------------------------------------ */
    /*  DELETE – remove appointment                                        */
    /* ------------------------------------------------------------------ */
    if (req.method === "DELETE") {
      await pool
        .request()
        .input("id", sql.Int, id)
        .query(`DELETE FROM dbo.appointments WHERE appointment_id = @id`);

      return res.status(200).json({ message: "Appointment deleted successfully" });
    }

    res.setHeader("Allow", "GET, PUT, DELETE");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error(`/api/appointments/${id} error`, err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
