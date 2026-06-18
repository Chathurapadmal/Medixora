import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { CalendarIcon, ClockIcon } from "@/components/dashboard-icons";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type Patient = { patient_id: number; patient_name: string };
type Doctor = {
  id: number;
  name: string;
  specialization: string;
  shiftStart?: string;
  shiftEnd?: string;
  availability?: string;
  room?: string;
  consultationFee?: number;
  status?: string;
};

type FieldErrors = {
  patientId?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const NEXT_SLOTS = ["10:30", "11:15", "14:00", "15:30"];
const STATUSES = ["Scheduled", "Pending", "Confirmed"];

const formatTime12 = (time24: string) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

/* shared class builders */
const fieldCls = (hasError: boolean) =>
  [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition",
    hasError
      ? "border-red-400 focus:border-red-500 bg-red-50"
      : "border-slate-300 focus:border-[#2563eb]",
  ].join(" ");

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4.25a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3Zm.75 6a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
      </svg>
      {msg}
    </p>
  ) : null;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function BookAppointmentPage() {
  const router = useRouter();

  // ── dropdown data ──────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── form state ────────────────────────────────────────────────────
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("Scheduled");

  // ── validation errors ─────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ── submit state ──────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  // ── derived: selected doctor ──────────────────────────────────────
  const selectedDoctor = doctors.find(
    (d) => String(d.id) === doctorId
  );

  // ── fetch patients & doctors ──────────────────────────────────────
  const loadDropdowns = useCallback(async () => {
    try {
      setLoadingData(true);
      const [pRes, dRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/doctors"),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        setPatients(Array.isArray(pData) ? pData : pData.data ?? []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDoctors(Array.isArray(dData) ? dData : dData.data ?? []);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);

  // ── live validation (only after field is touched) ─────────────────
  useEffect(() => {
    const errs: FieldErrors = {};
    if (touched.patientId && !patientId)
      errs.patientId = "Please select a patient.";
    if (touched.doctorId && !doctorId)
      errs.doctorId = "Please select an attending physician.";
    if (touched.appointmentDate && !appointmentDate)
      errs.appointmentDate = "Please choose an appointment date.";
    if (touched.appointmentTime && !appointmentTime)
      errs.appointmentTime = "Please choose an appointment time.";
    setFieldErrors(errs);
  }, [patientId, doctorId, appointmentDate, appointmentTime, touched]);

  // ── validate all fields, mark all as touched ──────────────────────
  const validateAll = (): boolean => {
    setTouched({
      patientId: true,
      doctorId: true,
      appointmentDate: true,
      appointmentTime: true,
    });

    const errs: FieldErrors = {};
    if (!patientId) errs.patientId = "Please select a patient.";
    if (!doctorId) errs.doctorId = "Please select an attending physician.";
    if (!appointmentDate) errs.appointmentDate = "Please choose an appointment date.";
    if (!appointmentTime) errs.appointmentTime = "Please choose an appointment time.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── slot click ────────────────────────────────────────────────────
  const handleSlotClick = (slot: string) => {
    setAppointmentTime(slot);
    setTouched((t) => ({ ...t, appointmentTime: true }));
  };

  // ── submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    if (!validateAll()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: parseInt(patientId),
          doctor_id: parseInt(doctorId),
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason_for_visit: reason,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Map raw API errors → friendly messages
        const raw: string = (data as any).error ?? "";
        if (raw.includes("patient_id")) {
          setFieldErrors((e) => ({ ...e, patientId: "Please select a valid patient." }));
        } else if (raw.includes("doctor_id")) {
          setFieldErrors((e) => ({ ...e, doctorId: "Please select a valid physician." }));
        } else if (raw.includes("appointment_date")) {
          setFieldErrors((e) => ({ ...e, appointmentDate: "Please choose a valid date." }));
        } else if (raw.includes("appointment_time")) {
          setFieldErrors((e) => ({ ...e, appointmentTime: "Please choose a valid time." }));
        } else {
          setServerError(raw || "Failed to book appointment. Please try again.");
        }
        return;
      }

      setSuccess(`Appointment booked! ID: ${(data as any).appointment_number}`);
      setTimeout(() => router.push(`/appointments/${(data as any).appointment_id}`), 1500);
    } catch (err: any) {
      setServerError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.keys(fieldErrors).length > 0;

  /* ---------------------------------------------------------------- */
  return (
    <div className="mx-auto max-w-[1280px]">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]"
      >
        {/* ── LEFT FORM ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* HEADER */}
          <div>
            <h1 className="text-[24px] font-semibold text-slate-900">
              Book Appointment
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Schedule a new visit or consultation.
            </p>
          </div>

          {/* BANNER – server error */}
          {serverError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-red-500">
                <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* BANNER – top-level summary when user tries to submit with missing fields */}
          {hasErrors && Object.values(touched).some(Boolean) && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Please fix the following before continuing:</p>
                <ul className="mt-1 list-disc pl-4 text-xs text-amber-700 space-y-0.5">
                  {fieldErrors.patientId && <li>{fieldErrors.patientId}</li>}
                  {fieldErrors.doctorId && <li>{fieldErrors.doctorId}</li>}
                  {fieldErrors.appointmentDate && <li>{fieldErrors.appointmentDate}</li>}
                  {fieldErrors.appointmentTime && <li>{fieldErrors.appointmentTime}</li>}
                </ul>
              </div>
            </div>
          )}

          {/* BANNER – success */}
          {success && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-emerald-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-emerald-700">{success} — redirecting…</p>
            </div>
          )}

          {/* FORM FIELDS */}
          <div className="mt-7 space-y-5">

            {/* ROW – patient + doctor */}
            <div className="grid gap-4 md:grid-cols-2">

              {/* PATIENT */}
              <div>
                <label htmlFor="patient-select" className="mb-2 block text-sm font-medium text-slate-700">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="patient-select"
                  value={patientId}
                  onChange={(e) => { setPatientId(e.target.value); setTouched((t) => ({ ...t, patientId: true })); }}
                  onBlur={() => setTouched((t) => ({ ...t, patientId: true }))}
                  disabled={loadingData}
                  className={fieldCls(!!fieldErrors.patientId) + " disabled:opacity-60"}
                >
                  <option value="">
                    {loadingData ? "Loading patients…" : "Select a patient"}
                  </option>
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.patient_name}
                    </option>
                  ))}
                </select>
                <FieldError msg={fieldErrors.patientId} />
              </div>

              {/* DOCTOR */}
              <div>
                <label htmlFor="doctor-select" className="mb-2 block text-sm font-medium text-slate-700">
                  Attending Physician <span className="text-red-500">*</span>
                </label>
                <select
                  id="doctor-select"
                  value={doctorId}
                  onChange={(e) => { setDoctorId(e.target.value); setTouched((t) => ({ ...t, doctorId: true })); }}
                  onBlur={() => setTouched((t) => ({ ...t, doctorId: true }))}
                  disabled={loadingData}
                  className={fieldCls(!!fieldErrors.doctorId) + " disabled:opacity-60"}
                >
                  <option value="">
                    {loadingData ? "Loading doctors…" : "Select a physician"}
                  </option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {d.specialization ? ` – ${d.specialization}` : ""}
                    </option>
                  ))}
                </select>
                <FieldError msg={fieldErrors.doctorId} />
              </div>
            </div>

            {/* ROW – date + time */}
            <div className="grid gap-4 md:grid-cols-2">

              {/* DATE */}
              <div>
                <label htmlFor="appointment-date" className="mb-2 block text-sm font-medium text-slate-700">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="appointment-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => { setAppointmentDate(e.target.value); setTouched((t) => ({ ...t, appointmentDate: true })); }}
                    onBlur={() => setTouched((t) => ({ ...t, appointmentDate: true }))}
                    min={new Date().toISOString().slice(0, 10)}
                    className={fieldCls(!!fieldErrors.appointmentDate) + " pr-10"}
                  />
                  <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <FieldError msg={fieldErrors.appointmentDate} />
              </div>

              {/* TIME */}
              <div>
                <label htmlFor="appointment-time" className="mb-2 block text-sm font-medium text-slate-700">
                  Appointment Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="appointment-time"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => { setAppointmentTime(e.target.value); setTouched((t) => ({ ...t, appointmentTime: true })); }}
                    onBlur={() => setTouched((t) => ({ ...t, appointmentTime: true }))}
                    className={fieldCls(!!fieldErrors.appointmentTime) + " pr-10"}
                  />
                  <ClockIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <FieldError msg={fieldErrors.appointmentTime} />
              </div>
            </div>

            {/* REASON */}
            <div>
              <label htmlFor="reason-for-visit" className="mb-2 block text-sm font-medium text-slate-700">
                Reason for Visit
              </label>
              <textarea
                id="reason-for-visit"
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe symptoms or purpose of consultation..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2563eb]"
              />
            </div>

            {/* STATUS */}
            <div className="max-w-[220px]">
              <label htmlFor="initial-status" className="mb-2 block text-sm font-medium text-slate-700">
                Initial Status
              </label>
              <select
                id="initial-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563eb]"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* DIVIDER + BUTTONS */}
            <div className="border-t border-slate-200 pt-5">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/appointments")}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  id="confirm-appointment-btn"
                  className="rounded-lg bg-[#0f52d6] px-5 py-2 text-sm font-medium text-white hover:bg-[#0b45bb] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Booking…" : "Confirm Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT CARD – doctor preview ────────────────────────────── */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-[#0f52d6]" />

          <div className="p-5">
            {selectedDoctor ? (
              <>
                {/* DOCTOR INFO */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4f74ff] to-[#1450d2] text-white text-xl font-bold shadow-lg">
                    {selectedDoctor.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[20px] font-semibold leading-snug text-slate-900">
                      {selectedDoctor.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[#2563eb]">
                      {selectedDoctor.specialization || "General Physician"}
                    </p>
                    <div className="mt-2 text-sm text-slate-600 space-y-1">
                      <p>Room: <span className="font-medium text-slate-900">{selectedDoctor.room || "TBA"}</span></p>
                      <p>Fee: <span className="font-medium text-slate-900">Rs {selectedDoctor.consultationFee || "0.00"}</span></p>
                    </div>
                  </div>
                </div>

                {/* AVAILABILITY */}
                <div className="mt-5 rounded-xl bg-[#f3f4ff] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Today&apos;s Availability</span>
                    <span className={[
                      "rounded-full px-2 py-1 text-[11px] font-semibold",
                      selectedDoctor.status === "Active" || !selectedDoctor.status ? "bg-[#dcfce7] text-[#16a34a]" : 
                      selectedDoctor.status === "On Leave" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    ].join(" ")}>
                      {selectedDoctor.status || "Active"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                    <ClockIcon className="h-4 w-4 text-slate-500" />
                    {selectedDoctor.shiftStart && selectedDoctor.shiftEnd
                      ? `${formatTime12(selectedDoctor.shiftStart)} – ${formatTime12(selectedDoctor.shiftEnd)}`
                      : "09:00 AM – 04:30 PM"}
                  </div>
                </div>

                {/* NEXT OPEN SLOTS */}
                <div className="mt-6">
                  <h4 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    NEXT OPEN SLOTS
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {NEXT_SLOTS.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => handleSlotClick(slot)}
                        className={[
                          "rounded-lg border px-3 py-2 text-sm font-medium transition",
                          appointmentTime === slot
                            ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                            : "border-slate-300 bg-[#f8fafc] text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                      >
                        {formatTime12(slot)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-slate-400">
                    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Select a physician to view availability and open slots.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}