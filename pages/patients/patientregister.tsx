import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  ContactIcon,
  MailIcon,
  PhoneIcon,
  PrintIcon,
  UserPlusIcon,
} from "@/components/dashboard-icons";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function PatientRegisterPage() {
  const [dob, setDob] = useState("");

  const calculateAge = (date: string) => {
    if (!date) return "";

    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    return age;
  };

  return (
    <div className="relative mx-auto w-full max-w-[1100px] space-y-6">
      <Link
        href="/patients"
        className="absolute -left-14 -top-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-2xl font-bold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        aria-label="Back to patients directory"
        title="Back to Patients"
      >
        ←
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-2 flex items-center text-sm text-slate-500" aria-label="Breadcrumb">
            <Link href="/patients" className="font-semibold hover:text-[#004ac6]">
              Patients
            </Link>
            <ChevronRightIcon className="mx-1 h-4 w-4" />
            <span className="font-semibold text-slate-700">Add New Patient</span>
          </nav>

          <h1 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-slate-900">
            Register Patient
          </h1>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Enter the required details below to create a new patient profile.
          </p>
        </div>
      </div>

      <form className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
          <div className="border-b border-slate-200 bg-[#faf8ff] px-6 py-4">
            <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 text-slate-900">
              <UserPlusIcon className="h-5 w-5 text-[#004ac6]" />
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="fullName">
                Full Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g. Jane Doe"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="dob">
                Date of Birth <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                />
                <MaterialIcon
                  name="calendar_today"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="age">
                Age
              </label>
              <input
                id="age"
                type="number"
                disabled
                value={calculateAge(dob)}
                placeholder="Auto-calculated"
                className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-[#f3f3fe] px-4 py-2.5 text-sm text-slate-500 outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Calculated from Date of Birth</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="gender">
                Gender <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="gender"
                  defaultValue=""
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                >
                  <option disabled value="">
                    Select Gender
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
                <MaterialIcon
                  name="arrow_drop_down"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="bloodGroup">
                Blood Group
              </label>
              <div className="relative">
                <select
                  id="bloodGroup"
                  defaultValue=""
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                >
                  <option disabled value="">
                    Select Blood Group
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
                <MaterialIcon
                  name="arrow_drop_down"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
          <div className="border-b border-slate-200 bg-[#faf8ff] px-6 py-4">
            <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 text-slate-900">
              <ContactIcon className="h-5 w-5 text-[#004ac6]" />
              Contact Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="contactNumber">
                Contact Number <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="contactNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="patient@example.com"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="address">
                Residential Address
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="Full street address, city, state, zip code"
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
          <div className="border-b border-slate-200 bg-[#faf8ff] px-6 py-4">
            <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 text-slate-900">
              <AlertTriangleIcon className="h-5 w-5 text-[#004ac6]" />
              Emergency &amp; Medical Context
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="emergencyContact">
                Emergency Contact Name &amp; Relation
              </label>
              <div className="relative">
                <MaterialIcon
                  name="group"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="emergencyContact"
                  type="text"
                  placeholder="e.g. John Doe (Spouse)"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="emergencyPhone">
                Emergency Contact Phone
              </label>
              <div className="relative">
                <MaterialIcon
                  name="emergency"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="allergies">
                Known Allergies
              </label>
              <div className="relative">
                <MaterialIcon name="coronavirus" className="absolute left-3 top-3 text-slate-500" />
                <textarea
                  id="allergies"
                  rows={2}
                  placeholder="List any drug, food, or environmental allergies. Type 'None' if applicable."
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800" htmlFor="medicalNotes">
                Initial Medical Notes / History
              </label>
              <textarea
                id="medicalNotes"
                rows={4}
                placeholder="Brief overview of past medical history, current medications, or presenting complaints."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Link
            href="/patients"
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.05em] text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            Cancel
          </Link>

          <button
            className="flex items-center gap-2 rounded-lg bg-[#004ac6] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition hover:bg-[#003ea8] active:scale-[0.98]"
            type="submit"
          >
            Save Patient
          </button>
        </div>
      </form>
    </div>
  );
}
