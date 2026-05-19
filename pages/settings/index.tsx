import React, { useState } from 'react';
import Head from 'next/head';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General Info');
  const tabs = ['General Info', 'Security', 'Notifications', 'Billing & Plans'];

  return (
    <>
      <Head>
        <title>Settings | Medixora</title>
      </Head>
      <div className="mx-auto max-w-[1280px] space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your clinic preferences, security, and billing details.</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-4">
          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Clinic Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Clinic Information</h2>
                  <p className="text-sm text-gray-500">Update the public details of your medical facility.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CLINIC NAME</label>
                  <input type="text" defaultValue="MediStock General Hospital" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">REGISTRATION ID</label>
                  <input type="text" defaultValue="MED-8892-NY" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PRIMARY PHONE</label>
                  <input type="text" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SUPPORT EMAIL</label>
                  <input type="email" defaultValue="contact@medistock-hospital.com" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">FACILITY ADDRESS</label>
                <input type="text" defaultValue="100 Healthcare Ave, Medical District, NY 10001" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <button className="bg-[#1d4ed8] hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Administrator Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Administrator Profile</h2>
                  <p className="text-sm text-gray-500">Manage your personal account details.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden border border-gray-200">
                     <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Change Photo
                  </button>
                </div>
                
                <div className="flex-1 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">FIRST NAME</label>
                      <input type="text" defaultValue="James" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">LAST NAME</label>
                      <input type="text" defaultValue="Carter" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">EMAIL ADDRESS</label>
                    <input type="email" defaultValue="j.carter@medistock.com" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Stock Alert Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-orange-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">Stock Alert Thresholds</h3>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">Set global minimum limits before triggering reorder notifications.</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                <span className="font-semibold text-gray-600 uppercase text-xs tracking-wider">GENERAL SUPPLIES</span>
                <span className="font-bold text-gray-900">20 Units</span>
              </div>
              <div className="mt-3 flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-600 uppercase text-xs tracking-wider">CRITICAL MEDICATIONS</span>
                <span className="font-bold text-orange-600">50 Units</span>
              </div>
            </div>

            {/* Password & Security Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">Password & Security</h3>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors placeholder-gray-400" 
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors placeholder-gray-400" 
                />
                <button className="w-full bg-[#f1f5f9] hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                  Update Password
                </button>
              </div>
            </div>

            {/* Billing Settings Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">Billing Settings</h3>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CURRENT PLAN</div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-gray-900">Enterprise</div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded tracking-wider">ACTIVE</span>
                </div>
              </div>
              
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Manage Payment Methods 
                <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
