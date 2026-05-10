import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { id, quantity, unitPrice, expiryDate, supplier } =
      req.body as Record<string, unknown>;

    const medicineId = Number(id);
    const addQuantity = Number(quantity);

    if (!medicineId || medicineId <= 0) {
      return res.status(400).json({ error: "A valid medicine id is required." });
    }

    if (!addQuantity || addQuantity <= 0) {
      return res
        .status(400)
        .json({ error: "Restock quantity must be greater than zero." });
    }

    const pool = await getConnection();
    const request = pool.request();
    request.input("id", sql.Int, medicineId);
    request.input("quantity", sql.Int, addQuantity);

    // Build dynamic SET clauses for optional fields
    const setClauses = ["stock_quantity = stock_quantity + @quantity"];

    if (unitPrice !== undefined && unitPrice !== "" && unitPrice !== null) {
      request.input("unitPrice", sql.Decimal(18, 2), Number(unitPrice));
      setClauses.push("unit_price = @unitPrice");
    }

    if (expiryDate && String(expiryDate).trim()) {
      request.input("expiryDate", sql.Date, new Date(String(expiryDate)));
      setClauses.push("expiry_date = @expiryDate");
    }

    if (supplier && String(supplier).trim()) {
      request.input("supplierName", sql.NVarChar, String(supplier));
      setClauses.push(
        "supplier_id = (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_name = @supplierName)",
      );
    }

    const result = await request.query(`
      UPDATE inventory
      SET ${setClauses.join(",\n          ")}
      WHERE medicine_id = @id;

      SELECT
        i.medicine_id        AS id,
        i.medicine_name      AS name,
        i.stock_quantity     AS stock,
        i.minimum_stock_level AS minimum,
        CAST(i.unit_price AS decimal(18,2)) AS price,
        CONVERT(varchar(10), i.expiry_date, 23) AS expiryDate,
        s.supplier_name      AS supplier
      FROM inventory i
      LEFT JOIN suppliers s ON s.supplier_id = i.supplier_id
      WHERE i.medicine_id = @id;
    `);

    const updated = result.recordset?.[0];

    if (!updated) {
      return res.status(404).json({ error: "Medicine not found." });
    }

    return res.status(200).json(updated);
  } catch (err: any) {
    console.error("/api/inventory/restock error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
