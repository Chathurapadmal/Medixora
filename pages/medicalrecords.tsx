import { useEffect, useState } from "react";
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
} from "@/components/dashboard-icons";

type MedicalRecord = {
  record_id: number;
  patient_id: number;
  patient_name?: string;
  doctor_id?: number;
  doctor_name?: string;
  visit_date?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  status?: string;
  created_at?: string;
};

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/medicalrecords");
      if (!response.ok) {
        throw new Error("Failed to fetch medical records");
      }
      const data = await response.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getColorForInitial = (name: string | undefined): string => {
    if (!name) return "bg-[#eef0ff] text-[#4554cb]";
    const colors = [
      "bg-[#dcf6e9] text-[#11805d]",
      "bg-[#fff1ea] text-[#c2642c]",
      "bg-[#e7f0ff] text-[#3657d6]",
      "bg-[#eceef5] text-[#70798d]",
      "bg-[#ffe6e6] text-[#d43d3d]",
      "bg-[#dff8ee] text-[#12a76f]",
    ];
    const hash = name.charCodeAt(0) % colors.length;
    return colors[hash];
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDiagnosisClass = (diagnosis: string | undefined): string => {
    if (!diagnosis) return "bg-[#eceef5] text-[#70798d]";
    const lower = diagnosis.toLowerCase();
    if (lower.includes("urgent") || lower.includes("acute")) {
      return "bg-[#ffe6e6] text-[#d43d3d]";
    }
    if (lower.includes("routine")) {
      return "bg-[#eceef5] text-[#70798d]";
    }
    if (lower.includes("follow")) {
      return "bg-[#dff8ee] text-[#12a76f]";
    }
    return "bg-[#dff8ee] text-[#12a76f]";
  };

  const formatDate = (date: string | undefined): string => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const isWithinDateRange = (date: string | undefined): boolean => {
    if (!date || dateFilter === "all") return true;
    const recordDate = new Date(date);
    const now = new Date();
    const days = dateFilter === "7" ? 7 : 30;
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return recordDate >= daysAgo;
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      (r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.record_id.toString().includes(searchTerm) ||
        r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;

    const matchesDate = isWithinDateRange(r.visit_date);

    return matchesSearch && matchesDate;
  });
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900">
              Medical Records
            </h1>
            <p className="text-[14px] text-slate-500">
              Manage and review comprehensive patient treatment histories.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={fetchRecords} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              Refresh
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm text-white hover:bg-[#1d4ed8]">
              <PlusIcon className="h-4 w-4" />
              New Record
            </button>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* SEARCH */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 w-full md:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by patient name, ID, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* FILTERS */}
          <div className="flex gap-2">
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white"
            >
              <option value="all">All Dates</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
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
          <p className="text-slate-600">Loading medical records...</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredRecords.length > 0 && (
        <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          
          <div className="overflow-hidden rounded-[20px]">
            <table className="w-full text-left">

              <thead>
                <tr className="bg-[#fafbff] text-[13px] text-slate-500">
                  <th className="px-5 py-3">Record ID</th>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Attending Doctor</th>
                  <th className="px-5 py-3">Diagnosis</th>
                  <th className="px-5 py-3">Prescription</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="text-[14px] text-slate-700">
                {filteredRecords.map((r) => (
                  <tr key={r.record_id} className="border-t border-slate-200 hover:bg-slate-50">

                    <td className="px-5 py-4 text-blue-600 font-medium cursor-pointer">
                      MR-{r.record_id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold ${getColorForInitial(r.patient_name)}`}>
                          {getInitials(r.patient_name)}
                        </div>
                        {r.patient_name || "N/A"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {r.doctor_name ? `Dr. ${r.doctor_name}` : "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ${getDiagnosisClass(r.diagnosis)}`}>
                        {r.diagnosis || "No diagnosis"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600 text-xs">
                      {r.prescription ? r.prescription.substring(0, 40) + (r.prescription.length > 40 ? "..." : "") : "None"}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(r.visit_date)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500 border-t border-slate-200">
            <span>Showing {filteredRecords.length} of {records.length} records</span>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredRecords.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">{searchTerm || dateFilter !== "all" ? "No records found matching your criteria." : "No medical records yet."}</p>
        </div>
      )}
    </div>
  );
}