"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import { NotificationBell } from "@/components/layout/NotificationBell";
import Image from "next/image";

const NAV_ITEMS = {
  SCHOOL_ADMIN: [
    { label: "Vue générale", href: "/dashboard/admin", icon: "grid" },
    { label: "Élèves", href: "/dashboard/admin/students", icon: "users" },
    {
      label: "Enseignants",
      href: "/dashboard/admin/teachers",
      icon: "graduation",
    },
    { label: "Classes", href: "/dashboard/admin/classes", icon: "book" },
    { label: "Matières", href: "/dashboard/admin/subjects", icon: "layers" },
    { label: "Examens", href: "/dashboard/admin/exams", icon: "clipboard" },
    { label: "Notes", href: "/dashboard/admin/grades", icon: "bar-chart" },
    {
      label: "Paiements",
      href: "/dashboard/admin/payments",
      icon: "credit-card",
    },
    { label: "Abonnement", href: "/dashboard/admin/billing", icon: "package" },
    {
      label: "Paramètres",
      href: "/dashboard/admin/settings",
      icon: "settings",
    },
  ],
  SUPER_ADMIN: [
    { label: "Vue générale", href: "/dashboard/admin", icon: "grid" },
    { label: "Écoles", href: "/dashboard/admin/schools", icon: "building" },
    { label: "Élèves", href: "/dashboard/admin/students", icon: "users" },
    {
      label: "Enseignants",
      href: "/dashboard/admin/teachers",
      icon: "graduation",
    },
    { label: "Classes", href: "/dashboard/admin/classes", icon: "book" },
    {
      label: "Paiements",
      href: "/dashboard/admin/payments",
      icon: "credit-card",
    },
    { label: "Abonnement", href: "/dashboard/admin/billing", icon: "package" },
    {
      label: "Paramètres",
      href: "/dashboard/admin/settings",
      icon: "settings",
    },
  ],
  TEACHER: [
    { label: "Vue générale", href: "/dashboard/teacher", icon: "grid" },
    { label: "Mes Classes", href: "/dashboard/teacher/classes", icon: "book" },
    { label: "Élèves", href: "/dashboard/teacher/students", icon: "users" },
    { label: "Examens", href: "/dashboard/teacher/exams", icon: "clipboard" },
    { label: "Notes", href: "/dashboard/teacher/grades", icon: "bar-chart" },
  ],
  STUDENT: [
    { label: "Vue générale", href: "/dashboard/student", icon: "grid" },
    {
      label: "Mes Notes",
      href: "/dashboard/student/grades",
      icon: "bar-chart",
    },
    {
      label: "Planning",
      href: "/dashboard/student/schedule",
      icon: "calendar",
    },
    {
      label: "Paiements",
      href: "/dashboard/student/payments",
      icon: "credit-card",
    },
  ],
};

const ICONS = {
  grid: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
    />
  ),
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  ),
  graduation: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
    />
  ),
  book: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  ),
  layers: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 4l8 4-8 4-8-4 8-4zm0 8l8 4-8 4-8-4 8-4z"
    />
  ),
  clipboard: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  ),
  "bar-chart": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  ),
  "credit-card": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  ),
  package: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  ),
  building: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  ),
  settings: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
  ),
  calendar: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  ),
};

function NavIcon({ name }) {
  return (
    <svg
      className="w-[18px] h-[18px] flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {ICONS[name]}
    </svg>
  );
}

function Avatar({ name, size = "md" }) {
  const s = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-500 to-violet-600 flex-shrink-0",
        s,
      )}
    >
      {initials}
    </div>
  );
}

export function Sidebar({ user, tenant }) {
  const pathname = usePathname();
  const role = user?.role || "STUDENT";
  const items = NAV_ITEMS[role] || NAV_ITEMS.STUDENT;
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "240px",
        background: "#060b18",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        zIndex: 30,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "13px",
              fontFamily: "Syne, sans-serif",
              flexShrink: 0,
            }}
          >
            <Image
              src="/schoolflow-logo.png"
              alt="SchoolFlow"
              width={28}
              height={28}
              className="nav-logo-img"
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                fontFamily: "Syne, sans-serif",
                lineHeight: 1.2,
              }}
            >
              SchoolFlow
            </p>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "10px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "140px",
              }}
            >
              {tenant?.name || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/admin" &&
              item.href !== "/dashboard/teacher" &&
              item.href !== "/dashboard/student" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "10px",
                marginBottom: "2px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "white" : "#64748b",
                background: isActive
                  ? "linear-gradient(135deg,#1a3aeb,#7c3aed)"
                  : "transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: Notifications + Profile + Logout */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Notifications row */}
        <div
          style={{
            padding: "4px 8px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#475569",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Notifications
          </span>
          <NotificationBell />
        </div>

        {/* Profile link */}
        <Link
          href="/dashboard/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "12px",
            textDecoration: "none",
            background:
              pathname === "/dashboard/profile"
                ? "rgba(43,80,245,0.15)"
                : "rgba(255,255,255,0.03)",
            border: `1px solid ${pathname === "/dashboard/profile" ? "rgba(43,80,245,0.3)" : "rgba(255,255,255,0.06)"}`,
            marginBottom: "6px",
            transition: "all 0.2s",
          }}
        >
          <Avatar name={fullName} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "600",
                color: "white",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fullName}
            </p>
            <p style={{ margin: 0, fontSize: "10px", color: "#475569" }}>
              {user?.role?.replace("_", " ")}
            </p>
          </div>
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="#475569"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>

        {/* Logout */}
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 12px",
            borderRadius: "10px",
            background: "none",
            border: "none",
            color: "#475569",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "DM Sans, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#475569";
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
