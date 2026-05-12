import { useState } from "react";
import { useRouter } from "next/router";
import {
  ChevronRightIcon,
  UserPlusIcon,
  ContactIcon,
  AlertTriangleIcon,
  PrintIcon,
  MailIcon,
  PhoneIcon,
} from "@/components/dashboard-icons";

export default function PatientRegisterPage() {
  const router = useRouter();
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_name: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    allergies: "",
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "date_of_birth") {
      setDob(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_name) {
      setError("Patient name is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          blood_type: formData.blood_type || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          emergency_contact: formData.emergency_contact || null,
          emergency_phone: formData.emergency_phone || null,
          allergies: formData.allergies || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/patients");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
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
          <button 
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm text-white hover:bg-[#1d4ed8] disabled:opacity-50"
          >
            <PrintIcon className="h-4 w-4" />
            {loading ? "Saving..." : "Save Patient"}
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          ✓ Patient registered successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* PERSONAL INFO */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 bg-[#f8faff]">
          <UserPlusIcon className="h-4 w-4 text-[#2563eb]" />
          <h2 className="text-sm font-semibold text-slate-700">
            Personal Information
          </h2>
        </div>

        <div className="p-5 grid gap-4 md:grid-cols-2">

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="patient_name"
              placeholder="e.g. Jane Doe"
              value={formData.patient_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={dob}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
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
            <select 
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Blood Group</label>
            <select 
              name="blood_type"
              value={formData.blood_type}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select Blood Group</option>
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
              <option value="B-">B-</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 bg-[#f8faff]">
          <ContactIcon className="h-4 w-4 text-[#2563eb]" />
          <h2 className="text-sm font-semibold text-slate-700">
            Contact Details
          </h2>
        </div>

        <div className="p-5 grid gap-4 md:grid-cols-2">

          {/* PHONE INPUT WITH ICON */}
          <div>
            <label className="text-sm text-slate-600">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 px-3 focus-within:ring-2 focus-within:ring-blue-100">
              <PhoneIcon className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-2 py-2 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          {/* EMAIL INPUT WITH ICON */}
          <div>
            <label className="text-sm text-slate-600">Email Address</label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 px-3 focus-within:ring-2 focus-within:ring-blue-100">
              <MailIcon className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-2 py-2 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">Residential Address</label>
            <textarea
              name="address"
              placeholder="Full street address, city, state, zip code"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* EMERGENCY */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 bg-[#f8faff]">
          <AlertTriangleIcon className="h-4 w-4 text-[#2563eb]" />
          <h2 className="text-sm font-semibold text-slate-700">
            Emergency & Medical Context
          </h2>
        </div>

        <div className="p-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">
              Emergency Contact Name & Relation
            </label>
            <input
              type="text"
              name="emergency_contact"
              placeholder="e.g. John Doe (Spouse)"
              value={formData.emergency_contact}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">
              Emergency Contact Phone
            </label>
            <input
              type="text"
              name="emergency_phone"
              placeholder="+1 (555) 000-0000"
              value={formData.emergency_phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">
              Known Allergies
            </label>
            <input
              type="text"
              name="allergies"
              placeholder="List any drug, food, or environmental allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-2">
        <button 
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Cancel
        </button>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm text-white hover:bg-[#1d4ed8] disabled:opacity-50"
        >
          <PrintIcon className="h-4 w-4" />
          {loading ? "Saving..." : "Save Patient"}
        </button>
      </div>
      </form>
    </div>
  );
}
