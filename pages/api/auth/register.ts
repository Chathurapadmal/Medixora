import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "@/lib/db";

type ResponseData = {
  success?: boolean;
  message: string;
  userId?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, fullName, role, department, phone } = req.body;

  // Validate required fields
  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password length
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  try {
    const pool = await getConnection();

    // Check if user already exists
    const userExists = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .execute("dbo.sp_GetUserByEmail");

    if (userExists.recordset.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user through stored procedure
    const result = await pool
      .request()
      .input("username", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email)
      .input("password_hash", sql.NVarChar, hashedPassword)
      .input("role", sql.NVarChar, role)
      .input("status", sql.NVarChar, "active")
      .output("user_id", sql.Int)
      .execute("dbo.sp_RegisterUser");

    const userId = result.output.user_id;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      userId,
    });
  } catch (error: any) {
    console.error("Registration error:", error?.message || error);
    res.status(500).json({ 
      message: error?.message || "Registration failed",
      error: process.env.NODE_ENV === "development" ? error?.message : undefined
    });
  }
}
