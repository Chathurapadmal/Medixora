import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  DeleteIcon,
} from "@/components/dashboard-icons";

const patients = [
  {
    id: "PT-2023-001",
    initials: "SJ",
    name: "Sarah Jenkins",
    age: 34,
    gender: "Female",
    blood: "O+",
    contact: "+1 (555) 123-4567",
    status: "Active",
    statusClass: "bg-[#dcf6e9] text-[#11805d]",
    color: "bg-[#eef0ff] text-[#4554cb]",
  },
  {
    id: "PT-2023-002",
    initials: "MR",
    name: "Michael Roberts",
    age: 52,
    gender: "Male",
    blood: "A-",
    contact: "+1 (555) 987-6543",
    status: "Active",
    statusClass: "bg-[#dcf6e9] text-[#11805d]",
    color: "bg-[#f3e8ff] text-[#7c3aed]",
  },
  {
    id: "PT-2023-003",
    initials: "AL",
    name: "Anita Lopez",
    age: 28,
    gender: "Female",
    blood: "B+",
    contact: "+1 (555) 345-6789",
    status: "In Treatment",
    statusClass: "bg-[#fff4db] text-[#b7791f]",
    color: "bg-[#fff1ea] text-[#c2642c]",
  },
  {
    id: "PT-2023-004",
    initials: "DW",
    name: "David Williams",
    age: 65,
    gender: "Male",
    blood: "AB+",
    contact: "+1 (555) 765-4321",
    status: "Discharged",
    statusClass: "bg-[#eceef5] text-[#70798d]",
    color: "bg-[#ffe6e6] text-[#d43d3d]",
  },
];

export default function PatientsPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900">
              Patient Directory
            </h1>
            <p className="text-[14px] text-slate-500">
              Manage patient records, appointments, and medical history.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#1d4ed8]">
            <PlusIcon className="h-4 w-4" />
            Add New Patient
          </button>
        </div>

        {/* SEARCH + ACTIONS */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 w-full md:max-w-sm">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by name or ID..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              Filter
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              Export
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
                <th className="px-5 py-3">PATIENT ID</th>
                <th className="px-5 py-3">NAME</th>
                <th className="px-5 py-3">DETAILS</th>
                <th className="px-5 py-3">BLOOD GROUP</th>
                <th className="px-5 py-3">CONTACT</th>
                <th className="px-5 py-3">STATUS</th>
                <th className="px-5 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="text-[14px] text-slate-700">
              {patients.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-5 py-4 text-slate-500">{p.id}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold ${p.color}`}>
                        {p.initials}
                      </div>
                      {p.name}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {p.age} yrs • {p.gender}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs">
                      {p.blood}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">{p.contact}</td>

                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.statusClass}`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
  <div className="flex justify-end gap-0">
    
    <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
      <EyeIcon className="h-4 w-4 text-slate-500" />
    </button>

    <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
      <EditIcon className="h-4 w-4 text-blue-500" />
    </button>

    <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
      <DeleteIcon className="h-4 w-4 text-red-500" />
    </button>

  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500 border-t">
          <span>Showing 1 to 4 of 24 entries</span>

          <div className="flex items-center gap-2">
            <button className="px-2 py-1">Prev</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-2 py-1">2</button>
            <button className="px-2 py-1">3</button>
            <button className="px-2 py-1">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}