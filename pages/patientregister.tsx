import { useState } from "react";
import {
  UsersIcon,
  ChevronRightIcon,
  UserPlusIcon,
  ContactIcon,
  AlertTriangleIcon,
  PrintIcon,
} from "@/components/dashboard-icons";

export default function PatientRegisterPage() {
  const [dob, setDob] = useState("");

  const calculateAge = (date: string) => {
    if (!date) return "";
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>

          {/* ✅ UPDATED BREADCRUMB */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            
            <span>Patients</span>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-slate-700 font-medium">Add New Patient</span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            Register Patient
          </h1>

          <p className="text-sm text-slate-500">
            Enter the required details below to create a new patient profile.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
            Cancel
          </button>

          {/* ✅ ICON ADDED */}
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm text-white hover:bg-[#1d4ed8]">
            <PrintIcon className="h-4 w-4" />
            Save Patient
          </button>
        </div>
      </div>

      {/* PERSONAL INFO */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        {/* ✅ ICON ADDED */}
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <UserPlusIcon className="h-4 w-4 text-[#2563eb]" />
          Personal Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Age</label>
            <input
              type="text"
              value={calculateAge(dob)}
              disabled
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">
              Gender <span className="text-red-500">*</span>
            </label>
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Blood Group</label>
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option>Select Blood Group</option>
              <option>O+</option>
              <option>A+</option>
              <option>B+</option>
              <option>AB+</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        {/* ✅ ICON ADDED */}
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ContactIcon className="h-4 w-4 text-[#2563eb]" />
          Contact Details
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Email Address</label>
            <input
              type="email"
              placeholder="patient@example.com"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">Residential Address</label>
            <textarea
              placeholder="Full street address, city, state, zip code"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* EMERGENCY */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        {/* ✅ ICON ADDED */}
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <AlertTriangleIcon className="h-4 w-4 text-[#2563eb]" />
          Emergency & Medical Context
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">
              Emergency Contact Name & Relation
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe (Spouse)"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">
              Emergency Contact Phone
            </label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">
              Known Allergies
            </label>
            <input
              type="text"
              placeholder="List any drug, food, or environmental allergies"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">
              Initial Medical Notes / History
            </label>
            <textarea
              placeholder="Brief overview of past medical history, medications, or complaints"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex justify-end gap-2">
        <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
          Cancel
        </button>

        {/* ✅ ICON ADDED */}
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm text-white hover:bg-[#1d4ed8]">
          <PrintIcon className="h-4 w-4" />
          Save Patient
        </button>
      </div>
    </div>
  );
}