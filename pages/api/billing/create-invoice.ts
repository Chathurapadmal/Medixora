import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export type InvoiceItem = {
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type CreateFullInvoiceBody = {
  patient_id?: number;
  patient_name: string;
  doctor_id?: number;
  due_date?: string;
  treatment_cost?: number;
  discount?: number;
  payment_method?: string;
  notes?: string;
  status?: string;
  items: InvoiceItem[];
};

/* ------------------------------------------------------------------ */
/*  Ensure invoice_items table exists                                   */
/* ------------------------------------------------------------------ */
async function ensureTables(pool: Awaited<ReturnType<typeof getConnection>>) {
  // invoices table
  await pool.request().query(`
    IF OBJECT_ID('dbo.invoices', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.invoices (
        invoice_id     INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        invoice_number NVARCHAR(30)  NOT NULL DEFAULT '',
        patient_id     INT           NULL,
        patient_name   NVARCHAR(255) NOT NULL,
        doctor_id      INT           NULL,
        invoice_date   DATE          NOT NULL DEFAULT CAST(GETDATE() AS date),
        due_date       DATE          NULL,
        treatment_cost DECIMAL(18,2) NOT NULL DEFAULT 0,
        medicine_cost  DECIMAL(18,2) NOT NULL DEFAULT 0,
        discount       DECIMAL(18,2) NOT NULL DEFAULT 0,
        total_amount   DECIMAL(18,2) NOT NULL DEFAULT 0,
        payment_method NVARCHAR(50)  NULL,
        status         NVARCHAR(20)  NOT NULL DEFAULT 'Pending',
        notes          NVARCHAR(MAX) NULL,
        created_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END;
  `);

  // invoice_items table
  await pool.request().query(`
    IF OBJECT_ID('dbo.invoice_items', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.invoice_items (
        item_id        INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        invoice_id     INT           NOT NULL,
        description    NVARCHAR(255) NOT NULL,
        item_type      NVARCHAR(50)  NULL,
        quantity       INT           NOT NULL DEFAULT 1,
        unit_price     DECIMAL(18,2) NOT NULL DEFAULT 0,
        CONSTRAINT FK_invoice_items_invoice
          FOREIGN KEY (invoice_id) REFERENCES dbo.invoices(invoice_id) ON DELETE CASCADE
      );
    END;
  `);
}

/* ------------------------------------------------------------------ */
/*  Handler                                                             */
/* ------------------------------------------------------------------ */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const pool = await getConnection();
    await ensureTables(pool);

    const {
      patient_id,
      patient_name,
      doctor_id,
      due_date,
      treatment_cost = 0,
      discount = 0,
      payment_method,
      notes,
      status = "Pending",
      items = [],
    } = req.body as CreateFullInvoiceBody;

    if (!patient_name?.trim()) {
      return res.status(400).json({ error: "patient_name is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one medicine item is required" });
    }

    // Validate stock for each item
    for (const item of items) {
      if (!item.medicine_id || item.quantity < 1) {
        return res.status(400).json({ error: "Each item needs a valid medicine_id and quantity ≥ 1" });
      }
      const stockCheck = await pool
        .request()
        .input("mid", sql.Int, item.medicine_id)
        .query("SELECT stock_quantity FROM dbo.inventory WHERE medicine_id = @mid");

      const available = stockCheck.recordset[0]?.stock_quantity ?? 0;
      if (available < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${item.medicine_name}": available ${available}, requested ${item.quantity}`,
        });
      }
    }

    // Calculate medicine cost from items
    const medicine_cost = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const total_amount = Number(treatment_cost) + medicine_cost - Number(discount);

    /* ── 1. Insert invoice ── */
    const invReq = pool.request();
    invReq.input("patient_name",   sql.NVarChar(255), patient_name.trim());
    invReq.input("patient_id",     sql.Int,           patient_id   ?? null);
    invReq.input("doctor_id",      sql.Int,           doctor_id    ?? null);
    invReq.input("due_date",       sql.Date,          due_date ? new Date(due_date) : null);
    invReq.input("treatment_cost", sql.Decimal(18,2), Number(treatment_cost));
    invReq.input("medicine_cost",  sql.Decimal(18,2), medicine_cost);
    invReq.input("discount",       sql.Decimal(18,2), Number(discount));
    invReq.input("total_amount",   sql.Decimal(18,2), total_amount);
    invReq.input("payment_method", sql.NVarChar(50),  payment_method ?? null);
    invReq.input("status",         sql.NVarChar(20),  status);
    invReq.input("notes",          sql.NVarChar(sql.MAX), notes ?? null);

    const insertResult = await invReq.query(`
      INSERT INTO dbo.invoices
        (invoice_number, patient_name, patient_id, doctor_id, invoice_date, due_date,
         treatment_cost, medicine_cost, discount, total_amount, payment_method, status, notes)
      VALUES (
        '', @patient_name, @patient_id, @doctor_id, CAST(GETDATE() AS date), @due_date,
        @treatment_cost, @medicine_cost, @discount, @total_amount, @payment_method, @status, @notes
      );
      SELECT SCOPE_IDENTITY() AS invoice_id;
    `);

    const invoice_id: number = insertResult.recordset[0]?.invoice_id;

    // Set invoice_number from real ID
    await pool.request()
      .input("id", sql.Int, invoice_id)
      .query(`
        UPDATE dbo.invoices
        SET invoice_number = CONCAT('INV-', YEAR(GETDATE()), '-', RIGHT('00000' + CAST(invoice_id AS VARCHAR), 5))
        WHERE invoice_id = @id
      `);

    /* ── 2. Insert invoice_items + decrement inventory ── */
    for (const item of items) {
      await pool.request()
        .input("invoice_id",  sql.Int,           invoice_id)
        .input("description", sql.NVarChar(255), item.medicine_name)
        .input("item_type",   sql.NVarChar(50),  "Medicine")
        .input("quantity",    sql.Int,           item.quantity)
        .input("unit_price",  sql.Decimal(18,2), item.unit_price)
        .query(`
          INSERT INTO dbo.invoice_items
            (invoice_id, description, item_type, quantity, unit_price)
          VALUES
            (@invoice_id, @description, @item_type, @quantity, @unit_price);
        `);

      // Decrement inventory stock
      await pool.request()
        .input("mid", sql.Int, item.medicine_id)
        .input("qty", sql.Int, item.quantity)
        .query(`
          UPDATE dbo.inventory
          SET stock_quantity = CASE
            WHEN stock_quantity - @qty < 0 THEN 0
            ELSE stock_quantity - @qty
          END
          WHERE medicine_id = @mid;
        `);
    }

    /* ── 3. Return created invoice ── */
    const created = await pool.request()
      .input("id", sql.Int, invoice_id)
      .query(`
        SELECT i.*, d.doctor_name
        FROM dbo.invoices i
        LEFT JOIN dbo.doctors d ON d.doctor_id = i.doctor_id
        WHERE i.invoice_id = @id
      `);

    return res.status(201).json({
      invoice: created.recordset[0],
      invoice_id,
    });

  } catch (err: unknown) {
    console.error("/api/billing/create-invoice error", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Server error",
    });
  }
}
