import { useEffect, useState } from "react";
import { BellIcon, HelpIcon, SearchIcon } from "./dashboard-icons";
import UserAvatar from "@/components/UserAvatar";

export default function Topbar() {
  const [user, setUser] = useState({
    username: "Staff User",
    role:     "Staff",
    userId:   "",
    avatar:   "",
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("userName") || "Staff User";
    const storedRole     = localStorage.getItem("userRole") || "Staff";
    const storedId       = localStorage.getItem("userId")   || "";
    const cachedAvatar   = localStorage.getItem("userAvatar") || "";

    setUser({ username: storedUsername, role: storedRole, userId: storedId, avatar: cachedAvatar });

    // Fetch the latest avatar from the DB (in case a different tab uploaded it)
    if (storedId) {
      fetch(`/api/user/avatar?userId=${storedId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.avatarUrl) {
            localStorage.setItem("userAvatar", data.avatarUrl);
            setUser((prev) => ({ ...prev, avatar: data.avatarUrl }));
          }
        })
        .catch(() => {/* silent – cached value stays */});
    }

    // Same-tab avatar update (dispatched by ProfilePhotoUploader on upload)
    const handleAvatarUpdate = (e: Event) => {
      const url = (e as CustomEvent<string>).detail;
      setUser((prev) => ({ ...prev, avatar: url }));
    };
    window.addEventListener("avatarUpdated", handleAvatarUpdate);

    // Cross-tab avatar update
    const handleStorageChange = () => {
      const newAvatar = localStorage.getItem("userAvatar") || "";
      setUser((prev) => ({ ...prev, avatar: newAvatar }));
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
      window.removeEventListener("storage",       handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-400 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-5 lg:px-6">

        {/* ── Search ── */}
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-2.5 shadow-[0_1px_1px_rgba(15,23,42,0.02)]">
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Search patients, doctors, medicines..."
            className="w-full min-w-0 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* ── Notifications ── */}
        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 sm:flex"
          aria-label="Notifications"
        >
          <BellIcon className="h-4 w-4" />
        </button>

        {/* ── Help ── */}
        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 sm:flex"
          aria-label="Help"
        >
          <HelpIcon className="h-4 w-4" />
        </button>

        <div className="hidden h-8 w-px bg-slate-300 sm:block" />

        {/* ── User pill ── */}
        <div className="flex items-center gap-3 pl-1 sm:pl-2">
          {/*
            UserAvatar picks: real photo → initials (unique color per userId) → role gradient.
            The color is deterministic, so the same user always shows the same colored avatar.
          */}
          <UserAvatar
            avatarUrl={user.avatar}
            name={user.username}
            userId={user.userId}
            role={user.role}
            size={40}
            borderRadius="9999px"
          />

          <div className="hidden text-left sm:block">
            <div className="text-[14px] font-semibold leading-tight text-slate-900">
              {user.username}
            </div>
            <div className="text-[12px] leading-tight text-slate-500">{user.role}</div>
          </div>
        </div>

      </div>
    </header>
  );
}