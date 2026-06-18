import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

// Idempotently ensure all profile columns exist on dbo.users
async function ensureColumns(pool: Awaited<ReturnType<typeof getConnection>>) {
  const columns = [
    "first_name NVARCHAR(100) NULL",
    "last_name  NVARCHAR(100) NULL",
    "phone      NVARCHAR(50)  NULL",
    "department NVARCHAR(255) NULL",
    "specialization NVARCHAR(255) NULL",
    "license_no     NVARCHAR(100) NULL",
    "ward       NVARCHAR(255) NULL",
    "shift      NVARCHAR(100) NULL",
    "nurse_station  NVARCHAR(255) NULL",
  ];

  for (const col of columns) {
    const colName = col.split(" ")[0];
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('dbo.users') AND name = '${colName}'
      )
      ALTER TABLE dbo.users ADD ${col};
    `);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });

    try {
      const pool = await getConnection();
      await ensureColumns(pool);

      const result = await pool
        .request()
        .input("userId", sql.Int, Number(userId))
        .query(`
          SELECT
            user_id, username, email, [role], status,
            ISNULL(first_name, '') AS first_name,
            ISNULL(last_name,  '') AS last_name,
            ISNULL(phone,      '') AS phone,
            ISNULL(department, '') AS department,
            ISNULL(specialization, '') AS specialization,
            ISNULL(license_no, '') AS license_no,
            ISNULL(ward,       '') AS ward,
            ISNULL(shift,      '') AS shift,
            ISNULL(nurse_station,'') AS nurse_station,
            ISNULL(avatar_url, '') AS avatar_url
          FROM dbo.users
          WHERE user_id = @userId
        `);

      if (!result.recordset.length) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ success: true, profile: result.recordset[0] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "DB error";
      console.error("[settings/profile GET]", msg);
      return res.status(500).json({ message: msg });
    }
  }

  // ── PUT ──────────────────────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const {
      userId,
      firstName, lastName, phone,
      email, username,
      department, specialization, licenseNo,
      ward, shift, nurseStation,
    } = req.body as Record<string, string>;

    if (!userId) return res.status(400).json({ message: "userId required" });

    try {
      const pool = await getConnection();
      await ensureColumns(pool);

      await pool
        .request()
        .input("userId",      sql.Int,           Number(userId))
        .input("firstName",   sql.NVarChar(100), firstName   ?? "")
        .input("lastName",    sql.NVarChar(100), lastName    ?? "")
        .input("phone",       sql.NVarChar(50),  phone       ?? "")
        .input("email",       sql.NVarChar(255), email       ?? "")
        .input("username",    sql.NVarChar(255), username    ?? "")
        .input("department",  sql.NVarChar(255), department  ?? "")
        .input("specialization", sql.NVarChar(255), specialization ?? "")
        .input("licenseNo",   sql.NVarChar(100), licenseNo   ?? "")
        .input("ward",        sql.NVarChar(255), ward        ?? "")
        .input("shift",       sql.NVarChar(100), shift       ?? "")
        .input("nurseStation",sql.NVarChar(255), nurseStation ?? "")
        .query(`
          UPDATE dbo.users SET
            first_name     = @firstName,
            last_name      = @lastName,
            phone          = @phone,
            email          = @email,
            username       = @username,
            department     = @department,
            specialization = @specialization,
            license_no     = @licenseNo,
            ward           = @ward,
            shift          = @shift,
            nurse_station  = @nurseStation
          WHERE user_id = @userId
        `);

      return res.status(200).json({ success: true, message: "Profile updated" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "DB error";
      console.error("[settings/profile PUT]", msg);
      return res.status(500).json({ message: msg });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
