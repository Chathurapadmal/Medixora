import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusIcon,
  SearchIcon,
  CalendarIcon,
  FilterIcon,
  ClockIcon,
} from "@/components/dashboard-icons";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type Appointment = {
  appointment_id: number;
  appointment_number: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;       // "YYYY-MM-DD"
  appointment_time: string;       // "HH:MM"
  reason_for_visit: string;
  status: "Scheduled" | "Pending" | "Confirmed" | "Completed" | "Cancelled" | string;
};

type ApiResponse = {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

/* ------------------------------------------------------------------ */
/*  Status styles                                                        */
/* ------------------------------------------------------------------ */
const statusStyle: Record<string, { badge: string; dot: string }> = {
  Scheduled: { badge: "bg-[#eff6ff] text-[#1d4ed8]",   dot: "bg-[#1d4ed8]" },
  Pending:   { badge: "bg-[#ffe8d9] text-[#c2642c]",   dot: "bg-[#c2642c]" },
  Confirmed: { badge: "bg-[#dcf6e9] text-[#11805d]",   dot: "bg-[#11805d]" },
  Completed: { badge: "bg-[#eceef5] text-[#5f6475]",   dot: "bg-[#5f6475]" },
  Cancelled: { badge: "bg-[#ffe6e6] text-[#d43d3d]",   dot: "bg-[#d43d3d]" },
};
const defaultStyle = { badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const formatDate = (d: string) => {
  if (!d) return "–";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (t: string) => {
  if (!t) return "–";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const ALL_STATUSES = ["", "Scheduled", "Pending", "Confirmed"];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const LIMIT = 10;

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [userRole, setUserRole]     = useState("Admin");
  const [userEmail, setUserEmail]   = useState("");

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "Admin");
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = atob(token);
        const email = decoded.split(":")[2];
        if (email) setUserEmail(email);
      } catch (e) {}
    }
  }, []);

  // ── fetch ──────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string> = {
        search,
        status: statusFilter,
        page: String(page),
        limit: String(LIMIT),
      };

      if (userRole === "Doctor" && userEmail) {
        params.doctorEmail = userEmail;
      }

      const queryString = new URLSearchParams(params).toString();

      const res = await fetch(`/api/appointments?${queryString}`);
      if (!res.ok) throw new Error("Failed to load appointments");

      const json: ApiResponse = await res.json();
      setAppointments(json.data ?? []);
      setTotal(json.total ?? 0);
      setPages(json.pages ?? 1);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, userRole, userEmail]);

  useEffect(() => {
    const timer = setTimeout(fetchAppointments, 300);
    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  // reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // ── delete ─────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this appointment?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    fetchAppointments();
  };

  // ── status update ─────────────────────────────────────────────────
  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchAppointments();
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">
              Appointments
            </h1>
            <p className="mt-2 max-w-[700px] text-[14px] leading-7 text-slate-500">
              Manage patient scheduling, review upcoming consultations,
              and update appointment statuses.
            </p>
          </div>

          <Link
            href="/appointments/bookappointment"
            id="new-appointment-btn"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1450d2] px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(20,80,210,0.20)] transition hover:bg-[#0f43b5]"
          >
            <PlusIcon className="h-4 w-4" />
            New Appointment
          </Link>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">

          {/* SEARCH */}
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 md:max-w-sm">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              id="search-appointments"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or ID..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-2">

            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <FilterIcon className="h-4 w-4 text-slate-500" />
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.filter(Boolean).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <button
              onClick={fetchAppointments}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

        {/* error */}
        {error && (
          <div className="px-5 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {/* loading skeleton */}
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">
            Loading appointments…
          </div>
        ) : appointments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <CalendarIcon className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">
                No appointments found.{" "}
                <Link
                  href="/appointments/bookappointment"
                  className="font-medium text-[#1450d2] hover:underline"
                >
                  Book one now →
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fafbff] text-[13px] font-medium text-slate-500">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Patient Name</th>
                  <th className="px-5 py-4">Doctor</th>
                  <th className="px-5 py-4">Date &amp; Time</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="text-[14px] text-slate-700">
                {appointments.map((apt) => {
                  const style = statusStyle[apt.status] ?? defaultStyle;
                  return (
                    <tr
                      key={apt.appointment_id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-5 py-4 text-slate-500 font-mono text-[12px]">
                        #{apt.appointment_number || String(apt.appointment_id).padStart(4, "0")}
                      </td>

                      {/* PATIENT */}
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {apt.patient_name}
                      </td>

                      {/* DOCTOR */}
                      <td className="px-5 py-4 text-slate-600">
                        {apt.doctor_name}
                      </td>

                      {/* DATE + TIME */}
                      <td className="px-5 py-4">
                        <div className="text-slate-700">{formatDate(apt.appointment_date)}</div>
                        <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {formatTime(apt.appointment_time)}
                        </div>
                      </td>

                      {/* REASON */}
                      <td className="px-5 py-4 text-slate-600 max-w-[200px]">
                        <span className="line-clamp-2">
                          {apt.reason_for_visit || "–"}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            handleStatusChange(apt.appointment_id, e.target.value)
                          }
                          className={`inline-flex items-center rounded-full border-0 px-3 py-1 text-[12px] font-medium outline-none cursor-pointer ${style.badge}`}
                        >
                          {userRole === "Doctor" ? (
                            <>
                              <option value={apt.status}>{apt.status}</option>
                              {apt.status !== "Confirmed" && <option value="Confirmed">Confirmed</option>}
                            </>
                          ) : (
                            ALL_STATUSES.filter(Boolean).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))
                          )}
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        {userRole !== "Doctor" && (
                          <button
                            onClick={() => handleDelete(apt.appointment_id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
              <span>
                Showing {(page - 1) * LIMIT + 1}–
                {Math.min(page * LIMIT, total)} of {total} entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-slate-400 disabled:opacity-30"
                >
                  ‹
                </button>

                {Array.from({ length: pages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, page - 3),
                    Math.min(pages, page + 2)
                  )
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={[
                        "rounded-md px-3 py-1 text-sm transition",
                        p === page
                          ? "bg-[#1450d2] text-white"
                          : "text-slate-600 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-2 py-1 text-slate-600 disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}