import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "@/lib/db";

type ResponseData = {
  success?: boolean;
  message: string;
  userId?: number;
  token?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, role } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const pool = await getConnection();

    // Find user by email
    const userResult = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .execute("dbo.sp_AuthenticateUser");

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userResult.recordset[0];

    if (String(user.status).toLowerCase() !== "active") {
      return res.status(401).json({ message: "Account is inactive" });
    }

    // Check role if provided
    if (role && user.role !== role) {
      return res.status(401).json({ message: "Invalid role for this account" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // In production, you'd generate a JWT or session token here
    const token = Buffer.from(`${user.user_id}:${email}`).toString("base64");

    res.status(200).json({
      success: true,
      message: "Login successful",
      userId: user.user_id,
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error?.message || error);
    res.status(500).json({ 
      message: error?.message || "Login failed",
      error: process.env.NODE_ENV === "development" ? error?.message : undefined
    });
  }
}
