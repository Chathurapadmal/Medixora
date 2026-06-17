import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { EditIcon, DeleteIcon, MoreIcon } from "../../components/dashboard-icons";

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
  status?: string;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const [deleting, setDeleting] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [editing, setEditing] = useState(false);

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editDoctor) return;
    setEditing(true);
    try {
      await fetch(`/api/doctors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDoctor),
      });
      setDoctors((prev) => prev.map((d) => (d.id === editDoctor.id ? editDoctor : d)));
      setEditDoctor(null);
    } catch (err) {
      console.error("Failed to update doctor:", err);
    } finally {
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!deleteDoctor) return;
    setDeleting(true);
    try {
      await fetch(`/api/doctors/${deleteDoctor.id}`, { method: "DELETE" });
      setDoctors((prev) => prev.filter((d) => d.id !== deleteDoctor.id));
      setDeleteDoctor(null);
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) {
          setDoctors(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => setDoctors([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Doctors - MediStock</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-6">
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-600">Loading doctors…</p>
          ) : doctors.length === 0 ? (
            <p className="text-sm text-slate-600">No doctors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
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
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {doctors.map((d) => (
                    <tr key={d.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-500">
                        {d.id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                        {d.name ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {d.specialization ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {d.phone ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {d.email ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {d.consultationFee ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {d.experienceYears ?? "-"} yrs
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {d.availability ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            d.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : d.status === "On Leave"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {d.status ?? "Active"}
                        </span>
                      </td>

                      <td className="relative whitespace-nowrap px-4 py-4 text-right">
                        <button
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Actions for ${d.name}`}
                          onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}
                        >
                          <MoreIcon className="h-5 w-5" />
                        </button>

                        {openMenuId === d.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-4 top-12 z-20 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                          >
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                              onClick={() => { setEditDoctor(d); setOpenMenuId(null); }}
                            >
                              <EditIcon className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                              onClick={() => { setDeleteDoctor(d); setOpenMenuId(null); }}
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
          )}
        </section>

        {deleteDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <DeleteIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Doctor Profile</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Are you sure you want to remove <span className="font-semibold text-slate-900">Dr. {deleteDoctor.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setDeleteDoctor(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Profile"}
                </button>
              </div>
            </div>
          </div>
        )}

        {editDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <EditIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Doctor Profile</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Update the information for Dr. {editDoctor.name}
                  </p>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Full Name</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                      value={editDoctor.name || ""}
                      onChange={(e) => setEditDoctor({ ...editDoctor, name: e.target.value })}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Email Address</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                      type="email"
                      value={editDoctor.email || ""}
                      onChange={(e) => setEditDoctor({ ...editDoctor, email: e.target.value })}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Phone</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                      value={editDoctor.phone || ""}
                      onChange={(e) => setEditDoctor({ ...editDoctor, phone: e.target.value })}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Specialization</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                      value={editDoctor.specialization || ""}
                      onChange={(e) => setEditDoctor({ ...editDoctor, specialization: e.target.value })}
                    />
                  </label>
                  
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Consultation Fee</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                      type="number"
                      step="0.01"
                      value={editDoctor.consultationFee || ""}
                      onChange={(e) => setEditDoctor({ ...editDoctor, consultationFee: e.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Status</span>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                      value={editDoctor.status || "Active"}
                      onChange={(e) => setEditDoctor({ ...editDoctor, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setEditDoctor(null)}
                    disabled={editing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={editing}
                  >
                    {editing ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}