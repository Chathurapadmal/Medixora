import {
  PlusIcon,
  SearchIcon,
} from "@/components/dashboard-icons";

const doctors = [
  {
    id: "#MD-1042",
    name: "Dr. Sarah Jenkins",
    initials: "SJ",
    color: "bg-[#eef0ff] text-[#4554cb]",
    specialization: "Cardiology",
    phone: "(555) 123-4567",
    email: "s.jenkins@medistock.com",
    availability: "Mon, Wed, Fri",
    status: "Available",
    statusClass: "bg-[#dcf6e9] text-[#11805d]",
  },
  {
    id: "#MD-1088",
    name: "Dr. Robert Chen",
    initials: "RC",
    color: "bg-[#e7f7f0] text-[#11805d]",
    specialization: "Neurology",
    phone: "(555) 987-6543",
    email: "r.chen@medistock.com",
    availability: "Tue, Thu, Sat",
    status: "Busy",
    statusClass: "bg-[#ffe8d9] text-[#c2642c]",
  },
  {
    id: "#MD-1102",
    name: "Dr. Emily Parker",
    initials: "EP",
    color: "bg-[#eef2ff] text-[#5a6178]",
    specialization: "Pediatrics",
    phone: "(555) 456-7890",
    email: "e.parker@medistock.com",
    availability: "Mon - Fri",
    status: "Off Duty",
    statusClass: "bg-[#eceef5] text-[#70798d]",
  },
  {
    id: "#MD-1145",
    name: "Dr. Michael Chang",
    initials: "MC",
    color: "bg-[#fff1ea] text-[#c2642c]",
    specialization: "Orthopedics",
    phone: "(555) 234-5678",
    email: "m.chang@medistock.com",
    availability: "Wed, Thu, Fri",
    status: "Available",
    statusClass: "bg-[#dcf6e9] text-[#11805d]",
  },
];

export default function DoctorsPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900">
              Doctor Directory
            </h1>
            <p className="text-[14px] text-slate-500">
              Manage hospital staff, specialties, and availability.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#1d4ed8]">
            <PlusIcon className="h-4 w-4" />
            Add Doctor
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* SEARCH */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 w-full md:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by name, ID, or email..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* FILTERS */}
          <div className="flex gap-2">
            <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white">
              <option>All Specialties</option>
              <option>Cardiology</option>
              <option>Neurology</option>
              <option>Pediatrics</option>
              <option>Orthopedics</option>
            </select>

            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="overflow-hidden rounded-[20px]">
          <table className="w-full text-left">

            <thead>
              <tr className="bg-[#fafbff] text-[13px] text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">DOCTOR</th>
                <th className="px-5 py-3">SPECIALIZATION</th>
                <th className="px-5 py-3">CONTACT</th>
                <th className="px-5 py-3">AVAILABILITY</th>
                <th className="px-5 py-3">STATUS</th>
              </tr>
            </thead>

            <tbody className="text-[14px] text-slate-700">
              {doctors.map((d) => (
                <tr key={d.id} className="border-t">

                  {/* ID */}
                  <td className="px-5 py-4 text-slate-500">
                    {d.id}
                  </td>

                  {/* DOCTOR */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 flex items-center justify-center rounded-full text-xs font-semibold ${d.color}`}>
                        {d.initials}
                      </div>
                      <span>{d.name}</span>
                    </div>
                  </td>

                  {/* SPECIALIZATION */}
                  <td className="px-5 py-4 text-slate-600">
                    {d.specialization}
                  </td>

                  {/* CONTACT */}
                  <td className="px-5 py-4 text-slate-600">
                    <div>{d.phone}</div>
                    <div className="text-xs text-slate-400">{d.email}</div>
                  </td>

                  {/* AVAILABILITY */}
                  <td className="px-5 py-4 text-slate-600">
                    {d.availability}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${d.statusClass}`}>
                      {d.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500 border-t">
          <span>Showing 1 to 4 of 42 doctors</span>

          <div className="flex items-center gap-2">
            <button className="px-2 py-1">‹</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-2 py-1">2</button>
            <button className="px-2 py-1">3</button>
            <button className="px-2 py-1">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}