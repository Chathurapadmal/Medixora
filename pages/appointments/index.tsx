import Link from "next/link";
import {
  PlusIcon,
  SearchIcon,
  CalendarIcon,
  FilterIcon,
  ClockIcon,
} from "@/components/dashboard-icons";

const appointments = [
  {
    id: "#APT-8492",
    patient: "Eleanor Pena",
    doctor: "Dr. Sarah Jenkins",
    date: "Oct 24, 2023",
    time: "09:00 AM",
    reason: "Annual Physical Exami...",
    status: "Pending",
    statusClass: "bg-[#ffe8d9] text-[#c2642c]",
    dot: "bg-[#c2642c]",
  },
  {
    id: "#APT-8493",
    patient: "Robert Fox",
    doctor: "Dr. Michael Chen",
    date: "Oct 24, 2023",
    time: "10:30 AM",
    reason: "Post-Surgery Follow up",
    status: "Confirmed",
    statusClass: "bg-[#dcf6e9] text-[#11805d]",
    dot: "bg-[#11805d]",
  },
  {
    id: "#APT-8488",
    patient: "Esther Howard",
    doctor: "Dr. Emily Larson",
    date: "Oct 23, 2023",
    time: "02:15 PM",
    reason: "Cardiology Consultatio...",
    status: "Completed",
    statusClass: "bg-[#eceef5] text-[#5f6475]",
    dot: "bg-[#5f6475]",
  },
  {
    id: "#APT-8485",
    patient: "Guy Hawkins",
    doctor: "Dr. Sarah Jenkins",
    date: "Oct 23, 2023",
    time: "04:00 PM",
    reason: "Routine Blood Work",
    status: "Cancelled",
    statusClass: "bg-[#ffe6e6] text-[#d43d3d]",
    dot: "bg-[#d43d3d]",
  },
  {
    id: "#APT-8495",
    patient: "Leslie Alexander",
    doctor: "Dr. Amanda Lee",
    date: "Oct 25, 2023",
    time: "08:15 AM",
    reason: "MRI Scan Review",
    status: "Confirmed",
    statusClass: "bg-[#dcf6e9] text-[#11805d]",
    dot: "bg-[#11805d]",
  },
];

export default function AppointmentsPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">

      {/* HEADER */}
      <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">
              Appointments
            </h1>

            <p className="mt-2 max-w-[700px] text-[14px] leading-7 text-slate-500">
              Manage patient scheduling, review upcoming consultations,
              and update appointment statuses.
            </p>
          </div>

          {/* UPDATED BUTTON */}
          <Link
            href="/appointments/bookappointment"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1450d2] px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(20,80,210,0.20)] transition hover:bg-[#0f43b5]"
          >
            <PlusIcon className="h-4 w-4" />
            New Appointment
          </Link>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">

          {/* SEARCH */}
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 md:max-w-sm">
            <SearchIcon className="h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search by patient name or ID..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-2">

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              mm/dd/yyyy
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <FilterIcon className="h-4 w-4 text-slate-500" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

        <table className="w-full text-left">

          <thead>
            <tr className="bg-[#fafbff] text-[13px] font-medium text-slate-500">
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Patient Name</th>
              <th className="px-5 py-4">Doctor</th>
              <th className="px-5 py-4">Date & Time</th>
              <th className="px-5 py-4">Reason</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="text-[14px] text-slate-700">

            {appointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="border-t border-slate-100"
              >

                {/* ID */}
                <td className="px-5 py-4 text-slate-600">
                  {appointment.id}
                </td>

                {/* PATIENT */}
                <td className="px-5 py-4 font-medium text-slate-800">
                  {appointment.patient}
                </td>

                {/* DOCTOR */}
                <td className="px-5 py-4 text-slate-600">
                  {appointment.doctor}
                </td>

                {/* DATE + TIME */}
                <td className="px-5 py-4">
                  <div className="text-slate-700">
                    {appointment.date}
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {appointment.time}
                  </div>
                </td>

                {/* REASON */}
                <td className="px-5 py-4 text-slate-700">
                  {appointment.reason}
                </td>

                {/* STATUS */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium ${appointment.statusClass}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${appointment.dot}`}
                    />

                    {appointment.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">

          <span>Showing 1 to 5 of 42 entries</span>

          <div className="flex items-center gap-2">

            <button className="px-2 py-1 text-slate-400">
              ‹
            </button>

            <button className="rounded-md bg-[#1450d2] px-3 py-1 text-white">
              1
            </button>

            <button className="px-2 py-1 hover:text-slate-700">
              2
            </button>

            <button className="px-2 py-1 hover:text-slate-700">
              3
            </button>

            <span className="px-1">...</span>

            <button className="px-2 py-1 hover:text-slate-700">
              9
            </button>

            <button className="px-2 py-1 text-slate-600">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}