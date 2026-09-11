import { BellRing, PartyPopper } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { ExpiryBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PRODUCTS } from "@/lib/mock-data";
import Link from "next/link";

export default function AlertasPage() {
  const expired = PRODUCTS.filter((p) => p.expiryStatus === "expired");
  const expiringSoon = PRODUCTS.filter((p) => p.expiryStatus === "expiring-soon");
  const hasAlerts = expired.length > 0 || expiringSoon.length > 0;

  return (
    <div className="pt-1">
      <PageHeader
        title="Alertas"
        subtitle="Productos que necesitan tu atención"
      />

      {!hasAlerts ? (
        <EmptyState
          icon={PartyPopper}
          title="¡Todo en orden!"
          description="Ningún producto está caducado o a punto de caducar."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {expired.length > 0 ? (
            <AlertSection title="Caducados" products={expired} />
          ) : null}
          {expiringSoon.length > 0 ? (
            <AlertSection title="Caducan pronto" products={expiringSoon} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function AlertSection({
  title,
  products,
}: {
  title: string;
  products: typeof PRODUCTS;
}) {
  return (
    <div>
      <h2 className="mb-2.5 flex items-center gap-1.5 font-display text-base font-bold text-ink">
        <BellRing size={16} className="text-primary" />
        {title}
      </h2>
      <div className="flex flex-col gap-2.5">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/producto/${product.id}`}
            className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[0_8px_20px_-14px_rgba(36,28,38,0.2)] ring-1 ring-black/[0.03] active:scale-[0.98]"
          >
            <ProductSwatch category={product.category} colorHex={product.colorHex} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold text-ink">
                {product.name}
              </p>
              <p className="truncate text-xs text-ink-muted">
                {product.brand} · {product.expiryText}
              </p>
            </div>
            <ExpiryBadge status={product.expiryStatus} />
          </Link>
        ))}
      </div>
    </div>
  );
}
