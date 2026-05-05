import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { MedicineIcon, PlusIcon } from "../../components/dashboard-icons";

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

type Supplier = { id?: number; name: string };

type MedicineForm = {
  name: string;
  category: string;
  supplier: string;
  code: string;
  description: string;
  quantity: number;
  minimum: number;
  price: string;
  expiryDate: string;
  location: string;
  batchNo: string;
};

export default function AddMedicinePage() {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [form, setForm] = useState<MedicineForm>({
    name: "",
    category: "",
    supplier: "",
    code: "",
    description: "",
    quantity: 0,
    minimum: 0,
    price: "",
    expiryDate: "",
    location: "",
    batchNo: "",
  });

  useEffect(() => {
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((data: unknown) => {
        const safeData = Array.isArray(data) ? data : [];
        // suppliers API may return objects or strings
        const names = safeData.map((s) => (typeof s === "string" ? s : (s as Supplier).name));
        setSuppliers(names as string[]);
      })
      .catch(() => setSuppliers([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    // simple post-submit behavior: navigate back
    location.href = "/inventory";
  }

  return (
    <>
      <Head>
        <title>Add Medicine - MediStock</title>
      </Head>

      <div className="relative mx-auto max-w-5xl space-y-6">
        <Link
          href="/inventory"
          className="absolute -left-14 -top-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-2xl font-bold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          aria-label="Back to inventory dashboard"
          title="Back to Inventory"
        >
          ←
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link
                href="/inventory"
                className="text-blue-600 hover:text-blue-700"
              >
                Inventory
              </Link>
              <span>/</span>
              <span>Add Medicine</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Add New Medicine
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enter the details for a new inventory item and add it to the
              medicine catalog.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <MedicineIcon className="h-7 w-7" />
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <MedicineIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Clinical Identification
                </h2>
                <p className="text-sm text-slate-500">
                  Medicine identity, category, supplier, and dosage notes.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Medicine Name" required>
                <input
                  className={inputClass}
                  placeholder="e.g. Amoxicillin 500mg"
                  aria-label="Medicine Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>

              <Field label="Category" required>
                <select
                  className={inputClass}
                  aria-label="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option>Antibiotics</option>
                  <option>Analgesics</option>
                  <option>Antipyretics</option>
                  <option>Vaccines</option>
                  <option>Supplements</option>
                </select>
              </Field>

              <Field label="Primary Supplier" required>
                <select
                  className={inputClass}
                  aria-label="Primary Supplier"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                >
                  <option value="" disabled>
                    Select Supplier
                  </option>
                  {suppliers.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Medicine Code">
                <input
                  className={inputClass}
                  placeholder="Auto generated or enter manually"
                  aria-label="Medicine Code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Description & Dosage Guidelines">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="Add dosage guidelines, handling notes, or safety instructions..."
                    aria-label="Description and Dosage Guidelines"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <PlusIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Stock Metrics
                </h2>
                <p className="text-sm text-slate-500">
                  Initial quantity, warning threshold, price, expiry, and
                  location.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Initial Quantity" required>
                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    placeholder="500"
                    aria-label="Initial Quantity"
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  />
                  <span className="border-l border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">
                    Units
                  </span>
                </div>
              </Field>

              <Field label="Minimum Alert Stock" required>
                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    placeholder="100"
                    aria-label="Minimum Alert Stock"
                    type="number"
                    value={form.minimum}
                    onChange={(e) => setForm({ ...form, minimum: Number(e.target.value) })}
                  />
                  <span className="border-l border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">
                    Units
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Triggers low stock warning.
                </p>
              </Field>

              <Field label="Unit Price">
                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <span className="border-r border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">
                    Rs
                  </span>
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    placeholder="12.50"
                    aria-label="Unit Price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </Field>

              <Field label="Expiry Date" required>
                <input className={inputClass} type="date" aria-label="Expiry Date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </Field>

              <Field label="Storage Location">
                <select className={inputClass} aria-label="Storage Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                  <option value="" disabled>
                    Select Aisle / Shelf
                  </option>
                  <option>Aisle A - Shelf 1 (Cold Storage)</option>
                  <option>Aisle B - Shelf 3</option>
                  <option>Aisle C - Shelf 2 (Secure)</option>
                </select>
              </Field>

              <Field label="Batch Number">
                <input className={inputClass} placeholder="e.g. AMX-442-X1" aria-label="Batch Number" value={form.batchNo} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} />
              </Field>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/inventory"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Save Medicine
            </button>
          </div>
        </form>
      </div>
    </>
  );
}