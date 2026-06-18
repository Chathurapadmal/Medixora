import Head from "next/head";
import Link from "next/link";
import { ChevronLeftIcon, FileIcon, SearchIcon, ChevronRightIcon } from "@/components/dashboard-icons";
import { useState } from "react";

const guides = [
  { title: "Getting Started with Medixora", category: "Basics", time: "5 min read", desc: "A comprehensive overview of Medixora's features and navigation.", href: "/support/guides/getting-started" },
];

export default function UserGuides() {
  const [search, setSearch] = useState("");

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>User Guides - Medixora Support</title>
      </Head>

      <div className="mx-auto max-w-[1280px] space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/support" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Guides & Tutorials</h1>
            <p className="text-sm text-slate-500">Learn how to make the most out of Medixora.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search guides by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Guides Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide, idx) => (
            <Link href={guide.href} key={idx} className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  {guide.category}
                </span>
                <span className="text-xs font-medium text-slate-400">{guide.time}</span>
              </div>
              <div className="mt-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{guide.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{guide.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600">
                Read Guide
                <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
          {filteredGuides.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 py-12 text-center">
              <FileIcon className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-slate-500">No guides found matching &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
