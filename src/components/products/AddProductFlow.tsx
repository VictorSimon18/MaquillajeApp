"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { CatalogSearch } from "./CatalogSearch";
import { CatalogConfirmForm } from "./CatalogConfirmForm";
import { ProductForm } from "./ProductForm";
import type { CatalogProductWithCategory, CatalogRating, Category, Occasion } from "@/lib/types";

type Step = "search" | "confirm" | "manual";

export function AddProductFlow({
  categories,
  occasions,
  catalogProducts,
  ratings,
}: {
  categories: Category[];
  occasions: Occasion[];
  catalogProducts: CatalogProductWithCategory[];
  ratings: Record<string, CatalogRating>;
}) {
  const [step, setStep] = useState<Step>("search");
  const [selected, setSelected] = useState<CatalogProductWithCategory | null>(null);

  if (step === "confirm" && selected) {
    return (
      <CatalogConfirmForm
        catalogProduct={selected}
        occasions={occasions}
        onBack={() => setStep("search")}
        onAddAnother={() => {
          setSelected(null);
          setStep("search");
        }}
      />
    );
  }

  if (step === "manual") {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setStep("search")}
          className="flex items-center gap-1 text-sm font-bold text-ink-muted active:scale-95"
        >
          <ChevronLeft size={16} />
          Volver a buscar en el catálogo
        </button>
        <ProductForm mode="create" categories={categories} occasions={occasions} />
      </div>
    );
  }

  return (
    <CatalogSearch
      products={catalogProducts}
      ratings={ratings}
      onSelect={(product) => {
        setSelected(product);
        setStep("confirm");
      }}
      onManual={() => setStep("manual")}
    />
  );
}
