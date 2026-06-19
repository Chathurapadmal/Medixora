import Head from "next/head";
import { useState, useCallback } from "react";
import { BillingIcon, PlusIcon } from "@/components/dashboard-icons";

type BillItem = {
  id: string;
  label: string;
  qty: number;
  unitPrice: number;
  category: string;
};

const SERVICE_CATALOG: { label: string; price: number; category: string }[] = [
  { label: "General Consultation", price: 150, category: "Consultation" },
  { label: "Specialist Consultation", price: 250, category: "Consultation" },
  { label: "Emergency Consultation", price: 350, category: "Consultation" },
  { label: "Complete Blood Count (CBC)", price: 85.5, category: "Lab" },
  { label: "Lipid Panel", price: 110, category: "Lab" },
  { label: "Urinalysis", price: 55, category: "Lab" },
  { label: "Blood Glucose Test", price: 45, category: "Lab" },
  { label: "Chest X-Ray", price: 180, category: "Radiology" },
  { label: "Ultrasound Scan", price: 220, category: "Radiology" },
  { label: "ECG / EKG", price: 130, category: "Procedure" },
  { label: "IV Drip (per session)", price: 95, category: "Procedure" },
  { label: "Wound Dressing", price: 65, category: "Procedure" },
  { label: "Pharmacy – Custom", price: 0, category: "Pharmacy" },
];

const PATIENTS = [
  { id: "p1", name: "Elena Vance", dob: "1988-03-14", id_no: "PT-00421" },
  { id: "p2", name: "James Sullivan", dob: "1975-11-02", id_no: "PT-00388" },
  { id: "p3", name: "Mariah Woods", dob: "1993-07-29", id_no: "PT-00510" },
];

const CONSULTATIONS = [
  { id: "c1", label: "Routine Consultation – May 12, 2026", patientId: "p1" },
  { id: "c2", label: "Diagnostic Review – May 11, 2026", patientId: "p2" },
  { id: "c3", label: "Follow-up – May 10, 2026", patientId: "p3" },
];

let nextId = 10;

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function BillingPage() {
  const [items, setItems] = useState<BillItem[]>([
    { id: "i1", label: "General Consultation", qty: 1, unitPrice: 150, category: "Consultation" },
    { id: "i2", label: "Complete Blood Count (CBC)", qty: 1, unitPrice: 85.5, category: "Lab" },
  ]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(5);
  const [selectedPatient, setSelectedPatient] = useState("p1");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setBillingNotes] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState("All");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  const patient = PATIENTS.find((p) => p.id === selectedPatient) ?? PATIENTS[0];

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
  const discountAmt = subtotal * (discount / 100);
  const taxAmt = (subtotal - discountAmt) * (tax / 100);
  const total = subtotal - discountAmt + taxAmt;

  const showToast = useCallback((msg: string, type: "success" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addFromCatalog = (svc: (typeof SERVICE_CATALOG)[0]) => {
    const id = `i${nextId++}`;
    setItems((prev) => [...prev, { id, label: svc.label, qty: 1, unitPrice: svc.price, category: svc.category }]);
    setShowCatalog(false);
    showToast(`"${svc.label}" added to bill`);
  };

  const addCustomItem = () => {
    const id = `i${nextId++}`;
    setItems((prev) => [...prev, { id, label: "Custom Service", qty: 1, unitPrice: 0, category: "Other" }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    showToast("Item removed", "info");
  };

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: field === "label" ? value : Number(value) } : it))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerate = () => {
    showToast("Invoice generated successfully!");
  };

  const categories = ["All", ...Array.from(new Set(SERVICE_CATALOG.map((s) => s.category)))];
  const filteredCatalog = catalogFilter === "All" ? SERVICE_CATALOG : SERVICE_CATALOG.filter((s) => s.category === catalogFilter);

  return (
    <>
      <Head>
        <title>Generate Bill – Medixora</title>
        <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>
      </Head>

      {/* Toast */}
      {toast && (
        <div className={`no-print fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium text-white shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-600" : "bg-slate-700"}`}>
          {toast.type === "success" && <CheckIcon className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showPreview && (
        <div className="no-print fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPreview(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">✕</button>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[22px] font-bold text-[#1d4ed8]">MEDIXORA</p>
                <p className="text-[12px] text-slate-500">Medical Management System</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-slate-700">INVOICE</p>
                <p className="text-[12px] text-slate-400">INV-{Date.now().toString().slice(-6)}</p>
                <p className="text-[12px] text-slate-400">Due: {dueDate}</p>
              </div>
            </div>
            <div className="mb-6 rounded-lg bg-slate-50 p-4 text-[13px]">
              <p className="font-semibold text-slate-800">{patient.name}</p>
              <p className="text-slate-500">Patient ID: {patient.id_no}</p>
              <p className="text-slate-500">DOB: {patient.dob}</p>
            </div>
            <table className="mb-6 w-full text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] uppercase text-slate-400">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Unit</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{it.label}</td>
                    <td className="py-2 text-center text-slate-500">{it.qty}</td>
                    <td className="py-2 text-right text-slate-500">${it.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium text-slate-800">${(it.qty * it.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Discount ({discount}%)</span><span>-${discountAmt.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Tax ({tax}%)</span><span>+${taxAmt.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-[15px] font-bold text-slate-900"><span>Total Due</span><span className="text-[#1d4ed8]">${total.toFixed(2)}</span></div>
            </div>
            {notes && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">{notes}</p>}
            <div className="mt-6 flex gap-2">
              <button onClick={handlePrint} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">Print</button>
              <button onClick={handleGenerate} className="flex-1 rounded-xl bg-[#1d4ed8] py-2.5 text-[13px] font-semibold text-white hover:bg-[#1e40af]">Confirm & Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Catalog Drawer */}
      {showCatalog && (
        <div className="no-print fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCatalog(false)}>
          <div className="h-full w-full max-w-sm overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-slate-900">Service Catalog</h3>
                <button onClick={() => setShowCatalog(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setCatalogFilter(cat)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${catalogFilter === cat ? "bg-[#1d4ed8] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-100 p-3">
              {filteredCatalog.map((svc) => (
                <button key={svc.label} onClick={() => addFromCatalog(svc)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-slate-50">
                  <div>
                    <p className="text-[13px] font-medium text-slate-800">{svc.label}</p>
                    <p className="text-[11px] text-slate-400">{svc.category}</p>
                  </div>
                  <span className="ml-4 text-[13px] font-semibold text-[#1d4ed8]">{svc.price > 0 ? `$${svc.price.toFixed(2)}` : "Custom"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Generate Bill</h1>
            <p className="mt-1 text-[14px] text-slate-500">Create a new invoice for patient consultations and services.</p>
          </div>
          <div className="no-print flex gap-2">
            <button onClick={handlePrint} type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <PrintIcon className="h-4 w-4" />
              Print
            </button>
            <button type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M7 3h8l4 4v14H7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Save Draft
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">

            {/* Patient Information */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-[20px] font-semibold text-slate-900">
                  <span className="text-[#2563eb]"><BillingIcon className="h-5 w-5" /></span>
                  Patient Information
                </h2>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Select Patient</span>
                  <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                    {PATIENTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Associated Record</span>
                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                    <option>Select linked consultation...</option>
                    {CONSULTATIONS.filter((c) => c.patientId === selectedPatient).map((c) => (
                      <option key={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              {/* Patient Quick Info */}
              <div className="mx-5 mb-5 flex items-center gap-4 rounded-xl bg-blue-50 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-[15px] font-bold text-white">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{patient.name}</p>
                  <p className="text-[12px] text-slate-500">ID: {patient.id_no} · DOB: {patient.dob}</p>
                </div>
                <span className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : paymentStatus === "Partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                  {paymentStatus}
                </span>
              </div>
            </section>

            {/* Itemized Charges */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="text-[20px] font-semibold text-slate-900">Itemized Charges</h2>
                <div className="no-print flex items-center gap-3">
                  <button type="button" onClick={() => setShowCatalog(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-[#2563eb] transition hover:bg-blue-100">
                    Browse Catalog
                  </button>
                  <button type="button" onClick={addCustomItem}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]">
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add Custom
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-[#fafbff] text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-2.5">Service / Item</th>
                      <th className="px-2 py-2.5">Category</th>
                      <th className="px-2 py-2.5">Qty</th>
                      <th className="px-2 py-2.5">Unit Price ($)</th>
                      <th className="px-5 py-2.5 text-right">Total ($)</th>
                      <th className="no-print px-2 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100 text-[13px] text-slate-700 hover:bg-slate-50/60">
                        <td className="px-5 py-3">
                          <input value={item.label} onChange={(e) => updateItem(item.id, "label", e.target.value)}
                            className="w-full rounded-md border-0 bg-transparent py-1 text-[13px] text-slate-800 outline-none ring-1 ring-transparent focus:ring-blue-400 focus:bg-white px-2 transition" />
                        </td>
                        <td className="px-2 py-3">
                          <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{item.category}</span>
                        </td>
                        <td className="px-2 py-3">
                          <input type="number" min={1} value={item.qty} onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                            className="w-14 rounded-md border border-slate-300 px-2 py-1.5 text-center text-[13px] outline-none focus:border-blue-500" />
                        </td>
                        <td className="px-2 py-3">
                          <input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                            className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-[13px] outline-none focus:border-blue-500" />
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-900">${(item.qty * item.unitPrice).toFixed(2)}</td>
                        <td className="no-print px-2 py-3">
                          <button onClick={() => removeItem(item.id)} className="text-slate-300 transition hover:text-red-500">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-[13px] text-slate-400">
                          No items yet. Browse the service catalog or add a custom item.
                        </td>
                      </tr>
                    )}

                    <tr className="border-t border-slate-200 bg-slate-50/60 text-[13px] text-slate-600">
                      <td colSpan={3} className="px-5 py-3 text-[12px] text-slate-400 italic">{items.length} item{items.length !== 1 ? "s" : ""} · Subtotal: ${subtotal.toFixed(2)}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px]">Discount (%)</span>
                          <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                            className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-center outline-none focus:border-blue-500" />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[12px]">Tax (%)</span>
                          <input type="number" min={0} max={100} value={tax} onChange={(e) => setTax(Number(e.target.value))}
                            className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-center outline-none focus:border-blue-500" />
                        </div>
                      </td>
                      <td className="no-print" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payment Information */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-[20px] font-semibold text-slate-900">Payment Information</h2>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Payment Status</span>
                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Partial</option>
                      <option>Pending Insurance</option>
                      <option>Waived</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Payment Method</span>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                      <option value="">Select method...</option>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>Bank Transfer</option>
                      <option>Insurance</option>
                      <option>Cheque</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Payment Due Date</span>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500" />
                  </label>
                </div>

                {/* Insurance fields — shown when method is Insurance */}
                {paymentMethod === "Insurance" && (
                  <div className="grid gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-medium text-blue-700">Insurance Provider</span>
                      <input placeholder="e.g. AIA, Ceylinco Life" className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-blue-500" />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-medium text-blue-700">Policy / Claim Number</span>
                      <input placeholder="e.g. POL-2026-00123" className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-blue-500" />
                    </label>
                  </div>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Billing Notes (Optional)</span>
                  <textarea rows={3} value={notes} onChange={(e) => setBillingNotes(e.target.value)}
                    placeholder="Add any internal notes or messages to appear on the invoice..."
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500" />
                </label>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Invoice Summary */}
            <section className="rounded-2xl border border-[#c8d5ff] bg-[#dfe7ff] p-5 shadow-[0_10px_24px_rgba(37,99,235,0.12)]">
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#3657d6]">Invoice Summary</p>
              <p className="mt-1 text-[13px] text-slate-600">Patient: {patient.name}</p>

              <div className="mt-4 space-y-2 text-[13px] text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount ({discount}%)</span>
                  <span className="text-red-600">-${discountAmt.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax ({tax}%)</span>
                  <span>+${taxAmt.toFixed(2)}</span>
                </div>
              </div>

              <div className="my-4 h-px bg-[#b9c8f4]" />

              <div className="flex items-center justify-between text-[17px] font-semibold text-slate-900">
                <span>Total Due</span>
                <span className="text-[42px] leading-none text-[#2054d8]">${total.toFixed(2)}</span>
              </div>

              <div className="no-print mt-5 space-y-2">
                <button type="button" onClick={handleGenerate}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#1d4ed8] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_12px_20px_rgba(29,78,216,0.25)] transition hover:bg-[#1e40af]">
                  Generate Final Bill
                </button>
                <button type="button" onClick={() => setShowPreview(true)}
                  className="inline-flex w-full items-center justify-center text-[13px] font-medium text-[#2563eb] underline decoration-[#9eb8ff] underline-offset-4">
                  Preview Invoice
                </button>
              </div>
            </section>

            {/* Quick cost breakdown by category */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-slate-400">Cost Breakdown</p>
              {Object.entries(
                items.reduce<Record<string, number>>((acc, it) => {
                  acc[it.category] = (acc[it.category] ?? 0) + it.qty * it.unitPrice;
                  return acc;
                }, {})
              ).map(([cat, amt]) => (
                <div key={cat} className="mb-2">
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="text-slate-600">{cat}</span>
                    <span className="font-semibold text-slate-800">${(amt as number).toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-[#2563eb]" style={{ width: `${subtotal > 0 ? ((amt as number) / subtotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-[12px] text-slate-400 italic">No items added yet.</p>}
            </section>

            {/* Policy Reminder */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 text-[13px] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M12 17v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <p>
                  <span className="font-semibold text-slate-800">Billing Policy Reminder</span>
                  <br />
                  Ensure all insurance details are verified before marking status as &ldquo;Pending Insurance&rdquo; to avoid claim rejections.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
