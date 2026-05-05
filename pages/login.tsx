import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Client-side validation
    if (!formData.email || !formData.password) {
      setError("Email and password required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.userId);
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
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
                Advanced Health Management System.
                <br />
                Streamlining clinical workflows with precision and reliability.
              </p>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-9 md:py-10">
            <form onSubmit={handleSubmit} className="mt-1 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
                  Login successful! Redirecting...
                </div>
              )}

              <label className="block">
                <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">Role</div>
                <div className="relative">
                  <select name="role" value={formData.role} onChange={handleChange} className="h-12 w-full appearance-none rounded-none border border-[#cfd4e0] bg-white px-3 pr-9 text-[15px] text-[#303646] outline-none focus:border-[#0b56d1]" disabled={loading}>
                    <option value="">Select your role</option>
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                  </select>
                  <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747b8c]" fill="none">
                    <path d="m5.5 7.8 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </label>

              <label className="block">
                <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">Email address</div>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]">
                    <rect x="3.6" y="5.7" width="16.8" height="12.6" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m4.5 7.1 7 5.4a.8.8 0 0 0 1 0l7-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="staff@medistock.com" className="h-12 w-full rounded-none border border-[#cfd4e0] bg-[#f7f8fd] pl-10 pr-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1] focus:bg-white" disabled={loading} />
                </div>
              </label>

              <label>
                <div className="mb-2 flex items-center justify-between text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">
                  <span>Password</span>
                  <a href="#" className="text-[13px] font-semibold normal-case tracking-normal text-[#0b56d1]">Forgot Password?</a>
                </div>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]">
                    <path d="M7.2 10.2h9.6a1 1 0 0 1 1 1v7.1a1 1 0 0 1-1 1H7.2a1 1 0 0 1-1-1v-7.1a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M9.2 10.2V8.5a2.8 2.8 0 1 1 5.6 0v1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="h-12 w-full rounded-none border border-[#cfd4e0] bg-[#f7f8fd] pl-10 pr-10 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1] focus:bg-white" disabled={loading} />
                  <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f7687]">
                    <path d="M3.8 12s2.9-4.7 8.2-4.7 8.2 4.7 8.2 4.7-2.9 4.7-8.2 4.7S3.8 12 3.8 12Z" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M5 19 19 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
              </label>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-[15px] text-[#555d6f]">
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="h-4 w-4 rounded border-[#c1c8d8]" disabled={loading} />
                  Remember me for 30 days
                </label>
              </div>

              <button type="submit" disabled={loading || success} className="h-12 w-full rounded-none bg-[#0b56d1] px-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(11,86,209,0.25)] transition hover:bg-[#0846ad] disabled:opacity-50">
                {loading ? "Signing In..." : "Sign In to MediStock →"}
              </button>
            </form>

            <div className="mt-9 border-t border-[#e4e7ef] pt-6 text-center text-[15px] text-[#666f80]">
              New staff member? <Link href="/register" className="font-medium text-[#0b56d1]">Request Account Access</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}