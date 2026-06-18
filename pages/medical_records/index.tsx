import { useEffect, useState, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  CalendarIcon,
  FilterIcon,
  ImportIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon,
  ChevronDownIcon,
} from "@/components/dashboard-icons";

type MedicalRecord = {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number | null;
  doctorName: string | null;
  visitDate: string;
  diagnosis: string | null;
  treatment: string | null;
  prescription: string | null;
  notes: string | null;
  status: string;
};

const AVATAR_PALETTES = [
  { bg: "bg-[#6cf8bb]", text: "text-[#00714d]" },
  { bg: "bg-[#bc4800]", text: "text-[#ffede6]" },
  { bg: "bg-[#2563eb]", text: "text-[#eeefff]" },
  { bg: "bg-[#e1e2ed]", text: "text-[#191b23]" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function avatarFor(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

function statusBadgeClass(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 ring-emerald-600/20";
    case "pending":
      return "bg-amber-100 text-amber-700 ring-amber-600/20";
    case "cancelled":
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(text: string | null, max = 40) {
  if (!text) return "-";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function formatRecordId(id: number) {
  return `MR-${String(id).padStart(4, "0")}`;
}

function ActionsMenu({
  record,
  onDelete,
}: {
  record: MedicalRecord;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label="Actions"
      >
        <MoreIcon className="h-5 w-5" />
      </button>

      {open && (
        <div 
          className="absolute right-0 z-[100] mt-2 w-40 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <Link
              href={`/medical_records/${record.id}`}
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
            >
              View Full Record
            </Link>
            <Link
              href={`/patients/${record.patientId}`}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              View Patient Details
            </Link>
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              onClick={() => {
                setOpen(false);
                if (window.confirm("Are you sure you want to delete this medical record?")) {
                  onDelete(record.id);
                }
              }}
            >
              Delete Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filtered, setFiltered] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("All Time");

  useEffect(() => {
    let mounted = true;

    fetch("/api/medical-records")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) {
          const list = Array.isArray(data) ? data : [];
          setRecords(list);
          setFiltered(list);
        }
      })
      .catch(() => {
        if (mounted) { setRecords([]); setFiltered([]); }
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    const now = new Date();
    const cutoff = (() => {
      switch (dateRange) {
        case "Last 7 Days": { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
        case "Last 30 Days": { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
        case "This Month": { return new Date(now.getFullYear(), now.getMonth(), 1); }
        case "Previous Quarter": { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
        default: return null;
      }
    })();

    setFiltered(
      records.filter((r) => {
        const matchSearch =
          !q ||
          r.patientName?.toLowerCase().includes(q) ||
          r.doctorName?.toLowerCase().includes(q) ||
          r.diagnosis?.toLowerCase().includes(q) ||
          formatRecordId(r.id).toLowerCase().includes(q);

        const matchDate =
          !cutoff || new Date(r.visitDate) >= cutoff;

        return matchSearch && matchDate;
      })
    );
  }, [search, dateRange, records]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/medical-records/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete record");
      
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setFiltered((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }, []);

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/medical-records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      setFiltered((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      alert(err.message);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Medical Records - MediStock</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Medical Records</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Medical Records
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage and review comprehensive patient treatment histories.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              type="button"
            >
              <ImportIcon className="h-4 w-4" />
              Import
            </button>

            <Link
              href="/medical_records/add_medical_record"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              New Record
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Search Records
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search by patient name, ID, or doctor..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Date Range
              </span>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option>All Time</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                  <option>Previous Quarter</option>
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              type="button"
            >
              <FilterIcon className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="px-6 py-8 text-sm text-slate-500">Loading records…</p>
          ) : filtered.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-500">
              {records.length === 0 ? "No records found." : "No records match your search."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Record ID",
                      "Patient Name",
                      "Attending Doctor",
                      "Diagnosis",
                      "Prescription Summary",
                      "Date",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((record) => {
                    const avatar = avatarFor(record.patientName ?? "");
                    const initials = getInitials(record.patientName ?? "?");

                    return (
                      <tr key={record.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-blue-600">
                          {formatRecordId(record.id)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatar.bg} ${avatar.text}`}
                            >
                              {initials}
                            </div>
                            <span className="text-sm font-semibold text-slate-950">
                              {record.patientName ?? "-"}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {record.doctorName ? `Dr. ${record.doctorName}` : "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {record.diagnosis ? (
                            <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset bg-slate-100 text-slate-700 ring-slate-500/20">
                              {record.diagnosis}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {truncate(record.prescription)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {formatDate(record.visitDate)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <select
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset outline-none cursor-pointer ${statusBadgeClass(record.status)}`}
                            value={record.status || "Completed"}
                            onChange={(e) => handleStatusChange(record.id, e.target.value)}
                          >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <ActionsMenu record={record} onDelete={handleDelete} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {filtered.length} of {records.length} record{records.length !== 1 ? "s" : ""}
              </p>

              <div className="flex gap-2">
                {["1", "2", "3"].map((page) => (
                  <button
                    key={page}
                    className={
                      page === "1"
                        ? "h-9 w-9 rounded-lg bg-blue-600 text-sm font-semibold text-white"
                        : "h-9 w-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    }
                    type="button"
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}