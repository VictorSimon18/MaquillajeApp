"use client";

import { useState } from "react";
import { Camera, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META, OCCASION_META } from "@/lib/constants";
import type { Occasion, ProductCategory } from "@/lib/types";

export default function AddProductPage() {
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleOccasion(value: Occasion) {
    setOccasions((prev) =>
      prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-soft text-mint">
          <Check size={30} strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">¡Producto añadido!</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Esto es una vista previa — todavía no se guarda de verdad.
          </p>
        </div>
        <Button variant="primary" onClick={() => setSubmitted(false)}>
          Añadir otro producto
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <PageHeader title="Añadir producto" subtitle="Guarda un nuevo producto en tu armario" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <button
          type="button"
          className="flex h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line bg-surface-muted/60 text-ink-muted transition-colors active:scale-[0.99]"
        >
          <Camera size={26} />
          <span className="text-sm font-semibold">Añadir una foto</span>
        </button>

        <Card className="flex flex-col gap-4">
          <Field label="Nombre del producto">
            <input
              type="text"
              placeholder="Ej. Labial Mate Velvet"
              className="input-field"
            />
          </Field>
          <Field label="Marca">
            <input type="text" placeholder="Ej. Studio Glow" className="input-field" />
          </Field>
          <Field label="Fecha de apertura">
            <input type="date" className="input-field" />
          </Field>
        </Card>

        <div>
          <p className="mb-2 text-sm font-bold text-ink">Categoría</p>
          <div className="flex flex-wrap gap-2">
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
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-ink">¿Para qué ocasiones?</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(OCCASION_META) as Occasion[]).map((key) => (
              <Chip
                key={key}
                label={OCCASION_META[key].label}
                icon={OCCASION_META[key].icon}
                active={occasions.includes(key)}
                onClick={() => toggleOccasion(key)}
              />
            ))}
          </div>
        </div>

        <Card>
          <Field label="Notas (opcional)">
            <textarea
              placeholder="Acabado, textura, para qué lo usas..."
              rows={3}
              className="input-field resize-none"
            />
          </Field>
        </Card>

        <Button type="submit" variant="primary" className="w-full">
          Guardar producto
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}
