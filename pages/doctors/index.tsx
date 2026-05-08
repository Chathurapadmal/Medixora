import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

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