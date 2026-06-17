import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, currentPassword, newPassword } = req.body as {
    userId?: string | number;
    currentPassword?: string;
    newPassword?: string;
  };

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "userId, currentPassword and newPassword are required" });
  }

  if (String(newPassword).length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters" });
  }

  try {
    const pool = await getConnection();

    // 1. Fetch current hash
    const userResult = await pool
      .request()
      .input("userId", sql.Int, Number(userId))
      .query(`SELECT password_hash FROM dbo.users WHERE user_id = @userId`);

    if (!userResult.recordset.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password_hash } = userResult.recordset[0];

    // 2. Verify current password
    const valid = await bcrypt.compare(String(currentPassword), password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // 3. Hash + save new password
    const newHash = await bcrypt.hash(String(newPassword), 10);
    await pool
      .request()
      .input("userId",  sql.Int,          Number(userId))
      .input("newHash", sql.NVarChar(255), newHash)
      .query(`UPDATE dbo.users SET password_hash = @newHash WHERE user_id = @userId`);

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "DB error";
    console.error("[settings/password PUT]", msg);
    return res.status(500).json({ message: msg });
  }
}
