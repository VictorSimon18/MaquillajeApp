"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { ProductSwatch } from "@/components/ui/ProductSwatch";
import { DuplicateWarning } from "@/components/ui/DuplicateWarning";
import { getOccasionIcon } from "@/lib/constants";
import {
  checkDuplicateProduct,
  createProductFromCatalog,
  type DuplicateMatch,
} from "@/lib/actions/products";
import type { CatalogProductWithCategory, Occasion } from "@/lib/types";

export function CatalogConfirmForm({
  catalogProduct,
  occasions,
  onBack,
  onAddAnother,
}: {
  catalogProduct: CatalogProductWithCategory;
  occasions: Occasion[];
  onBack: () => void;
  onAddAnother: () => void;
}) {
  const router = useRouter();
  const [openedAt, setOpenedAt] = useState("");
  const [occasionIds, setOccasionIds] = useState<string[]>([]);
  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function toggleOccasion(id: string) {
    setOccasionIds((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  }

  async function handleConfirm() {
    setError(null);

    if (!duplicateAcknowledged) {
      const match = await checkDuplicateProduct(
        catalogProduct.brand,
        catalogProduct.category_id,
        catalogProduct.shade ?? "",
      );
      if (match) {
        setDuplicate(match);
        return;
      }
    }

    setSubmitting(true);
    const result = await createProductFromCatalog(catalogProduct.id, openedAt, occasionIds);
    setSubmitting(false);

    if (result.error && !result.productId) {
      setError(result.error);
      return;
    }
    setSuccess(result.productId ?? null);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-soft text-mint">
          <Check size={30} strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">¡Producto añadido!</h1>
          <p className="mt-1 text-sm text-ink-muted">Ya forma parte de tu armario.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.push(`/producto/${success}`)}>
            Ver producto
          </Button>
          <Button variant="primary" onClick={onAddAnother}>
            Añadir otro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-bold text-ink-muted active:scale-95"
      >
        <ChevronLeft size={16} />
        Volver a buscar
      </button>

      <Card className="flex items-center gap-3">
        <ProductSwatch categoryName={catalogProduct.category.name} seed={catalogProduct.id} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {catalogProduct.brand}
          </p>
          <p className="font-display text-base font-bold leading-snug text-ink">
            {catalogProduct.name}
          </p>
          <p className="text-xs text-ink-muted">
            {catalogProduct.category.name}
            {catalogProduct.shade ? ` · ${catalogProduct.shade}` : ""} · caduca a los{" "}
            {catalogProduct.category.default_shelf_life_days} días de abrirlo
          </p>
        </div>
      </Card>

      <Card>
        <Field label="Fecha de apertura">
          <input
            type="date"
            value={openedAt}
            onChange={(e) => setOpenedAt(e.target.value)}
            className="input-field"
          />
        </Field>
      </Card>

      <div>
        <p className="mb-2 text-sm font-bold text-ink">¿Para qué ocasiones?</p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((occasion) => (
            <Chip
              key={occasion.id}
              label={occasion.name}
              icon={getOccasionIcon(occasion.name)}
              active={occasionIds.includes(occasion.id)}
              onClick={() => toggleOccasion(occasion.id)}
            />
          ))}
        </div>
      </div>

      {duplicate ? (
        <DuplicateWarning
          duplicate={duplicate}
          onReview={() => setDuplicate(null)}
          onConfirmAnyway={() => {
            setDuplicateAcknowledged(true);
            setDuplicate(null);
          }}
        />
      ) : null}

      {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}

      <Button variant="primary" className="w-full" disabled={submitting} onClick={handleConfirm}>
        {submitting ? "Guardando..." : "Guardar en mi armario"}
      </Button>
    </div>
  );
}
