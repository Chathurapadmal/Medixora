import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  DeleteIcon,
} from "@/components/dashboard-icons";

type Patient = {
  patient_id: number;
  patient_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  status?: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patients");
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string | undefined): number | string => {
    if (!dateOfBirth) return "N/A";
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return "N/A";
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
      "bg-[#f3e8ff] text-[#7c3aed]",
      "bg-[#fff1ea] text-[#c2642c]",
      "bg-[#ffe6e6] text-[#d43d3d]",
      "bg-[#e7f7f0] text-[#11805d]",
      "bg-[#fff4db] text-[#b7791f]",
    ];
    const hash = name.charCodeAt(0) % colors.length;
    return colors[hash];
  };

  const filteredPatients = patients.filter((p) =>
    p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_id.toString().includes(searchTerm)
  );
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900">
              Patient Directory
            </h1>
            <p className="text-[14px] text-slate-500">
              Manage patient records, appointments, and medical history.
            </p>
          </div>

          <Link href="/patientregister">
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#1d4ed8]">
              <PlusIcon className="h-4 w-4" />
              Add New Patient
            </button>
          </Link>
        </div>

        {/* SEARCH + ACTIONS */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 w-full md:max-w-sm">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={fetchPatients} className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
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
          <p className="text-slate-600">Loading patients...</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredPatients.length > 0 && (
        <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="overflow-hidden rounded-[20px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fafbff] text-[13px] text-slate-500">
                  <th className="px-5 py-3">PATIENT ID</th>
                  <th className="px-5 py-3">NAME</th>
                  <th className="px-5 py-3">DETAILS</th>
                  <th className="px-5 py-3">BLOOD GROUP</th>
                  <th className="px-5 py-3">CONTACT</th>
                  <th className="px-5 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="text-[14px] text-slate-700">
                {filteredPatients.map((p) => (
                  <tr key={p.patient_id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-500">PT-{p.patient_id}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold ${getColorForInitial(p.patient_name)}`}>
                          {getInitials(p.patient_name)}
                        </div>
                        {p.patient_name}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {calculateAge(p.date_of_birth)} yrs • {p.gender || "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs">
                        {p.blood_type || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">{p.phone || p.email || "N/A"}</td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-0">
                        <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                          <EyeIcon className="h-4 w-4 text-slate-500" />
                        </button>

                        <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                          <EditIcon className="h-4 w-4 text-blue-500" />
                        </button>

                        <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                          <DeleteIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500 border-t border-slate-200">
            <span>Showing {filteredPatients.length} of {patients.length} entries</span>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredPatients.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">{searchTerm ? "No patients found matching your search." : "No patients registered yet."}</p>
          {!searchTerm && (
            <Link href="/patientregister">
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1d4ed8]">
                <PlusIcon className="h-4 w-4" />
                Add First Patient
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}