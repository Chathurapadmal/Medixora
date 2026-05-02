import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.08),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef3ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-between bg-[#12308a] px-8 py-10 text-white sm:px-10 lg:px-12">
            <div>
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium tracking-[0.12em] text-white/80 uppercase">
                MediStock
              </div>
              <h1 className="mt-8 max-w-md text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Welcome back to your health management dashboard.
              </h1>
              <p className="mt-4 max-w-lg text-[15px] leading-7 text-white/80">
                Sign in to manage patients, appointments, inventory, and billing from one place.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ["24/7", "secure access"],
                ["1,200+", "patient records"],
                ["Live", "inventory alerts"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/8 p-4">
                  <div className="text-2xl font-semibold">{value}</div>
                  <div className="mt-1 text-sm text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white px-6 py-10 sm:px-10 lg:px-12">
            <div className="mx-auto flex w-full max-w-md flex-col justify-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">Sign in</h2>
                <p className="mt-2 text-sm text-slate-500">Use your admin credentials to continue.</p>
              </div>

              <form className="mt-8 space-y-5">
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
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:bg-white"
                  />
                </label>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]" />
                    Remember me
                  </label>
                  <a href="#" className="font-medium text-[#2563eb] hover:text-[#1d4ed8]">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] transition hover:bg-[#1d4ed8]"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
                  Create one
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}