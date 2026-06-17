<<<<<<< Updated upstream
=======
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
>>>>>>> Stashed changes
import {
  CalendarIcon,
  FilterIcon,
  ImportIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/dashboard-icons";

const records = [
  {
    id: "MR-8472-A",
    initials: "JS",
    avatarClass: "bg-[#6cf8bb] text-[#00714d]",
    name: "James Sullivan",
    doctor: "Dr. Aris Thorne",
    diagnosis: "Acute Bronchitis",
    diagnosisClass: "bg-red-100 text-red-700 ring-red-600/20",
    prescription: "Azithromycin 250mg, Albuterol...",
    date: "Oct 26, 2023",
  },
  {
    id: "MR-8471-X",
    initials: "MW",
    avatarClass: "bg-[#bc4800] text-[#ffede6]",
    name: "Mariah Woods",
    doctor: "Dr. Sarah Jenkins",
    diagnosis: "Routine Checkup",
    diagnosisClass: "bg-slate-100 text-slate-600 ring-slate-500/20",
    prescription: "None (Refill authorized for Lisi...)",
    date: "Oct 25, 2023",
  },
  {
    id: "MR-8469-C",
    initials: "KL",
    avatarClass: "bg-[#2563eb] text-[#eeefff]",
    name: "Kevin Lin",
    doctor: "Dr. Marcus Vance",
    diagnosis: "Post-Op Observation",
    diagnosisClass: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    prescription: "Ibuprofen 800mg, Cephalexin...",
    date: "Oct 24, 2023",
  },
  {
    id: "MR-8465-B",
    initials: "ER",
    avatarClass: "bg-[#e1e2ed] text-[#191b23]",
    name: "Elena Rodriguez",
    doctor: "Dr. Aris Thorne",
    diagnosis: "Migraine (Severe)",
    diagnosisClass: "bg-red-100 text-red-700 ring-red-600/20",
    prescription: "Sumatriptan 50mg PRN...",
    date: "Oct 23, 2023",
  },
];

function MaterialIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function MedicalRecordsPage() {
<<<<<<< Updated upstream
=======
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filtered, setFiltered] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("All Time");
  const [dropdownState, setDropdownState] = useState<{ id: number; top: number; right: number } | null>(null);

  useEffect(() => {
    const handleClose = () => setDropdownState(null);
    document.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      document.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/medical-records?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete record from the database.");
      }
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setFiltered((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete record", err);
      alert("Error deleting record. Please try again.");
    }
  };

  const fetchRecords = () => {
    setLoading(true);
    fetch("/api/medical-records")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setRecords(list);
        setFiltered(list);
      })
      .catch(() => {
        setRecords([]);
        setFiltered([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
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

>>>>>>> Stashed changes
  return (
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

<<<<<<< Updated upstream
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
            New Record
          </button>
        </div>
=======
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
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadgeClass(record.status)}`}
                          >
                            {record.status
                              ? record.status.charAt(0).toUpperCase() + record.status.slice(1)
                              : "Completed"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              aria-label={`Actions for ${record.patientName}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (dropdownState?.id === record.id) {
                                  setDropdownState(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDropdownState({
                                    id: record.id,
                                    top: rect.bottom,
                                    right: window.innerWidth - rect.right,
                                  });
                                }
                              }}
                            >
                              <MoreIcon className="h-5 w-5" />
                            </button>

                            {dropdownState?.id === record.id && (
                              <div 
                                className="fixed z-50 mt-1 flex w-32 flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                                style={{ top: dropdownState.top, right: dropdownState.right }}
                              >
                                <button
                                  className="w-full rounded-md px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownState(null);
                                    router.push(`/medical_records/add_medical_record?id=${record.id}`);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full rounded-md px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownState(null);
                                    handleDelete(record.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
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
>>>>>>> Stashed changes
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
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Date Range
            </span>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-sm text-slate-700 outline-none focus:border-blue-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
                <option>Previous Quarter</option>
                <option>Custom Range...</option>
              </select>
              <MaterialIcon
                name="arrow_drop_down"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400"
              />
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
              {records.map((record) => (
                <tr key={record.id} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-blue-600">
                    {record.id}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${record.avatarClass}`}
                      >
                        {record.initials}
                      </div>
                      <span className="text-sm font-semibold text-slate-950">
                        {record.name}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {record.doctor}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${record.diagnosisClass}`}
                    >
                      {record.diagnosis}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {record.prescription}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {record.date}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <button
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Actions for ${record.name}`}
                      type="button"
                    >
                      <MoreIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing 1 to 4 of 128 records
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
      </section>
    </div>
  );
}