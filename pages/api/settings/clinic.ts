import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

const DEFAULT_CLINIC: Record<string, string> = {
  clinic_name:      "MediStock General Hospital",
  registration_id:  "MED-8892-NY",
  phone:            "+1 (555) 123-4567",
  email:            "contact@medistock-hospital.com",
  timezone:         "(UTC-05:00) Eastern Time",
  language:         "English (US)",
  address:          "100 Healthcare Ave, Medical District, NY 10001",
  general_supplies_threshold: "20",
  critical_med_threshold:     "50",
  surgical_equip_threshold:   "10",
};

async function ensureClinicTable(pool: Awaited<ReturnType<typeof getConnection>>) {
  await pool.request().query(`
    IF OBJECT_ID('dbo.clinic_settings', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.clinic_settings (
        setting_key   NVARCHAR(100) NOT NULL PRIMARY KEY,
        setting_value NVARCHAR(MAX) NULL,
        updated_at    DATETIME2     NOT NULL CONSTRAINT DF_clinic_settings_uat DEFAULT SYSUTCDATETIME()
      );
    END;
  `);

  // Seed defaults for any missing keys
  for (const [k, v] of Object.entries(DEFAULT_CLINIC)) {
    await pool.request()
      .input("k", sql.NVarChar(100), k)
      .input("v", sql.NVarChar(sql.MAX), v)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.clinic_settings WHERE setting_key = @k)
          INSERT INTO dbo.clinic_settings (setting_key, setting_value) VALUES (@k, @v);
      `);
  }
}

function rowsToObj(rows: { setting_key: string; setting_value: string }[]) {
  return Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value ?? ""]));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const pool = await getConnection();
      await ensureClinicTable(pool);

      const result = await pool
        .request()
        .query(`SELECT setting_key, setting_value FROM dbo.clinic_settings`);

      const clinic = rowsToObj(result.recordset);
      return res.status(200).json({ success: true, clinic });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "DB error";
      console.error("[settings/clinic GET]", msg);
      return res.status(500).json({ message: msg });
    }
  }

  // ── PUT ──────────────────────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const updates = req.body as Record<string, string>;

    try {
      const pool = await getConnection();
      await ensureClinicTable(pool);

      for (const [k, v] of Object.entries(updates)) {
        await pool.request()
          .input("k", sql.NVarChar(100), k)
          .input("v", sql.NVarChar(sql.MAX), String(v ?? ""))
          .query(`
            MERGE dbo.clinic_settings AS target
            USING (SELECT @k AS setting_key, @v AS setting_value) AS src
              ON target.setting_key = src.setting_key
            WHEN MATCHED THEN
              UPDATE SET setting_value = src.setting_value, updated_at = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN
              INSERT (setting_key, setting_value) VALUES (src.setting_key, src.setting_value);
          `);
      }

      return res.status(200).json({ success: true, message: "Clinic settings updated" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "DB error";
      console.error("[settings/clinic PUT]", msg);
      return res.status(500).json({ message: msg });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
