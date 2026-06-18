import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const pool = await getConnection();

      // Fetch the main invoice record
      const invoiceResult = await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`
          SELECT 
            i.invoice_id,
            i.invoice_number,
            i.patient_name,
            i.patient_id,
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
          WHERE i.invoice_id = @id
        `);

      if (invoiceResult.recordset.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const invoice = invoiceResult.recordset[0];

      // Fetch the items
      const itemsResult = await pool.request()
        .input("id", sql.Int, Number(id))
        .query(`
          SELECT 
            item_id,
            description,
            item_type,
            quantity,
            CAST(unit_price AS decimal(18,2)) AS unit_price,
            CAST(line_total AS decimal(18,2)) AS line_total
          FROM dbo.invoice_items
          WHERE invoice_id = @id
          ORDER BY item_id ASC
        `);

      return res.status(200).json({
        ...invoice,
        items: itemsResult.recordset,
      });

    } catch (err: any) {
      console.error("/api/billing/invoices/[id] error", err);
      return res.status(500).json({ error: err.message || "Server error" });
    }
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ error: "Method Not Allowed" });
}
