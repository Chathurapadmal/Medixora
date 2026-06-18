import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

type AppointmentRow = {
  appointment_id: number;
  appointment_number: string;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  appointment_time: string;
  reason_for_visit: string;
  status: string;
  created_at: string;
};

type ResponseData =
  | AppointmentRow[]
  | AppointmentRow
  | { error: string }
  | { message: string; appointment_id: number };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const pool = await getConnection();

    /* ------------------------------------------------------------------ */
    /*  GET – list all appointments (with optional search & status filter) */
    /* ------------------------------------------------------------------ */
    if (req.method === "GET") {
      const { search = "", status = "", page = "1", limit = "20", doctorEmail = "" } = req.query;

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
      const offset = (pageNum - 1) * limitNum;

      const request = pool.request();
      request.input("search", sql.NVarChar, `%${search}%`);
      request.input("status", sql.NVarChar, status as string);
      request.input("offset", sql.Int, offset);
      request.input("limit", sql.Int, limitNum);
      request.input("doctorEmail", sql.NVarChar, doctorEmail as string);

      const result = await request.query(`
        SELECT
          a.appointment_id,
          a.appointment_number,
          a.patient_id,
          p.patient_name,
          a.doctor_id,
          d.doctor_name,
          ISNULL(d.specialization, '') AS specialization,
          CONVERT(varchar(10), a.appointment_date, 23)     AS appointment_date,
          a.appointment_time,
          ISNULL(a.reason_for_visit, '')                   AS reason_for_visit,
          a.status,
          CONVERT(varchar(19), a.created_at, 121)          AS created_at
        FROM dbo.appointments a
        LEFT JOIN dbo.patients p ON p.patient_id = a.patient_id
        LEFT JOIN dbo.doctors  d ON d.doctor_id  = a.doctor_id
        WHERE
          (@search = '%%'
            OR p.patient_name LIKE @search
            OR a.appointment_number LIKE @search)
          AND (@status = '' OR a.status = @status)
          AND (@doctorEmail = '' OR d.email = @doctorEmail)
        ORDER BY a.appointment_id DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

      // total count for pagination
      const countReq = pool.request();
      countReq.input("search", sql.NVarChar, `%${search}%`);
      countReq.input("status", sql.NVarChar, status as string);
      countReq.input("doctorEmail", sql.NVarChar, doctorEmail as string);
      const countResult = await countReq.query(`
        SELECT COUNT(1) AS total
        FROM dbo.appointments a
        LEFT JOIN dbo.patients p ON p.patient_id = a.patient_id
        LEFT JOIN dbo.doctors d ON d.doctor_id = a.doctor_id
        WHERE
          (@search = '%%'
            OR p.patient_name LIKE @search
            OR a.appointment_number LIKE @search)
          AND (@status = '' OR a.status = @status)
          AND (@doctorEmail = '' OR d.email = @doctorEmail)
      `);

      const total = countResult.recordset[0]?.total ?? 0;

      return res.status(200).json({
        data: result.recordset || [],
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      } as any);
    }

    /* ------------------------------------------------------------------ */
    /*  POST – create a new appointment                                    */
    /* ------------------------------------------------------------------ */
    if (req.method === "POST") {
      const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason_for_visit,
        status = "Scheduled",
      } = req.body;

      if (!patient_id) return res.status(400).json({ error: "patient_id: Please select a valid patient." });
      if (!doctor_id) return res.status(400).json({ error: "doctor_id: Please select a valid attending physician." });
      if (!appointment_date) return res.status(400).json({ error: "appointment_date: Please choose an appointment date." });
      if (!appointment_time) return res.status(400).json({ error: "appointment_time: Please choose an appointment time." });

      // Generate appointment number: APT-YYYYMMDD-XXXX
      const datePart = new Date(appointment_date)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      const rand = Math.floor(1000 + Math.random() * 9000);
      const appointmentNumber = `APT-${datePart}-${rand}`;

      const result = await pool
        .request()
        .input("appointment_number", sql.NVarChar, appointmentNumber)
        .input("patient_id", sql.Int, parseInt(patient_id))
        .input("doctor_id", sql.Int, parseInt(doctor_id))
        .input("appointment_date", sql.Date, new Date(appointment_date))
        .input("appointment_time", sql.NVarChar, appointment_time)
        .input("reason_for_visit", sql.NVarChar, reason_for_visit || null)
        .input("status", sql.NVarChar, status)
        .query(`
          INSERT INTO dbo.appointments (
            appointment_number, patient_id, doctor_id,
            appointment_date, appointment_time, reason_for_visit, status
          )
          OUTPUT INSERTED.appointment_id, INSERTED.appointment_number
          VALUES (
            @appointment_number, @patient_id, @doctor_id,
            @appointment_date, @appointment_time, @reason_for_visit, @status
          )
        `);

      return res.status(201).json({
        message: "Appointment booked successfully",
        appointment_id: result.recordset[0]?.appointment_id,
        appointment_number: result.recordset[0]?.appointment_number,
      } as any);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("/api/appointments error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
