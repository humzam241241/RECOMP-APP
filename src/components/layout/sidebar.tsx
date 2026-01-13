"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  HomeIcon,
  DumbbellIcon,
  ForkKnifeIcon,
  SparklesIcon,
  BrainIcon,
  ChartIcon,
  SettingsIcon,
  LogOutIcon,
  RunningIcon,
  UsersIcon,
} from "@/components/ui/icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: <HomeIcon size={22} /> },
  { href: "/dashboard/workout", label: "Workout", icon: <DumbbellIcon size={22} /> },
  { href: "/dashboard/running", label: "Running", icon: <RunningIcon size={22} /> },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: <ForkKnifeIcon size={22} /> },
  { href: "/dashboard/dopamine", label: "Dopamine", icon: <SparklesIcon size={22} /> },
  { href: "/dashboard/mindset", label: "Mindset", icon: <BrainIcon size={22} /> },
];

const secondaryNavItems: NavItem[] = [
  { href: "/dashboard/community", label: "Community", icon: <UsersIcon size={22} /> },
  { href: "/dashboard/progress", label: "Progress", icon: <ChartIcon size={22} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <SettingsIcon size={22} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "var(--background-secondary)",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "var(--spacing-lg)",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "18px",
              color: "white",
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}
          >
            RECOMP
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1 }}>
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--foreground-quaternary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "0 var(--spacing-md)",
              marginBottom: "var(--spacing-sm)",
            }}
          >
            Main
          </p>
          <ul style={{ listStyle: "none" }}>
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                }
              />
            ))}
          </ul>
        </div>

        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--foreground-quaternary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "0 var(--spacing-md)",
              marginBottom: "var(--spacing-sm)",
            }}
          >
            More
          </p>
          <ul style={{ listStyle: "none" }}>
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname.startsWith(item.href)}
              />
            ))}
          </ul>
        </div>
      </nav>

      {/* User Section */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          paddingTop: "var(--spacing-lg)",
        }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
            width: "100%",
            padding: "var(--spacing-md)",
            background: "transparent",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            color: "var(--foreground-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOutIcon size={20} />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
}

function NavLink({ item, isActive }: NavLinkProps) {
  return (
    <li>
      <Link
        href={item.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-md)",
          padding: "var(--spacing-md)",
          borderRadius: "var(--radius-md)",
          textDecoration: "none",
          color: isActive ? "var(--foreground)" : "var(--foreground-secondary)",
          background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
          fontWeight: isActive ? 600 : 500,
          fontSize: "14px",
          transition: "all var(--transition-fast)",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "var(--foreground)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--foreground-secondary)";
          }
        }}
      >
        <span
          style={{
            color: isActive ? "var(--accent-blue)" : "inherit",
            display: "flex",
            alignItems: "center",
          }}
        >
          {item.icon}
        </span>
        <span>{item.label}</span>
        {item.badge && (
          <span
            style={{
              marginLeft: "auto",
              background: "var(--accent-blue)",
              color: "white",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {item.badge}
          </span>
        )}
        {isActive && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "3px",
              height: "24px",
              background: "var(--accent-blue)",
              borderRadius: "var(--radius-full)",
            }}
          />
        )}
      </Link>
    </li>
  );
}
