import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  DoctorsIcon,
  MedicineIcon,
  MoreIcon,
  MoneyIcon,
  PlusIcon,
  SuppliersIcon,
  WarningSmallIcon,
} from "@/components/dashboard-icons";

type DashboardInventoryItem = {
  id: number;
  name: string;
  category: string | null;
  supplier: string | null;
  stock: number;
  minimum: number;
  price: number;
  expiryDate: string | null;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Expired";
};

type DashboardSummary = {
  staffAccounts: number;
  activeStaff: number;
  totalMedicines: number;
  lowStockMedicines: number;
  expiredMedicines: number;
  inventoryValue: number;
  totalSuppliers: number;
};

type DashboardResponse = {
  summary: DashboardSummary;
  recentInventory: DashboardInventoryItem[];
  lowStockItems: DashboardInventoryItem[];
};

const quickActions = [
  { label: "Add Medicine", href: "/inventory/add_medicine", icon: MedicineIcon, bg: "bg-[#e7f7f0] text-[#11805d]" },
  { label: "Register User", href: "/register", icon: DoctorsIcon, bg: "bg-[#eef2ff] text-[#3063f2]" },
  { label: "View Inventory", href: "/inventory", icon: SuppliersIcon, bg: "bg-[#fff1ea] text-[#c2642c]" },
  { label: "Low Stock Alerts", href: "/inventory/low_stock_alerts", icon: WarningSmallIcon, bg: "bg-[#ffe6e6] text-[#d43d3d]" },
];

const statusStyles: Record<DashboardInventoryItem["status"], string> = {
  "In Stock": "bg-[#dcf6e9] text-[#11805d]",
  "Low Stock": "bg-[#fff4db] text-[#b7791f]",
  "Out of Stock": "bg-[#ffe0e0] text-[#d85a5a]",
  Expired: "bg-[#ffe0e0] text-[#d85a5a]",
};

const defaultStats = [
  {
    label: "STAFF ACCOUNTS",
    value: "0",
    changeLabel: "active staff",
    icon: DoctorsIcon,
    iconBg: "bg-[#eaf0ff] text-[#3657d6]",
  },
  {
    label: "TOTAL MEDICINES",
    value: "0",
    changeLabel: "from inventory",
    icon: MedicineIcon,
    iconBg: "bg-[#e7f7f0] text-[#11805d]",
  },
  {
    label: "LOW STOCK ALERTS",
    value: "0",
    changeLabel: "of inventory items",
    icon: AlertTriangleIcon,
    iconBg: "bg-[#ffe6e6] text-[#d43d3d]",
    valueClass: "text-[#c92d2d]",
  },
  {
    label: "INVENTORY VALUE",
    value: "Rs. 0.00",
    changeLabel: "current stock valuation",
    icon: MoneyIcon,
    iconBg: "bg-[#dff8ee] text-[#12a76f]",
  },
];

function formatCompactCurrency(value: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10000 ? 1 : 2,
    minimumFractionDigits: value < 10000 ? 2 : 0,
  }).format(value);
  return `Rs. ${formatted}`;
}

function formatDate(value: string | null) {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
        {progress !== undefined ? (
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
  const [user, setUser] = useState<{ username: string; role: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Admin Data
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  // Role-specific quick stats
  const [stats, setStats] = useState({
    patientsCount: 0,
    appointmentsCount: 0,
    doctorAppointments: [] as any[],
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      if (router.pathname !== "/login") router.replace("/login");
      return;
    }

    const storedUsername = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");

    const timeoutId = window.setTimeout(() => {
      let email = "";
      try {
        email = atob(token).split(":")[2] || "";
      } catch (e) {}

      if (storedUsername && storedRole) {
        setUser({ username: storedUsername, role: storedRole, email });
        setLoading(false);
        return;
      }

      try {
        const decoded = atob(token);
        const [, username, decodedEmail] = decoded.split(":");
        setUser({
          username: username || "Staff User",
          role: "Staff",
          email: decodedEmail || "",
        });
      } catch (err) {
        console.error("Failed to decode token:", err);
        if (router.pathname !== "/login") router.replace("/login");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router.pathname]);

  useEffect(() => {
    let mounted = true;

    if (user?.role === "Admin") {
      fetch("/api/dashboard")
        .then((response) => response.json())
        .then((data: DashboardResponse | { error?: string }) => {
          if (!mounted) return;
          if ("error" in data && data.error) {
            setDashboardError(data.error);
            setDashboard(null);
            return;
          }
          setDashboard(data as DashboardResponse);
        })
        .catch((error) => {
          if (!mounted) return;
          setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard data");
          setDashboard(null);
        })
        .finally(() => {
          if (mounted) setDashboardLoading(false);
        });
    } else if (user?.role === "Nurse") {
      Promise.all([
        fetch("/api/patients").then(r => r.json()),
        fetch("/api/appointments?limit=1").then(r => r.json())
      ]).then(([pData, aData]) => {
        if (mounted) {
          const pCount = Array.isArray(pData) ? pData.length : (pData.total || 0);
          setStats(s => ({ ...s, patientsCount: pCount, appointmentsCount: aData.total || 0 }));
          setDashboardLoading(false);
        }
      }).catch(() => { if (mounted) setDashboardLoading(false); });
    } else if (user?.role === "Doctor") {
      const email = user.email || "";
      Promise.all([
        fetch(`/api/appointments?doctorEmail=${encodeURIComponent(email)}&limit=10`).then(r => r.json()),
        fetch(`/api/doctors?email=${encodeURIComponent(email)}`).then(r => r.json())
      ])
        .then(([aptData, docData]) => {
          if (mounted) {
            setStats(s => ({ ...s, doctorAppointments: aptData.data || [] }));
            if (docData && docData.length > 0) {
              setDoctorProfile(docData[0]);
            }
            setDashboardLoading(false);
          }
        })
        .catch(() => { if (mounted) setDashboardLoading(false); });
    } else {
      if (mounted) setDashboardLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user?.role, user?.email]);

  const updateDoctorStatus = async (nextStatus: string) => {
    if (!doctorProfile?.id) return;

    const previousStatus = doctorProfile.status;
    setDoctorProfile((current: any) => (current ? { ...current, status: nextStatus } : current));

    try {
      const response = await fetch(`/api/doctors?id=${doctorProfile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update doctor status");
      }
    } catch (error) {
      setDoctorProfile((current: any) => (current ? { ...current, status: previousStatus } : current));
      console.error("Failed to update doctor status:", error);
    }
  };

  const adminStats = useMemo(() => {
    const summary = dashboard?.summary;
    const totalMedicines = summary?.totalMedicines ?? 0;
    const lowStockMedicines = summary?.lowStockMedicines ?? 0;
    const lowStockRate = totalMedicines > 0 ? Math.round((lowStockMedicines / totalMedicines) * 100) : 0;

    return [
      {
        ...defaultStats[0],
        value: String(summary?.staffAccounts ?? 0),
        changeLabel: `${summary?.activeStaff ?? 0} active staff`,
      },
      {
        ...defaultStats[1],
        value: String(totalMedicines),
        changeLabel: `${summary?.totalSuppliers ?? 0} suppliers onboard`,
      },
      {
        ...defaultStats[2],
        value: String(lowStockMedicines),
        progress: lowStockRate,
        changeLabel: `${lowStockRate}% of inventory`,
      },
      {
        ...defaultStats[3],
        value: formatCompactCurrency(summary?.inventoryValue ?? 0),
      },
    ];
  }, [dashboard]);

  if (loading || dashboardLoading) {
    return <div className="mx-auto max-w-[1280px] space-y-6 p-6">Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard Overview - MediStock</title>
      </Head>

      <div className="mx-auto max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">Dashboard Overview</h1>
              <p className="mt-1 text-[14px] text-slate-500">Welcome back, {user.username}. Here is the current snapshot for your role ({user.role}).</p>
            </div>
          </div>
        </div>

        {/* ADMIN DASHBOARD */}
        {user.role === "Admin" && (
          <>
            <div className="grid gap-4 xl:grid-cols-4">
              {adminStats.map((stat) => (
                <MetricCard key={stat.label} {...stat} />
              ))}
            </div>

            {dashboardError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Dashboard data loaded with an error: {dashboardError}
              </div>
            ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
          <div className="space-y-6">
            <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="text-[16px] font-semibold text-slate-900">Recent Inventory</h2>
                <Link href="/inventory" className="text-[14px] font-medium text-[#2563eb] hover:text-[#1d4ed8]">View All</Link>
              </div>

              <div className="overflow-hidden rounded-b-[20px]">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#fafbff] text-[13px] font-medium text-slate-500">
                      <th className="px-5 py-3">Medicine</th>
                      <th className="px-5 py-3">Supplier</th>
                      <th className="px-5 py-3">Stock</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Expiry</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboard?.recentInventory ?? []).map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-b-0 text-[14px] text-slate-700">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef0ff] text-[11px] font-semibold text-[#4554cb]">
                              {(item.name.slice(0, 2).toUpperCase() || "--")}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.supplier || "N/A"}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {item.stock}
                          {item.minimum > 0 ? <span className="ml-1 text-slate-400">/ {item.minimum}</span> : null}
                        </td>
                        <td className="px-5 py-4">
                          <span className={["inline-flex rounded-full px-3 py-1 text-[12px] font-medium", statusStyles[item.status]].join(" ")}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{formatDate(item.expiryDate)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link href="/inventory" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                            <MoreIcon className="h-5 w-5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {!dashboard?.recentInventory.length ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                          No inventory data available yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between px-5 py-4">
                  <h3 className="text-[15px] font-medium text-slate-900">Database Health</h3>
                </div>
                <div className="px-5 pb-5">
                  <div className="space-y-3 rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f7f8ff] p-4 text-[14px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Total suppliers</span>
                      <span className="font-semibold text-slate-900">{dashboard?.summary.totalSuppliers ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active staff</span>
                      <span className="font-semibold text-slate-900">{dashboard?.summary.activeStaff ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Expired medicines</span>
                      <span className="font-semibold text-slate-900">{dashboard?.summary.expiredMedicines ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between px-5 py-4">
                  <h3 className="text-[15px] font-medium text-slate-900">Inventory Snapshot</h3>
                </div>
                <div className="px-5 pb-5">
                  <div className="space-y-3 rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f7f8ff] p-4 text-[14px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Low stock items</span>
                      <span className="font-semibold text-slate-900">{dashboard?.summary.lowStockMedicines ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total medicines</span>
                      <span className="font-semibold text-slate-900">{dashboard?.summary.totalMedicines ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Inventory value</span>
                      <span className="font-semibold text-slate-900">{formatCompactCurrency(dashboard?.summary.inventoryValue ?? 0)}</span>
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
                {(dashboard?.lowStockItems ?? []).map((item) => (
                  <div key={item.id} className="px-4 py-4 text-[13px]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-800">{item.name}</div>
                        <div className="mt-1 text-slate-500">Supplier: {item.supplier || "N/A"}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#ef4444]">{item.stock} Units</div>
                        <Link href="/inventory/add_medicine" className="mt-1 inline-block text-[12px] font-medium text-[#2563eb] hover:text-[#1d4ed8]">Reorder</Link>
                      </div>
                    </div>
                  </div>
                ))}
                {!dashboard?.lowStockItems.length ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">No low stock items right now.</div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200 px-4 py-4">
                <h3 className="text-[15px] font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {quickActions.map(({ label, href, icon: Icon, bg }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-[98px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-[#f7f8fc] px-4 text-[14px] font-medium text-slate-700 transition hover:border-slate-200 hover:bg-white"
                  >
                    <span className={["flex h-11 w-11 items-center justify-center rounded-xl", bg].join(" ")}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-center leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
          </>
        )}

        {/* NURSE DASHBOARD */}
        {user.role === "Nurse" && (
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="TOTAL PATIENTS"
              value={String(stats.patientsCount)}
              changeLabel="registered patients"
              icon={DoctorsIcon}
              iconBg="bg-[#eaf0ff] text-[#3657d6]"
            />
            <MetricCard
              label="UPCOMING APPOINTMENTS"
              value={String(stats.appointmentsCount)}
              changeLabel="total appointments"
              icon={MedicineIcon}
              iconBg="bg-[#e7f7f0] text-[#11805d]"
            />
          </div>
        )}

        {/* DOCTOR DASHBOARD */}
        {user.role === "Doctor" && (
          <div className="space-y-6">
            {doctorProfile && (
              <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-900">My Profile Status</h2>
                  <p className="text-[13px] text-slate-500">Update your current availability status in the doctor directory.</p>
                </div>
                <select
                  value={doctorProfile.status}
                  onChange={(e) => updateDoctorStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[14px] font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}

            <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-[16px] font-semibold text-slate-900">Your Recent & Upcoming Appointments</h2>
              </div>
              <div className="overflow-hidden rounded-b-[20px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#fafbff] text-[13px] font-medium text-slate-500">
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.doctorAppointments.map((apt) => (
                    <tr key={apt.appointment_id} className="border-b border-slate-100 last:border-b-0 text-[14px] text-slate-700">
                      <td className="px-5 py-4 font-medium">{apt.patient_name}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(apt.appointment_date)}</td>
                      <td className="px-5 py-4 text-slate-600">{apt.appointment_time}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-600">
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!stats.doctorAppointments.length && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

      </div>
    </>
  );
}
