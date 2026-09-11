"use client";

import { useMemo, useState } from "react";
import { Wand2 } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { ProductCard } from "@/components/ui/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOccasionIcon } from "@/lib/constants";
import type { Occasion, ProductWithRelations } from "@/lib/types";

export function RecomendacionClient({
  products,
  occasions,
}: {
  products: ProductWithRelations[];
  occasions: Occasion[];
}) {
  const [occasionId, setOccasionId] = useState<string | null>(occasions[0]?.id ?? null);

  const matches = useMemo(
    () => products.filter((product) => product.occasions.some((o) => o.id === occasionId)),
    [products, occasionId],
  );

  const selectedOccasion = occasions.find((o) => o.id === occasionId);

  if (occasions.length === 0) {
    return (
      <EmptyState
        icon={Wand2}
        title="Aún no hay ocasiones"
        description="Añade una ocasión al crear un producto para verla aquí."
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {occasions.map((occasion) => (
          <Chip
            key={occasion.id}
            label={occasion.name}
            icon={getOccasionIcon(occasion.name)}
            active={occasionId === occasion.id}
            onClick={() => setOccasionId(occasion.id)}
          />
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-secondary-soft px-4 py-3 text-secondary">
        <Wand2 size={18} strokeWidth={2.25} />
        <p className="text-sm font-semibold">
          Para {selectedOccasion?.name.toLowerCase()}, esto es lo que ya tienes en tu armario.
        </p>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title="Aún no hay sugerencias para esta ocasión"
          description="Añade productos y asígnales esta ocasión para verlos aquí."
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
