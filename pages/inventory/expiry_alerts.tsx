import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  SearchIcon,
  WarningSmallIcon,
} from "../../components/dashboard-icons";

type ExpiryStatus = "Expired" | "Expiring Soon";

type ExpiryItem = {
  id: number;
  name: string;
  category?: string;
  batchNo?: string;
  quantity?: number;
  expiryDate?: string;
  daysRemaining?: number;
  status?: ExpiryStatus;
  price?: number;
  stock?: number;
  supplier?: string;
};

const computeDaysRemaining = (expiry?: string) => {
  if (!expiry) return undefined;
  const d = new Date(expiry);
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function ExpiryAlertsPage() {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  useEffect(() => {
    fetch("/api/inventory/expiry-alerts")
      .then((r) => r.json())
      .then((data: unknown) => {
        const rows = Array.isArray(data) ? data : [];

        const mapped = rows.map((r: any) => {
          const expiryDate = String(r.expiryDate ?? "");
          const daysRemaining = computeDaysRemaining(expiryDate);

          return {
            id: Number(r.id),
            name: String(r.name ?? "Unknown"),
            category: String(r.category ?? ""),
            batchNo: String(r.batchNo ?? ""),
            quantity: Number(r.quantity ?? 0),
            expiryDate,
            daysRemaining,
            status:
              typeof daysRemaining === "number" && daysRemaining < 0
                ? ("Expired" as ExpiryStatus)
                : ("Expiring Soon" as ExpiryStatus),
            price: Number(r.price ?? 0),
            stock: Number(r.stock ?? 0),
            supplier: String(r.supplier ?? ""),
          };
        });

        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.category?.trim()).filter(Boolean) as string[]),
      ).sort(),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items
        .filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batchNo?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .filter(
          (item) =>
            categoryFilter === "All Categories" || item.category === categoryFilter,
        ),
    [categoryFilter, items, searchTerm],
  );

  const expiredCount = items.filter((item) => (item.daysRemaining ?? 999) < 0).length;
  const expiringCount = items.filter(
    (item) => (item.daysRemaining ?? 999) >= 0 && (item.daysRemaining ?? 999) < 30,
  ).length;
  const valueAtRisk = items
    .filter((item) => (item.daysRemaining ?? 999) < 30)
    .reduce((sum, item) => sum + (item.price ?? 0) * (item.stock ?? 0), 0);

  const statusClass: Record<ExpiryStatus, string> = {
    Expired: "bg-red-600 text-white ring-red-600/20",
    "Expiring Soon": "bg-amber-50 text-amber-700 ring-amber-600/20",
  };

  return (
    <>
      <Head>
        <title>Expiry Alerts - MediStock</title>
      </Head>

      <div className="relative mx-auto max-w-7xl space-y-6">
        <Link
          href="/inventory"
          className="absolute -left-14 -top-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-2xl font-bold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          aria-label="Back to inventory dashboard"
          title="Back to Inventory"
        >
          ←
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link
                href="/inventory"
                className="text-blue-600 hover:text-blue-700"
              >
                Inventory
              </Link>
              <span>/</span>
              <span>Expiry Alerts</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Expiry Alerts
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Monitor critical inventory dates. Items flagged here require
              immediate attention to prevent clinical shortages, waste, or
              compliance violations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              Export Report
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Expired Items
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">{expiredCount}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Requires immediate disposal protocol.
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-2 text-red-600">
                <WarningSmallIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Expiring Soon
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{expiringCount}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Less than 30 days. Review usage rates.
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <AlertTriangleIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Value at Risk
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              Rs{valueAtRisk.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-emerald-600">
              +2.4% vs last month
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Critical Inventory List
              </h2>
              <p className="text-sm text-slate-500">
                Expired and near-expiry medicines that need attention.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category
                </span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                  aria-label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option>All Categories</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Item Name",
                    "Category",
                    "Batch No.",
                    "Quantity",
                    "Expiry Date",
                    "Days Rem.",
                    "Status",
                  ].map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      Loading…
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No expiry alerts found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                        {item.name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {item.category || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {item.batchNo || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {item.quantity ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                        {item.expiryDate || "-"}
                      </td>

                      <td
                        className={[
                          "whitespace-nowrap px-4 py-4 text-sm font-bold",
                          (item.daysRemaining ?? 0) < 0
                            ? "text-red-600"
                            : "text-amber-600",
                        ].join(" ")}
                      >
                        {typeof item.daysRemaining === "number"
                          ? item.daysRemaining
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            statusClass[(item.status ?? "Expiring Soon") as ExpiryStatus],
                          ].join(" ")}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-500">
              Showing 1 to {filteredItems.length} of {items.length} entries
            </p>
          </div>
        </section>
      </div>
    </>
  );
}