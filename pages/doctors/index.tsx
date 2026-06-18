import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

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

function ActionsMenu({
  doctor,
  onDelete,
}: {
  doctor: Doctor;
  onDelete: (id: string) => void;
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 stroke-2">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>

      {open && (
        <div 
          className="absolute right-0 z-[100] mt-2 w-32 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <Link
              href={`/doctors/${doctor.id}`}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
            >
              Edit Details
            </Link>
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
    </div>
  );
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
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
                      "Room",
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

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-800">
                        {d.room || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            d.status === "Active"
                              ? "bg-emerald-100 text-emerald-700 ring-emerald-600/20"
                              : d.status === "On Leave"
                                ? "bg-amber-100 text-amber-700 ring-amber-600/20"
                                : "bg-slate-100 text-slate-600 ring-slate-500/20",
                          ].join(" ")}
                        >
                          {d.status ?? "Active"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <ActionsMenu doctor={d} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}