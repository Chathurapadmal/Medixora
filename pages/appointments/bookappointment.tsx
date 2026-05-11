import {
  CalendarIcon,
  ClockIcon,
} from "@/components/dashboard-icons";

export default function BookAppointmentPage() {
  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_230px]">

        {/* LEFT FORM */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          {/* HEADER */}
          <div>
            <h1 className="text-[24px] font-semibold text-slate-900">
              Book Appointment
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Schedule a new visit or consultation.
            </p>
          </div>

          {/* FORM */}
          <div className="mt-7 space-y-5">

            {/* ROW */}
            <div className="grid gap-4 md:grid-cols-2">

              {/* PATIENT */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Patient Name
                </label>

                <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563eb]">
                  <option>Select a patient</option>
                  <option>James Sullivan</option>
                  <option>Mariah Woods</option>
                  <option>Kevin Lin</option>
                </select>
              </div>

              {/* DOCTOR */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Attending Physician
                </label>

                <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563eb]">
                  <option>Dr. Amanda Lee - Neurology</option>
                  <option>Dr. Sarah Jenkins - Cardiology</option>
                  <option>Dr. Michael Chen - Orthopedics</option>
                </select>
              </div>
            </div>

            {/* ROW */}
            <div className="grid gap-4 md:grid-cols-2">

              {/* DATE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Appointment Date
                </label>

                <div className="relative">
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#2563eb]"
                  />

                  <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* TIME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Appointment Time
                </label>

                <div className="relative">
                  <input
                    type="time"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#2563eb]"
                  />

                  <ClockIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* REASON */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reason for Visit
              </label>

              <textarea
                rows={5}
                placeholder="Briefly describe symptoms or purpose of consultation..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2563eb]"
              />
            </div>

            {/* STATUS */}
            <div className="max-w-[220px]">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Initial Status
              </label>

              <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563eb]">
                <option>Scheduled</option>
                <option>Pending</option>
                <option>Confirmed</option>
              </select>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-slate-200 pt-5">

              {/* BUTTONS */}
              <div className="flex justify-end gap-3">
                <button className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>

                <button className="rounded-lg bg-[#0f52d6] px-5 py-2 text-sm font-medium text-white hover:bg-[#0b45bb]">
                  Confirm Appointment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          {/* TOP BLUE LINE */}
          <div className="h-1 w-full bg-[#0f52d6]" />

          <div className="p-5">

            {/* DOCTOR */}
            <div className="flex items-start gap-4">

              <img
                src="https://i.pravatar.cc/100?img=47"
                alt="Doctor"
                className="h-14 w-14 rounded-full object-cover"
              />

              <div>
                <h3 className="text-[28px] font-semibold leading-none text-slate-900">
                  Dr. Amanda Lee
                </h3>

                <p className="mt-2 text-sm font-medium text-[#2563eb]">
                  Neurology
                </p>
              </div>
            </div>

            {/* AVAILABILITY */}
            <div className="mt-5 rounded-xl bg-[#f3f4ff] p-4">

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Today&apos;s Availability
                </span>

                <span className="rounded-full bg-[#dcfce7] px-2 py-1 text-[11px] font-semibold text-[#16a34a]">
                  Available
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <ClockIcon className="h-4 w-4 text-slate-500" />
                09:00 AM - 04:30 PM
              </div>
            </div>

            {/* NEXT SLOTS */}
            <div className="mt-6">
              <h4 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                NEXT OPEN SLOTS
              </h4>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  "10:30 AM",
                  "11:15 AM",
                  "02:00 PM",
                  "03:30 PM",
                ].map((slot) => (
                  <button
                    key={slot}
                    className="rounded-lg border border-slate-300 bg-[#f8fafc] px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}