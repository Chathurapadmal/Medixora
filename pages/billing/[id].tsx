import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type InvoiceItem = {
  item_id: number;
  description: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Invoice = {
  invoice_id: number;
  invoice_number: string;
  patient_name: string;
  doctor_name: string | null;
  invoice_date: string;
  due_date: string | null;
  treatment_cost: number;
  medicine_cost: number;
  discount: number;
  total_amount: number;
  payment_method: string | null;
  status: string;
  notes: string | null;
  items: InvoiceItem[];
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const fmtRs = (n: number) =>
  `Rs. ${Number(n).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function InvoiceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/billing/invoices/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invoice not found or server error");
        return res.json();
      })
      .then((data) => setInvoice(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add("billing-invoice-print");
    };

    const handleAfterPrint = () => {
      document.body.classList.remove("billing-invoice-print");
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      document.body.classList.remove("billing-invoice-print");
    };
  }, []);

  const handlePrint = () => {
    document.body.classList.add("billing-invoice-print");
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading invoice…</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-medium">{error || "Invoice not found"}</p>
        <Link href="/billing" className="text-blue-600 hover:underline">← Back to Billing</Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{invoice.invoice_number} – Medixora</title>
      </Head>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 print:m-0 print:max-w-none print:p-0 billing-invoice-print-area">

        {/* ── Actions (hidden on print) ── */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <Link href="/billing" className="hover:text-blue-600 font-medium">Billing</Link>
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"/></svg>
              <span className="font-semibold text-slate-800">{invoice.invoice_number}</span>
            </nav>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 stroke-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
              </svg>
              Print / Download PDF
            </button>
          </div>
        </div>

        {/* ── Invoice Document ── */}
        <div className="billing-invoice-print-area rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="flex flex-col-reverse gap-6 sm:flex-row sm:justify-between pb-8 border-b border-slate-100 print:border-slate-300">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-blue-700">Medixora</h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                123 Health Avenue, Medical District<br />
                Colombo, Sri Lanka<br />
                +94 11 234 5678<br />
                contact@medixora.com
              </p>
            </div>
            <div className="sm:text-right">
              <h2 className="text-3xl font-light text-slate-300 uppercase tracking-widest">Invoice</h2>
              <p className="mt-2 text-lg font-semibold text-slate-900">{invoice.invoice_number}</p>
              <p className="mt-1 text-sm text-slate-500">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                  invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                  invoice.status === 'Cancelled' ? 'bg-slate-100 text-slate-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {invoice.status}
                </span>
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-4 border-b border-slate-100 print:border-slate-300">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Billed To</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{invoice.patient_name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Date Issued</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{invoice.invoice_date}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Due Date</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{invoice.due_date || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Attending Doctor</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {invoice.doctor_name ? `Dr. ${invoice.doctor_name}` : "—"}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="py-8">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 print:border-slate-300">
                  <th className="pb-3 font-semibold text-slate-900">Description</th>
                  <th className="pb-3 text-right font-semibold text-slate-900">Qty</th>
                  <th className="pb-3 text-right font-semibold text-slate-900">Unit Price</th>
                  <th className="pb-3 text-right font-semibold text-slate-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                
                {/* Treatment (if any) */}
                {invoice.treatment_cost > 0 && (
                  <tr>
                    <td className="py-4 font-medium text-slate-800">Medical Treatment / Consultation</td>
                    <td className="py-4 text-right text-slate-600">1</td>
                    <td className="py-4 text-right text-slate-600">{fmtRs(invoice.treatment_cost)}</td>
                    <td className="py-4 text-right font-medium text-slate-800">{fmtRs(invoice.treatment_cost)}</td>
                  </tr>
                )}

                {/* Medicines */}
                {invoice.items.map((item) => (
                  <tr key={item.item_id}>
                    <td className="py-4">
                      <p className="font-medium text-slate-800">{item.description}</p>
                      {item.item_type && <p className="text-xs text-slate-400">{item.item_type}</p>}
                    </td>
                    <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600">{fmtRs(item.unit_price)}</td>
                    <td className="py-4 text-right font-medium text-slate-800">{fmtRs(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="flex flex-col-reverse gap-8 pt-8 border-t border-slate-100 print:border-slate-300 sm:flex-row sm:justify-between">
            <div className="sm:w-1/2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Payment Details</p>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium">Method:</span> {invoice.payment_method || "N/A"}
              </p>
              {invoice.notes && (
                <>
                  <p className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">Notes</p>
                  <p className="mt-2 text-sm text-slate-600">{invoice.notes}</p>
                </>
              )}
            </div>

            <div className="sm:w-1/3">
              <div className="flex justify-between text-sm text-slate-600 py-1.5">
                <span>Subtotal</span>
                <span>{fmtRs(Number(invoice.treatment_cost) + Number(invoice.medicine_cost))}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500 py-1.5">
                <span>Discount</span>
                <span>− {fmtRs(invoice.discount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 print:border-slate-300 mt-2 pt-3 text-lg font-bold text-slate-900">
                <span>Total</span>
                <span className="text-blue-700">{fmtRs(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="mt-16 text-center text-xs text-slate-400">
            Thank you for choosing Medixora. Wishing you a quick recovery.
          </div>
        </div>

      </div>

      {/* Global Print Styles to ensure background colors print if needed, and hide layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body.billing-invoice-print {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body.billing-invoice-print * {
            visibility: hidden;
          }
          body.billing-invoice-print .billing-invoice-print-area,
          body.billing-invoice-print .billing-invoice-print-area * {
            visibility: visible;
          }
          body.billing-invoice-print > #__next > div {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }
          body.billing-invoice-print > #__next > div > aside {
            display: none !important;
          }
          body.billing-invoice-print > #__next > div > div > header {
            display: none !important;
          }
          body.billing-invoice-print > #__next > div > div {
            min-height: 0 !important;
            overflow: visible !important;
          }
          body.billing-invoice-print main {
            overflow: visible !important;
            padding: 0 !important;
          }
          body.billing-invoice-print .billing-invoice-print-area {
            position: relative;
            inset: auto;
            margin: 0;
            width: 100%;
          }
          @page {
            margin: 1.5cm;
          }
        }
      `}} />
    </>
  );
}
