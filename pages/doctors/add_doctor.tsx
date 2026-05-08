import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DoctorsIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon,
} from "../../components/dashboard-icons";

type DoctorStatus = "Active" | "On Leave" | "Inactive";

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
  status?: DoctorStatus;
};

type DoctorFilterStatus = "All Statuses" | DoctorStatus;

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] =
    useState("All Specializations");
  const [statusFilter, setStatusFilter] =
    useState<DoctorFilterStatus>("All Statuses");

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

  const statusStyles: Record<DoctorStatus, string> = {
    Active: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    "On Leave": "bg-amber-100 text-amber-700 ring-amber-600/20",
    Inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  const specializationOptions = useMemo(() => {
    const specializations = new Set(
      doctors
        .map((doctor) => doctor.specialization?.trim())
        .filter((value): value is string => Boolean(value))
    );

    return ["All Specializations", ...Array.from(specializations).sort()];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !query ||
        [
          doctor.id,
          doctor.name,
          doctor.specialization,
          doctor.phone,
          doctor.email,
          doctor.availability,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesSpecialization =
        specializationFilter === "All Specializations" ||
        doctor.specialization === specializationFilter;

      const matchesStatus =
        statusFilter === "All Statuses" ||
        (doctor.status ?? "Active") === statusFilter;

      return matchesSearch && matchesSpecialization && matchesStatus;
    });
  }, [doctors, searchTerm, specializationFilter, statusFilter]);

  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(
    (doctor) => (doctor.status ?? "Active") === "Active"
  ).length;
  const onLeaveDoctors = doctors.filter(
    (doctor) => doctor.status === "On Leave"
  ).length;

  const showingFrom = filteredDoctors.length > 0 ? 1 : 0;
  const showingTo = filteredDoctors.length;

  return (
    <>
      <Head>
        <title>Doctors - MediStock</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Doctors</p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Doctor Directory
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage doctor profiles, specialties, and availability.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/doctors/add_doctor"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Doctor
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <DoctorsIcon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Doctors
                </p>
                <p className="text-2xl font-bold text-slate-950">
                  {totalDoctors}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active Doctors</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {activeDoctors}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Currently available profiles
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">On Leave</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {onLeaveDoctors}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Temporarily unavailable
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Search Doctors
              </span>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search by name, ID, phone, or email..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Specialization
              </span>

              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={specializationFilter}
                onChange={(event) =>
                  setSpecializationFilter(event.target.value)
                }
              >
                {specializationOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </span>

              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as DoctorFilterStatus)
                }
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>
            </label>

            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Loading doctors...
                    </td>
                  </tr>
                ) : filteredDoctors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No doctors match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => {
                    const status = doctor.status ?? "Active";

                    return (
                      <tr
                        key={doctor.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-500">
                          {doctor.id}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                          {doctor.name ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {doctor.specialization ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {doctor.phone ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {doctor.email ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {doctor.consultationFee ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {doctor.experienceYears ?? "-"} yrs
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {doctor.availability ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                              statusStyles[status],
                            ].join(" ")}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <button
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Actions for ${doctor.name ?? doctor.id}`}
                            type="button"
                          >
                            <MoreIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {showingFrom} to {showingTo} of{" "}
              {filteredDoctors.length} entries
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
    </>
  );
}