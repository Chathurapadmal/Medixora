import Link from "next/link";
import { useRouter } from "next/router";
import {
  AppointmentsIcon,
  BillingIcon,
  DashboardIcon,
  DoctorsIcon,
  InventoryIcon,
  LogoMark,
  PatientsIcon,
  RecordsIcon,
  ReportsIcon,
  SettingsIcon,
  SupportIcon,
  SuppliersIcon,
} from "./dashboard-icons";

const navItems = [
  { label: "Dashboard", href: "/", icon: DashboardIcon },
  { label: "Patients", href: "/patients", icon: PatientsIcon },
  { label: "Doctors", href: "/doctors", icon: DoctorsIcon },
  { label: "Appointments", href: "/appointments", icon: AppointmentsIcon },
  { label: "Medical Records", href: "/medical_records", icon: RecordsIcon },
  { label: "Inventory", href: "/inventory", icon: InventoryIcon },
  { label: "Billing", href: "/billing", icon: BillingIcon },
  { label: "Suppliers", href: "/suppliers", icon: SuppliersIcon },
  { label: "Reports", href: "/reports", icon: ReportsIcon },
];

export default function Sidebar() {
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/") {
      return router.pathname === "/";
    }

    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden h-screen w-[255px] shrink-0 flex-col border-r border-slate-400 bg-white md:flex">
      <div className="border-b border-slate-100 p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4f74ff] text-white shadow-[0_10px_18px_rgba(79,116,255,0.28)]">
            <LogoMark className="h-7 w-7" />
          </div>

          <div>
            <div className="text-[18px] font-semibold leading-tight text-slate-900">
              MediStock
            </div>
            <div className="text-[13px] leading-tight text-slate-500">
              Health Management System
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);

          return (
            <Link
              key={label}
              href={href}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                active
                  ? "bg-[#eef2ff] text-[#2563eb]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-[#2563eb]" />
              )}

              <span
                className={[
                  "flex h-5 w-5 items-center justify-center",
                  active
                    ? "text-[#2563eb]"
                    : "text-slate-500 group-hover:text-slate-700",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-400 p-4">
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <SettingsIcon className="h-4 w-4 text-slate-500" />
            <span>Settings</span>
          </Link>

          <Link
            href="/support"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <SupportIcon className="h-4 w-4 text-slate-500" />
            <span>Support</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}