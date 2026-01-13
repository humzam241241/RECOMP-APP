"use client";

import type { CSSProperties } from "react";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: CSSProperties;
}

const sizeMap = {
  sm: "4px",
  md: "8px",
  lg: "12px",
};

const colorMap = {
  default: "var(--accent-blue)",
  gradient: "var(--gradient-blue)",
  success: "var(--accent-green)",
  warning: "var(--accent-orange)",
  danger: "var(--accent-red)",
};

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
  animated = true,
  style,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{ width: "100%", ...style }}>
      {(showLabel || label) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          {label && (
            <span
              style={{
                fontSize: "13px",
                color: "var(--foreground-secondary)",
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          )}
          {showLabel && (
            <span
              style={{
                fontSize: "13px",
                color: "var(--foreground-tertiary)",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: sizeMap[size],
          background: "var(--background-tertiary)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background:
              variant === "gradient" ? colorMap[variant] : colorMap[variant],
            borderRadius: "var(--radius-full)",
            transition: animated ? "width 0.5s ease-out" : "none",
          }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
  style?: CSSProperties;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = "default",
  showLabel = true,
  label,
  style,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        ...style,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--background-tertiary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.5s ease-out",
          }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: size * 0.22,
              fontWeight: 700,
              color: "var(--foreground)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(percentage)}%
          </span>
          {label && (
            <span
              style={{
                fontSize: size * 0.1,
                color: "var(--foreground-tertiary)",
                fontWeight: 500,
                marginTop: "2px",
              }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
