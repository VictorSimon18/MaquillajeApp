import Link from "next/link";
import { createElement } from "react";
import { notFound } from "next/navigation";
import { CalendarDays, MessageSquare, Pencil, Repeat, Sparkles, Timer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { ExpiryBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteProductButton } from "@/components/products/DeleteProductButton";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { getCategoryIcon, getOccasionIcon } from "@/lib/constants";
import { formatExpiryText, getExpiryStatus } from "@/lib/expiry";
import { getProductById } from "@/lib/data/products";
import { getReviewsForCatalogProduct } from "@/lib/data/reviews";
import { logUsage } from "@/lib/actions/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const status = getExpiryStatus(product.opened_at, product.shelf_life_days);
  const expiryText = formatExpiryText(product.opened_at, product.shelf_life_days);
  const productId = product.id;
  const reviewsSummary = product.catalog_product_id
    ? await getReviewsForCatalogProduct(product.catalog_product_id)
    : null;

  async function logUsageAction() {
    "use server";
    await logUsage(productId);
  }

  return (
    <div className="pt-1">
      <PageHeader title="Detalle del producto" backHref="/armario" />

      <Card className="flex flex-col items-center gap-3 text-center">
        <ProductSwatch
          categoryName={product.category.name}
          seed={product.id}
          photoUrl={product.photo_url}
          size="lg"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {product.brand}
          </p>
          <h1 className="font-display text-xl font-bold text-ink">{product.name}</h1>
          <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-ink-muted">
            {createElement(getCategoryIcon(product.category.name), { size: 14 })}
            {product.category.name}
            {product.shade ? ` · ${product.shade}` : ""}
          </p>
        </div>
        {status ? <ExpiryBadge status={status} /> : null}
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CalendarDays size={17} strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Apertura</p>
            <p className="text-sm font-semibold text-ink">
              {product.opened_at ?? "Sin registrar"}
            </p>
          </div>
        </Card>
        <Card className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
            <Timer size={17} strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Caducidad est.</p>
            <p className="text-sm font-semibold text-ink">
              {product.shelf_life_days ? `${product.shelf_life_days} días` : "Sin definir"}
            </p>
          </div>
        </Card>
        <Card className="col-span-2 flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-soft text-mint">
            <Repeat size={17} strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Uso registrado</p>
            <p className="text-sm font-semibold text-ink">
              Usado {product.usage_count} {product.usage_count === 1 ? "vez" : "veces"} ·{" "}
              {expiryText}
            </p>
          </div>
        </Card>
      </div>

      {product.occasions.length > 0 ? (
        <div className="mt-5">
          <h2 className="mb-2.5 flex items-center gap-1.5 font-display text-base font-bold text-ink">
            <Sparkles size={16} className="text-secondary" />
            Ocasiones
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.occasions.map((occasion) => (
              <span
                key={occasion.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-3.5 py-1.5 text-sm font-semibold text-secondary"
              >
                {createElement(getOccasionIcon(occasion.name), { size: 14, strokeWidth: 2.5 })}
                {occasion.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {product.notes ? (
        <div className="mt-5">
          <h2 className="mb-2 font-display text-base font-bold text-ink">Notas</h2>
          <Card>
            <p className="text-sm leading-relaxed text-ink-soft">{product.notes}</p>
          </Card>
        </div>
      ) : null}

      <div className="mt-5">
        <h2 className="mb-2.5 flex items-center gap-1.5 font-display text-base font-bold text-ink">
          <MessageSquare size={16} className="text-secondary" />
          Reseñas
        </h2>
        {product.catalog_product_id && reviewsSummary ? (
          <ReviewsSection
            catalogProductId={product.catalog_product_id}
            productId={product.id}
            summary={reviewsSummary}
          />
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Sin reseñas de otros usuarios"
            description="Este producto no está en el catálogo, así que no tiene reseñas de otros usuarios todavía."
          />
        )}
      </div>

      <form action={logUsageAction} className="mt-6">
        <Button type="submit" variant="primary" className="w-full">
          Lo he usado hoy
        </Button>
      </form>

      <div className="mt-3 flex gap-3">
        <Link href={`/producto/${product.id}/editar`} className="flex-1">
          <Button variant="ghost" className="w-full">
            <Pencil size={16} />
            Editar
          </Button>
        </Link>
        <DeleteProductButton productId={product.id} />
      </div>
    </div>
  );
}
