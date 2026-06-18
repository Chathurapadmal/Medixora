import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PlusIcon,
  SearchIcon,
  MoreIcon,
} from "../components/dashboard-icons";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  contactInfo?: string;
  status?: string;
  phone?: string;
  email?: string;
  address?: string;
};

/* ------------------------------------------------------------------ */
/*  Actions dropdown                                                    */
/* ------------------------------------------------------------------ */
function ActionsMenu({
  supplier,
  onDelete,
}: {
  supplier: Supplier;
  onDelete: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Actions for ${supplier.name}`}
      >
        <MoreIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5">

          {/* View */}
          <button
            onClick={() => {
              setOpen(false);
              alert(
                `Supplier Details\n\nName: ${supplier.name}\nContact Person: ${supplier.contactPerson ?? "–"}\nContact Info: ${supplier.contactInfo ?? "–"}\nStatus: ${supplier.status ?? "–"}`
              );
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-400">
              <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            View Details
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100" />

          {/* Delete */}
          <button
            onClick={() => {
              setOpen(false);
              onDelete(supplier.id, supplier.name);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-red-400">
              <path d="M8.5 4h3a1.5 1.5 0 0 0-3 0Zm-1.5 0a3 3 0 1 1 6 0h4a.75.75 0 0 1 0 1.5h-.893l-.9 9.63A2.75 2.75 0 0 1 12.468 17H7.532a2.75 2.75 0 0 1-2.74-2.87l-.9-9.63H3a.75.75 0 0 1 0-1.5h4Z" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [deleting, setDeleting]   = useState<string | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────
  const loadSuppliers = () => {
    setLoading(true);
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((json) => {
        const rows: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : [];
        setSuppliers(
          rows.map((s: any) => ({
            id:            String(s.supplier_id ?? s.id ?? Math.random()),
            name:          s.supplier_name ?? s.name ?? "Unknown",
            contactPerson: s.contact_person ?? s.contactPerson ?? undefined,
            phone:         s.phone ?? undefined,
            email:         s.email ?? undefined,
            contactInfo:   s.phone
              ? `${s.phone}${s.email ? " · " + s.email : ""}`
              : s.email ?? s.contactInfo ?? undefined,
            status:        s.status ?? "Active",
          }))
        );
      })
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSuppliers(); }, []);

  // ── delete ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/suppliers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      } else {
        const json = await res.json().catch(() => ({}));
        alert((json as any).error || "Failed to delete supplier.");
      }
    } catch {
      alert("Network error – could not delete supplier.");
    } finally {
      setDeleting(null);
    }
  };

  // ── search filter ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) =>
      [s.id, s.name, s.contactPerson, s.contactInfo]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [search, suppliers]);

  /* ---------------------------------------------------------------- */
  return (
    <>
      <Head>
        <title>Suppliers - MediStock</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Suppliers</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Suppliers
            </h1>
            <p className="mt-2 text-sm text-slate-500">Manage medical and pharmaceutical vendors.</p>
          </div>

          <Link
            href="/suppliers/add"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Supplier
          </Link>
        </div>

        {/* SEARCH BAR */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Search Suppliers
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
              <button
                onClick={() => setSearch("")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                onClick={loadSuppliers}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["ID", "Supplier Name", "Contact Person", "Contact Info", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  /* skeleton rows */
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const isActive = (s.status ?? "").toLowerCase() === "active";
                    return (
                      <tr
                        key={s.id}
                        className={`transition hover:bg-slate-50 ${deleting === s.id ? "opacity-40 pointer-events-none" : ""}`}
                      >
                        {/* ID */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-500">
                          #{s.id}
                        </td>

                        {/* NAME */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                          {s.name}
                        </td>

                        {/* CONTACT PERSON */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {s.contactPerson ?? "–"}
                        </td>

                        {/* CONTACT INFO */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {s.contactInfo ?? "–"}
                        </td>

                        {/* STATUS */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-slate-400"}`}
                            />
                            {s.status ?? "Active"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <ActionsMenu supplier={s} onDelete={handleDelete} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {suppliers.length} entries
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
