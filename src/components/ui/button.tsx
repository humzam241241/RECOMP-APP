"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    background: var(--gradient-blue);
    color: white;
    border: none;
    box-shadow: var(--shadow-glow-blue);
  `,
  secondary: `
    background: var(--background-tertiary);
    color: var(--foreground);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `,
  ghost: `
    background: transparent;
    color: var(--foreground-secondary);
    border: none;
  `,
  danger: `
    background: var(--accent-red);
    color: white;
    border: none;
  `,
  success: `
    background: var(--gradient-green);
    color: white;
    border: none;
    box-shadow: var(--shadow-glow-green);
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);",
  md: "padding: 12px 24px; font-size: 14px; border-radius: var(--radius-md);",
  lg: "padding: 16px 32px; font-size: 16px; border-radius: var(--radius-lg);",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          cursor: disabled || isLoading ? "not-allowed" : "pointer",
          opacity: disabled || isLoading ? 0.5 : 1,
          transition: "all var(--transition-fast)",
          width: fullWidth ? "100%" : "auto",
          ...Object.fromEntries(
            variantStyles[variant]
              .split(";")
              .filter(Boolean)
              .map((s) => {
                const [key, value] = s.split(":").map((x) => x.trim());
                return [
                  key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
                  value,
                ];
              })
          ),
          ...Object.fromEntries(
            sizeStyles[size]
              .split(";")
              .filter(Boolean)
              .map((s) => {
                const [key, value] = s.split(":").map((x) => x.trim());
                return [
                  key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
                  value,
                ];
              })
          ),
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "white",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          button:hover:not(:disabled) {
            transform: translateY(-1px);
            filter: brightness(1.1);
          }
          button:active:not(:disabled) {
            transform: translateY(0);
            filter: brightness(0.95);
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = "Button";
