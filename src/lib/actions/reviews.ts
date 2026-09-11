"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ReviewActionResult {
  error?: string;
}

/** Crear y editar son la misma operación: upsert sobre (catalog_product_id, user_id). */
export async function upsertReview(
  catalogProductId: string,
  productId: string,
  rating: number,
  comment: string,
): Promise<ReviewActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Selecciona una puntuación entre 1 y 5 estrellas." };
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      catalog_product_id: catalogProductId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    },
    { onConflict: "catalog_product_id,user_id" },
  );

  if (error) return { error: "No se ha podido guardar la reseña." };

  revalidatePath(`/producto/${productId}`);
  revalidatePath("/anadir");
  return {};
}
