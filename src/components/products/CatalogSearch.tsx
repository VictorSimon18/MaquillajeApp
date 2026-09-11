"use client";

import { useMemo, useState } from "react";
import { PackageSearch, Search, Star } from "lucide-react";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CatalogProductWithCategory, CatalogRating } from "@/lib/types";

const POPULAR_LIMIT = 12;

export function CatalogSearch({
  products,
  ratings,
  onSelect,
  onManual,
}: {
  products: CatalogProductWithCategory[];
  ratings: Record<string, CatalogRating>;
  onSelect: (product: CatalogProductWithCategory) => void;
  onManual: () => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, POPULAR_LIMIT);
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) || product.brand.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por nombre o marca"
          autoFocus
          className="w-full rounded-2xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {query.trim() ? `${results.length} resultados` : "Más populares"}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No lo encontramos en el catálogo"
          description="Prueba con otro término de búsqueda o añádelo tú mismo."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className="flex items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-[0_8px_20px_-14px_rgba(36,28,38,0.2)] ring-1 ring-black/[0.03] transition-transform active:scale-[0.98]"
            >
              <ProductSwatch
                categoryName={product.category.name}
                seed={product.id}
                photoUrl={product.default_photo_url}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-display text-sm font-semibold text-ink">
                    {product.name}
                  </p>
                  {ratings[product.id] ? (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-soft px-1.5 py-0.5 text-[11px] font-bold text-amber">
                      <Star size={10} fill="currentColor" strokeWidth={0} />
                      {ratings[product.id].average.toFixed(1)}
                      <span className="font-normal text-ink-muted">
                        ({ratings[product.id].count})
                      </span>
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-ink-muted">
                  {product.brand}
                  {product.shade ? ` · ${product.shade}` : ""} · {product.category.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onManual}
        className="rounded-2xl border border-dashed border-line bg-surface-muted/60 py-3 text-center text-sm font-bold text-primary active:scale-[0.99]"
      >
        No está en la lista, añadir manualmente
      </button>
    </div>
  );
}
