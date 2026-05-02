import React from "react";
import { BellIcon, HelpIcon, SearchIcon } from "./DashboardIcons";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-2.5 shadow-[0_1px_1px_rgba(15,23,42,0.02)]">
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Search patients, doctors, medicines..."
            className="w-full min-w-0 bg-transparent text-[14px] text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 sm:flex"
          aria-label="Notifications"
        >
          <BellIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 sm:flex"
          aria-label="Help"
        >
          <HelpIcon className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pl-1 sm:pl-2">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-[radial-gradient(circle_at_30%_30%,#f9d5b4_0,#f0b98a_30%,#21314d_100%)] shadow-sm" />
          <div className="hidden text-left sm:block">
            <div className="text-[14px] font-semibold leading-tight text-slate-900">Dr. Sarah Jenkins</div>
            <div className="text-[12px] leading-tight text-slate-500">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
