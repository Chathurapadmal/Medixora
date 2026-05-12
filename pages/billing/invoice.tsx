import Layout from "@/components/Layout";
import { useState } from "react";
import {
  PrinterIcon,
  DownloadIcon,
  CheckCircleIcon,
} from "@/components/dashboard-icons";

interface InvoiceItem {
  description: string;
  details: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const invoiceData = {
  invoiceNumber: "INV-2023-0089",
  date: "Oct 24, 2023",
  dueDate: "Nov 24, 2023",
  status: "Paid",
  hospital: {
    name: "MediStack Hospital",
    address: "123 Health Avenue, Medical District",
    city: "Metropolis, NY 00001",
    phone: "(555) 123-4567",
    email: "billing@medistrack.com",
  },
  billedTo: {
    name: "Eleanor Vance",
    patientId: "P01-84730",
    address: "456 Oak Lane, Apt 4B",
    city: "Springfield, IL 62701",
    email: "eleanor.vance@example.com",
  },
  physician: {
    name: "Dr. Robert Chen",
    department: "Cardiology Department",
    license: "MED-39647",
    encounter: "ENC-2023-1024-A",
  },
  items: [
    {
      description: "Comprehensive Specialist Consultation",
      details: "Initial cardiology assessment, vitals, and history review.",
      quantity: 1,
      unitPrice: 250.0,
      total: 250.0,
    },
    {
      description: "12-Lead Electrocardiogram (ECG)",
      details: "Diagnostic test including interpretation and report.",
      quantity: 1,
      unitPrice: 125.0,
      total: 125.0,
    },
    {
      description: "Complete Blood Count (CBC) Panel",
      details: "Laboratory analysis",
      quantity: 1,
      unitPrice: 85.0,
      total: 85.0,
    },
  ],
  subtotal: 460.0,
  tax: 0.0,
  taxLabel: "Tax (0% Medical Exempt)",
  totalAmount: 460.0,
  amountPaid: -460.0,
  balanceDue: 0.0,
  notes:
    "Thank you for choosing MediStack Hospital. This invoice has been marked as Paid in Full via Credit Card ending in 4242 on Oct 24, 2023. No further action is required. For any billing inquiries, please contact our billing department.",
};

export default function Invoice() {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  const handleDownloadPDF = () => {
    alert("PDF download functionality would be implemented here");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Invoice</h1>
              <p className="mt-1 text-sm text-slate-600">
                Billing | {invoiceData.invoiceNumber}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <PrinterIcon className="h-4 w-4" />
                Print Invoice
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <DownloadIcon className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {/* Invoice Details Header */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Invoice Number</p>
                <p className="text-lg font-semibold text-slate-900">
                  {invoiceData.invoiceNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date Issued</p>
                <p className="text-lg font-semibold text-slate-900">
                  {invoiceData.date}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date Due</p>
                <p className="text-lg font-semibold text-slate-900">
                  {invoiceData.dueDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {invoiceData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Hospital and Billing Details */}
            <div className="grid grid-cols-2 gap-6">
              {/* From Section */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {invoiceData.hospital.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {invoiceData.hospital.address}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>{invoiceData.hospital.city}</p>
                  <p>{invoiceData.hospital.phone}</p>
                  <p>{invoiceData.hospital.email}</p>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-600 uppercase">
                  Billed To
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {invoiceData.billedTo.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      Patient ID {invoiceData.billedTo.patientId}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>{invoiceData.billedTo.address}</p>
                    <p>{invoiceData.billedTo.city}</p>
                    <p>{invoiceData.billedTo.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Treating Physician Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-600 uppercase">
                  Treating Physician
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {invoiceData.physician.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {invoiceData.physician.department}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>License: {invoiceData.physician.license}</p>
                    <p>Encounter Ref: {invoiceData.physician.encounter}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Service / Item Description
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {item.description}
                        </p>
                        <p className="text-sm text-slate-600">{item.details}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Instructions and Summary */}
            <div className="grid grid-cols-2 gap-6">
              {/* Payment Instructions */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-600 uppercase">
                  Payment Instructions & Notes
                </p>
                <p className="text-sm leading-relaxed text-slate-600">
                  {invoiceData.notes}
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium text-slate-900">
                      ${invoiceData.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {invoiceData.taxLabel}
                    </span>
                    <span className="font-medium text-slate-900">
                      ${invoiceData.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">
                        Total Amount
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        ${invoiceData.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-300 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Amount Paid</span>
                      <span className="font-medium text-slate-900">
                        ${Math.abs(invoiceData.amountPaid).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-300 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">
                        Balance Due
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ${invoiceData.balanceDue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
              <p>MediStack Hospital Management System © 2023</p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body {
              background: white;
            }
            .no-print {
              display: none;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
