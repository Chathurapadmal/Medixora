import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection, sql } from "@/lib/db";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

const IMGBB_API_KEY = "bc9abb11c139e0c420c15a71f53c2bd5";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

type ResponseData = {
  success?: boolean;
  message: string;
  avatarUrl?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // ── GET: fetch current avatar URL for a user ─────────────────────────────
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("userId", sql.Int, Number(userId))
        .query(`SELECT avatar_url FROM dbo.users WHERE user_id = @userId`);

      const avatarUrl = result.recordset[0]?.avatar_url ?? null;
      return res.status(200).json({ success: true, message: "OK", avatarUrl: avatarUrl || "" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "DB error";
      return res.status(500).json({ message: msg });
    }
  }

  // ── POST: upload to ImgBB and save URL ───────────────────────────────────
  if (req.method === "POST") {
    const { userId, imageBase64 } = req.body as {
      userId?: number | string;
      imageBase64?: string;
    };

    if (!userId || !imageBase64) {
      return res.status(400).json({ message: "userId and imageBase64 are required" });
    }

    // Strip data URL prefix if present (e.g. "data:image/png;base64,...")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // 1. Upload to ImgBB ─────────────────────────────────────────────────────
    let avatarUrl: string;
    try {
      const formBody = new URLSearchParams();
      formBody.append("key", IMGBB_API_KEY);
      formBody.append("image", base64Data);

      const imgbbRes = await fetch(IMGBB_UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });

      const imgbbJson = await imgbbRes.json();

      if (!imgbbRes.ok || !imgbbJson.success) {
        console.error("[ImgBB] Upload failed:", imgbbJson);
        return res.status(502).json({
          message: imgbbJson?.error?.message || "ImgBB upload failed",
        });
      }

      avatarUrl = imgbbJson.data.url as string;
    } catch (uploadErr: unknown) {
      const msg = uploadErr instanceof Error ? uploadErr.message : "Network error";
      console.error("[ImgBB] Exception:", msg);
      return res.status(502).json({ message: `ImgBB error: ${msg}` });
    }

    // 2. Save URL to database ─────────────────────────────────────────────────
    try {
      const pool = await getConnection();

      // Ensure the column exists (idempotent – safe to run multiple times)
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT 1 FROM sys.columns
          WHERE object_id = OBJECT_ID('dbo.users') AND name = 'avatar_url'
        )
        ALTER TABLE dbo.users ADD avatar_url NVARCHAR(1000) NULL;
      `);

      await pool
        .request()
        .input("userId", sql.Int, Number(userId))
        .input("avatarUrl", sql.NVarChar(1000), avatarUrl)
        .query(`
          UPDATE dbo.users
          SET avatar_url = @avatarUrl
          WHERE user_id = @userId
        `);

      return res.status(200).json({
        success: true,
        message: "Avatar updated successfully",
        avatarUrl,
      });
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : "DB error";
      console.error("[Avatar] DB error:", msg);
      return res.status(500).json({ message: `DB error: ${msg}` });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
