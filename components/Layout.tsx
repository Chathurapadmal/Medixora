import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "Admin";
    const path = router.pathname;

    let allowed = true;

    if (role === "Nurse") {
      const allowedPaths = ["/", "/dashboard", "/patients", "/appointments", "/medical_records", "/billing", "/settings", "/support"];
      if (!allowedPaths.some(p => path === p || path.startsWith(`${p}/`))) {
        allowed = false;
      }
    } else if (role === "Doctor") {
      const allowedPaths = ["/", "/dashboard", "/appointments", "/medical_records", "/patients", "/settings", "/support"];
      // Doctor can access /patients/[id] but NOT /patients index page.
      if (path === "/patients") {
        allowed = false;
      } else if (!allowedPaths.some(p => path === p || path.startsWith(`${p}/`))) {
        allowed = false;
      }
    }

    if (!allowed) {
      router.replace("/");
    } else {
      setIsAllowed(true);
    }
  }, [router.pathname]);

  if (!isAllowed) return null; // Wait for role check

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] text-slate-900">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
