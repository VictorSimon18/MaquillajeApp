import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-md shadow-pink-200 hover:brightness-105 active:scale-[0.98]",
  secondary:
    "bg-secondary-soft text-secondary hover:bg-secondary hover:text-white active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink-soft border border-line hover:border-primary hover:text-primary active:scale-[0.98]",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
