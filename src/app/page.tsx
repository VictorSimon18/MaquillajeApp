import Link from "next/link";
import { ArrowRight, Bell, PackageSearch, Wand2 } from "lucide-react";
import { PRODUCTS, DASHBOARD_SUGGESTION } from "@/lib/mock-data";
import { StatCard } from "@/components/ui/StatCard";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { Card } from "@/components/ui/Card";
import { ExpiryBadge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const total = PRODUCTS.length;
  const expiringSoon = PRODUCTS.filter((p) => p.expiryStatus === "expiring-soon");
  const expired = PRODUCTS.filter((p) => p.expiryStatus === "expired");
  const alerts = [...expired, ...expiringSoon].slice(0, 3);
  const suggestionProducts = DASHBOARD_SUGGESTION.productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  return (
    <div className="flex flex-col gap-6 pt-1">
      <div>
        <p className="text-sm font-medium text-ink-muted">Hola de nuevo 👋</p>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Tu armario en un vistazo
        </h1>
      </div>

      <div className="flex gap-3">
        <StatCard label="Productos" value={total} icon={PackageSearch} tone="primary" />
        <StatCard
          label="Caducan pronto"
          value={expiringSoon.length}
          icon={Bell}
          tone="amber"
        />
        <StatCard label="Caducados" value={expired.length} icon={Bell} tone="coral" />
      </div>

      <Card className="!bg-secondary text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Wand2 size={18} strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/75">
              Sugerencia de hoy
            </p>
            <p className="font-display text-base font-bold leading-tight">
              {DASHBOARD_SUGGESTION.occasionLabel}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {suggestionProducts.map((product) => (
            <div
              key={product.id}
              className="flex w-28 shrink-0 flex-col items-center gap-2 rounded-2xl bg-white/10 p-3 text-center"
            >
              <ProductSwatch category={product.category} colorHex={product.colorHex} size="sm" />
              <p className="text-xs font-semibold leading-tight">{product.name}</p>
            </div>
          ))}
        </div>

        <Link
          href="/recomendacion"
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-white"
        >
          Ver más recomendaciones
          <ArrowRight size={15} />
        </Link>
      </Card>

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
          {alerts.map((product) => (
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
                <p className="truncate text-xs text-ink-muted">{product.expiryText}</p>
              </div>
              <ExpiryBadge status={product.expiryStatus} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
