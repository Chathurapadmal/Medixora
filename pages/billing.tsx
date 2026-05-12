import Head from "next/head";
import { BillingIcon, PlusIcon } from "@/components/dashboard-icons";

const billItems = [
  {
    id: "general-consultation",
    label: "General Consultation",
    qty: 1,
    unitPrice: "150",
    total: "150.00",
  },
  {
    id: "cbc",
    label: "Complete Blood Count (CBC)",
    qty: 1,
    unitPrice: "85.50",
    total: "85.50",
  },
];

export default function BillingPage() {
  return (
    <>
      <Head>
        <title>Generate Bill - MediStock</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Generate Bill</h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Create a new invoice for patient consultations and services.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M7 3h8l4 4v14H7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save Draft
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-[26px] font-semibold text-slate-900">
                  <span className="text-[#2563eb]">
                    <BillingIcon className="h-5 w-5" />
                  </span>
                  Patient Information
                </h2>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Select Patient</span>
                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                    <option>Search or select patient...</option>
                    <option>Elena Vance</option>
                    <option>James Sullivan</option>
                    <option>Mariah Woods</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Associated Record</span>
                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                    <option>Select linked consultation...</option>
                    <option>Routine Consultation - May 12, 2026</option>
                    <option>Diagnostic Review - May 11, 2026</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="text-[26px] font-semibold text-slate-900">Itemized Charges</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-[#fafbff] text-[12px] uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-2.5">Service / Item Description</th>
                      <th className="px-2 py-2.5">Qty</th>
                      <th className="px-2 py-2.5">Unit Price ($)</th>
                      <th className="px-5 py-2.5 text-right">Total ($)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {billItems.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200 text-[14px] text-slate-700">
                        <td className="px-5 py-3">{item.label}</td>
                        <td className="px-2 py-3">
                          <input
                            defaultValue={item.qty}
                            className="w-14 rounded-md border border-slate-300 px-2 py-1.5 text-center text-[13px] outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            defaultValue={item.unitPrice}
                            className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-[13px] outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-slate-900">{item.total}</td>
                      </tr>
                    ))}

                    <tr className="border-t border-slate-200 text-[13px] text-slate-600">
                      <td className="px-5 py-3" />
                      <td className="px-2 py-3" />
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span>Discount (%)</span>
                          <input
                            defaultValue={0}
                            className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-center outline-none focus:border-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span>Tax (%)</span>
                          <input
                            defaultValue={5}
                            className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-center outline-none focus:border-blue-500"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-[26px] font-semibold text-slate-900">Payment Information</h2>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Payment Status</span>
                    <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Partial</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Expected Method</span>
                    <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-blue-500">
                      <option>Select method...</option>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>Bank Transfer</option>
                      <option>Insurance</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Billing Notes (Optional)</span>
                  <textarea
                    rows={3}
                    placeholder="Add any internal notes or messages to appear on the invoice..."
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-[#c8d5ff] bg-[#dfe7ff] p-5 shadow-[0_10px_24px_rgba(37,99,235,0.12)]">
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#3657d6]">Invoice Summary</p>
              <p className="mt-1 text-[13px] text-slate-600">Patient: Elenaor Vance</p>

              <div className="mt-4 space-y-2 text-[13px] text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>$235.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount (0%)</span>
                  <span>-$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax (5%)</span>
                  <span>+$11.78</span>
                </div>
              </div>

              <div className="my-4 h-px bg-[#b9c8f4]" />

              <div className="flex items-center justify-between text-[17px] font-semibold text-slate-900">
                <span>Total Due</span>
                <span className="text-[42px] leading-none text-[#2054d8]">$247.28</span>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1d4ed8] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_12px_20px_rgba(29,78,216,0.25)] transition hover:bg-[#1e40af]"
              >
                Generate Final Bill
              </button>

              <button
                type="button"
                className="mt-2 inline-flex w-full items-center justify-center text-[13px] font-medium text-[#2563eb] underline decoration-[#9eb8ff] underline-offset-4"
              >
                Preview Invoice
              </button>
            </section>

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
                  Ensure all insurance details are verified before marking status as "Pending Insurance" to avoid claim rejections.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}