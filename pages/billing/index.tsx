import Layout from "@/components/Layout";
import Link from "next/link";
import { ChevronRightIcon, EyeIcon, DownloadIcon } from "@/components/dashboard-icons";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  patientName: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
}

const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2023-0089",
    date: "Oct 24, 2023",
    patientName: "Eleanor Vance",
    amount: 460.0,
    status: "Paid",
  },
  {
    id: "2",
    invoiceNumber: "INV-2023-0088",
    date: "Oct 20, 2023",
    patientName: "John Smith",
    amount: 320.5,
    status: "Paid",
  },
  {
    id: "3",
    invoiceNumber: "INV-2023-0087",
    date: "Oct 15, 2023",
    patientName: "Sarah Johnson",
    amount: 580.75,
    status: "Pending",
  },
  {
    id: "4",
    invoiceNumber: "INV-2023-0086",
    date: "Oct 10, 2023",
    patientName: "Michael Brown",
    amount: 250.0,
    status: "Overdue",
  },
  {
    id: "5",
    invoiceNumber: "INV-2023-0085",
    date: "Oct 05, 2023",
    patientName: "Emily Davis",
    amount: 420.25,
    status: "Paid",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Overdue":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function Billing() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
          <p className="mt-1 text-slate-600">Manage invoices and billing records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Total Invoices</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">42</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Paid</p>
            <p className="mt-1 text-3xl font-bold text-green-600">$38.5k</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Pending</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600">$5.2k</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Overdue</p>
            <p className="mt-1 text-3xl font-bold text-red-600">$2.3k</p>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Invoice Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Patient Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {invoice.patientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href="/billing/invoice"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => alert("Download PDF functionality would be implemented")}
                        className="inline-flex items-center text-slate-600 hover:text-slate-700"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
