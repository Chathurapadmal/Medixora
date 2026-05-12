import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  SearchIcon,
} from "@/components/dashboard-icons";

type Doctor = {
  doctor_id: number;
  doctor_name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  qualifications?: string;
  experience_years?: number;
  consultation_fee?: number;
  availability?: string;
  shift_start?: string;
  shift_end?: string;
  status?: string;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/doctors");
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForInitial = (name: string): string => {
    const colors = [
      "bg-[#eef0ff] text-[#4554cb]",
      "bg-[#e7f7f0] text-[#11805d]",
      "bg-[#eef2ff] text-[#5a6178]",
      "bg-[#fff1ea] text-[#c2642c]",
      "bg-[#f3e8ff] text-[#7c3aed]",
      "bg-[#ffe6e6] text-[#d43d3d]",
    ];
    const hash = name.charCodeAt(0) % colors.length;
    return colors[hash];
  };

  const getStatusClass = (status: string | undefined): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-[#dcf6e9] text-[#11805d]";
      case "busy":
        return "bg-[#ffe8d9] text-[#c2642c]";
      case "off":
        return "bg-[#eceef5] text-[#70798d]";
      default:
        return "bg-[#dcf6e9] text-[#11805d]";
    }
  };

  const allSpecialties = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)));

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.doctor_id.toString().includes(searchTerm);

    const matchesSpecialty =
      specialtyFilter === "all" || d.specialization === specialtyFilter;

    return matchesSearch && matchesSpecialty;
  });
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900">
              Doctor Directory
            </h1>
            <p className="text-[14px] text-slate-500">
              Manage hospital staff, specialties, and availability.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#1d4ed8]">
            <PlusIcon className="h-4 w-4" />
            Add Doctor
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* SEARCH */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 w-full md:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* FILTERS */}
          <div className="flex gap-2">
            <select 
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white"
            >
              <option value="all">All Specialties</option>
              {allSpecialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            <button onClick={fetchDoctors} className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Loading doctors...</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredDoctors.length > 0 && (
        <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="overflow-hidden rounded-[20px]">
            <table className="w-full text-left">

              <thead>
                <tr className="bg-[#fafbff] text-[13px] text-slate-500">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">DOCTOR</th>
                  <th className="px-5 py-3">SPECIALIZATION</th>
                  <th className="px-5 py-3">CONTACT</th>
                  <th className="px-5 py-3">AVAILABILITY</th>
                  <th className="px-5 py-3">STATUS</th>
                </tr>
              </thead>

              <tbody className="text-[14px] text-slate-700">
                {filteredDoctors.map((d) => (
                  <tr key={d.doctor_id} className="border-t border-slate-200 hover:bg-slate-50">

                    {/* ID */}
                    <td className="px-5 py-4 text-slate-500">
                      #MD-{d.doctor_id}
                    </td>

                    {/* DOCTOR */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 flex items-center justify-center rounded-full text-xs font-semibold ${getColorForInitial(d.doctor_name)}`}>
                          {getInitials(d.doctor_name)}
                        </div>
                        <span>Dr. {d.doctor_name}</span>
                      </div>
                    </td>

                    {/* SPECIALIZATION */}
                    <td className="px-5 py-4 text-slate-600">
                      {d.specialization || "N/A"}
                    </td>

                    {/* CONTACT */}
                    <td className="px-5 py-4 text-slate-600">
                      <div>{d.phone || "N/A"}</div>
                      <div className="text-xs text-slate-400">{d.email || "N/A"}</div>
                    </td>

                    {/* AVAILABILITY */}
                    <td className="px-5 py-4 text-slate-600">
                      {d.availability || `${d.shift_start || ""} - ${d.shift_end || ""}`.trim() || "N/A"}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(d.status)}`}>
                        {d.status || "Active"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500 border-t border-slate-200">
            <span>Showing {filteredDoctors.length} of {doctors.length} doctors</span>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredDoctors.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">{searchTerm || specialtyFilter !== "all" ? "No doctors found matching your criteria." : "No doctors registered yet."}</p>
        </div>
      )}
    </div>
  );
}