import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  ImportIcon,
} from "@/components/dashboard-icons";

const records = [
  {
    id: "MR-8472-A",
    initials: "JS",
    color: "bg-[#dcf6e9] text-[#11805d]",
    name: "James Sullivan",
    doctor: "Dr. Aris Thorne",
    diagnosis: "Acute Bronchitis",
    diagnosisClass: "bg-[#ffe6e6] text-[#d43d3d]",
    prescription: "Azithromycin 250mg, Albuterol",
    date: "Oct 26, 2023",
  },
  {
    id: "MR-8471-X",
    initials: "MW",
    color: "bg-[#fff1ea] text-[#c2642c]",
    name: "Mariah Woods",
    doctor: "Dr. Sarah Jenkins",
    diagnosis: "Routine Checkup",
    diagnosisClass: "bg-[#eceef5] text-[#70798d]",
    prescription: "None (Refill authorized)",
    date: "Oct 25, 2023",
  },
  {
    id: "MR-8469-C",
    initials: "KL",
    color: "bg-[#e7f0ff] text-[#3657d6]",
    name: "Kevin Lin",
    doctor: "Dr. Marcus Vance",
    diagnosis: "Post-Op Observation",
    diagnosisClass: "bg-[#dff8ee] text-[#12a76f]",
    prescription: "Ibuprofen 800mg, Cephalexin",
    date: "Oct 24, 2023",
  },
  {
    id: "MR-8465-B",
    initials: "ER",
    color: "bg-[#eceef5] text-[#70798d]",
    name: "Elena Rodriguez",
    doctor: "Dr. Aris Thorne",
    diagnosis: "Migraine (Severe)",
    diagnosisClass: "bg-[#ffe6e6] text-[#d43d3d]",
    prescription: "Sumatriptan 50mg PRN",
    date: "Oct 23, 2023",
  },
];

export default function MedicalRecordsPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900">
              Medical Records
            </h1>
            <p className="text-[14px] text-slate-500">
              Manage and review comprehensive patient treatment histories.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              <ImportIcon className="h-4 w-4" />
              Import
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm text-white hover:bg-[#1d4ed8]">
              <PlusIcon className="h-4 w-4" />
              New Record
            </button>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* SEARCH */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 w-full md:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by patient name, ID, or doctor..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* FILTERS */}
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              Last 7 Days
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm">
              <FilterIcon className="h-4 w-4" />
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
                <th className="px-5 py-3">Record ID</th>
                <th className="px-5 py-3">Patient Name</th>
                <th className="px-5 py-3">Attending Doctor</th>
                <th className="px-5 py-3">Diagnosis</th>
                <th className="px-5 py-3">Prescription Summary</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[14px] text-slate-700">
              {records.map((r) => (
                <tr key={r.id} className="border-t border-slate-200">

                  <td className="px-5 py-4 text-blue-600 font-medium cursor-pointer">
                    {r.id}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold ${r.color}`}>
                        {r.initials}
                      </div>
                      {r.name}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {r.doctor}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${r.diagnosisClass}`}>
                      {r.diagnosis}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {r.prescription}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {r.date}
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    —
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500 border-t border-slate-200">
          <span>Showing 1 to 4 of 128 records</span>

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