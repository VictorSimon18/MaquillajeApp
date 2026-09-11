import Link from "next/link";
import { ArrowRight, Bell, PackageSearch, Wand2 } from "lucide-react";
import { getProducts } from "@/lib/data/products";
import { StatCard } from "@/components/ui/StatCard";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { Card } from "@/components/ui/Card";
import { ExpiryBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getExpiryStatus, getDaysUntilExpiry } from "@/lib/expiry";

export default async function DashboardPage() {
  const products = await getProducts();

  const withStatus = products.map((product) => ({
    product,
    status: getExpiryStatus(product.opened_at, product.shelf_life_days),
    days: getDaysUntilExpiry(product.opened_at, product.shelf_life_days),
  }));

  const expiringSoon = withStatus.filter((p) => p.status === "expiring-soon");
  const expired = withStatus.filter((p) => p.status === "expired");
  const urgent = [...expired, ...expiringSoon]
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
    .slice(0, 3);
  const recent = products.slice(0, 3);

  return (
    <div className="flex flex-col gap-6 pt-1">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Tu armario en un vistazo
        </h1>
      </div>

      <div className="flex gap-3">
        <StatCard label="Productos" value={products.length} icon={PackageSearch} tone="primary" />
        <StatCard label="Caducan pronto" value={expiringSoon.length} icon={Bell} tone="amber" />
        <StatCard label="Caducados" value={expired.length} icon={Bell} tone="coral" />
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Tu armario está vacío"
          description="Añade tu primer producto para empezar a llevar el control."
        />
      ) : (
        <>
          <Card className="!bg-secondary text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Wand2 size={18} strokeWidth={2.25} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/75">
                  Añadido recientemente
                </p>
                <p className="font-display text-base font-bold leading-tight">
                  Tus últimas incorporaciones
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
              {recent.map(({ id, name, category, photo_url }) => (
                <div
                  key={id}
                  className="flex w-28 shrink-0 flex-col items-center gap-2 rounded-2xl bg-white/10 p-3 text-center"
                >
                  <ProductSwatch categoryName={category.name} seed={id} photoUrl={photo_url} size="sm" />
                  <p className="text-xs font-semibold leading-tight">{name}</p>
                </div>
              ))}
            </div>

            <Link
              href="/recomendacion"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-white"
            >
              Ver recomendaciones por ocasión
              <ArrowRight size={15} />
            </Link>
          </Card>

          {urgent.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Caducan pronto</h2>
                <Link
                  href="/alertas"
                  className="inline-flex items-center gap-1 text-sm font-bold text-primary"
                >
                  Ver todo
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="flex flex-col gap-2.5">
                {urgent.map(({ product, status }) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[0_8px_20px_-14px_rgba(36,28,38,0.2)] ring-1 ring-black/[0.03] active:scale-[0.98]"
                  >
                    <ProductSwatch
                      categoryName={product.category.name}
                      seed={product.id}
                      photoUrl={product.photo_url}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-ink">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">{product.brand}</p>
                    </div>
                    {status ? <ExpiryBadge status={status} /> : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
