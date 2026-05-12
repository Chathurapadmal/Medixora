import React from "react";
import Link from "next/link";
import { ChevronLeftIcon, EditIcon } from "@/components/dashboard-icons";

export default function PatientDetailsPage() {
  const patient = {
    id: "PT-2023-001",
    name: "Sarah Jenkins",
    initials: "SJ",
    avatarClass: "bg-blue-100 text-blue-700",
    age: "34 yrs",
    gender: "Female",
    bloodGroup: "O+",
    contact: "+1 (555) 123-4567",
    email: "sarah.jenkins@example.com",
    address: "123 Main St, Springfield, AZ",
    status: "Active",
    registrationDate: "Jan 12, 2023",
    lastVisit: "Oct 24, 2023",
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/patients"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-[24px] font-semibold leading-8 tracking-[-0.01em] text-[#191b23]">
              Patient Details
            </h2>
            <p className="mt-1 text-sm leading-5 text-[#434655]">
              {patient.id} • Registered on {patient.registrationDate}
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-[#434655] shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]">
          <EditIcon className="h-4 w-4" />
          Edit Patient
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Overview */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* PROFILE CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col items-center text-center">
              <div
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${patient.avatarClass}`}
              >
                {patient.initials}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
              <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                {patient.status}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Age</span>
                <span className="font-semibold text-slate-800">{patient.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-semibold text-slate-800">{patient.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* CONTACT INFO CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              Contact Information
            </h4>
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <span className="block text-xs text-slate-400">Phone Number</span>
                <span className="mt-0.5 block font-medium text-slate-800">{patient.contact}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Email Address</span>
                <span className="mt-0.5 block font-medium text-slate-800">{patient.email}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Home Address</span>
                <span className="mt-0.5 block font-medium text-slate-800">{patient.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Medical History & Activity */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              Medical History
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-500">Allergies</div>
                <div className="mt-1 font-medium text-slate-800">Penicillin, Peanuts</div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-500">Chronic Conditions</div>
                <div className="mt-1 font-medium text-slate-800">Asthma</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-100 px-6 py-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Recent Appointments
              </h4>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Doctor</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">Oct 24, 2023</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">Dr. Alan Smith</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">General Practice</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Completed</span>
                    </td>
                  </tr>
                  <tr className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">Sep 05, 2023</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">Dr. Rachel Green</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">Cardiology</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Completed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
