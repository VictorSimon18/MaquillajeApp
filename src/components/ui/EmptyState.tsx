import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line bg-surface-muted/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={26} strokeWidth={2} />
      </span>
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {description ? (
        <p className="max-w-xs text-sm text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}
