import Link from "next/link";
import { useState } from "react";
import {
  SearchIcon,
  EyeIcon,
  EditIcon,
  DeleteIcon,
  FilterIcon,
  ExportIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/dashboard-icons";

const patients = [
  {
    id: "PT-2023-001",
    initials: "SJ",
    avatarClass: "bg-blue-100 text-blue-700",
    name: "Sarah Jenkins",
    details: "34 yrs • Female",
    bloodGroup: "O+",
    contact: "+1 (555) 123-4567",
    status: "Active",
    statusClass: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "PT-2023-002",
    initials: "MR",
    avatarClass: "bg-purple-100 text-purple-700",
    name: "Michael Roberts",
    details: "52 yrs • Male",
    bloodGroup: "A-",
    contact: "+1 (555) 987-6543",
    status: "Active",
    statusClass: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "PT-2023-003",
    initials: "AL",
    avatarClass: "bg-orange-100 text-orange-700",
    name: "Anita Lopez",
    details: "28 yrs • Female",
    bloodGroup: "B+",
    contact: "+1 (555) 345-6789",
    status: "In Treatment",
    statusClass: "bg-amber-100 text-amber-800",
  },
  {
    id: "PT-2023-004",
    initials: "DW",
    avatarClass: "bg-rose-100 text-rose-700",
    name: "David Williams",
    details: "65 yrs • Male",
    bloodGroup: "AB+",
    contact: "+1 (555) 765-4321",
    status: "Discharged",
    statusClass: "bg-slate-100 text-slate-600",
  },
];

export default function PatientDirectoryPage() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // This remembers what the user types in the search bar
  const [searchQuery, setSearchQuery] = useState("");

  // This filters the patients list automatically
  const filteredPatients = patients.filter((patient) => {
    const matchesName = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesId = patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesName || matchesId;
  });

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[24px] font-semibold leading-8 tracking-[-0.01em] text-[#191b23]">
            Patient Directory
          </h2>

          <p className="mt-1 text-sm leading-5 text-[#434655]">
            Manage patient records, appointments, and medical history.
          </p>
        </div>

        <Link href="/patients/add" className="flex items-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition-all hover:bg-[#003ea8] active:scale-[0.98]">
  Add New Patient
</Link>
      </div>

      <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
        
        {/* TOP BAR */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-white p-4 sm:flex-row">
          
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-4 text-sm leading-5 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#004ac6]"
              placeholder="Search by name or ID..."
              type="text"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#434655] transition-colors hover:bg-slate-50 sm:w-auto">
              <FilterIcon className="h-4 w-4 text-slate-500" />
              Filter
            </button>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#434655] transition-colors hover:bg-slate-50 sm:w-auto">
              <ExportIcon className="h-4 w-4 text-slate-500" />
              Export
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full divide-y divide-slate-200 text-left">
            
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Patient ID",
                  "Name",
                  "Details",
                  "Blood Group",
                  "Contact",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className={`whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${
                      header === "Actions" ? "text-center" : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {patients.map((patient) => (
                <tr key={patient.id} className="transition hover:bg-slate-50">
                  
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-medium text-slate-500">
                    {patient.id}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-3">
                      
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${patient.avatarClass}`}
                      >
                        {patient.initials}
                      </div>

                      <div className="text-sm font-semibold text-slate-950">
                        {patient.name}
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {patient.details}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-500/20">
                      {patient.bloodGroup}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {patient.contact}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${patient.statusClass}`}
                    >
                      {patient.status}
                    </span>
                  </td>

                  {/* FIXED ACTION ICONS */}
                  <td className="relative whitespace-nowrap px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleMenu(patient.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <span className="text-xl leading-none">⋮</span>
                    </button>

                    {openMenuId === patient.id && (
                      <div className="absolute right-6 top-12 z-30 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                        
                        <Link
                          href="/patients/patient_details"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </Link>

                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <EditIcon className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <DeleteIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white p-4 text-sm text-slate-500">
          
          <div>Showing 1 to 4 of 24 entries</div>

          <div className="flex items-center gap-1.5">
            
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-[#f3f3fe] text-slate-400"
              disabled
              type="button"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f56c6] text-[16px] font-medium text-white shadow-sm"
              type="button"
            >
              1
            </button>

            <button
              className="flex h-7 w-7 items-center justify-center rounded-md text-[16px] font-medium text-[#191b23] transition hover:bg-slate-100"
              type="button"
            >
              2
            </button>

            <button
              className="flex h-7 w-7 items-center justify-center rounded-md text-[16px] font-medium text-[#191b23] transition hover:bg-slate-100"
              type="button"
            >
              3
            </button>

            <span className="px-0.5 text-[15px] font-semibold text-[#434655]">
              ...
            </span>

            <button
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-[#f3f3fe] text-[#191b23] transition hover:bg-slate-100"
              type="button"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
