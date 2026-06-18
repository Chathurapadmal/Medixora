import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

type Patient = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  allergies?: string;
  status?: string;
};

const PAGE_SIZE = 10;

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_CLASSES = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];
function avatarClass(id: number) {
  return AVATAR_CLASSES[id % AVATAR_CLASSES.length];
}

function statusBadge(status?: string) {
  switch (status) {
    case "Active":       return "bg-emerald-100 text-emerald-800";
    case "In Treatment": return "bg-amber-100 text-amber-800";
    case "Discharged":   return "bg-slate-100 text-slate-600";
    default:             return "bg-emerald-100 text-emerald-800";
  }
}

function capitalise(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PatientDirectoryPage() {
  const router = useRouter();

  const [patients, setPatients]     = useState<Patient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [page, setPage]             = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function loadPatients() {
    setLoading(true);
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => setPatients(Array.isArray(data) ? data : []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadPatients(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/patients/${id}`, { method: "DELETE" });
      setPatients((prev) => prev.filter((p) => p.id !== id));
      setOpenMenuId(null);
    } finally {
      setDeletingId(null);
    }
  }

  /* filtering */
  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name?.toLowerCase().includes(q) || String(p.id).includes(q);
  });

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleMenu = (id: number) =>
    setOpenMenuId(openMenuId === id ? null : id);

  return (
    <>
      <Head>
        <title>Patients - MediStock</title>
      </Head>

      {/* overlay to close dropdown on outside click */}
      {openMenuId !== null && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuId(null)}
        />
      )}

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

          <Link
            href="/patients/patientregister"
            className="flex items-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition-all hover:bg-[#003ea8] active:scale-[0.98]"
          >
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
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                  {["Patient ID", "Name", "Gender", "Blood Group", "Contact", "Status", "Actions"].map(
                    (header) => (
                      <th
                        key={header}
                        className={`whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${
                          header === "Actions" ? "text-center" : ""
                        }`}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      Loading patients…
                    </td>
                  </tr>
                ) : pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((patient) => (
                    <tr key={patient.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-medium text-slate-500">
                        {String(patient.id).padStart(3, "0")}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarClass(patient.id)}`}
                          >
                            {initials(patient.name)}
                          </div>
                          <div className="text-sm font-semibold text-slate-950">
                            {patient.name ?? "-"}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {patient.gender ? capitalise(patient.gender) : "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {patient.bloodGroup ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-500/20">
                            {patient.bloodGroup}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {patient.phone ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(patient.status)}`}
                        >
                          {patient.status ?? "Active"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="relative whitespace-nowrap px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleMenu(patient.id); }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <span className="text-xl leading-none">⋮</span>
                        </button>

                        {openMenuId === patient.id && (
                          <div className="absolute right-6 top-12 z-30 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-[0_12px_30px_rgba(15,23,42,0.12)]">

                            {/* VIEW → goes to patientdetails */}
                            <button
                              type="button"
                              onClick={() => router.push(`/patients/${patient.id}`)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                            >
                              <EyeIcon className="h-4 w-4" />
                              View
                            </button>

                            {/* EDIT — wire up later */}
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                            >
                              <EditIcon className="h-4 w-4" />
                              Edit
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              disabled={deletingId === patient.id}
                              onClick={() => handleDelete(patient.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <DeleteIcon className="h-4 w-4" />
                              {deletingId === patient.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-white p-4 text-sm text-slate-500">
            <div>
              {loading
                ? "Loading…"
                : `Showing ${filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to ${Math.min(
                    safePage * PAGE_SIZE,
                    filtered.length
                  )} of ${filtered.length} entries`}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-[#f3f3fe] text-slate-400 disabled:opacity-40"
                disabled={safePage === 1}
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-0.5 text-[15px] font-semibold text-[#434655]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item as number)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-[14px] font-medium transition ${
                        safePage === item
                          ? "bg-[#2f56c6] text-white shadow-sm"
                          : "text-[#191b23] hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-[#f3f3fe] text-[#191b23] transition hover:bg-slate-100 disabled:opacity-40"
                disabled={safePage === totalPages}
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}