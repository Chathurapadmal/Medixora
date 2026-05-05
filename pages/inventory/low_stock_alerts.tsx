import Head from "next/head";
import Link from "next/link";
import {
  AlertTriangleIcon,
  SearchIcon,
  WarningSmallIcon,
} from "../../components/dashboard-icons";

type AlertStatus = "Critical" | "Low" | "Out of Stock" | "Ordered";

type LowStockItem = {
  name: string;
  category?: string;
  stock?: number;
  minimum?: number;
  status?: AlertStatus;
  supplier?: string;
  action?: string;
};

import { useEffect, useState } from "react";

export default function LowStockAlertsPage() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [criticalLevelCount, setCriticalLevelCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data: unknown) => {
        const rows = Array.isArray(data) ? data : (data as Record<string, unknown>)?.value || [];
        const safeRows = Array.isArray(rows) ? rows : [];
        const low = safeRows
          .map((r) => {
            const row = r as Record<string, unknown>;
            const stock = Number(row.stock || 0);
            const minimum = Number(row.minimum || 0);
            const status = stock === 0 ? "Out of Stock" : stock < minimum ? "Low" : "Ordered";
            return {
              name: String(row.name ?? "Unknown"),
              category: String(row.category ?? ""),
              stock,
              minimum,
              supplier: String(row.supplier ?? ""),
              action: stock < minimum ? "Restock" : "",
              status: status as AlertStatus,
            };
          })
          .filter((i) => typeof i.minimum === "number" && i.minimum > 0 && i.stock! <= i.minimum!);

        setItems(low);

        // Compute summary counts from filtered items
        const outOfStock = low.filter((i) => i.stock === 0).length;
        const lowStock = low.filter((i) => i.status === "Low").length;
        const critical = low.filter((i) => (i.stock ?? 0) < ((i.minimum ?? 1) * 0.25)).length;

        setOutOfStockCount(outOfStock);
        setLowStockCount(lowStock);
        setCriticalLevelCount(critical);
      })
      .catch(() => {
        setItems([]);
        setOutOfStockCount(0);
        setLowStockCount(0);
        setCriticalLevelCount(0);
      });
  }, []);

  const statusClass: Record<AlertStatus, string> = {
    Critical: "bg-red-50 text-red-700 ring-red-600/20",
    Low: "bg-amber-50 text-amber-700 ring-amber-600/20",
    "Out of Stock": "bg-slate-900 text-white ring-slate-900/20",
    Ordered: "bg-blue-50 text-blue-700 ring-blue-600/20",
  };

  const getWidthClass = (value: number): string => {
    if (value <= 0) return "w-0";
    if (value <= 25) return "w-1/4";
    if (value <= 50) return "w-1/2";
    if (value <= 75) return "w-3/4";
    return "w-full";
  };
  return (
    <>
      <Head>
        <title>Low Stock Alerts - MediStock</title>
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

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link
                href="/inventory"
                className="text-blue-600 hover:text-blue-700"
              >
                Inventory
              </Link>
              <span>/</span>
              <span>Low Stock Alerts</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Inventory Alerts
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage low stock and critical medical supplies.
            </p>
          </div>

          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            Export Report
          </button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Low Stock
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">{lowStockCount}</p>
                <p className="mt-1 text-sm text-slate-500">
                  +5 since yesterday
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
                  Critical Levels
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{criticalLevelCount}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Requires immediate attention
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <AlertTriangleIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Out of Stock
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{outOfStockCount}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Pending supplier delivery
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <AlertTriangleIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Actionable Items
              </h2>
              <p className="text-sm text-slate-500">
                Prioritized items that need purchase or delivery follow-up.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:w-72">
              <SearchIcon className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Item Name & Category",
                    "Stock Level",
                    "Status",
                    "Supplier",
                    "Action",
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
                {items
                  .filter(
                    (item) =>
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => {
                  const stock = Number(item.stock ?? 0);
                  const minimum = Number(item.minimum ?? 1);
                  const percentage = Math.min(100, Math.round((stock / minimum) * 100));

                  return (
                    <tr key={item.name} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-950">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.category}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="w-48">
                          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                            <span>
                              {item.stock} / {item.minimum} min
                            </span>
                            <span>{percentage}%</span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={[
                                "h-full rounded-full",
                                getWidthClass(percentage),
                                item.status === "Critical" ||
                                item.status === "Out of Stock"
                                  ? "bg-red-500"
                                  : "bg-amber-500",
                              ].join(" ")}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            statusClass[(item.status ?? "Low") as AlertStatus],
                          ].join(" ")}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {item.supplier}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                          {item.action}
                        </button>
                      </td>
                    </tr>
                  );
                })
                }
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            Showing 1 to 4 of 63 entries
          </div>
        </section>
      </div>
    </>
  );
}