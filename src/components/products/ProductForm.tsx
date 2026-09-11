"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, Check, Plus, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getCategoryIcon, getOccasionIcon } from "@/lib/constants";
import {
  checkDuplicateProduct,
  createCustomCategory,
  createCustomOccasion,
  createProduct,
  updateProduct,
  type DuplicateMatch,
  type ProductInput,
} from "@/lib/actions/products";
import type { Category, Occasion } from "@/lib/types";

export interface ProductFormValues {
  name: string;
  brand: string;
  categoryId: string;
  shade: string;
  openedAt: string;
  shelfLifeDays: string;
  notes: string;
  occasionIds: string[];
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  brand: "",
  categoryId: "",
  shade: "",
  openedAt: "",
  shelfLifeDays: "",
  notes: "",
  occasionIds: [],
};

export function ProductForm({
  mode,
  productId,
  categories: initialCategories,
  occasions: initialOccasions,
  initialValues,
}: {
  mode: "create" | "edit";
  productId?: string;
  categories: Category[];
  occasions: Occasion[];
  initialValues?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [occasions, setOccasions] = useState(initialOccasions);
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [shelfLifeTouched, setShelfLifeTouched] = useState(Boolean(initialValues?.shelfLifeDays));
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const [newOccasionName, setNewOccasionName] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function selectCategory(category: Category) {
    update("categoryId", category.id);
    if (!shelfLifeTouched) {
      update("shelfLifeDays", String(category.default_shelf_life_days));
    }
  }

  function toggleOccasion(id: string) {
    setValues((prev) => ({
      ...prev,
      occasionIds: prev.occasionIds.includes(id)
        ? prev.occasionIds.filter((o) => o !== id)
        : [...prev.occasionIds, id],
    }));
  }

  async function handleAddCategory() {
    if (!newCategoryName?.trim()) return;
    const created = await createCustomCategory(newCategoryName.trim(), 365);
    if (created) {
      setCategories((prev) => [...prev, created]);
      selectCategory(created);
    }
    setNewCategoryName(null);
  }

  async function handleAddOccasion() {
    if (!newOccasionName?.trim()) return;
    const created = await createCustomOccasion(newOccasionName.trim());
    if (created) {
      setOccasions((prev) => [...prev, created]);
      toggleOccasion(created.id);
    }
    setNewOccasionName(null);
  }

  function buildInput(): ProductInput {
    return {
      name: values.name,
      brand: values.brand,
      categoryId: values.categoryId,
      shade: values.shade,
      openedAt: values.openedAt,
      shelfLifeDays: values.shelfLifeDays ? Number(values.shelfLifeDays) : null,
      notes: values.notes,
      occasionIds: values.occasionIds,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim() || !values.brand.trim() || !values.categoryId) {
      setError("Nombre, marca y categoría son obligatorios.");
      return;
    }

    if (mode === "create" && !duplicateAcknowledged) {
      const match = await checkDuplicateProduct(values.brand, values.categoryId, values.shade);
      if (match) {
        setDuplicate(match);
        return;
      }
    }

    setSubmitting(true);
    const input = buildInput();
    const result =
      mode === "create" ? await createProduct(input) : await updateProduct(productId!, input);
    setSubmitting(false);

    if (result.error && !result.productId) {
      setError(result.error);
      return;
    }

    if (mode === "edit") {
      router.push(`/producto/${productId}`);
      return;
    }

    setSuccess(result.productId ?? null);
  }

  function continueDespiteDuplicate() {
    setDuplicateAcknowledged(true);
    setDuplicate(null);
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
          <Button
            variant="primary"
            onClick={() => {
              setValues(EMPTY_VALUES);
              setShelfLifeTouched(false);
              setDuplicateAcknowledged(false);
              setSuccess(null);
            }}
          >
            Añadir otro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {mode === "create" ? (
        <button
          type="button"
          className="flex h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line bg-surface-muted/60 text-ink-muted transition-colors active:scale-[0.99]"
        >
          <Camera size={26} />
          <span className="text-sm font-semibold">Añadir una foto</span>
        </button>
      ) : null}

      <Card className="flex flex-col gap-4">
        <Field label="Nombre del producto">
          <input
            type="text"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ej. Labial Mate Velvet"
            className="input-field"
          />
        </Field>
        <Field label="Marca">
          <input
            type="text"
            value={values.brand}
            onChange={(e) => update("brand", e.target.value)}
            placeholder="Ej. Studio Glow"
            className="input-field"
          />
        </Field>
        <Field label="Tono / color">
          <input
            type="text"
            value={values.shade}
            onChange={(e) => update("shade", e.target.value)}
            placeholder="Ej. Rosa nude 02"
            className="input-field"
          />
        </Field>
        <Field label="Fecha de apertura">
          <input
            type="date"
            value={values.openedAt}
            onChange={(e) => update("openedAt", e.target.value)}
            className="input-field"
          />
        </Field>
        <Field label="Caducidad estimada (días desde la apertura)">
          <input
            type="number"
            min={1}
            value={values.shelfLifeDays}
            onChange={(e) => {
              setShelfLifeTouched(true);
              update("shelfLifeDays", e.target.value);
            }}
            placeholder="Ej. 365"
            className="input-field"
          />
        </Field>
      </Card>

      <div>
        <p className="mb-2 text-sm font-bold text-ink">Categoría</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              icon={getCategoryIcon(category.name)}
              active={values.categoryId === category.id}
              onClick={() => selectCategory(category)}
            />
          ))}
          {newCategoryName === null ? (
            <Chip label="Nueva categoría" icon={Plus} onClick={() => setNewCategoryName("")} />
          ) : (
            <InlineAdd
              value={newCategoryName}
              onChange={setNewCategoryName}
              onConfirm={handleAddCategory}
              onCancel={() => setNewCategoryName(null)}
              placeholder="Nombre de la categoría"
            />
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-ink">¿Para qué ocasiones?</p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((occasion) => (
            <Chip
              key={occasion.id}
              label={occasion.name}
              icon={getOccasionIcon(occasion.name)}
              active={values.occasionIds.includes(occasion.id)}
              onClick={() => toggleOccasion(occasion.id)}
            />
          ))}
          {newOccasionName === null ? (
            <Chip label="Nueva ocasión" icon={Plus} onClick={() => setNewOccasionName("")} />
          ) : (
            <InlineAdd
              value={newOccasionName}
              onChange={setNewOccasionName}
              onConfirm={handleAddOccasion}
              onCancel={() => setNewOccasionName(null)}
              placeholder="Nombre de la ocasión"
            />
          )}
        </div>
      </div>

      <Card>
        <Field label="Notas (opcional)">
          <textarea
            value={values.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Acabado, textura, para qué lo usas..."
            rows={3}
            className="input-field resize-none"
          />
        </Field>
      </Card>

      {duplicate ? (
        <Card className="flex flex-col gap-3 !bg-amber-soft">
          <div className="flex items-start gap-2.5">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber" strokeWidth={2.25} />
            <p className="text-sm font-semibold text-ink">
              Ya tienes un producto parecido: {duplicate.name} ({duplicate.brand}
              {duplicate.shade ? ` · ${duplicate.shade}` : ""}).
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setDuplicate(null)}>
              Revisar
            </Button>
            <Button type="button" variant="primary" className="flex-1" onClick={continueDespiteDuplicate}>
              Guardar igualmente
            </Button>
          </div>
        </Card>
      ) : null}

      {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}

      <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
        {submitting
          ? "Guardando..."
          : mode === "create"
            ? "Guardar producto"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}

function InlineAdd({
  value,
  onChange,
  onConfirm,
  onCancel,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-36 rounded-full border border-line bg-white px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onConfirm();
          }
          if (e.key === "Escape") onCancel();
        }}
      />
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white active:scale-95"
      >
        Añadir
      </button>
    </div>
  );
}
