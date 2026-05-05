import Head from "next/head";
import Link from "next/link";
import {
  AlertTriangleIcon,
  SearchIcon,
  WarningSmallIcon,
} from "../../components/dashboard-icons";

type ExpiryStatus = "Expired" | "Expiring Soon";

type ExpiryItem = {
  name: string;
  batchNo?: string;
  quantity?: string;
  expiryDate?: string;
  daysRemaining?: number;
  status?: ExpiryStatus;
};

import { useEffect, useState } from "react";

const computeDaysRemaining = (expiry?: string) => {
  if (!expiry) return undefined;
  const d = new Date(expiry);
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function ExpiryAlertsPage() {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((rows: unknown) => {
        const safeRows = Array.isArray(rows) ? rows : [];
        const filtered = safeRows
          .map((r) => {
            const row = r as Record<string, unknown>;
            const days = computeDaysRemaining(String(row.expiryDate ?? ""));
            const status = (row.expiryDate && typeof days === "number" && days < 0) ? "Expired" : "Expiring Soon";
            return {
              name: String(row.name ?? "Unknown"),
              batchNo: String(row.batchNo ?? ""),
              quantity: String(row.stock ?? "-"),
              expiryDate: String(row.expiryDate ?? ""),
              daysRemaining: days,
              status: status as ExpiryStatus,
            };
          })
          .filter((i) => Boolean(i.expiryDate));
        setItems(filtered);
      })
      .catch(() => setItems([]));
  }, []);

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
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              Filter
            </button>

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
                <p className="mt-2 text-3xl font-bold text-red-600">24</p>
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
                <p className="mt-2 text-3xl font-bold text-amber-600">156</p>
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
            <p className="mt-2 text-3xl font-bold text-slate-950">$14,250</p>
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

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:w-72">
              <SearchIcon className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search item name..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Item Name",
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
                {items.map((item) => (
                  <tr key={item.batchNo} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                      {item.name}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {item.batchNo}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {item.quantity}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                      {item.expiryDate}
                    </td>

                    <td
                      className={[
                        "whitespace-nowrap px-4 py-4 text-sm font-bold",
                        (item.daysRemaining ?? 0) < 0
                          ? "text-red-600"
                          : "text-amber-600",
                      ].join(" ")}
                    >
                      {typeof item.daysRemaining === "number" ? item.daysRemaining : "-"}
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing 1 to 5 of 180 entries
            </p>

            <div className="flex gap-2">
              {["1", "2", "3"].map((page) => (
                <button
                  key={page}
                  className={
                    page === "1"
                      ? "h-9 w-9 rounded-lg bg-blue-600 text-sm font-semibold text-white"
                      : "h-9 w-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  }
                >
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