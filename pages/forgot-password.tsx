import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

type Step = "email" | "otp" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setStep("otp");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      setStep("done");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f3fb] px-4 py-10 sm:px-6 md:flex md:items-center">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="overflow-hidden rounded-2xl border border-[#dfe2ec] bg-[#fdfdff] shadow-[0_18px_42px_rgba(24,35,70,0.10)] md:grid md:grid-cols-[1.18fr_0.82fr]">
          <div className="relative min-h-[560px] overflow-hidden bg-[linear-gradient(180deg,#8db6e4_0%,#4d82c6_55%,#0c55cc_100%)] p-8 sm:p-10">
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.30) 0px, rgba(255,255,255,0.30) 1px, transparent 1px, transparent 44px), repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 52px)",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.38),transparent_52%),linear-gradient(180deg,rgba(12,85,204,0)_55%,rgba(12,85,204,0.86)_100%)]" />

            <div className="relative flex h-full flex-col justify-end">
              <div className="mb-3 inline-flex items-center gap-3 text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-white/90 text-[#0b56d1]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[38px] font-semibold tracking-[-0.03em]">MediStock</span>
              </div>
              <p className="max-w-[420px] text-[27px] leading-[1.45] text-white/95">
                Resetting your password is quick and secure.
                <br />
                Check your inbox for the OTP.
              </p>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-9 md:py-10">
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="mt-1 space-y-5">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#232736]">
                  Forgot Password
                </h2>
                <p className="text-[15px] text-[#4f5565]">
                  Enter your registered email and we will send you a one-time
                  password.
                </p>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <label className="block">
                  <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">
                    Email address
                  </div>
                  <div className="relative">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]"
                    >
                      <rect
                        x="3.6"
                        y="5.7"
                        width="16.8"
                        height="12.6"
                        rx="1.8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="m4.5 7.1 7 5.4a.8.8 0 0 0 1 0l7-5.4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@medistock.com"
                      className="h-12 w-full rounded-none border border-[#cfd4e0] bg-[#f7f8fd] pl-10 pr-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1] focus:bg-white"
                      disabled={loading}
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-none bg-[#0b56d1] px-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(11,86,209,0.25)] transition hover:bg-[#0846ad] disabled:opacity-50"
                >
                  {loading ? "Sending OTP..." : "Send OTP →"}
                </button>

                <div className="text-center text-[15px] text-[#666f80]">
                  <Link
                    href="/login"
                    className="font-medium text-[#0b56d1]"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleResetPassword} className="mt-1 space-y-5">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#232736]">
                  Reset Password
                </h2>
                <p className="text-[15px] text-[#4f5565]">
                  Enter the OTP sent to <strong>{email}</strong> and your new
                  password.
                </p>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <label className="block">
                  <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">
                    OTP Code
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="h-12 w-full rounded-none border border-[#cfd4e0] bg-[#f7f8fd] px-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1] focus:bg-white tracking-[8px] text-center text-[20px] font-bold"
                    disabled={loading}
                    maxLength={6}
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">
                    New Password
                  </div>
                  <div className="relative">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]"
                    >
                      <path
                        d="M7.2 10.2h9.6a1 1 0 0 1 1 1v7.1a1 1 0 0 1-1 1H7.2a1 1 0 0 1-1-1v-7.1a1 1 0 0 1 1-1Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M9.2 10.2V8.5a2.8 2.8 0 1 1 5.6 0v1.7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 w-full rounded-none border border-[#cfd4e0] bg-[#f7f8fd] pl-10 pr-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1] focus:bg-white"
                      disabled={loading}
                    />
                  </div>
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">
                    Confirm Password
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-none border border-[#cfd4e0] bg-[#f7f8fd] px-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1] focus:bg-white"
                    disabled={loading}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-none bg-[#0b56d1] px-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(11,86,209,0.25)] transition hover:bg-[#0846ad] disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password →"}
                </button>

                <div className="text-center text-[15px] text-[#666f80]">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="font-medium text-[#0b56d1] bg-transparent border-none cursor-pointer"
                  >
                    ← Use a different email
                  </button>
                </div>
              </form>
            )}

            {step === "done" && (
              <div className="mt-1 space-y-5">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#232736]">
                  Password Reset Complete
                </h2>
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
                  Your password has been reset successfully.
                </div>
                <button
                  onClick={() => router.push("/login")}
                  className="h-12 w-full rounded-none bg-[#0b56d1] px-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(11,86,209,0.25)] transition hover:bg-[#0846ad]"
                >
                  Go to Login →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
