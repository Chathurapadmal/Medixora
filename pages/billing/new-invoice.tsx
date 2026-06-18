import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type Medicine = {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  category: string;
};

type Patient = {
  patient_id: number;
  patient_name: string;
};

type LineItem = {
  medicine_id: number;
  medicine_name: string;
  unit_price: number;
  stock: number;
  quantity: number;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const fmtRs = (n: number) =>
  `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PAYMENT_METHODS = ["Cash", "Card", "Insurance", "Bank Transfer"];
const STATUSES = ["Pending", "Paid", "Overdue", "Cancelled"];

/* ------------------------------------------------------------------ */
/*  Medicine search component                                           */
/* ------------------------------------------------------------------ */
function MedicineSearch({
  medicines,
  onAdd,
}: {
  medicines: Medicine[];
  onAdd: (m: Medicine) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-slate-400">
          <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" fill="currentColor" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search medicine name or code…"
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          autoComplete="off"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="text-slate-400 hover:text-slate-600">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {results.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onAdd(m);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-blue-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">{m.code} · {m.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-700">{fmtRs(m.price)}</p>
                <p className={`text-xs ${m.stock < 10 ? "text-red-500 font-medium" : "text-slate-400"}`}>
                  {m.stock} in stock
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
          <p className="text-sm text-slate-400">No medicines found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function NewInvoicePage() {
  const router = useRouter();

  // ── Dropdown data ──
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients]   = useState<Patient[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── Form state ──
  const [patientId, setPatientId]         = useState<string>("");
  const [patientName, setPatientName]     = useState<string>("");
  const [dueDate, setDueDate]             = useState<string>("");
  const [treatmentCost, setTreatmentCost] = useState<string>("");
  const [discount, setDiscount]           = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [invoiceStatus, setInvoiceStatus] = useState<string>("Pending");
  const [notes, setNotes]                 = useState<string>("");
  const [items, setItems]                 = useState<LineItem[]>([]);

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string>("");
  const [success, setSuccess]       = useState<string>("");

  // ── Fetch data ──
  useEffect(() => {
    Promise.all([
      fetch("/api/inventory").then((r) => r.json()),
      fetch("/api/patients").then((r) => r.json()),
    ])
      .then(([inv, pats]) => {
        const meds: Medicine[] = (Array.isArray(inv) ? inv : []).map((m: any) => ({
          id:       m.id ?? m.medicine_id,
          code:     m.code ?? m.item_code ?? "",
          name:     m.name ?? m.medicine_name ?? "",
          price:    Number(m.price ?? m.unit_price ?? 0),
          stock:    Number(m.stock ?? m.stock_quantity ?? 0),
          category: m.category ?? "",
        }));
        setMedicines(meds);

        const ps: Patient[] = (Array.isArray(pats) ? pats : []).map((p: any) => ({
          patient_id:   p.patient_id ?? p.id,
          patient_name: p.patient_name ?? p.name ?? "",
        }));
        setPatients(ps);
      })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, []);

  // ── When patient selected from dropdown ──
  const handlePatientChange = (pid: string) => {
    setPatientId(pid);
    const found = patients.find((p) => String(p.patient_id) === pid);
    setPatientName(found?.patient_name ?? "");
  };

  // ── Add medicine to line items ──
  const handleAddMedicine = (m: Medicine) => {
    setItems((prev) => {
      const exists = prev.find((li) => li.medicine_id === m.id);
      if (exists) {
        // Just bump quantity
        return prev.map((li) =>
          li.medicine_id === m.id
            ? { ...li, quantity: Math.min(li.quantity + 1, li.stock) }
            : li
        );
      }
      return [
        ...prev,
        {
          medicine_id:   m.id,
          medicine_name: m.name,
          unit_price:    m.price,
          stock:         m.stock,
          quantity:      1,
        },
      ];
    });
  };

  const updateQty = (medicine_id: number, qty: number) => {
    setItems((prev) =>
      prev.map((li) =>
        li.medicine_id === medicine_id
          ? { ...li, quantity: Math.max(1, Math.min(qty, li.stock)) }
          : li
      )
    );
  };

  const removeItem = (medicine_id: number) => {
    setItems((prev) => prev.filter((li) => li.medicine_id !== medicine_id));
  };

  // ── Totals ──
  const medicineCost  = items.reduce((s, li) => s + li.quantity * li.unit_price, 0);
  const treatNum      = parseFloat(treatmentCost) || 0;
  const discNum       = parseFloat(discount) || 0;
  const totalAmount   = treatNum + medicineCost - discNum;

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!patientName.trim()) {
      setError("Please select or enter a patient name.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one medicine.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id:     patientId ? parseInt(patientId) : undefined,
          patient_name:   patientName.trim(),
          due_date:       dueDate || undefined,
          treatment_cost: treatNum,
          discount:       discNum,
          payment_method: paymentMethod,
          status:         invoiceStatus,
          notes:          notes || undefined,
          items: items.map((li) => ({
            medicine_id:   li.medicine_id,
            medicine_name: li.medicine_name,
            quantity:      li.quantity,
            unit_price:    li.unit_price,
            total_price:   li.quantity * li.unit_price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create invoice. Please try again.");
        return;
      }

      setSuccess(`Invoice ${data.invoice?.invoice_number ?? "#" + data.invoice_id} created successfully!`);
      setTimeout(() => router.push(`/billing/${data.invoice_id}`), 1500);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  return (
    <>
      <Head>
        <title>New Invoice – Medixora</title>
      </Head>

      <div className="mx-auto max-w-[1100px] space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <Link href="/billing" className="hover:text-blue-600 font-medium">Billing</Link>
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"/></svg>
              <span className="font-semibold text-slate-800">New Invoice</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Create New Invoice</h1>
            <p className="mt-0.5 text-sm text-slate-500">Select medicines, enter quantities, and generate the invoice.</p>
          </div>
          <Link
            href="/billing"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ← Back
          </Link>
        </div>

        {/* ── Feedback banners ── */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-red-500">
              <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-emerald-500">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-emerald-700">{success} Redirecting…</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* Patient & Details card */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-900">Invoice Details</h2>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">

                {/* Patient */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Patient <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="patient-select"
                    value={patientId}
                    onChange={(e) => handlePatientChange(e.target.value)}
                    disabled={loadingData}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  >
                    <option value="">{loadingData ? "Loading patients…" : "— Select a patient —"}</option>
                    {patients.map((p) => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.patient_name}
                      </option>
                    ))}
                  </select>
                  {/* Allow free-text if patient not in list */}
                  {!patientId && (
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Or type patient name manually…"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>

                {/* Treatment Cost */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Treatment Cost (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={treatmentCost}
                    onChange={(e) => setTreatmentCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Discount (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes or instructions…"
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </section>

            {/* Medicines card */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Medicines{" "}
                  <span className="text-red-500">*</span>
                  {items.length > 0 && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                      {items.length}
                    </span>
                  )}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">Search and add medicines. Inventory stock will be updated automatically.</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Search */}
                <MedicineSearch
                  medicines={medicines.filter((m) => m.stock > 0)}
                  onAdd={handleAddMedicine}
                />

                {/* Items table */}
                {items.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {["Medicine", "Unit Price", "Qty", "Line Total", ""].map((h) => (
                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((li) => (
                          <tr key={li.medicine_id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900">{li.medicine_name}</p>
                              <p className="text-xs text-slate-400">Stock: {li.stock}</p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                              {fmtRs(li.unit_price)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateQty(li.medicine_id, li.quantity - 1)}
                                  disabled={li.quantity <= 1}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={li.stock}
                                  value={li.quantity}
                                  onChange={(e) => updateQty(li.medicine_id, parseInt(e.target.value) || 1)}
                                  className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateQty(li.medicine_id, li.quantity + 1)}
                                  disabled={li.quantity >= li.stock}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-700">
                              {fmtRs(li.quantity * li.unit_price)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeItem(li.medicine_id)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                aria-label="Remove"
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Medicine subtotal */}
                      <tfoot className="border-t-2 border-slate-200 bg-blue-50/50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Medicine Subtotal
                          </td>
                          <td colSpan={2} className="px-4 py-3 text-right text-base font-bold text-blue-700">
                            {fmtRs(medicineCost)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-slate-300">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="mt-3 text-sm font-medium text-slate-500">No medicines added yet</p>
                    <p className="text-xs text-slate-400">Use the search bar above to find and add medicines</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN – Summary ── */}
          <div className="space-y-4">
            <div className="sticky top-4 space-y-4">

              {/* Summary card */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-base font-semibold text-slate-900">Invoice Summary</h3>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Treatment Cost</span>
                    <span className="font-medium text-slate-800">{fmtRs(treatNum)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Medicine ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                    <span className="font-medium text-slate-800">{fmtRs(medicineCost)}</span>
                  </div>
                  {discNum > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Discount</span>
                      <span className="font-medium text-red-500">− {fmtRs(discNum)}</span>
                    </div>
                  )}
                  <div className="my-2 border-t border-dashed border-slate-200" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Total Amount</span>
                    <span className="text-xl font-bold text-blue-700">{fmtRs(totalAmount)}</span>
                  </div>
                  <div className="mt-1 text-right text-xs text-slate-400">
                    {paymentMethod} · {invoiceStatus}
                  </div>
                </div>
              </div>

              {/* Inventory note */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-800">
                  📦 Inventory will be updated automatically when the invoice is created. Stock levels are reduced for each medicine added.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={submitting || success !== ""}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Creating Invoice…"
                    : success
                    ? "✓ Invoice Created!"
                    : "Create Invoice"}
                </button>
                <Link
                  href="/billing"
                  className="block w-full rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
