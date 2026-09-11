import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Volver"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink-soft shadow-sm ring-1 ring-black/[0.04] active:scale-95"
          >
            <ChevronLeft size={20} />
          </Link>
        ) : null}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}
