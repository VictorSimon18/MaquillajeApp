"use client";

import { useMemo, useState } from "react";
import { PackageOpen, Search } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { ProductCard } from "@/components/ui/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { EXPIRY_STATUS_META, getCategoryIcon } from "@/lib/constants";
import { getExpiryStatus } from "@/lib/expiry";
import type { Category, ExpiryStatus, ProductWithRelations } from "@/lib/types";

type StatusFilter = "todos" | ExpiryStatus;

export function ArmarioClient({
  products,
  categories,
}: {
  products: ProductWithRelations[];
  categories: Category[];
}) {
  const [categoryId, setCategoryId] = useState<string | "todos">("todos");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (categoryId !== "todos" && product.category_id !== categoryId) return false;
      if (status !== "todos" && getExpiryStatus(product.opened_at, product.shelf_life_days) !== status)
        return false;
      if (
        query.trim() &&
        !`${product.name} ${product.brand}`.toLowerCase().includes(query.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [products, categoryId, status, query]);

  return (
    <div>
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
        <Chip label="Todas las categorías" active={categoryId === "todos"} onClick={() => setCategoryId("todos")} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            icon={getCategoryIcon(category.name)}
            active={categoryId === category.id}
            onClick={() => setCategoryId(category.id)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={products.length === 0 ? "Tu armario está vacío" : "No hay productos con estos filtros"}
          description={
            products.length === 0
              ? "Añade tu primer producto para empezar a llevar el control."
              : "Prueba a cambiar la categoría o el estado para ver más resultados."
          }
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
