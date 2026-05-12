import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = await getConnection();
    
    // Ensure table exists
    const createTableQuery = `
      IF OBJECT_ID('dbo.suppliers', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.suppliers (
          supplier_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          supplier_name NVARCHAR(255) NOT NULL,
          contact_person NVARCHAR(255) NULL,
          phone NVARCHAR(50) NULL,
          email NVARCHAR(255) NULL,
          address NVARCHAR(500) NULL,
          status NVARCHAR(50) NOT NULL CONSTRAINT DF_suppliers_status DEFAULT ('Active'),
          created_at DATETIME2 NOT NULL CONSTRAINT DF_suppliers_created_at DEFAULT SYSUTCDATETIME()
        );
      END;
    `;
    await pool.request().query(createTableQuery);

    if (req.method === "GET") {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = "SELECT * FROM suppliers";
      let countQuery = "SELECT COUNT(*) as total FROM suppliers";

      if (search) {
        // Basic search filtering
        query += ` WHERE supplier_name LIKE '%${search}%' OR contact_person LIKE '%${search}%'`;
        countQuery += ` WHERE supplier_name LIKE '%${search}%' OR contact_person LIKE '%${search}%'`;
      }

      query += ` ORDER BY supplier_id DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

      const countResult = await pool.request().query(countQuery);
      const result = await pool.request().query(query);

      return res.status(200).json({
        data: result.recordset || [],
        total: countResult.recordset[0]?.total || 0,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    }

    if (req.method === "POST") {
      const { supplier_name, contact_person, phone, email, address, status = 'Active' } = req.body;
      
      if (!supplier_name) {
        return res.status(400).json({ error: "supplier_name is required" });
      }

      const insertQuery = `
        INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, status)
        VALUES (@supplier_name, @contact_person, @phone, @email, @address, @status)
      `;

      const request = pool.request();
      request.input('supplier_name', supplier_name);
      request.input('contact_person', contact_person);
      request.input('phone', phone);
      request.input('email', email);
      request.input('address', address);
      request.input('status', status);
      
      await request.query(insertQuery);
      return res.status(201).json({ message: "Supplier added successfully" });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("/api/suppliers error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
