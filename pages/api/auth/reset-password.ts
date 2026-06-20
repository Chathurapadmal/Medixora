import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
  }

  if (String(newPassword).length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters" });
  }

  try {
    const pool = await getConnection();

    // Ensure password_resets table exists
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='password_resets' AND xtype='U')
      CREATE TABLE dbo.password_resets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL,
        otp NVARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BIT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT GETDATE()
      )
    `);

    const resetResult = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(
        `SELECT otp, expires_at, used FROM dbo.password_resets WHERE email = @email`
      );

    if (resetResult.recordset.length === 0) {
      return res
        .status(400)
        .json({ message: "No reset request found for this email" });
    }

    const record = resetResult.recordset[0];

    if (record.used) {
      return res.status(400).json({ message: "OTP has already been used" });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (String(record.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .input("password_hash", sql.NVarChar, hashedPassword)
      .query(
        `UPDATE dbo.users SET password_hash = @password_hash WHERE email = @email`
      );

    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(
        `UPDATE dbo.password_resets SET used = 1 WHERE email = @email`
      );

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Reset-password error:", error?.message || error);
    return res.status(500).json({
      message: error?.message || "Failed to reset password",
      error:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
}
