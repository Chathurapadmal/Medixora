import React, { useState } from 'react';
import Layout from '@/components/Layout';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, isPositive, icon, bgColor }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className={`${bgColor} rounded-lg p-4 mr-4`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </p>
      </div>
    </div>
  );
};

interface DepartmentData {
  name: string;
  patients: number;
  avgWait: string;
  revenue: string;
  trend: number;
  isPositive: boolean;
}

const RevenueChart: React.FC = () => {
  const data = [
    { month: 'Jan', revenue: 45, expenses: 35 },
    { month: 'Feb', revenue: 55, expenses: 38 },
    { month: 'Mar', revenue: 52, expenses: 40 },
    { month: 'Apr', revenue: 62, expenses: 42 },
    { month: 'May', revenue: 68, expenses: 45 },
    { month: 'Jun', revenue: 75, expenses: 48 },
  ];

  const maxValue = 80;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue vs Expenses</h3>
      <div className="flex items-end justify-between h-64">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 mx-2">
            <div className="flex items-end gap-1 mb-4">
              <div
                className="bg-blue-500 rounded-t"
                style={{ width: '20px', height: `${(item.revenue / maxValue) * 200}px` }}
              />
              <div
                className="bg-red-500 rounded-t"
                style={{ width: '20px', height: `${(item.expenses / maxValue) * 200}px` }}
              />
            </div>
            <span className="text-xs text-gray-600">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-xs text-gray-600">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-xs text-gray-600">Expenses</span>
        </div>
      </div>
    </div>
  );
};

const PatientDemographicsChart: React.FC = () => {
  const demographics = [
    { label: 'Adults (18-64)', percentage: 45, count: 551 },
    { label: 'Seniors (65+)', percentage: 30, count: 360 },
    { label: 'Pediatric (0-17)', percentage: 25, count: 289 },
  ];

  const colors = ['#3B82F6', '#10B981', '#F97316'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Patient Demographics</h3>
      <div className="flex items-center justify-between">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Pie chart segments */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="25"
              strokeDasharray="70.7 235.6"
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10B981"
              strokeWidth="25"
              strokeDasharray="47.1 235.6"
              strokeDashoffset="-70.7"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#F97316"
              strokeWidth="25"
              strokeDasharray="39.6 235.6"
              strokeDashoffset="-117.8"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-2xl font-bold text-gray-900">1.2k</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
        <div className="flex-1 ml-8">
          {demographics.map((item, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors[idx] }}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colors[idx],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DepartmentPerformanceTable: React.FC = () => {
  const departments: DepartmentData[] = [
    { name: 'Cardiology', patients: 342, avgWait: '18 mins', revenue: '$45,200', trend: 4.2, isPositive: true },
    { name: 'Neurology', patients: 185, avgWait: '24 mins', revenue: '$36,500', trend: -1.8, isPositive: false },
    { name: 'Pediatrics', patients: 420, avgWait: '12 mins', revenue: '$22,100', trend: -0.5, isPositive: false },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Department Performance</h3>
        <a href="#" className="text-blue-600 text-sm hover:underline">
          View Full Report →
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Patients Treated</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg. Wait Time</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue Generated</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Trend</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{dept.name}</td>
                <td className="py-3 px-4 text-gray-700">{dept.patients}</td>
                <td className="py-3 px-4 text-gray-700">{dept.avgWait}</td>
                <td className="py-3 px-4 text-gray-700">{dept.revenue}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      dept.isPositive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {dept.isPositive ? '↑' : '↓'}{Math.abs(dept.trend)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Reports() {
  const [timeRange, setTimeRange] = useState('30days');

  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 text-sm mt-1">
                Generate comprehensive overview of hospital performance metrics.
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Export Excel
            </button>
          </div>

          {/* Filter Options */}
          <div className="flex gap-4 mt-6">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Export PDF
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <MetricCard
              label="Total Patients"
              value="1,248"
              change="vs last month"
              isPositive={true}
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              }
              bgColor="bg-blue-100"
            />
            <MetricCard
              label="Appointments"
              value="842"
              change="vs last month"
              isPositive={true}
              icon={
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm0 0V8m0 0H2m0 0v4m0 0v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
              }
              bgColor="bg-red-100"
            />
            <MetricCard
              label="Total Revenue"
              value="$142.5k"
              change="-3.2% vs last month"
              isPositive={false}
              icon={
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.16 5.314l4.897-4.897A1 1 0 0116 4v8a1 1 0 01-1 1h-8a1 1 0 01-.707-1.707l4.897-4.897a1 1 0 11.414.414L6.707 11H14V4.414L8.16 5.314z" />
                </svg>
              }
              bgColor="bg-green-100"
            />
            <MetricCard
              label="Bed Occupancy"
              value="78%"
              change="312 / 400 Beds Available"
              isPositive={true}
              icon={
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm0-6h.01M3 10h.01M3 16h.01M7 4h.01M7 10h.01M7 16h.01M11 4h.01M11 10h.01M11 16h.01M15 4h.01M15 10h.01M15 16h.01" />
                </svg>
              }
              bgColor="bg-purple-100"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <RevenueChart />
            <PatientDemographicsChart />
          </div>

          {/* Department Performance */}
          <DepartmentPerformanceTable />
        </div>
      </div>
    </Layout>
  );
}
