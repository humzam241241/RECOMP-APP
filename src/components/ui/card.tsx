"use client";

import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "default" | "glass" | "elevated" | "gradient";
  gradient?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
}

const paddingMap = {
  none: "0",
  sm: "var(--spacing-md)",
  md: "var(--spacing-lg)",
  lg: "var(--spacing-xl)",
};

export function Card({
  children,
  style,
  variant = "default",
  gradient,
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  const baseStyles: CSSProperties = {
    borderRadius: "var(--radius-xl)",
    padding: paddingMap[padding],
    transition: "all var(--transition-base)",
    cursor: onClick ? "pointer" : "default",
  };

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      background: "var(--background-secondary)",
      border: "1px solid rgba(255, 255, 255, 0.06)",
    },
    glass: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    elevated: {
      background: "var(--background-tertiary)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "var(--shadow-lg)",
    },
    gradient: {
      background: gradient || "var(--gradient-blue)",
      border: "none",
    },
  };

  return (
    <div
      onClick={onClick}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            variant === "elevated" ? "var(--shadow-lg)" : "none";
        }
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <div
      style={{
        marginBottom: "var(--spacing-md)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  style?: CSSProperties;
  size?: "sm" | "md" | "lg";
}

export function CardTitle({ children, style, size = "md" }: CardTitleProps) {
  const sizeStyles = {
    sm: { fontSize: "14px", fontWeight: 600 },
    md: { fontSize: "18px", fontWeight: 600 },
    lg: { fontSize: "24px", fontWeight: 700 },
  };

  return (
    <h3
      style={{
        color: "var(--foreground)",
        letterSpacing: "-0.02em",
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  return (
    <p
      style={{
        color: "var(--foreground-secondary)",
        fontSize: "14px",
        marginTop: "4px",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function CardContent({ children, style }: CardContentProps) {
  return <div style={style}>{children}</div>;
}
