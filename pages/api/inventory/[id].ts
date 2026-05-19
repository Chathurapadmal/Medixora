import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "../../../lib/db";

/**
 * DELETE /api/inventory/[id]
 * Removes a medicine from the inventory by its medicine_id.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const medicineId = Number(req.query.id);

    if (!medicineId || medicineId <= 0) {
      return res.status(400).json({ error: "A valid medicine id is required." });
    }

    const pool = await getConnection();
    const request = pool.request();
    request.input("id", sql.Int, medicineId);

    const result = await request.query(`
      DELETE FROM inventory WHERE medicine_id = @id;
      SELECT @@ROWCOUNT AS affected;
    `);

    const affected = result.recordset?.[0]?.affected ?? 0;

    if (affected === 0) {
      return res.status(404).json({ error: "Medicine not found." });
    }

    return res.status(200).json({ success: true, deletedId: medicineId });
  } catch (err: any) {
    console.error("/api/inventory/[id] DELETE error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
