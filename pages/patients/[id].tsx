import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  PrintIcon,
  EditProfileIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  EmergencyIcon,
  HeartIcon,
  ActivityIcon,
  ThermometerIcon,
  DropletIcon,
  PillIcon,
  AllergyIcon,
  NotesIcon,
} from "@/components/dashboard-icons";

type Patient = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  allergies?: string;
  status?: string;
  createdAt?: string;
};

function calcAge(dob?: string) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_COLORS = [
  "from-blue-300 to-blue-500",
  "from-purple-300 to-purple-500",
  "from-rose-300 to-rose-500",
  "from-emerald-300 to-emerald-500",
  "from-amber-300 to-amber-500",
  "from-sky-300 to-sky-500",
];
function avatarGradient(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function statusStyle(status?: string) {
  switch (status) {
    case "Active":
      return { dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Active" };
    case "In Treatment":
      return { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700 border-amber-200", label: "In Treatment" };
    case "Discharged":
      return { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200", label: "Discharged" };
    default:
      return { dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", label: status ?? "Active" };
  }
}

const TABS = ["Overview", "Appointment History", "Medical Records", "Prescriptions", "Billing History"];

export default function PatientDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/patients/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setPatient(data))
      .catch(() => setPatient(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading patient details…
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-slate-500">Patient not found.</p>
        <Link href="/patients" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const age = calcAge(patient.dateOfBirth);
  const st = statusStyle(patient.status);

  const ecParts = patient.emergencyContact?.match(/^(.+?)\s*\((.+)\)$/) ?? null;
  const ecName = ecParts ? ecParts[1].trim() : patient.emergencyContact ?? "—";
  const ecRelation = ecParts ? ecParts[2].trim() : "";

  const allergyTags = patient.allergies
    ? patient.allergies
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a && a.toLowerCase() !== "none")
    : [];

  return (
    <>
      <Head>
        <title>{patient.name ?? "Patient"} — MediStock</title>
      </Head>

      <div className="mx-auto w-full max-w-[1200px] space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/patients"
              className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Patients List
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Patient Details
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <PrintIcon className="h-4 w-4" />
              Print Record
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003ea8]"
            >
              <EditProfileIcon className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">

          {/* LEFT COLUMN */}
          <div className="space-y-4">

            {/* Profile card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative flex flex-col items-center px-6 pb-6 pt-8">

                {/* Status badge */}
                <span className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${st.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>

                {/* Avatar */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-md ${avatarGradient(patient.id)}`}
                >
                  {initials(patient.name)}
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">{patient.name ?? "—"}</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Patient ID: PT-{String(patient.id).padStart(4, "0")}
                </p>

                {/* Age / Blood / Gender */}
                <div className="mt-5 flex w-full justify-around border-t border-slate-100 pt-5">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Age</p>
                    <p className="mt-0.5 text-base font-bold text-slate-900">
                      {age !== null ? `${age} Yrs` : "—"}
                    </p>
                  </div>
                  <div className="w-px bg-slate-100" />
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Blood</p>
                    <p className="mt-0.5 text-base font-bold text-red-500">{patient.bloodGroup ?? "—"}</p>
                  </div>
                  <div className="w-px bg-slate-100" />
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gender</p>
                    <p className="mt-0.5 text-base font-bold text-slate-900">{patient.gender ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3 border-t border-slate-100 px-6 py-5">
                <div className="flex items-start gap-3">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Phone Number</p>
                    <p className="text-sm font-medium text-slate-800">{patient.phone ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Email Address</p>
                    <p className="text-sm font-medium text-slate-800">{patient.email ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Home Address</p>
                    <p className="text-sm font-medium text-slate-800">{patient.address ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency contact */}
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <EmergencyIcon className="h-4 w-4 text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Emergency Contact
                </p>
              </div>
              <p className="text-base font-bold text-slate-900">{ecName}</p>
              {ecRelation && <p className="mt-0.5 text-sm text-slate-500">{ecRelation}</p>}
              {patient.emergencyPhone && (
                <div className="mt-3 flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600">{patient.emergencyPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">

            {/* Tab bar */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition",
                    activeTab === tab
                      ? "bg-[#004ac6] text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                  ].join(" ")}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview content */}
            {activeTab === "Overview" && (
              <div className="space-y-4">

                {/* Recent Vitals */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Recent Vitals</h3>
                    <span className="text-xs text-slate-400">Recorded: Today, 08:30 AM</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <HeartIcon className="h-4 w-4 text-red-400" />
                        <span className="text-xs font-semibold text-slate-500">Blood Pressure</span>
                      </div>
                      <p className="text-xl font-bold text-slate-900">120/80</p>
                      <p className="text-xs text-slate-400">mmHg</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <ActivityIcon className="h-4 w-4 text-red-400" />
                        <span className="text-xs font-semibold text-slate-500">Heart Rate</span>
                      </div>
                      <p className="text-xl font-bold text-slate-900">
                        72 <span className="text-sm font-normal text-slate-500">bpm</span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <ThermometerIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-semibold text-slate-500">Temperature</span>
                      </div>
                      <p className="text-xl font-bold text-slate-900">
                        98.6 <span className="text-sm font-normal text-slate-500">°F</span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <DropletIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-semibold text-slate-500">SpO2</span>
                      </div>
                      <p className="text-xl font-bold text-slate-900">
                        99 <span className="text-sm font-normal text-slate-500">%</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medications + Allergies/Notes */}
                <div className="grid gap-4 md:grid-cols-2">

                  {/* Current Medications */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <PillIcon className="h-4 w-4 text-blue-500" />
                        Current Medications
                      </h3>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-600"
                      >
                        <span className="text-lg leading-none">+</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Amoxicillin 500mg</p>
                          <p className="text-xs text-slate-500">1 capsule every 8 hours</p>
                        </div>
                        <span className="ml-2 shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          3 Days Left
                        </span>
                      </div>
                      <div className="flex items-start justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Ibuprofen 400mg</p>
                          <p className="text-xs text-slate-500">1 tablet as needed for pain</p>
                        </div>
                        <span className="ml-2 shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Ongoing
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allergies + Notes */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                        <AllergyIcon className="h-4 w-4 text-rose-500" />
                        Known Allergies
                      </h3>
                      {allergyTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {allergyTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No known allergies recorded.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                        <NotesIcon className="h-4 w-4 text-slate-500" />
                        Physician Notes
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600">
                        Patient reports mild fatigue over the last 48 hours. Hydration levels appear
                        normal. Advised rest and monitoring of temperature. Follow up in 3 days if
                        symptoms persist.
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        — Dr. Sarah Jenkins, General Practice
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== "Overview" && (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                {activeTab} — coming soon
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}