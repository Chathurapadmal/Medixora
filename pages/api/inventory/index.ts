import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

async function getNextMedicineCode() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT MAX(TRY_CAST(RIGHT(item_code, 3) AS INT)) AS maxCode
    FROM inventory
    WHERE item_code LIKE 'MED-%'
  `);

  const maxCode = Number(result.recordset?.[0]?.maxCode ?? 0);
  return `MED-${String(maxCode + 1).padStart(3, "0")}`;
}

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
          (medicine_name, category, supplier_id, stock_quantity, minimum_stock_level, unit_price, expiry_date)
        VALUES
          (
            @name,
            @category,
            @supplierId,
            @quantity,
            @minimum,
            @price,
            @expiryDate
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
