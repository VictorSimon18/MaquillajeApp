"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Occasion } from "@/lib/types";

export interface ProductInput {
  name: string;
  brand: string;
  categoryId: string;
  shade: string;
  openedAt: string;
  shelfLifeDays: number | null;
  notes: string;
  occasionIds: string[];
}

export interface DuplicateMatch {
  id: string;
  name: string;
  brand: string;
  shade: string | null;
}

export interface ActionResult {
  error?: string;
  productId?: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function validateInput(input: ProductInput): string | null {
  if (!input.name.trim() || !input.brand.trim() || !input.categoryId) {
    return "Nombre, marca y categoría son obligatorios.";
  }
  return null;
}

/** Comparación simple de texto — no fuzzy matching, solo un aviso, no bloquea el guardado. */
export async function checkDuplicateProduct(
  brand: string,
  categoryId: string,
  shade: string,
): Promise<DuplicateMatch | null> {
  const { supabase, user } = await requireUser();
  if (!user || !brand.trim() || !categoryId) return null;

  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, shade")
    .eq("user_id", user.id)
    .eq("category_id", categoryId)
    .ilike("brand", brand.trim());

  if (error || !data || data.length === 0) return null;

  const normalizedShade = shade.trim().toLowerCase();
  if (!normalizedShade) return data[0] as DuplicateMatch;

  const match = data.find((p) => {
    const existingShade = (p.shade ?? "").trim().toLowerCase();
    return (
      existingShade.length > 0 &&
      (existingShade.includes(normalizedShade) || normalizedShade.includes(existingShade))
    );
  });

  return (match as DuplicateMatch) ?? null;
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const validationError = validateInput(input);
  if (validationError) return { error: validationError };

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      brand: input.brand.trim(),
      category_id: input.categoryId,
      shade: input.shade.trim() || null,
      opened_at: input.openedAt || null,
      shelf_life_days: input.shelfLifeDays,
      notes: input.notes.trim() || null,
    })
    .select("id")
    .single();

  if (error || !product) {
    return { error: "No se ha podido guardar el producto." };
  }

  if (input.occasionIds.length > 0) {
    const rows = input.occasionIds.map((occasion_id) => ({
      product_id: product.id,
      occasion_id,
    }));
    const { error: occasionsError } = await supabase.from("product_occasions").insert(rows);
    if (occasionsError) {
      return { productId: product.id, error: "Producto guardado, pero no se pudieron asociar las ocasiones." };
    }
  }

  revalidatePath("/armario");
  revalidatePath("/");
  return { productId: product.id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const validationError = validateInput(input);
  if (validationError) return { error: validationError };

  const { error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      brand: input.brand.trim(),
      category_id: input.categoryId,
      shade: input.shade.trim() || null,
      opened_at: input.openedAt || null,
      shelf_life_days: input.shelfLifeDays,
      notes: input.notes.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "No se ha podido actualizar el producto." };
  }

  const { error: deleteError } = await supabase
    .from("product_occasions")
    .delete()
    .eq("product_id", id);

  if (!deleteError && input.occasionIds.length > 0) {
    await supabase.from("product_occasions").insert(
      input.occasionIds.map((occasion_id) => ({ product_id: id, occasion_id })),
    );
  }

  revalidatePath("/armario");
  revalidatePath(`/producto/${id}`);
  revalidatePath("/");
  return { productId: id };
}

export async function deleteProduct(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  await supabase.from("products").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/armario");
  revalidatePath("/");
  redirect("/armario");
}

export async function logUsage(productId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { error } = await supabase
    .from("usage_logs")
    .insert({ product_id: productId, user_id: user.id });

  if (error) return { error: "No se ha podido registrar el uso." };

  revalidatePath(`/producto/${productId}`);
  return {};
}

/** Crea un producto del inventario a partir de un producto del catálogo. */
export async function createProductFromCatalog(
  catalogProductId: string,
  openedAt: string,
  occasionIds: string[],
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: catalogProductRow, error: catalogError } = await supabase
    .from("catalog_products")
    .select("name, brand, category_id, shade, default_photo_url, category:categories(default_shelf_life_days)")
    .eq("id", catalogProductId)
    .maybeSingle();

  if (catalogError || !catalogProductRow) {
    return { error: "No se ha encontrado el producto del catálogo." };
  }

  const catalogProduct = catalogProductRow as unknown as {
    name: string;
    brand: string;
    category_id: string;
    shade: string | null;
    default_photo_url: string | null;
    category: { default_shelf_life_days: number } | null;
  };

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: catalogProduct.name,
      brand: catalogProduct.brand,
      category_id: catalogProduct.category_id,
      shade: catalogProduct.shade,
      opened_at: openedAt || null,
      shelf_life_days: catalogProduct.category?.default_shelf_life_days ?? null,
      photo_url: catalogProduct.default_photo_url,
      catalog_product_id: catalogProductId,
    })
    .select("id")
    .single();

  if (error || !product) {
    return { error: "No se ha podido guardar el producto." };
  }

  if (occasionIds.length > 0) {
    const rows = occasionIds.map((occasion_id) => ({ product_id: product.id, occasion_id }));
    const { error: occasionsError } = await supabase.from("product_occasions").insert(rows);
    if (occasionsError) {
      return {
        productId: product.id,
        error: "Producto guardado, pero no se pudieron asociar las ocasiones.",
      };
    }
  }

  revalidatePath("/armario");
  revalidatePath("/");
  return { productId: product.id };
}

export async function createCustomCategory(
  name: string,
  defaultShelfLifeDays: number,
): Promise<Category | null> {
  const { supabase, user } = await requireUser();
  if (!user || !name.trim()) return null;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: name.trim(),
      default_shelf_life_days: defaultShelfLifeDays,
      is_custom: true,
    })
    .select("*")
    .single();

  if (error) return null;
  revalidatePath("/anadir");
  return data as Category;
}

export async function createCustomOccasion(name: string): Promise<Occasion | null> {
  const { supabase, user } = await requireUser();
  if (!user || !name.trim()) return null;

  const { data, error } = await supabase
    .from("occasions")
    .insert({ user_id: user.id, name: name.trim(), is_custom: true })
    .select("*")
    .single();

  if (error) return null;
  revalidatePath("/anadir");
  return data as Occasion;
}
