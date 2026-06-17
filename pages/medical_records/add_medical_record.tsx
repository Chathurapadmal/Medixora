import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { PlusIcon } from "../../components/dashboard-icons";

function RecordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
    </svg>
  );
}

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

type Doctor = {
  id: string;
  name?: string;
  specialization?: string;
};

type Patient = {
  patient_id: number;
  patient_name: string;
};

type RecordStatus = "Completed" | "Pending" | "Cancelled";

type MedicalRecordForm = {
  patientId: string;
  doctorId: string;
  visitDate: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
  status: RecordStatus;
};

export default function AddMedicalRecordPage() {
  const todayLocal = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState<MedicalRecordForm>({
    patientId: "",
    doctorId: "",
    visitDate: todayLocal,
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
    status: "Completed",
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetch("/api/patients").then((r) => r.json()),
      fetch("/api/doctors").then((r) => r.json()),
    ])
      .then(([pData, dData]) => {
        if (mounted) {
          setPatients(Array.isArray(pData) ? pData : []);
          setDoctors(Array.isArray(dData) ? dData : []);
        }
      })
      .catch(() => { })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    location.href = "/medical_records";
  }

  return (
    <>
      <Head>
        <title>Add Medical Record - MediStock</title>
      </Head>

      <div className="relative mx-auto max-w-6xl space-y-6">
        <Link
          href="/medical_records"
          className="absolute -left-14 -top-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-2xl font-bold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          aria-label="Back to medical records"
          title="Back to Medical Records"
        >
          ←
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link href="/medical_records" className="text-blue-600 hover:text-blue-700">
                Medical Records
              </Link>
              <span>/</span>
              <span>Add Record</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              New Record
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add patient visit details, clinical findings, and prescription information.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <RecordIcon className="h-7 w-7" />
          </div>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">Visit Information</h2>
                    <p className="text-sm text-slate-500">
                      Patient, attending doctor, and visit date.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <Field label="Patient" required>
                    <select
                      className={inputClass}
                      value={form.patientId}
                      onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        {loading ? "Loading…" : "Select patient"}
                      </option>
                      {patients.map((p) => (
                        <option key={p.patient_id} value={String(p.patient_id)}>
                          {p.patient_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Attending Doctor" required>
                    <select
                      className={inputClass}
                      value={form.doctorId}
                      onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        {loading ? "Loading…" : "Select doctor"}
                      </option>
                      {doctors.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.name}
                          {d.specialization ? ` — ${d.specialization}` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Visit Date & Time" required>
                      <input
                        className={inputClass}
                        type="datetime-local"
                        value={form.visitDate}
                        onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                        required
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <ClipboardIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">Clinical Details</h2>
                    <p className="text-sm text-slate-500">
                      Diagnosis, treatment plan, and prescribed medications.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="Diagnosis" required>
                      <input
                        className={inputClass}
                        placeholder="e.g. Acute Bronchitis, Migraine (Severe)"
                        value={form.diagnosis}
                        onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Treatment">
                    <textarea
                      className={inputClass + " resize-none"}
                      rows={4}
                      placeholder="Describe the treatment administered or recommended..."
                      value={form.treatment}
                      onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                    />
                  </Field>

                  <Field label="Prescription">
                    <textarea
                      className={inputClass + " resize-none"}
                      rows={4}
                      placeholder="e.g. Azithromycin 250mg twice daily for 5 days..."
                      value={form.prescription}
                      onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                    />
                  </Field>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">Record Details</h2>
                <p className="text-sm text-slate-500">
                  Additional notes and record status.
                </p>
              </div>

              <div className="space-y-5">
                <Field label="Additional Notes">
                  <textarea
                    className={inputClass + " resize-none"}
                    rows={7}
                    placeholder="Any additional observations, follow-up instructions, or remarks..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>

                <div className="border-t border-slate-200 pt-5">
                  <Field label="Record Status">
                    <select
                      className={inputClass}
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value as RecordStatus })
                      }
                    >
                      <option>Completed</option>
                      <option>Pending</option>
                      <option>Cancelled</option>
                    </select>
                  </Field>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status Guide
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                        Completed
                      </span>
                      <span className="text-xs text-slate-600">Visit finished; record is final.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700">
                        Pending
                      </span>
                      <span className="text-xs text-slate-600">Awaiting results or follow-up.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600">
                        Cancelled
                      </span>
                      <span className="text-xs text-slate-600">Visit was cancelled or voided.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/medical_records"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </>
  );
}