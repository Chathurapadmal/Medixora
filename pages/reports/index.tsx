import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function ReportsAnalytics() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    setChartData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [6500000, 7200000, 6800000, 8000000, 7500000, 8500000],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: [3500000, 4000000, 3800000, 4200000, 4100000, 4500000],
          backgroundColor: 'rgba(253, 185, 99, 0.8)',
          borderColor: 'rgba(253, 185, 99, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, []);

  return (
    <>
      <Head>
        <title>Reports & Analytics | Medixora</title>
      </Head>
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Comprehensive overview of hospital performance metrics.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>Overview Report</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>Last 30 Days</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">TOTAL PATIENTS</div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">1,248</div>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  +12.5%
                </span>
                vs last month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">APPOINTMENTS</div>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">842</div>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  +5.2%
                </span>
                vs last month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">TOTAL REVENUE</div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">Rs. 14.25Cr</div>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="flex items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium">
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                  -2.4%
                </span>
                vs last month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">BED OCCUPANCY</div>
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">78%</div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-right">312 / 400 Beds Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Revenue vs Expenses</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
              </button>
            </div>
            <div className="flex-1 w-full">
              {chartData && (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return 'Rs. ' + (value/100000).toFixed(1) + 'L';
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-[400px]">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Patient Demographics</h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-8">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path className="text-orange-200" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-400" strokeWidth="4" strokeDasharray="75, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-600" strokeWidth="4" strokeDasharray="45, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">1.2k</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">TOTAL</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>Adults (18-64)</div>
                  <span className="font-semibold text-gray-900">45%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>Seniors (65+)</div>
                  <span className="font-semibold text-gray-900">30%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-orange-300"></span>Pediatric (0-17)</div>
                  <span className="font-semibold text-gray-900">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Department Performance</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DEPARTMENT</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PATIENTS TREATED</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AVG. WAIT TIME</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">REVENUE GENERATED</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">TREND</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Cardiology</td>
                  <td className="px-6 py-4 text-sm text-gray-600">342</td>
                  <td className="px-6 py-4 text-sm text-gray-600">18 mins</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Rs. 4,520,000</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      +4.2%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Neurology</td>
                  <td className="px-6 py-4 text-sm text-gray-600">185</td>
                  <td className="px-6 py-4 text-sm text-gray-600">24 mins</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Rs. 3,850,000</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      +1.8%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Pediatrics</td>
                  <td className="px-6 py-4 text-sm text-gray-600">420</td>
                  <td className="px-6 py-4 text-sm text-gray-600">12 mins</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Rs. 2,210,000</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                      <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                      -0.5%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}