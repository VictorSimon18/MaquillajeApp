"use client";

import type { LucideIcon } from "lucide-react";

export function Chip({
  label,
  icon: Icon,
  active = false,
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors active:scale-95 ${
        active
          ? "border-transparent bg-primary text-white shadow-sm shadow-pink-200"
          : "border-line bg-white text-ink-soft hover:border-primary"
      }`}
    >
      {Icon ? <Icon size={15} strokeWidth={2.5} /> : null}
      {label}
    </button>
  );
}
