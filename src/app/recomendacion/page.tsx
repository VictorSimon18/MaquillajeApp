"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { ProductCard } from "@/components/ui/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { OCCASION_META } from "@/lib/constants";
import { PRODUCTS } from "@/lib/mock-data";
import type { Occasion } from "@/lib/types";

export default function RecomendacionPage() {
  const [occasion, setOccasion] = useState<Occasion>("diario");

  const matches = PRODUCTS.filter((product) => product.occasions.includes(occasion));

  return (
    <div className="pt-1">
      <PageHeader
        title="Recomendación"
        subtitle="Elige una ocasión y te sugerimos qué usar"
      />

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(Object.keys(OCCASION_META) as Occasion[]).map((key) => (
          <Chip
            key={key}
            label={OCCASION_META[key].label}
            icon={OCCASION_META[key].icon}
            active={occasion === key}
            onClick={() => setOccasion(key)}
          />
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-secondary-soft px-4 py-3 text-secondary">
        <Wand2 size={18} strokeWidth={2.25} />
        <p className="text-sm font-semibold">
          Para {OCCASION_META[occasion].label.toLowerCase()}, esto es lo que ya tienes en
          tu armario.
        </p>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title="Aún no hay sugerencias para esta ocasión"
          description="Añade productos y asígnales una ocasión para verlos aquí."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {matches.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
