import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
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

    const userResult = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`SELECT user_id, email FROM dbo.users WHERE email = @email`);

    if (userResult.recordset.length === 0) {
      return res.status(200).json({
        message:
          "If that email is registered, an OTP has been sent.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert OTP — create password_resets row or update existing
    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .input("otp", sql.NVarChar, otp)
      .input("expires_at", sql.DateTime, expiresAt).query(`
        IF EXISTS (SELECT 1 FROM dbo.password_resets WHERE email = @email)
          UPDATE dbo.password_resets SET otp = @otp, expires_at = @expires_at, used = 0 WHERE email = @email
        ELSE
          INSERT INTO dbo.password_resets (email, otp, expires_at) VALUES (@email, @otp, @expires_at)
      `);

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "If that email is registered, an OTP has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot-password error:", error?.message || error);
    return res.status(500).json({
      message: error?.message || "Failed to send OTP",
      error:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
}
