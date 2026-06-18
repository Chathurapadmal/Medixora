import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  ContactIcon,
  MailIcon,
  PhoneIcon,
  UserPlusIcon,
  GroupIcon,
  EmergencyIcon,
  AllergyIcon,
  ChevronDownIcon,
} from "@/components/dashboard-icons";

type PatientStatus = "Active" | "In Treatment" | "Discharged";

type PatientForm = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodGroup: string;
  allergies: string;
  medicalNotes: string;
  status: PatientStatus;
};

export default function PatientRegisterPage() {
  const [form, setForm] = useState<PatientForm>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodGroup: "",
    allergies: "",
    medicalNotes: "",
    status: "Active",
  });

  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError]   = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const calculateAge = (date: string) => {
    if (!date) return "";
    const today = new Date();
    const birth = new Date(date);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  };

  const set = (field: keyof PatientForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSaveError("");
    setSaveSuccess(false);

    // Map camelCase form fields → snake_case API fields
    const payload = {
      patient_name:      form.name,
      email:             form.email             || null,
      phone:             form.phone             || null,
      date_of_birth:     form.dateOfBirth       || null,
      gender:            form.gender            || null,
      address:           form.address           || null,
      emergency_contact: form.emergencyContact  || null,
      emergency_phone:   form.emergencyPhone    || null,
      blood_type:        form.bloodGroup        || null,
      allergies:         form.allergies         || null,
    };

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError((data as any).error || "Failed to save patient. Please try again.");
        setSubmitting(false);
        return;
      }

      setSaveSuccess(true);
      // Redirect after a short delay so the user sees the success message
      setTimeout(() => { location.href = "/patients"; }, 1200);
    } catch (err: any) {
      setSaveError(err.message || "Network error. Please check your connection.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]";

  const iconInputClass =
    "w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]";

  const labelClass =
    "mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-800";

  return (
    <>
      <Head>
        <title>Register Patient - MediStock</title>
      </Head>

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

        {/* ── Save feedback banners ── */}
        {saveError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-red-500">
              <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm font-medium text-red-700">{saveError}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-emerald-500">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm font-medium text-emerald-700">Patient registered successfully! Redirecting…</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* ── Personal Information ── */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-200 bg-[#faf8ff] px-6 py-4">
              <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 text-slate-900">
                <UserPlusIcon className="h-5 w-5 text-[#004ac6]" />
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="fullName">
                  Full Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  className={inputClass}
                  value={form.name}
                  onChange={set("name")}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="dob">
                  Date of Birth <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="dob"
                  type="date"
                  required
                  className={inputClass}
                  value={form.dateOfBirth}
                  onChange={set("dateOfBirth")}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="age">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  disabled
                  value={calculateAge(form.dateOfBirth)}
                  placeholder="Auto-calculated"
                  className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-[#f3f3fe] px-4 py-2.5 text-sm text-slate-500 outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">Calculated from Date of Birth</p>
              </div>

              <div>
                <label className={labelClass} htmlFor="gender">
                  Gender <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    required
                    className={`${inputClass} appearance-none`}
                    value={form.gender}
                    onChange={set("gender")}
                  >
                    <option disabled value="">Select Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="bloodGroup">
                  Blood Group
                </label>
                <div className="relative">
                  <select
                    id="bloodGroup"
                    className={`${inputClass} appearance-none`}
                    value={form.bloodGroup}
                    onChange={set("bloodGroup")}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Contact Details ── */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-200 bg-[#faf8ff] px-6 py-4">
              <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 text-slate-900">
                <ContactIcon className="h-5 w-5 text-[#004ac6]" />
                Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="contactNumber">
                  Contact Number <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="contactNumber"
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    className={iconInputClass}
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="patient@example.com"
                    className={iconInputClass}
                    value={form.email}
                    onChange={set("email")}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="address">
                  Residential Address
                </label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder="Full street address, city, state, zip code"
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                  value={form.address}
                  onChange={set("address")}
                />
              </div>
            </div>
          </section>

          {/* ── Emergency & Medical Context ── */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-200 bg-[#faf8ff] px-6 py-4">
              <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 text-slate-900">
                <AlertTriangleIcon className="h-5 w-5 text-[#004ac6]" />
                Emergency &amp; Medical Context
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="emergencyContact">
                  Emergency Contact Name &amp; Relation
                </label>
                <div className="relative">
                  <GroupIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="emergencyContact"
                    type="text"
                    placeholder="e.g. John Doe (Spouse)"
                    className={iconInputClass}
                    value={form.emergencyContact}
                    onChange={set("emergencyContact")}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="emergencyPhone">
                  Emergency Contact Phone
                </label>
                <div className="relative">
                  <EmergencyIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className={iconInputClass}
                    value={form.emergencyPhone}
                    onChange={set("emergencyPhone")}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="allergies">
                  Known Allergies
                </label>
                <div className="relative">
                  <AllergyIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <textarea
                    id="allergies"
                    rows={2}
                    placeholder="List any drug, food, or environmental allergies. Type 'None' if applicable."
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                    value={form.allergies}
                    onChange={set("allergies")}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="medicalNotes">
                  Initial Medical Notes / History
                </label>
                <textarea
                  id="medicalNotes"
                  rows={4}
                  placeholder="Brief overview of past medical history, current medications, or presenting complaints."
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004ac6]"
                  value={form.medicalNotes}
                  onChange={set("medicalNotes")}
                />
              </div>
            </div>
          </section>

          {/* ── Footer buttons ── */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <Link
              href="/patients"
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.05em] text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              Cancel
            </Link>

            <button
              className="flex items-center gap-2 rounded-lg bg-[#004ac6] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition hover:bg-[#003ea8] active:scale-[0.98] disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}