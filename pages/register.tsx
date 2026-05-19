import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && router.pathname !== "/") {
      router.replace("/");
    }
  }, [router]);

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
    if (
      !formData.username ||
      !formData.email ||
      !formData.role ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and policies");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An error occurred during registration");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f3fb] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[920px]">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b56d1] shadow-[0_8px_24px_rgba(11,86,209,0.35)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <rect x="3" y="3" width="18" height="18" rx="5" fill="white" fillOpacity="0.15" />
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[52px] font-semibold leading-none tracking-[-0.04em] text-slate-900 sm:text-[56px]">MediStock</span>
          </div>
          <h1 className="mt-8 text-[40px] font-semibold leading-none tracking-[-0.03em] text-[#232736] sm:text-[46px]">Staff Registration</h1>
          <p className="mx-auto mt-4 max-w-[640px] text-[24px] leading-[1.45] text-[#4f5565]">
            Create a new administrative or medical staff account for
            <br className="hidden sm:block" />
            the Health Management System.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e3e5ee] bg-[#fdfdff] p-8 shadow-[0_14px_38px_rgba(24,35,70,0.08)] sm:p-10">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
              Registration successful! Redirecting to login...
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2 block">
              <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">Username *</div>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]">
                  <path d="M12 12a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M6.2 18.2c.9-2.1 3-3.3 5.8-3.3s5 1.2 5.8 3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#cfd4e0] bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1]" placeholder="e.g. Dr. Sarah Jenkins" disabled={loading} />
              </div>
            </label>
            <label className="sm:col-span-2 block">
              <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">Email address *</div>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]">
                  <rect x="3.6" y="5.7" width="16.8" height="12.6" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m4.5 7.1 7 5.4a.8.8 0 0 0 1 0l7-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#cfd4e0] bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1]" placeholder="sarah.jenkins@medistock.com" disabled={loading} />
              </div>
            </label>

            <label>
              <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">System role *</div>
              <div className="relative">
                <select name="role" value={formData.role} onChange={handleChange} className="h-12 w-full appearance-none rounded-lg border border-[#cfd4e0] bg-white px-3 pr-9 text-[15px] text-[#303646] outline-none focus:border-[#0b56d1]" disabled={loading}>
                  <option value="">Select Access Level</option>
                  <option value="Admin">Admin</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                </select>
                <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747b8c]" fill="none">
                  <path d="m5.5 7.8 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </label>

            <label>
              <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">Password *</div>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]">
                  <path d="M7.2 10.2h9.6a1 1 0 0 1 1 1v7.1a1 1 0 0 1-1 1H7.2a1 1 0 0 1-1-1v-7.1a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9.2 10.2V8.5a2.8 2.8 0 1 1 5.6 0v1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#cfd4e0] bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1]" placeholder="••••••••" disabled={loading} />
              </div>
            </label>

            <label>
              <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5e6472]">Confirm password *</div>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8091]">
                  <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m9.3 12 1.8 1.8 3.6-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#cfd4e0] bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none placeholder:text-[#8f95a5] focus:border-[#0b56d1]" placeholder="••••••••" disabled={loading} />
              </div>
            </label>
          </div>

          <label className="mt-6 flex items-start gap-2 text-[15px] text-[#555d6f]">
            <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="mt-[2px] h-4 w-4 rounded border-[#c1c8d8]" disabled={loading} />
            <span>
              I agree to the <a className="font-medium text-[#0b56d1]" href="#">Hospital Security Policies</a> and <a className="font-medium text-[#0b56d1]" href="#">Terms of Service</a>. *
            </span>
          </label>

          <button type="submit" disabled={loading || success} className="mt-7 h-12 w-full rounded-lg bg-[#0b56d1] px-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(11,86,209,0.25)] transition hover:bg-[#0846ad] disabled:opacity-50">
            {loading ? "Registering..." : "Register Staff Account"}
          </button>

          <div className="mt-7 border-t border-[#e4e7ef] pt-5 text-center text-[15px] text-[#666f80]">
            <Link href="/login" className="font-medium text-[#0b56d1]">← Already have an account? Return to Login</Link>
          </div>
        </form>

        <div className="mt-7 text-center text-[14px] font-medium text-[#646d80]">
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#0d8e59] align-middle" />
          Secure Connection established to MediStock Main Server
        </div>
      </div>
    </main>
  );
}