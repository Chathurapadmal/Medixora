import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Dummy data for invoices based on the screenshot
const invoices = [
  { id: '#INV-2023-8901', patient: 'Eleanor Pena', date: 'Oct 24, 2023', isOverdue: false, treatment: 'Rs.450.00', medicine: 'Rs.85.50', discount: '-Rs.20.00', total: 'Rs.515.50' },
  { id: '#INV-2023-8902', patient: 'Robert Fox', date: 'Oct 24, 2023', isOverdue: false, treatment: 'Rs.1,200.00', medicine: 'Rs.340.00', discount: 'Rs.0.00', total: 'Rs.1,540.00' },
  { id: '#INV-2023-8895', patient: 'Wade Warren', date: 'Oct 18, 2023', isOverdue: true, treatment: 'Rs.80.00', medicine: 'Rs.25.00', discount: 'Rs.0.00', total: 'Rs.105.00' },
  { id: '#INV-2023-8904', patient: 'Esther Howard', date: 'Oct 23, 2023', isOverdue: false, treatment: 'Rs.2,500.00', medicine: 'Rs.150.00', discount: '-Rs.250.00', total: 'Rs.2,400.00' },
  { id: '#INV-2023-8905', patient: 'Leslie Alexander', date: 'Oct 23, 2023', isOverdue: false, treatment: 'Rs.150.00', medicine: 'Rs.45.00', discount: 'Rs.0.00', total: 'Rs.195.00' },
];

export default function BillingManagement() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <>
      <Head>
        <title>Billing Management | Medixora</title>
      </Head>
      <div className="mx-auto max-w-[1280px] space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing Management</h1>
            <p className="text-sm text-gray-500 mt-1">Review, process, and generate patient invoices.</p>
          </div>
          <button className="bg-[#1d4ed8] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Generate Bill
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">TODAY'S COLLECTIONS</div>
              <div className="p-1.5 bg-green-50 text-green-600 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
            </div>
            <div>
                <div className="text-4xl font-bold text-gray-900">Rs.12,450.00</div>
              <div className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1">
                ↑ 8.2% from yesterday
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">PENDING INVOICES</div>
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">42</div>
              <div className="text-sm text-gray-500 mt-2">
                Awaiting payment verification
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center relative shadow-sm overflow-hidden">
            <svg className="absolute right-[-10px] top-1/2 transform -translate-y-1/2 w-32 h-32 text-gray-50 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            <div className="relative z-10">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AVG. BILL VALUE</div>
              <div>
                <div className="text-4xl font-bold text-gray-900">Rs.845.50</div>
                <div className="text-sm text-gray-500 mt-2">
                  Across all departments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and List wrapper */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search by Patient or ID..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-9 pr-8 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer">
                  <option>All Statuses</option>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Overdue</option>
                </select>
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                </div>
              </div>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-9 pr-8 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                </select>
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">INVOICE ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">PATIENT NAME</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">DATE</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">TREATMENT COST</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">MEDICINE COST</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">DISCOUNT</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                      {inv.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {inv.patient}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv.isOverdue ? (
                        <div className="flex items-center gap-1.5 text-red-600 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          {inv.date}
                        </div>
                      ) : (
                        <span>{inv.date}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium text-right">
                      {inv.treatment}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium text-right">
                      {inv.medicine}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">
                      {inv.discount}
                    </td>
                    <td className="px-6 py-4 text-base font-bold text-gray-900 text-right">
                      {inv.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">5</span> of <span className="font-medium text-gray-900">42</span> entries
            </div>
            <div className="flex gap-1 mt-4 sm:mt-0">
              <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-400 disabled:opacity-50">&lt;</button>
              <button className="px-3 py-1.5 bg-[#1d4ed8] text-white border border-[#1d4ed8] rounded-md font-medium">1</button>
              <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 font-medium">2</button>
              <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 font-medium">3</button>
              <span className="px-2 py-1.5 text-gray-500">...</span>
              <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 font-medium">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
