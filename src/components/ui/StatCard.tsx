import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "amber" | "coral" | "mint";
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    amber: "bg-amber-soft text-amber",
    coral: "bg-coral-soft text-coral",
    mint: "bg-mint-soft text-mint",
  };

  return (
    <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-surface p-3.5 shadow-[0_8px_20px_-14px_rgba(36,28,38,0.2)] ring-1 ring-black/[0.03]">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        <Icon size={18} strokeWidth={2.25} />
      </span>
      <div>
        <p className="font-display text-xl font-bold leading-none text-ink">{value}</p>
        <p className="mt-1 text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
