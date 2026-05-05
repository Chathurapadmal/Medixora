import Head from "next/head";
import Link from "next/link";
import {
  MedicineIcon,
  PlusIcon,
  SearchIcon,
} from "../../components/dashboard-icons";
import { useEffect, useMemo, useState } from "react";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Expired";

type InventoryItem = {
  id: string;
  name: string;
  category?: string;
  stock?: number | string;
  minimum?: number;
  price?: string | number;
  expiryDate?: string;
  supplier?: string;
  status?: StockStatus;
  batchNo?: string;
  description?: string;
};

type InventoryFilterStatus = "All Statuses" | StockStatus;

function normalizeStatus(status?: string): StockStatus {
  if (status === "Available" || status === "In Stock") return "In Stock";
  if (status === "Low Stock") return "Low Stock";
  if (status === "Out of Stock") return "Out of Stock";
  return "Expired";
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] =
    useState<InventoryFilterStatus>("All Statuses");

  useEffect(() => {
    let mounted = true;

    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) {
          setInventoryItems(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => setInventoryItems([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const statusStyles: Record<StockStatus, string> = {
    "In Stock": "bg-green-300 text-green-700 ring-green-600/20",
    "Low Stock": "bg-orange-300 text-orange-700 ring-orange-600/20",
    "Out of Stock": "bg-red-200 text-red-700 ring-red-600/20",
    Expired: "bg-red-600 text-white ring-red-600/20",
  };

  const normalizedItems = useMemo(
    () =>
      inventoryItems.map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      })),
    [inventoryItems]
  );

  const categoryOptions = useMemo(() => {
    const categories = new Set(
      normalizedItems
        .map((item) => item.category?.trim())
        .filter((value): value is string => Boolean(value))
    );

    return ["All Categories", ...Array.from(categories).sort()];
  }, [normalizedItems]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return normalizedItems.filter((item) => {
      const matchesSearch =
        !query ||
        [item.id, item.name, item.category, item.supplier, item.batchNo]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesCategory =
        categoryFilter === "All Categories" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All Statuses" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, normalizedItems, searchTerm, statusFilter]);

  const totalMedicines = normalizedItems.length;

  const criticalLevels = normalizedItems.filter((item) => {
    const stock = Number(item.stock ?? 0);
    const minimum = Number(item.minimum ?? 0);
    return stock > 0 && stock < minimum;
  }).length;

  const expiredItems = normalizedItems.filter(
    (item) => item.status === "Expired"
  ).length;

  const outOfStockItems = normalizedItems.filter(
    (item) => Number(item.stock ?? 0) <= 0
  ).length;

  const showingFrom = filteredItems.length > 0 ? 1 : 0;
  const showingTo = filteredItems.length;

  return (
    <>
      <Head>
        <title>Medicine Inventory - MediStock</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Inventory</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Medicine Inventory
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage stock levels, expiry dates, categories, and supplier
              details.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/inventory/add_medicine"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Medicine
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <MedicineIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Medicines
                </p>
                <p className="text-2xl font-bold text-slate-950">
                  {totalMedicines}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/inventory/low_stock_alerts"
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:bg-amber-100"
          >
            <p className="text-sm font-medium text-slate-500">
              Critical Levels
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {criticalLevels + outOfStockItems}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Low stock and out of stock items
            </p>
          </Link>

          <Link
            href="/inventory/expiry_alerts"
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-300 hover:bg-red-100"
          >
            <p className="text-sm font-medium text-slate-500">Expired Items</p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {expiredItems}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Requires disposal protocol
            </p>
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Search Inventory
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Category
              </span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Stock Status
              </span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as InventoryFilterStatus)
                }
              >
                <option>All Statuses</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
                <option>Expired</option>
              </select>
            </label>

            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              More Filters
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "ID",
                    "Medicine Name",
                    "Category",
                    "Stock",
                    "Unit Price",
                    "Expiry Date",
                    "Supplier",
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
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No inventory items match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-500">
                        {item.id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                        {item.name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {item.category}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                        {String(item.stock ?? "-")}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {String(item.price ?? "-")}
                      </td>

                      <td
                        className={[
                          "whitespace-nowrap px-4 py-4 text-sm",
                          item.status === "Expired"
                            ? "font-semibold text-red-600"
                            : "text-slate-600",
                        ].join(" ")}
                      >
                        {item.expiryDate ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {item.supplier ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            statusStyles[item.status as StockStatus],
                          ].join(" ")}
                        >
                          {item.status ?? "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {showingFrom} to {showingTo} of {filteredItems.length}{" "}
              entries
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