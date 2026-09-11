import { EXPIRY_STATUS_META } from "@/lib/constants";
import type { ExpiryStatus } from "@/lib/types";

export function ExpiryBadge({ status }: { status: ExpiryStatus }) {
  const meta = EXPIRY_STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: meta.soft, color: meta.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}
