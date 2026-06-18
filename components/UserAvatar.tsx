import React from "react";

// ── Deterministic color palette ───────────────────────────────────────────────
// Each user gets a consistent color based on their userId so the same user
// always shows the same colored avatar across the entire app.
const PALETTE = [
  { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" }, // violet
  { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" }, // blue
  { bg: "#dcfce7", text: "#166534", border: "#86efac" }, // emerald
  { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" }, // amber
  { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" }, // pink
  { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" }, // sky
  { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" }, // purple
  { bg: "#fdf4ff", text: "#86198f", border: "#e879f9" }, // fuchsia
  { bg: "#ecfdf5", text: "#064e3b", border: "#6ee7b7" }, // teal
  { bg: "#fff7ed", text: "#9a3412", border: "#fdba74" }, // orange
];

function getColor(userId: number | string) {
  const n = typeof userId === "string" ? parseInt(userId, 10) || 0 : userId;
  return PALETTE[Math.abs(n) % PALETTE.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Role-specific gradient fallbacks (used when name is unknown) ──────────────
const ROLE_GRADIENTS: Record<string, string> = {
  Admin:  "radial-gradient(circle at 30% 30%, #c4b5fd 0%, #7c3aed 60%, #312e81 100%)",
  Doctor: "radial-gradient(circle at 30% 30%, #bfdbfe 0%, #3b82f6 60%, #1e3a5f 100%)",
  Nurse:  "radial-gradient(circle at 30% 30%, #a7f3d0 0%, #10b981 60%, #064e3b 100%)",
};

// ── Component props ───────────────────────────────────────────────────────────
export interface UserAvatarProps {
  /** Uploaded photo URL from DB. If provided (and non-empty) it takes priority. */
  avatarUrl?: string | null;
  /** Full name or username – used to generate initials */
  name: string;
  /** Used to pick a deterministic color from the palette */
  userId: number | string;
  /** Role – used as last-resort gradient when no avatarUrl and no name */
  role?: string;
  /** px size of the square/circle  (default 40) */
  size?: number;
  /** Border radius CSS token or px value (default "9999px" = full circle) */
  borderRadius?: string;
  /** Extra CSS classes */
  className?: string;
  /** Alt text for the img element */
  alt?: string;
}

/**
 * `UserAvatar` renders (in priority order):
 *   1. Real uploaded photo from `avatarUrl`
 *   2. Colored circle with the user's initials (deterministic color from userId)
 *   3. Role gradient blob (if role is known but name is empty)
 *   4. Generic slate gradient
 *
 * The same `userId` always produces the same color — making each user visually
 * distinct without requiring an uploaded photo.
 */
export default function UserAvatar({
  avatarUrl,
  name,
  userId,
  role,
  size = 40,
  borderRadius = "9999px",
  className = "",
  alt,
}: UserAvatarProps) {
  const color   = getColor(userId);
  const initials = name ? getInitials(name) : null;
  const fontSize = Math.max(10, Math.round(size * 0.36));

  const wrapStyle: React.CSSProperties = {
    width:        size,
    height:       size,
    borderRadius,
    flexShrink:   0,
    overflow:     "hidden",
    border:       `1.5px solid ${color.border}`,
    display:      "flex",
    alignItems:   "center",
    justifyContent: "center",
    background:   color.bg,
  };

  // 1. Real photo
  if (avatarUrl) {
    return (
      <div style={wrapStyle} className={className}>
        <img
          src={avatarUrl}
          alt={alt ?? name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  // 2. Initials
  if (initials) {
    return (
      <div style={wrapStyle} className={className}>
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color:       color.text,
            lineHeight:  1,
            userSelect:  "none",
            letterSpacing: "-0.02em",
          }}
        >
          {initials}
        </span>
      </div>
    );
  }

  // 3. Role gradient fallback
  const gradient =
    (role && ROLE_GRADIENTS[role]) ||
    "radial-gradient(circle at 30% 30%, #f9d5b4 0, #f0b98a 30%, #21314d 100%)";

  return (
    <div
      style={{
        ...wrapStyle,
        background: gradient,
        border:     "1.5px solid rgba(255,255,255,0.2)",
      }}
      className={className}
    />
  );
}
