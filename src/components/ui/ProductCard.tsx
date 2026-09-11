import Link from "next/link";
import type { ProductWithRelations } from "@/lib/types";
import { getExpiryStatus } from "@/lib/expiry";
import { ProductSwatch } from "./ProductSwatch";
import { ExpiryBadge } from "./Badge";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const status = getExpiryStatus(product.opened_at, product.shelf_life_days);

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col gap-3 rounded-3xl bg-surface p-3.5 shadow-[0_8px_24px_-14px_rgba(36,28,38,0.2)] ring-1 ring-black/[0.03] transition-transform active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <ProductSwatch categoryName={product.category.name} seed={product.id} />
        {status ? <ExpiryBadge status={status} /> : null}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {product.brand}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug text-ink group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-ink-muted">{product.category.name}</p>
      </div>
    </Link>
  );
}
