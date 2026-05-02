import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef3ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:grid-cols-[0.95fr_1.05fr]">
          <section className="bg-slate-950 px-8 py-10 text-white sm:px-10 lg:px-12">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] font-medium tracking-[0.12em] text-white/80 uppercase">
              Join MediStock
            </div>
            <h1 className="mt-8 max-w-md text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Create your account and set up the clinic workspace.
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-white/75">
              Start tracking patient records, inventory, and appointments with a secure admin account.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {[
                ["Fast setup", "Create access in minutes"],
                ["Team ready", "Add doctors and staff later"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/8 p-4">
                  <div className="text-xl font-semibold">{value}</div>
                  <div className="mt-1 text-sm text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white px-6 py-10 sm:px-10 lg:px-12">
            <div className="mx-auto flex w-full max-w-md flex-col justify-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">Create account</h2>
                <p className="mt-2 text-sm text-slate-500">Register your admin access for the system.</p>
              </div>

              <form className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                  <input
                    type="text"
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    placeholder="admin@medistock.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
                  <input
                    type="password"
                    placeholder="Repeat your password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:bg-white"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] transition hover:bg-[#1d4ed8]"
                >
                  Register
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}