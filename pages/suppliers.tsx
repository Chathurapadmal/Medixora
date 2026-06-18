import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  SuppliersIcon,
  PlusIcon,
  SearchIcon,
  MoreIcon,
} from "../components/dashboard-icons";

type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  contactInfo?: string;
  category?: string;
  status?: string;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          // map minimal API shape to Supplier
          setSuppliers(
            data.map((s: any) => ({
              id: s.id ?? String(Math.random()).slice(2, 8),
              name: s.name ?? "Unknown",
              contactPerson: s.contactPerson,
              contactInfo: s.contactInfo,
              category: s.category,
              status: s.status ?? "Active",
            }))
          );
        } else {
          setSuppliers([]);
        }
      })
      .catch(() => setSuppliers([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) =>
      [s.id, s.name, s.contactPerson, s.contactInfo, s.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [search, suppliers]);

  return (
    <>
      <Head>
        <title>Suppliers - MediStock</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Suppliers</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Suppliers
            </h1>
            <p className="mt-2 text-sm text-slate-500">Manage medical and pharmaceutical vendors.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/suppliers/add"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Supplier
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Search suppliers
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search names, IDs, contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </label>

            <div className="flex items-center justify-end gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Filter
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Import
              </button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "ID",
                    "Supplier Name",
                    "Contact Person",
                    "Contact Info",
                    "Category",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-500">{s.id}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">{s.name}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{s.contactPerson ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{s.contactInfo ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{s.category ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 ring-green-600/10">{s.status}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={`Actions for ${s.name}`}>
                          <MoreIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</p>

            <div className="flex gap-2">
              {["1", "2", "3"].map((page) => (
                <button key={page} className={page === "1" ? "h-9 w-9 rounded-lg bg-blue-600 text-sm font-semibold text-white" : "h-9 w-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"}>
                  {page}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
