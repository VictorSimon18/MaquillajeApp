import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-surface p-4 shadow-[0_8px_24px_-12px_rgba(36,28,38,0.18)] ring-1 ring-black/[0.03] ${className}`}
    >
      {children}
    </div>
  );
}
