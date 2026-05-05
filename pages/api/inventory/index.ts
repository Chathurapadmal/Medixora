import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      const result = await pool
        .request()
        .query(
          `SELECT
            i.medicine_id AS id,
            i.item_code AS code,
            i.medicine_name AS name,
            i.category,
            i.stock_quantity AS stock,
            i.minimum_stock_level AS minimum,
            CAST(i.unit_price AS decimal(18,2)) AS price,
            CONVERT(varchar(10), i.expiry_date, 23) AS expiryDate,
            s.supplier_name AS supplier,
            i.status
          FROM inventory i
          LEFT JOIN suppliers s ON s.supplier_id = i.supplier_id
          ORDER BY i.medicine_id DESC`
        );

      return res.status(200).json(result.recordset || []);
    }

    if (req.method === "POST") {
      const { name, category, supplier, code, quantity, minimum, price, expiryDate } =
        req.body as Record<string, any>;

      const request = pool.request();
      request.input("name", sql.NVarChar, name || null);
      request.input("category", sql.NVarChar, category || null);
      request.input("supplier", sql.NVarChar, supplier || null);
      request.input("code", sql.NVarChar, code || null);
      request.input("quantity", sql.Int, Number(quantity) || 0);
      request.input("minimum", sql.Int, Number(minimum) || 0);
      request.input("price", sql.Decimal(18, 2), price ? Number(price) : 0);
      request.input("expiryDate", sql.Date, expiryDate ? new Date(expiryDate) : null);

      const insertQuery = `
        DECLARE @supplierId INT = (
          SELECT TOP 1 supplier_id
          FROM suppliers
          WHERE supplier_name = @supplier
        );

        INSERT INTO inventory
          (item_code, medicine_name, category, supplier_id, stock_quantity, minimum_stock_level, unit_price, expiry_date, status)
        VALUES
          (
            @code,
            @name,
            @category,
            @supplierId,
            @quantity,
            @minimum,
            @price,
            @expiryDate,
            CASE
              WHEN @expiryDate IS NOT NULL AND @expiryDate < CAST(GETDATE() AS date) THEN 'Expired'
              WHEN @quantity <= 0 THEN 'Out of Stock'
              WHEN @quantity < @minimum THEN 'Low Stock'
              ELSE 'In Stock'
            END
          );

        SELECT SCOPE_IDENTITY() AS id;
      `;

      const result = await request.query(insertQuery);
      return res.status(201).json({ insertedId: result.recordset?.[0]?.id ?? null });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/inventory error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
