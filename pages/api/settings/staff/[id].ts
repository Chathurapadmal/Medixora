import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const pool = await getConnection();

    // Interconnect: Get user's email and role first to delete them from doctors table if necessary
    const userResult = await pool.request()
      .input("id", sql.Int, Number(id))
      .query(`SELECT email, [role] FROM dbo.users WHERE user_id = @id`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.recordset[0];

    // Delete user from users table
    await pool.request()
      .input("id", sql.Int, Number(id))
      .query(`DELETE FROM dbo.users WHERE user_id = @id`);

    // Interconnect: Delete doctor profile if the role is Doctor
    if (user.role === 'Doctor' && user.email) {
      await pool.request()
        .input("email", sql.NVarChar, user.email)
        .query(`DELETE FROM dbo.doctors WHERE email = @email`);
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "DB error";
    console.error("[settings/staff/[id] DELETE]", msg);
    return res.status(500).json({ message: msg });
  }
}
