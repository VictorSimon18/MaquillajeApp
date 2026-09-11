import { notFound } from "next/navigation";
import { CalendarDays, Repeat, Sparkles, Timer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { ExpiryBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META, OCCASION_META } from "@/lib/constants";
import { PRODUCTS } from "@/lib/mock-data";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <div className="pt-1">
      <PageHeader title="Detalle del producto" backHref="/armario" />

      <Card className="flex flex-col items-center gap-3 text-center">
        <ProductSwatch category={product.category} colorHex={product.colorHex} size="lg" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {product.brand}
          </p>
          <h1 className="font-display text-xl font-bold text-ink">{product.name}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            {CATEGORY_META[product.category].label}
          </p>
        </div>
        <ExpiryBadge status={product.expiryStatus} />
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CalendarDays size={17} strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Apertura</p>
            <p className="text-sm font-semibold text-ink">{product.openedDateLabel}</p>
          </div>
        </Card>
        <Card className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
            <Timer size={17} strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Caducidad est.</p>
            <p className="text-sm font-semibold text-ink">{product.expiryDateLabel}</p>
          </div>
        </Card>
        <Card className="col-span-2 flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-soft text-mint">
            <Repeat size={17} strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Uso registrado</p>
            <p className="text-sm font-semibold text-ink">
              Usado {product.usageCount} veces · {product.expiryText}
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <h2 className="mb-2.5 flex items-center gap-1.5 font-display text-base font-bold text-ink">
          <Sparkles size={16} className="text-secondary" />
          Ocasiones
        </h2>
        <div className="flex flex-wrap gap-2">
          {product.occasions.map((occasion) => {
            const meta = OCCASION_META[occasion];
            return (
              <span
                key={occasion}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-3.5 py-1.5 text-sm font-semibold text-secondary"
              >
                <meta.icon size={14} strokeWidth={2.5} />
                {meta.label}
              </span>
            );
          })}
        </div>
      </div>

      {product.notes ? (
        <div className="mt-5">
          <h2 className="mb-2 font-display text-base font-bold text-ink">Notas</h2>
          <Card>
            <p className="text-sm leading-relaxed text-ink-soft">{product.notes}</p>
          </Card>
        </div>
      ) : null}

      <div className="mt-6 flex gap-3">
        <Button variant="ghost" className="flex-1">
          Editar
        </Button>
        <Button variant="primary" className="flex-1">
          Marcar como usado hoy
        </Button>
      </div>
    </div>
  );
}
