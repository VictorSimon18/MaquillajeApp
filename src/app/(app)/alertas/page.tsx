import Link from "next/link";
import { BellRing, PartyPopper } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { ExpiryBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProducts } from "@/lib/data/products";
import { formatExpiryText, getDaysUntilExpiry, getExpiryStatus } from "@/lib/expiry";
import type { ProductWithRelations } from "@/lib/types";

export default async function AlertasPage() {
  const products = await getProducts();

  const withStatus = products.map((product) => ({
    product,
    status: getExpiryStatus(product.opened_at, product.shelf_life_days),
    days: getDaysUntilExpiry(product.opened_at, product.shelf_life_days),
  }));

  const expired = withStatus
    .filter((p) => p.status === "expired")
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));
  const expiringSoon = withStatus
    .filter((p) => p.status === "expiring-soon")
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));
  const hasAlerts = expired.length > 0 || expiringSoon.length > 0;

  return (
    <div className="pt-1">
      <PageHeader title="Alertas" subtitle="Productos que necesitan tu atención" />

      {!hasAlerts ? (
        <EmptyState
          icon={PartyPopper}
          title="¡Todo en orden!"
          description="Ningún producto está caducado o a punto de caducar."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {expired.length > 0 ? (
            <AlertSection title="Caducados" items={expired.map((p) => p.product)} />
          ) : null}
          {expiringSoon.length > 0 ? (
            <AlertSection title="Caducan pronto" items={expiringSoon.map((p) => p.product)} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function AlertSection({ title, items }: { title: string; items: ProductWithRelations[] }) {
  return (
    <div>
      <h2 className="mb-2.5 flex items-center gap-1.5 font-display text-base font-bold text-ink">
        <BellRing size={16} className="text-primary" />
        {title}
      </h2>
      <div className="flex flex-col gap-2.5">
        {items.map((product) => {
          const status = getExpiryStatus(product.opened_at, product.shelf_life_days);
          return (
            <Link
              key={product.id}
              href={`/producto/${product.id}`}
              className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[0_8px_20px_-14px_rgba(36,28,38,0.2)] ring-1 ring-black/[0.03] active:scale-[0.98]"
            >
              <ProductSwatch categoryName={product.category.name} seed={product.id} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-ink">
                  {product.name}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {product.brand} · {formatExpiryText(product.opened_at, product.shelf_life_days)}
                </p>
              </div>
              {status ? <ExpiryBadge status={status} /> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
