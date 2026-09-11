"use client";

import { useMemo, useState } from "react";
import { PackageOpen, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { ProductCard } from "@/components/ui/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_META, EXPIRY_STATUS_META } from "@/lib/constants";
import { PRODUCTS } from "@/lib/mock-data";
import type { ExpiryStatus, ProductCategory } from "@/lib/types";

type CategoryFilter = "todos" | ProductCategory;
type StatusFilter = "todos" | ExpiryStatus;

export default function ArmarioPage() {
  const [category, setCategory] = useState<CategoryFilter>("todos");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (category !== "todos" && product.category !== category) return false;
      if (status !== "todos" && product.expiryStatus !== status) return false;
      if (
        query.trim() &&
        !`${product.name} ${product.brand}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [category, status, query]);

  return (
    <div className="pt-1">
      <PageHeader title="Mi armario" subtitle={`${PRODUCTS.length} productos guardados`} />

      <div className="relative mb-4">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por nombre o marca"
          className="w-full rounded-2xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(["todos", "active", "expiring-soon", "expired"] as StatusFilter[]).map((value) => (
          <Chip
            key={value}
            label={value === "todos" ? "Todos los estados" : EXPIRY_STATUS_META[value].label}
            active={status === value}
            onClick={() => setStatus(value)}
          />
        ))}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Chip label="Todas las categorías" active={category === "todos"} onClick={() => setCategory("todos")} />
        {(Object.keys(CATEGORY_META) as ProductCategory[]).map((key) => (
          <Chip
            key={key}
            label={CATEGORY_META[key].label}
            icon={CATEGORY_META[key].icon}
            active={category === key}
            onClick={() => setCategory(key)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No hay productos con estos filtros"
          description="Prueba a cambiar la categoría o el estado para ver más resultados."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
