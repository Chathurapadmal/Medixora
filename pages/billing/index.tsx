import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import type { Invoice } from "@/pages/api/billing/invoices";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  }).format(n);
}

function statusStyle(s: Invoice["status"]) {
  const map: Record<Invoice["status"], string> = {
    Paid:      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending:   "bg-amber-50   text-amber-700   border border-amber-200",
    Overdue:   "bg-red-50     text-red-700     border border-red-200",
    Cancelled: "bg-slate-100  text-slate-500   border border-slate-200",
  };
  return map[s] ?? "bg-slate-100 text-slate-500";
}

// ─── Create Invoice Modal ───────────────────────────────────────────────────

type ModalProps = {
  onClose: () => void;
  onCreated: (inv: Invoice) => void;
};

function CreateInvoiceModal({ onClose, onCreated }: ModalProps) {
  const [form, setForm] = useState({
    patient_name: "",
    due_date: "",
    treatment_cost: "",
    medicine_cost: "",
    discount: "",
    payment_method: "Cash",
    notes: "",
    status: "Pending",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const treatNum = parseFloat(form.treatment_cost) || 0;
  const medNum   = parseFloat(form.medicine_cost)  || 0;
  const discNum  = parseFloat(form.discount)        || 0;
  const total    = treatNum + medNum - discNum;

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.patient_name.trim()) { setError("Patient name is required."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name:   form.patient_name.trim(),
          due_date:       form.due_date || undefined,
          treatment_cost: treatNum,
          medicine_cost:  medNum,
          discount:       discNum,
          payment_method: form.payment_method,
          notes:          form.notes || undefined,
          status:         form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create invoice"); return; }
      onCreated(data.invoice as Invoice);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">New Invoice</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Patient name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Patient Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={form.patient_name}
              onChange={e => set("patient_name", e.target.value)}
              placeholder="e.g. John Silva"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Due date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => set("due_date", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option>Pending</option>
                <option>Paid</option>
                <option>Overdue</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-3 gap-4">
            {(["treatment_cost", "medicine_cost", "discount"] as const).map((field) => (
              <div key={field}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 capitalize">
                  {field === "treatment_cost" ? "Treatment (Rs.)" : field === "medicine_cost" ? "Medicine (Rs.)" : "Discount (Rs.)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[field]}
                  onChange={e => set(field, e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
            <select
              value={form.payment_method}
              onChange={e => set("payment_method", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option>Cash</option>
              <option>Card</option>
              <option>Insurance</option>
              <option>Bank Transfer</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Any additional information..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Total preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total Amount</span>
            <span className="text-xl font-bold text-slate-900">{fmtCurrency(total)}</span>
          </div>

          {/* actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

type Stats = {
  todays_collection: number;
  pending_count: number;
  overdue_count: number;
  avg_invoice_value: number;
};

const STATUSES = ["all", "Pending", "Paid", "Overdue", "Cancelled"] as const;
const PAGE_SIZE = 15;

export default function BillingManagement() {
  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [total, setTotal]           = useState(0);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [search,     setSearch]     = useState("");
  const [statusFilter, setFilter]   = useState<typeof STATUSES[number]>("all");
  const [page,       setPage]       = useState(1);
  const [showModal,  setShowModal]  = useState(false);

  // Status update optimistic state
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Track previous search/filter to reset page when they change
  const prevSearchRef = useRef(search);
  const prevFilterRef = useRef(statusFilter);

  const load = useCallback(async (pageOverride?: number) => {
    setLoading(true);
    setError("");
    try {
      const activePage = pageOverride ?? page;
      const params = new URLSearchParams({
        page: String(activePage),
        limit: String(PAGE_SIZE),
        ...(search ? { search } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      });
      const res = await fetch(`/api/billing/invoices?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to load"); return; }
      setInvoices(data.invoices ?? []);
      setTotal(data.total ?? 0);
      setStats(data.stats ?? null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
   
  }, [page, search, statusFilter]);

  useEffect(() => {
    const searchChanged = prevSearchRef.current !== search;
    const filterChanged = prevFilterRef.current !== statusFilter;
    prevSearchRef.current = search;
    prevFilterRef.current = statusFilter;
    if (searchChanged || filterChanged) {
      setPage(1);
      void load(1);
    } else {
      void load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  async function updateStatus(invoiceId: number, newStatus: string) {
    setUpdatingId(invoiceId);
    try {
      await fetch("/api/billing/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId, status: newStatus }),
      });
      setInvoices(prev =>
        prev.map(inv =>
          inv.invoice_id === invoiceId ? { ...inv, status: newStatus as Invoice["status"] } : inv
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function onCreated(inv: Invoice) {
    setShowModal(false);
    setInvoices(prev => [inv, ...prev]);
    setTotal(prev => prev + 1);
  }

  return (
    <>
      <Head>
        <title>Billing Management | Medixora</title>
      </Head>

      {showModal && <CreateInvoiceModal onClose={() => setShowModal(false)} onCreated={onCreated} />}

      <div className="mx-auto max-w-[1280px] space-y-6 p-4 lg:p-6">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">Billing Management</h1>
            <p className="mt-0.5 text-sm text-slate-500">Review, process, and generate patient invoices.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Invoice
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "TODAY'S COLLECTIONS",
              value: stats ? fmtCurrency(stats.todays_collection) : "—",
              sub: "Paid invoices today",
              color: "text-emerald-600",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              ),
              iconBg: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "PENDING INVOICES",
              value: stats ? String(stats.pending_count) : "—",
              sub: "Awaiting payment",
              color: "text-amber-600",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              ),
              iconBg: "bg-amber-50 text-amber-600",
            },
            {
              label: "OVERDUE INVOICES",
              value: stats ? String(stats.overdue_count) : "—",
              sub: "Require attention",
              color: "text-red-600",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              ),
              iconBg: "bg-red-50 text-red-600",
            },
            {
              label: "AVG. BILL VALUE",
              value: stats ? fmtCurrency(stats.avg_invoice_value) : "—",
              sub: "Across paid invoices",
              color: "text-blue-600",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              ),
              iconBg: "bg-blue-50 text-blue-600",
            },
          ].map(card => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
                </div>
              </div>
              <p className={`mt-3 text-2xl font-bold ${card.color} lg:text-3xl`}>{card.value}</p>
              <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Controls */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative max-w-xs w-full">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search patient or invoice…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 flex-wrap">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => { setFilter(s); setPage(1); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    statusFilter === s
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-5 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Invoice #", "Patient", "Date", "Due Date", "Treatment", "Medicine", "Discount", "Total", "Method", "Status", "Actions"].map(h => (
                    <th key={h} className="whitespace-nowrap px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-10 text-center text-sm text-slate-400">Loading invoices…</td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-10 text-center text-sm text-slate-400">
                      No invoices found.{" "}
                      <button onClick={() => setShowModal(true)} className="text-blue-600 hover:underline">Create one?</button>
                    </td>
                  </tr>
                ) : invoices.map(inv => (
                  <tr key={inv.invoice_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-blue-600">{inv.invoice_number || `#${inv.invoice_id}`}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{inv.patient_name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{inv.invoice_date}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {inv.due_date ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-slate-700">{fmtCurrency(inv.treatment_cost)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-slate-700">{fmtCurrency(inv.medicine_cost)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-red-500">
                      {inv.discount > 0 ? `-${fmtCurrency(inv.discount)}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-900">{fmtCurrency(inv.total_amount)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {inv.payment_method ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <select
                        disabled={updatingId === inv.invoice_id}
                        value={inv.status}
                        onChange={e => updateStatus(inv.invoice_id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 disabled:opacity-50"
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Overdue</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{(page - 1) * PAGE_SIZE + 1}</span>
              {" – "}
              <span className="font-semibold text-slate-900">{Math.min(page * PAGE_SIZE, total)}</span>
              {" of "}
              <span className="font-semibold text-slate-900">{total}</span> invoices
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >&lt;</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      page === p ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
