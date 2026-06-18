import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "@/lib/db";

type ResponseData = {
  success?: boolean;
  message: string;
  userId?: number;
  username?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, username, fullName, role } = req.body;
  const resolvedUsername = username || fullName;

  // Validate required fields
  if (!email || !password || !resolvedUsername || !role) {
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

    // Check if user already exists directly against dbo.users
    const userExists = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT user_id
        FROM dbo.users
        WHERE email = @email
      `);

    if (userExists.recordset.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user directly into dbo.users
    const result = await pool
      .request()
      .input("username", sql.NVarChar, resolvedUsername)
      .input("email", sql.NVarChar, email)
      .input("password_hash", sql.NVarChar, hashedPassword)
      .input("role", sql.NVarChar, role)
      .input("status", sql.NVarChar, "active")
      .query(`
        INSERT INTO dbo.users (username, email, password_hash, [role], status)
        OUTPUT INSERTED.user_id
        VALUES (@username, @email, @password_hash, @role, @status)
      `);

    const userId = result.recordset[0]?.user_id;

    // Interconnect: If role is Doctor, also add them to the doctors table
    if (role === "Doctor") {
      await pool
        .request()
        .input("doctor_name", sql.NVarChar, resolvedUsername)
        .input("email", sql.NVarChar, email)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.doctors WHERE email = @email)
          BEGIN
            INSERT INTO dbo.doctors (doctor_name, email, status)
            VALUES (@doctor_name, @email, 'active')
          END
        `);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful",
      userId,
      username: resolvedUsername,
    });
  } catch (error: any) {
    console.error("Registration error:", error?.message || error);
    res.status(500).json({ 
      message: error?.message || "Registration failed",
      error: process.env.NODE_ENV === "development" ? error?.message : undefined
    });
  }
}
