"use client";

import { CalendarIcon, UserIcon } from "@/components/ui/icons";

interface HeaderProps {
  title: string;
  subtitle?: string;
  dayNumber?: number;
  phase?: string;
}

export function Header({ title, subtitle, dayNumber, phase }: HeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "var(--spacing-xl)",
        paddingBottom: "var(--spacing-lg)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
            marginBottom: "var(--spacing-xs)",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            {title}
          </h1>
          {phase && (
            <span
              style={{
                background:
                  phase === "foundation"
                    ? "var(--gradient-blue)"
                    : phase === "build"
                    ? "var(--gradient-orange)"
                    : "var(--gradient-purple)",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                textTransform: "capitalize",
              }}
            >
              {phase}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: "15px",
              color: "var(--foreground-secondary)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-lg)",
        }}
      >
        {dayNumber !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              padding: "var(--spacing-sm) var(--spacing-md)",
              background: "var(--background-tertiary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <CalendarIcon size={18} color="var(--accent-blue)" />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Day {dayNumber}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "var(--foreground-tertiary)",
              }}
            >
              / 90
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
            color: "var(--foreground-secondary)",
            fontSize: "14px",
          }}
        >
          <span>{today}</span>
        </div>

        <button
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-full)",
            background: "var(--background-tertiary)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--background-elevated)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--background-tertiary)";
          }}
        >
          <UserIcon size={20} color="var(--foreground-secondary)" />
        </button>
      </div>
    </header>
  );
}
