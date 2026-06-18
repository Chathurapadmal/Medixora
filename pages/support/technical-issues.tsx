import Head from "next/head";
import Link from "next/link";
import { ChevronLeftIcon, SupportIcon } from "@/components/dashboard-icons";
import { useState } from "react";

export default function TechnicalIssues() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Report Technical Issue - Medixora Support</title>
      </Head>

      <div className="mx-auto max-w-[800px] space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/support" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Report a Technical Issue</h1>
            <p className="text-sm text-slate-500">Found a bug? Let us know so we can fix it.</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] lg:p-8">
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
            <SupportIcon className="h-6 w-6 text-emerald-600" />
            <p className="text-sm font-medium">Our technical team monitors these reports 24/7. Critical bugs are usually resolved within hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Issue Type</label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
                  <option>UI Glitch or Layout Issue</option>
                  <option>Login or Authentication</option>
                  <option>Data Not Saving / Error Message</option>
                  <option>Performance / Slowness</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Severity</label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
                  <option>Low (Cosmetic, doesn&apos;t affect workflow)</option>
                  <option>Medium (Workaround available)</option>
                  <option>High (Core functionality broken)</option>
                  <option>Critical (System down, data loss)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Title / Short Description</label>
              <input 
                type="text" 
                required
                placeholder="E.g., Save button on Add Medicine is unresponsive"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Steps to Reproduce</label>
              <textarea 
                rows={5}
                required
                placeholder="1. Go to Inventory&#10;2. Click on Add Medicine&#10;3. Fill fields and click Save&#10;4. Observe that..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === "submitting" || status === "success"}
              className={`w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] ${
                status === "success" ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
              }`}
            >
              {status === "submitting" ? "Submitting Report..." : status === "success" ? "Report Submitted!" : "Submit Bug Report"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
