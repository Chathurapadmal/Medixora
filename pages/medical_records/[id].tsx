import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

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
  createdAt: string;
};

function formatRecordId(id: number) {
  return `MR-${String(id).padStart(4, "0")}`;
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

export default function ViewMedicalRecordPage() {
  const router = useRouter();
  const { id } = router.query;
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/medical-records/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Record not found");
        return res.json();
      })
      .then((data) => setRecord(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading medical record…</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-medium text-red-500">{error || "Record not found"}</p>
        <Link href="/medical_records" className="text-blue-600 hover:underline">
          ← Back to Medical Records
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{formatRecordId(record.id)} - Medical Record Details</title>
      </Head>

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/medical_records" className="font-medium hover:text-blue-600">
            Medical Records
          </Link>
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
          <span className="font-semibold text-slate-800">{formatRecordId(record.id)}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Medical Record {formatRecordId(record.id)}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Created on {formatDate(record.createdAt)}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${statusBadgeClass(
                  record.status
                )}`}
              >
                {record.status || "Completed"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="grid gap-12 lg:grid-cols-2">
              
              {/* Left Column: People & Dates */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Patient Details</h3>
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-lg font-bold text-blue-700">{record.patientName}</p>
                    <div className="mt-2 text-sm text-slate-600">
                      <Link href={`/patients/${record.patientId}`} className="text-blue-600 hover:underline">
                        View full profile →
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Attending Doctor</h3>
                  <div className="mt-3">
                    <p className="font-medium text-slate-700">
                      {record.doctorName ? `Dr. ${record.doctorName}` : "Not Assigned"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Visit Date</h3>
                  <div className="mt-3">
                    <p className="font-medium text-slate-700">{formatDate(record.visitDate)}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Medical Data */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Diagnosis</h3>
                  <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    {record.diagnosis || <span className="italic text-slate-400">No diagnosis recorded.</span>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Treatment Plan</h3>
                  <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    {record.treatment || <span className="italic text-slate-400">No treatment plan recorded.</span>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Prescription</h3>
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                    {record.prescription ? (
                      <p className="whitespace-pre-wrap">{record.prescription}</p>
                    ) : (
                      <span className="italic text-emerald-700/60">No prescription given.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Additional Notes</h3>
                  <div className="mt-3 text-sm text-slate-600">
                    {record.notes ? (
                      <p className="whitespace-pre-wrap">{record.notes}</p>
                    ) : (
                      <span className="italic text-slate-400">No additional notes.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
