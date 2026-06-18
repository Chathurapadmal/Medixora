import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

type AppointmentDetail = {
  appointment_id: number;
  appointment_number: string;
  patient_name: string;
  doctor_name: string;
  specialization: string;
  room: string;
  consultationFee: number;
  appointment_date: string;
  appointment_time: string;
  reason_for_visit: string;
  status: string;
  created_at: string;
};

const formatTime12 = (time24: string) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export default function AppointmentReceiptPage() {
  const router = useRouter();
  const { id } = router.query;
  const [apt, setApt] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/appointments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Appointment not found");
        return res.json();
      })
      .then((data) => setApt(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading appointment details…</p>
      </div>
    );
  }

  if (error || !apt) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-medium text-red-500">{error || "Appointment not found"}</p>
        <Link href="/appointments" className="text-blue-600 hover:underline">
          ← Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Appointment {apt.appointment_number} - MediStock</title>
      </Head>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top bar (hidden in print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/appointments"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Appointments
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M6 9V3h12v6m-4 5h4M6 14h.01M6 18h12v3H6v-3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Print Receipt
          </button>
        </div>

        {/* Receipt Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Appointment Confirmed</h1>
              <p className="mt-1 text-sm text-slate-500">
                Receipt / Booking Details
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appointment No.</p>
              <p className="text-lg font-bold text-blue-600">{apt.appointment_number}</p>
              <p className="mt-1 flex items-center gap-2 sm:justify-end text-sm text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                {apt.status}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Patient Info */}
            <div className="rounded-xl bg-slate-50 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Details</h3>
              <div className="mt-3">
                <p className="text-lg font-semibold text-slate-900">{apt.patient_name}</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-500">Reason:</span>{" "}
                    {apt.reason_for_visit || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="rounded-xl bg-blue-50 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Physician Details</h3>
              <div className="mt-3">
                <p className="text-lg font-semibold text-slate-900">Dr. {apt.doctor_name}</p>
                <p className="text-sm font-medium text-blue-600">{apt.specialization}</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-500">Room Number:</span>{" "}
                    <span className="font-semibold text-slate-900">{apt.room || "TBA"}</span>
                  </p>
                  <p>
                    <span className="font-medium text-slate-500">Consultation Fee:</span>{" "}
                    <span className="font-semibold text-slate-900">Rs {apt.consultationFee || "0.00"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="mt-8 rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6 justify-around">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {new Date(apt.appointment_date + "T00:00:00").toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="hidden sm:block h-12 w-px bg-slate-200"></div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Time</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{formatTime12(apt.appointment_time)}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            <p>Please arrive 15 minutes before your scheduled appointment time.</p>
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </>
  );
}
