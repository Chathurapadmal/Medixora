import Head from "next/head";
import Link from "next/link";
import {
  AlertTriangleIcon,
  SearchIcon,
  WarningSmallIcon,
} from "../../components/dashboard-icons";

type AlertStatus = "Critical" | "Low" | "Out of Stock" | "Ordered";

type LowStockItem = {
  id: number;
  name: string;
  category?: string;
  stock?: number;
  minimum?: number;
  status?: AlertStatus;
  supplier?: string;
  price?: number;
  expiryDate?: string;
  action?: string;
};

import { useEffect, useState } from "react";

export default function LowStockAlertsPage() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [criticalLevelCount, setCriticalLevelCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  // Restock modal state
  const [restockItem, setRestockItem] = useState<LowStockItem | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockPrice, setRestockPrice] = useState("");
  const [restockExpiry, setRestockExpiry] = useState("");
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restocking, setRestocking] = useState(false);
  const [restockError, setRestockError] = useState("");
  const [restockSuccess, setRestockSuccess] = useState("");
  const [supplierList, setSupplierList] = useState<string[]>([]);

  function fetchItems() {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data: unknown) => {
        const rows = Array.isArray(data) ? data : (data as Record<string, unknown>)?.value || [];
        const safeRows = Array.isArray(rows) ? rows : [];

        // Extract unique supplier names from the full dataset (for restock dropdown)
        const names = [...new Set(
          safeRows
            .map((r: any) => String((r as Record<string, unknown>).supplier ?? ""))
            .filter(Boolean),
        )];
        setSupplierList(names.sort());

        const low = safeRows
          .map((r) => {
            const row = r as Record<string, unknown>;
            const stock = Number(row.stock || 0);
            const minimum = Number(row.minimum || 0);
            const status = stock === 0 ? "Out of Stock" : stock < minimum ? "Low" : "Ordered";
            return {
              id: Number(row.id ?? 0),
              name: String(row.name ?? "Unknown"),
              category: String(row.category ?? ""),
              stock,
              minimum,
              supplier: String(row.supplier ?? ""),
              price: row.price != null ? Number(row.price) : undefined,
              expiryDate: row.expiryDate ? String(row.expiryDate) : undefined,
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
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function openRestockModal(item: LowStockItem) {
    setRestockItem(item);
    setRestockQty("");
    setRestockPrice(item.price != null ? String(item.price) : "");
    setRestockExpiry(item.expiryDate ?? "");
    setRestockSupplier(item.supplier ?? "");
    setRestockError("");
    setRestockSuccess("");
  }

  function closeRestockModal() {
    setRestockItem(null);
    setRestockQty("");
    setRestockPrice("");
    setRestockExpiry("");
    setRestockSupplier("");
    setRestockError("");
    setRestockSuccess("");
  }

  async function handleRestock() {
    if (!restockItem) return;

    const qty = Number(restockQty);
    if (!qty || qty <= 0) {
      setRestockError("Please enter a quantity greater than zero.");
      return;
    }

    setRestocking(true);
    setRestockError("");
    setRestockSuccess("");

    try {
      const payload: Record<string, unknown> = {
        id: restockItem.id,
        quantity: qty,
      };

      // Include optional update fields only when filled
      if (restockPrice.trim()) payload.unitPrice = restockPrice;
      if (restockExpiry.trim()) payload.expiryDate = restockExpiry;
      if (restockSupplier.trim()) payload.supplier = restockSupplier;

      const response = await fetch("/api/inventory/restock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as Record<string, string>).error || "Restock failed.");
      }

      const updated = (await response.json()) as Record<string, unknown>;
      setRestockSuccess(
        `Successfully restocked ${restockItem.name}. New stock: ${updated.stock} units.`,
      );

      // Refresh the table data
      fetchItems();

      // Auto-close after a short delay so the user sees the success message
      setTimeout(() => {
        closeRestockModal();
      }, 1500);
    } catch (err: any) {
      setRestockError(err.message || "An unexpected error occurred.");
    } finally {
      setRestocking(false);
    }
  }

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

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                {filteredItems.map((item) => {
                  const stock = Number(item.stock ?? 0);
                  const minimum = Number(item.minimum ?? 1);
                  const percentage = Math.min(100, Math.round((stock / minimum) * 100));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
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
                        <button
                          onClick={() => openRestockModal(item)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          {item.action || "Restock"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            Showing {filteredItems.length} of {items.length} entries
          </div>
        </section>
      </div>

      {/* ── Restock Modal ─────────────────────────────────────────────── */}
      {restockItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRestockModal();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Restock Medicine
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add stock for&nbsp;
                  <span className="font-semibold text-slate-700">
                    {restockItem.name}
                  </span>
                </p>
              </div>

              <button
                onClick={closeRestockModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Current stock info */}
            <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Current
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {restockItem.stock}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Minimum
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-600">
                    {restockItem.minimum}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Deficit
                  </p>
                  <p className="mt-1 text-xl font-bold text-red-600">
                    {Math.max(0, (restockItem.minimum ?? 0) - (restockItem.stock ?? 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity input */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Restock Quantity <span className="text-red-500">*</span>
              </span>
              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  placeholder={String(
                    Math.max(0, (restockItem.minimum ?? 0) - (restockItem.stock ?? 0)),
                  )}
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => {
                    setRestockQty(e.target.value);
                    setRestockError("");
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRestock();
                  }}
                />
                <span className="border-l border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">
                  Units
                </span>
              </div>
            </label>

            {/* Suggested quick-fill */}
            {(restockItem.minimum ?? 0) > (restockItem.stock ?? 0) && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRestockQty(
                      String(Math.max(0, (restockItem.minimum ?? 0) - (restockItem.stock ?? 0))),
                    )
                  }
                  className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  Fill to minimum ({(restockItem.minimum ?? 0) - (restockItem.stock ?? 0)})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRestockQty(
                      String(
                        Math.max(0, (restockItem.minimum ?? 0) * 2 - (restockItem.stock ?? 0)),
                      ),
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Fill to 2× minimum
                </button>
              </div>
            )}

            {/* Optional update fields */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Update Details (optional)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Unit Price */}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Unit Price
                  </span>
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                    <span className="border-r border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">
                      Rs
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                      placeholder="12.50"
                      type="number"
                      step="0.01"
                      min="0"
                      value={restockPrice}
                      onChange={(e) => setRestockPrice(e.target.value)}
                    />
                  </div>
                </label>

                {/* Expiry Date */}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Expiry Date
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    type="date"
                    value={restockExpiry}
                    onChange={(e) => setRestockExpiry(e.target.value)}
                  />
                </label>

                {/* Supplier */}
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Supplier
                  </span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    value={restockSupplier}
                    onChange={(e) => setRestockSupplier(e.target.value)}
                  >
                    <option value="">— Keep current supplier —</option>
                    {supplierList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Error / Success feedback */}
            {restockError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {restockError}
              </div>
            )}
            {restockSuccess && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {restockSuccess}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={closeRestockModal}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={restocking || !!restockSuccess}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restocking ? "Restocking…" : "Confirm Restock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}