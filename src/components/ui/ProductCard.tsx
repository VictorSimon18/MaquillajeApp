import Link from "next/link";
import { CATEGORY_META } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { ProductSwatch } from "./ProductSwatch";
import { ExpiryBadge } from "./Badge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col gap-3 rounded-3xl bg-surface p-3.5 shadow-[0_8px_24px_-14px_rgba(36,28,38,0.2)] ring-1 ring-black/[0.03] transition-transform active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <ProductSwatch category={product.category} colorHex={product.colorHex} />
        <ExpiryBadge status={product.expiryStatus} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {product.brand}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug text-ink group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          {CATEGORY_META[product.category].label}
        </p>
      </div>
    </Link>
  );
}
