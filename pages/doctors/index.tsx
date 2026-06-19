import type { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { DoctorsIcon, PlusIcon } from "../../components/dashboard-icons";



type Doctor = {
  id: string;
  name?: string;
  specialization?: string;
  qualifications?: string;
  experienceYears?: number;
  phone?: string;
  email?: string;
  consultationFee?: string | number;
  availability?: string;
  shiftStart?: string;
  shiftEnd?: string;
  room?: string;
  status?: string;
};

type DoctorStatus = "Active" | "On Leave" | "Inactive";

type DoctorForm = {
  name: string;
  email: string;
  password?: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  fee: string;
  days: string[];
  shiftStart: string;
  shiftEnd: string;
  room: string;
  status: DoctorStatus;
};



const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const weekDays = [
  { label: "M", value: "Mon" },
  { label: "T", value: "Tue" },
  { label: "W", value: "Wed" },
  { label: "T", value: "Thu" },
  { label: "F", value: "Fri" },
  { label: "S", value: "Sat" },
  { label: "S", value: "Sun" },
];

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}



function ActionsMenu({
  doctor,
  onDelete,
  onEdit,
}: {
  doctor: Doctor;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 128 });
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        onClick={handleToggle}
        aria-label="Actions"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 stroke-2">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
          className="z-[9999] w-32 rounded-lg bg-white shadow-lg ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              onClick={() => {
                setOpen(false);
                onEdit(doctor.id);
              }}
            >
              Edit Details
            </button>
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              onClick={() => {
                setOpen(false);
                if (window.confirm("Are you sure you want to delete this doctor?")) {
                  onDelete(doctor.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
}



function EditDoctorPanel({
  doctorId,
  onClose,
  onSaved,
}: {
  doctorId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<DoctorForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: 0,
    fee: "",
    days: [],
    shiftStart: "",
    shiftEnd: "",
    room: "",
    status: "Active",
  });

  useEffect(() => {
    fetch(`/api/doctors?id=${doctorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          specialization: data.specialization || "",
          qualification: data.qualifications || "",
          experience: data.experience || 0,
          fee: data.fee || "",
          days: data.availability ? data.availability.split(", ") : [],
          shiftStart: data.shiftStart || "",
          shiftEnd: data.shiftEnd || "",
          room: data.room || "",
          status: data.status || "Active",
        });
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const toggleDay = (day: string) => {
    setForm((current) => {
      const exists = current.days.includes(day);
      return {
        ...current,
        days: exists
          ? current.days.filter((item) => item !== day)
          : [...current.days, day],
      };
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch(`/api/doctors?id=${doctorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSaved();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-[201] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <DoctorsIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Edit Doctor</h2>
              <p className="text-xs text-slate-500">
                Update profile, credentials & availability
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close panel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 stroke-2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading profile…</div>
        ) : (
          <form className="space-y-6 p-6" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <DoctorsIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Personal Information
                  </h3>
                  <p className="text-sm text-slate-500">
                    Basic profile and contact information.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Full Name" required>
                    <input
                      className={inputClass}
                      placeholder="Enter full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <Field label="Email Address" required>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Field>

                <Field label="New Password (optional)">
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={form.password || ""}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </Field>

                <Field label="Contact Number" required>
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="Enter contact number"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </Field>
              </div>
            </section>

            {/* Professional Credentials */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <PlusIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Professional Credentials
                  </h3>
                  <p className="text-sm text-slate-500">
                    Specialty, qualification, experience, and consultation fee.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Specialization" required>
                  <select
                    className={inputClass}
                    value={form.specialization}
                    onChange={(e) =>
                      setForm({ ...form, specialization: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select specialization
                    </option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Pediatrics</option>
                    <option>Orthopedics</option>
                    <option>General Surgery</option>
                  </select>
                </Field>

                <Field label="Highest Qualification" required>
                  <input
                    className={inputClass}
                    placeholder="Enter qualification"
                    value={form.qualification}
                    onChange={(e) =>
                      setForm({ ...form, qualification: e.target.value })
                    }
                  />
                </Field>

                <Field label="Years of Experience">
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.experience}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          experience: Number(e.target.value),
                        })
                      }
                    />
                    <span className="border-l border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">
                      YRS
                    </span>
                  </div>
                </Field>

                <Field label="Consultation Fee">
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                    <span className="border-r border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">
                      Rs
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.fee}
                      onChange={(e) =>
                        setForm({ ...form, fee: e.target.value })
                      }
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Availability */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-950">
                  Availability
                </h3>
                <p className="text-sm text-slate-500">
                  Working days, shift time, and current profile status.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Working Days
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day, index) => {
                      const active = form.days.includes(day.value);

                      return (
                        <button
                          key={`${day.value}-${index}`}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={[
                            "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition",
                            active
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Field label="Shift Start Time">
                  <input
                    className={inputClass}
                    type="time"
                    value={form.shiftStart}
                    onChange={(e) =>
                      setForm({ ...form, shiftStart: e.target.value })
                    }
                  />
                </Field>

                <Field label="Shift End Time">
                  <input
                    className={inputClass}
                    type="time"
                    value={form.shiftEnd}
                    onChange={(e) =>
                      setForm({ ...form, shiftEnd: e.target.value })
                    }
                  />
                </Field>

                <Field label="Room Number">
                  <input
                    className={inputClass}
                    placeholder="e.g. 101A"
                    value={form.room}
                    onChange={(e) =>
                      setForm({ ...form, room: e.target.value })
                    }
                  />
                </Field>

                <div className="border-t border-slate-200 pt-5">
                  <Field label="Profile Status">
                    <select
                      className={inputClass}
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as DoctorStatus,
                        })
                      }
                    >
                      <option>Active</option>
                      <option>On Leave</option>
                      <option>Inactive</option>
                    </select>
                  </Field>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                <PlusIcon className="h-4 w-4" />
                {saving ? "Saving…" : "Update Profile"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}


export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/doctors?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete doctor");
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Doctors - MediStock</title>
      </Head>

      <div className="mx-auto max-w-[1440px] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Doctors</p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Doctor Directory
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage doctor profiles, specialties, and availability.
            </p>
          </div>

          <Link
            href="/doctors/add_doctor"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Add Doctor
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "ID",
                    "Name",
                    "Specialization",
                    "Phone",
                    "Email",
                    "Fee",
                    "Experience",
                    "Availability",
                    "Room",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                      Loading doctors…
                    </td>
                  </tr>
                ) : doctors.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  doctors.map((d, index) => (
                    <tr key={d.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {d.id}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {d.name ?? "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {d.specialization ?? "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {d.phone ?? "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {d.email ?? "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {d.consultationFee ?? "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {d.experienceYears ?? "-"} yrs
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {d.availability ?? "-"}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {d.room || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            d.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : d.status === "On Leave"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-800",
                          ].join(" ")}
                        >
                          {d.status ?? "Active"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-right">
                        <ActionsMenu
                          doctor={d}
                          onDelete={handleDelete}
                          onEdit={setEditingId}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Doctor slide-over panel */}
      {editingId && (
        <EditDoctorPanel
          doctorId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null);
            fetchDoctors();
          }}
        />
      )}
    </>
  );
}