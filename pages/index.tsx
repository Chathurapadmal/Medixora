import {
  AlertTriangleIcon,
  BillingIcon,
  BriefcaseIcon,
  ClipboardCheckIcon,
  FileIcon,
  MedicineIcon,
  MoreIcon,
  MoneyIcon,
  PatientsIcon,
  PlusIcon,
  WarningSmallIcon,
} from "@/components/dashboard-icons";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const stats = [
  {
    label: "TOTAL PATIENTS",
    value: "1,248",
    change: "+12%",
    changeLabel: "from last month",
    icon: PatientsIcon,
    iconBg: "bg-[#eaf0ff] text-[#3657d6]",
  },
  {
    label: "TODAY'S APPOINTMENTS",
    value: "42",
    changeLabel: "65% Completed",
    icon: ClipboardCheckIcon,
    iconBg: "bg-[#fbead8] text-[#b66b2e]",
    progress: 65,
  },
  {
    label: "LOW STOCK MEDICINES",
    value: "15",
    change: "-3",
    changeLabel: "needs immediate attention",
    icon: AlertTriangleIcon,
    iconBg: "bg-[#ffe6e6] text-[#d43d3d]",
    valueClass: "text-[#c92d2d]",
  },
  {
    label: "TOTAL REVENUE",
    value: "$45.2k",
    change: "+8.5%",
    changeLabel: "from last week",
    icon: MoneyIcon,
    iconBg: "bg-[#dff8ee] text-[#12a76f]",
  },
];

const appointments = [
  { initials: "EM", name: "Emily Chen", doctor: "Dr. Robert Smith", time: "09:00 AM", status: "Completed", statusClass: "bg-[#dcf6e9] text-[#11805d]" },
  { initials: "MJ", name: "Michael Johnson", doctor: "Dr. Sarah Jenkins", time: "10:30 AM", status: "In Progress", statusClass: "bg-[#e2e6ff] text-[#5661c4]" },
  { initials: "LW", name: "Lisa Wong", doctor: "Dr. Alan Turing", time: "01:15 PM", status: "Scheduled", statusClass: "bg-[#eceef5] text-[#70798d]" },
  { initials: "DB", name: "David Brown", doctor: "Dr. Robert Smith", time: "03:00 PM", status: "Cancelled", statusClass: "bg-[#ffe0e0] text-[#d85a5a]" },
];

const lowStock = [
  { name: "Amoxicillin 500mg", supplier: "MedCorp", units: "12 Units" },
  { name: "Paracetamol IV", supplier: "HealthInc", units: "5 Units" },
];

const quickActions = [
  { label: "New Patient", icon: PlusIcon, bg: "bg-[#eef2ff] text-[#3063f2]" },
  { label: "Create Bill", icon: BriefcaseIcon, bg: "bg-[#fff1ea] text-[#c2642c]" },
  { label: "Add Medicine", icon: MedicineIcon, bg: "bg-[#e7f7f0] text-[#11805d]" },
  { label: "View Reports", icon: FileIcon, bg: "bg-[#eef2ff] text-[#5a6178]" },
];

function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconBg,
  valueClass,
  progress,
}: {
  label: string;
  value: string;
  change?: string;
  changeLabel: string;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  valueClass?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="text-[13px] font-medium tracking-[0.08em] text-slate-500">{label}</div>
          <div className={[
            "text-[32px] font-semibold leading-none text-slate-900",
            valueClass,
          ].filter(Boolean).join(" ")}>{value}</div>
        </div>
        <div className={[
          "flex h-10 w-10 items-center justify-center rounded-full",
          iconBg,
        ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[12px] text-slate-500">
        {change ? <span className="font-semibold text-emerald-600">{change}</span> : null}
        {progress ? (
          <div className="flex-1">
            <div className="h-2 rounded-full bg-[#f2efe9]">
              <div className="h-2 rounded-full bg-[#bc7a29]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 text-right text-[11px] text-slate-500">{changeLabel}</div>
          </div>
        ) : (
          <span>{changeLabel}</span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      const storedUsername = localStorage.getItem("userName");
      const storedRole = localStorage.getItem("userRole");

      if (storedUsername && storedRole) {
        setUser({ username: storedUsername, role: storedRole });
        setLoading(false);
        return;
      }

      try {
        const decoded = atob(token);
        const [, username, role] = decoded.split(":");
        setUser({
          username: username || "Staff User",
          role: role || "Staff",
        });
      } catch (err) {
        console.error("Failed to decode token:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }, [router]);

    if (loading) {
      return <div className="mx-auto max-w-[1280px] space-y-6 p-6">Loading...</div>;
    }

    if (!user) {
      return null;
    }
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">Dashboard Overview</h1>
            <p className="mt-1 text-[14px] text-slate-500">Welcome back, {user.username}. Here is today&apos;s summary.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              <PlusIcon className="h-4 w-4" />
              Add Patient
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#1d4ed8] bg-[#2563eb] px-4 py-2.5 text-[14px] font-medium text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] transition hover:bg-[#1d4ed8]">
              <BillingIcon className="h-4 w-4" />
              Book Appointment
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <MetricCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
        <div className="space-y-6">
          <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-[16px] font-semibold text-slate-900">Recent Appointments</h2>
              <button className="text-[14px] font-medium text-[#2563eb] hover:text-[#1d4ed8]">View All</button>
            </div>

            <div className="overflow-hidden rounded-b-[20px]">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#fafbff] text-[13px] font-medium text-slate-500">
                    <th className="px-5 py-3">Patient Name</th>
                    <th className="px-5 py-3">Doctor</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.name} className="border-b border-slate-100 last:border-b-0 text-[14px] text-slate-700">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef0ff] text-[11px] font-semibold text-[#4554cb]">
                            {appointment.initials}
                          </div>
                          <span>{appointment.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{appointment.doctor}</td>
                      <td className="px-5 py-4 text-slate-600">{appointment.time}</td>
                      <td className="px-5 py-4">
                        <span className={["inline-flex rounded-full px-3 py-1 text-[12px] font-medium", appointment.statusClass].join(" ")}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <MoreIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-[15px] font-medium text-slate-900">Revenue Overview</h3>
              </div>
              <div className="px-5 pb-5">
                <div className="flex h-[195px] items-center justify-center rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f7f8ff] text-center text-slate-500">
                  <div>
                    <div className="mx-auto mb-2 flex w-fit items-center gap-2 text-[14px] font-medium text-slate-700">
                      <span className="inline-block h-4 w-4 rounded-sm bg-slate-700/80" />
                      Chart Visualization (Revenue)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-[15px] font-medium text-slate-900">Medicine Usage Trends</h3>
              </div>
              <div className="px-5 pb-5">
                <div className="flex h-[195px] items-center justify-center rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f7f8ff] text-center text-slate-500">
                  <div>
                    <div className="mx-auto mb-2 flex w-fit items-center gap-2 text-[14px] font-medium text-slate-700">
                      <span className="inline-block h-4 w-4 rounded-sm border border-slate-500" />
                      Chart Visualization (Inventory)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
              <WarningSmallIcon className="h-[18px] w-[18px] text-[#ef4444]" />
              <h3 className="text-[15px] font-semibold text-slate-900">Low Stock Alerts</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStock.map((item) => (
                <div key={item.name} className="px-4 py-4 text-[13px]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="mt-1 text-slate-500">Supplier: {item.supplier}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#ef4444]">{item.units}</div>
                      <button className="mt-1 text-[12px] font-medium text-[#2563eb] hover:text-[#1d4ed8]">Reorder</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-200 px-4 py-4">
              <h3 className="text-[15px] font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {quickActions.map(({ label, icon: Icon, bg }) => (
                <button
                  key={label}
                  className="flex min-h-[98px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-[#f7f8fc] px-4 text-[14px] font-medium text-slate-700 transition hover:border-slate-200 hover:bg-white"
                >
                  <span className={["flex h-11 w-11 items-center justify-center rounded-xl", bg].join(" ")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
