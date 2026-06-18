import type { ReactNode } from "react";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { DoctorsIcon, PlusIcon } from "../../components/dashboard-icons";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

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

const weekDays = [
  { label: "M", value: "Mon" },
  { label: "T", value: "Tue" },
  { label: "W", value: "Wed" },
  { label: "T", value: "Thu" },
  { label: "F", value: "Fri" },
  { label: "S", value: "Sat" },
  { label: "S", value: "Sun" },
];

export default function AddDoctorPage() {
  const [form, setForm] = useState<DoctorForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: 0,
    fee: "",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    shiftStart: "09:00",
    shiftEnd: "17:00",
    room: "",
    status: "Active",
  });

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

    await fetch("/api/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    location.href = "/doctors";
  }

  return (
    <>
      <Head>
        <title>Add Doctor - MediStock</title>
      </Head>

      <div className="relative mx-auto max-w-6xl space-y-6">
        <Link
          href="/doctors"
          className="absolute -left-14 -top-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-2xl font-bold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          aria-label="Back to doctors dashboard"
          title="Back to Doctors"
        >
          ←
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link
                href="/doctors"
                className="text-blue-600 hover:text-blue-700"
              >
                Doctors
              </Link>
              <span>/</span>
              <span>Add Doctor</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              New Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add doctor information, professional credentials, availability,
              and profile status.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <DoctorsIcon className="h-7 w-7" />
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <DoctorsIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Personal Information
                    </h2>
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

                  <Field label="Account Password" required>
                    <input
                      className={inputClass}
                      type="password"
                      placeholder="Enter login password"
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

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <PlusIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Professional Credentials
                    </h2>
                    <p className="text-sm text-slate-500">
                      Specialty, qualification, experience, and consultation
                      fee.
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
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">
                  Availability
                </h2>
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
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/doctors"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </>
  );
}