'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person: string;
  contact_info: string;
  category: string;
  status: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const limit = 10;
  const router = useRouter();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/suppliers?page=${page}&limit=${limit}&search=${search}`
      );
      const data = await response.json();
      setSuppliers(data.data || []);
      setTotal(data.total || 0);
      setTotalActive(data.data?.filter((s: Supplier) => s.status === 'Active').length || 0);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700';
      case 'Suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(total / limit);
  const displayPages = [];
  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) displayPages.push(i);
  } else {
    displayPages.push(1);
    if (page > 2) displayPages.push('...');
    if (page > 1 && page < totalPages) displayPages.push(page);
    if (page < totalPages - 1) displayPages.push('...');
    displayPages.push(totalPages);
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 px-4 py-6 sm:px-5 lg:px-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Suppliers</h1>
            <p className="text-gray-600 mt-1">Manage medical equipment and pharmaceutical vendors.</p>
          </div>
          <button 
            onClick={() => router.push('/suppliers/add')}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Add Supplier
          </button>
        </div>
      </div>

      <div>
        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Active Suppliers</div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-4xl font-bold text-gray-900">{totalActive}</div>
                <span className="text-xs text-gray-500">+3 this month</span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Approvals</div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-4xl font-bold text-red-600">8</div>
                <span className="text-xs text-gray-500">Requires review</span>
              </div>
            </div>
            <div className="bg-blue-600 rounded-lg p-6">
              <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Contract Renewals</div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-4xl font-bold text-white">12</div>
                <span className="text-xs text-blue-100">contracts expiring in next 30 days.</span>
              </div>
              <button className="mt-4 text-sm text-blue-200 hover:text-white font-medium">Review Now →</button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search names, IDs, contacts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border-none focus:outline-none text-gray-900"
            />
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 5.707A1 1 0 013 5V3z" clipRule="evenodd" />
              </svg>
              Filter
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Person</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No suppliers found
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier, index) => (
                      <tr key={supplier.supplier_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">VND-{supplier.supplier_id.toString().padStart(4, '0')}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{supplier.supplier_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.contact_person}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{supplier.contact_info?.split('\n')[0]}</div>
                          {supplier.contact_info?.includes('\n') && <div className="text-xs text-gray-500">{supplier.contact_info?.split('\n')[1]}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.category}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(supplier.status)}`}>
                            {supplier.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {suppliers.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} entries
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>
                {displayPages.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof p === 'number' && setPage(p)}
                    disabled={typeof p !== 'number'}
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : typeof p === 'number'
                        ? 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        : 'text-gray-600 cursor-default'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page * limit >= total}
                  className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
