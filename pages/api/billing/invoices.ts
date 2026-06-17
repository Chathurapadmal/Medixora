import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

export type Invoice = {
  invoice_id: number;
  invoice_number: string;
  patient_name: string;
  invoice_date: string;
  due_date: string | null;
  treatment_cost: number;
  medicine_cost: number;
  discount: number;
  total_amount: number;
  payment_method: string | null;
  status: "Pending" | "Paid" | "Overdue" | "Cancelled";
  notes: string | null;
  doctor_name: string | null;
};

export type CreateInvoiceBody = {
  patient_name: string;
  patient_id?: number;
  doctor_id?: number;
  due_date?: string;
  treatment_cost: number;
  medicine_cost: number;
  discount: number;
  payment_method?: string;
  notes?: string;
  status?: string;
};

async function ensureInvoiceTable(pool: Awaited<ReturnType<typeof getConnection>>) {
  await pool.request().query(`
    IF OBJECT_ID('dbo.invoices', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.invoices (
        invoice_id     INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        invoice_number NVARCHAR(30)      NOT NULL DEFAULT '',
        patient_id     INT               NULL,
        patient_name   NVARCHAR(255)     NOT NULL,
        doctor_id      INT               NULL,
        invoice_date   DATE              NOT NULL DEFAULT CAST(GETDATE() AS date),
        due_date       DATE              NULL,
        treatment_cost DECIMAL(18,2)     NOT NULL DEFAULT 0,
        medicine_cost  DECIMAL(18,2)     NOT NULL DEFAULT 0,
        discount       DECIMAL(18,2)     NOT NULL DEFAULT 0,
        total_amount   DECIMAL(18,2)     NOT NULL DEFAULT 0,
        payment_method NVARCHAR(50)      NULL,
        status         NVARCHAR(20)      NOT NULL DEFAULT 'Pending',
        notes          NVARCHAR(MAX)     NULL,
        created_by     INT               NULL,
        created_at     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END;
  `);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await getConnection();
    await ensureInvoiceTable(pool);

    /* ------------------------------------------------------------------ */
    /* GET  /api/billing/invoices?status=&search=&page=&limit=             */
    /* ------------------------------------------------------------------ */
    if (req.method === "GET") {
      const { status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const request = pool.request();
      request.input("limit", sql.Int, parseInt(limit));
      request.input("offset", sql.Int, offset);

      let where = "WHERE 1=1";
      if (status && status !== "all") {
        request.input("status", sql.NVarChar, status);
        where += " AND LOWER(i.status) = LOWER(@status)";
      }
      if (search) {
        request.input("search", sql.NVarChar, `%${search}%`);
        where += " AND (i.patient_name LIKE @search OR i.invoice_number LIKE @search)";
      }

      const [listResult, countResult, statsResult] = await Promise.all([
        request.query(`
          SELECT
            i.invoice_id,
            i.invoice_number,
            i.patient_name,
            CONVERT(varchar(12), i.invoice_date, 107) AS invoice_date,
            CONVERT(varchar(12), i.due_date, 107) AS due_date,
            CAST(i.treatment_cost AS decimal(18,2)) AS treatment_cost,
            CAST(i.medicine_cost  AS decimal(18,2)) AS medicine_cost,
            CAST(i.discount       AS decimal(18,2)) AS discount,
            CAST(i.total_amount   AS decimal(18,2)) AS total_amount,
            i.payment_method,
            i.status,
            i.notes,
            d.doctor_name
          FROM dbo.invoices i
          LEFT JOIN dbo.doctors d ON d.doctor_id = i.doctor_id
          ${where}
          ORDER BY i.invoice_id DESC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `),
        pool.request().query(`SELECT COUNT(1) AS total FROM dbo.invoices`),
        pool.request().query(`
          SELECT
            ISNULL(SUM(CASE WHEN CAST(invoice_date AS date) = CAST(GETDATE() AS date) AND status = 'Paid' THEN total_amount ELSE 0 END), 0) AS todays_collection,
            COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending_count,
            COUNT(CASE WHEN status = 'Overdue' THEN 1 END) AS overdue_count,
            ISNULL(AVG(CASE WHEN status = 'Paid' THEN total_amount END), 0) AS avg_invoice_value
          FROM dbo.invoices
        `),
      ]);

      return res.status(200).json({
        invoices: listResult.recordset as Invoice[],
        total: countResult.recordset[0]?.total ?? 0,
        stats: statsResult.recordset[0] ?? {},
      });
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/billing/invoices  – create a new invoice                  */
    /* ------------------------------------------------------------------ */
    if (req.method === "POST") {
      const body = req.body as CreateInvoiceBody;
      const {
        patient_name,
        patient_id,
        doctor_id,
        due_date,
        treatment_cost = 0,
        medicine_cost = 0,
        discount = 0,
        payment_method,
        notes,
        status = "Pending",
      } = body;

      if (!patient_name?.trim()) {
        return res.status(400).json({ error: "patient_name is required" });
      }

      const total = treatment_cost + medicine_cost - discount;

      const request = pool.request();
      request.input("patient_name",   sql.NVarChar(255), patient_name.trim());
      request.input("patient_id",     sql.Int, patient_id ?? null);
      request.input("doctor_id",      sql.Int, doctor_id ?? null);
      request.input("due_date",       sql.Date, due_date ?? null);
      request.input("treatment_cost", sql.Decimal(18, 2), treatment_cost);
      request.input("medicine_cost",  sql.Decimal(18, 2), medicine_cost);
      request.input("discount",       sql.Decimal(18, 2), discount);
      request.input("total_amount",   sql.Decimal(18, 2), total);
      request.input("payment_method", sql.NVarChar(50), payment_method ?? null);
      request.input("status",         sql.NVarChar(20), status);
      request.input("notes",          sql.NVarChar(sql.MAX), notes ?? null);

      const insertResult = await request.query(`
        INSERT INTO dbo.invoices
          (invoice_number, patient_name, patient_id, doctor_id, invoice_date, due_date,
           treatment_cost, medicine_cost, discount, total_amount, payment_method, status, notes)
        OUTPUT INSERTED.invoice_id
        VALUES (
          '',
          @patient_name, @patient_id, @doctor_id, CAST(GETDATE() AS date), @due_date,
          @treatment_cost, @medicine_cost, @discount, @total_amount, @payment_method, @status, @notes
        );
      `);

      // Update invoice_number using the real identity ID
      const newId: number = insertResult.recordset[0]?.invoice_id;
      await pool.request()
        .input("id", sql.Int, newId)
        .query(`
          UPDATE dbo.invoices
          SET invoice_number = CONCAT('INV-', YEAR(GETDATE()), '-', RIGHT('00000' + CAST(invoice_id AS VARCHAR), 5))
          WHERE invoice_id = @id
        `);

      // Fetch and return the created invoice
      const created = await pool.request()
        .input("id", sql.Int, newId)
        .query(`
          SELECT i.*, d.doctor_name
          FROM dbo.invoices i
          LEFT JOIN dbo.doctors d ON d.doctor_id = i.doctor_id
          WHERE i.invoice_id = @id
        `);

      return res.status(201).json({ invoice: created.recordset[0] });
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/billing/invoices  – update status                        */
    /* ------------------------------------------------------------------ */
    if (req.method === "PATCH") {
      const { invoice_id, status } = req.body as { invoice_id: number; status: string };
      if (!invoice_id || !status) {
        return res.status(400).json({ error: "invoice_id and status are required" });
      }

      await pool.request()
        .input("id",     sql.Int, invoice_id)
        .input("status", sql.NVarChar(20), status)
        .query(`
          UPDATE dbo.invoices
          SET status = @status, updated_at = SYSUTCDATETIME()
          WHERE invoice_id = @id
        `);

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (err: unknown) {
    console.error("/api/billing/invoices error", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
