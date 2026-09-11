import { createClient } from "@/lib/supabase/server";
import type { CatalogRating, Profile, Review, ReviewWithProfile } from "@/lib/types";

export interface ReviewsSummary {
  /** Reseñas de otros usuarios (no incluye la del usuario actual), más recientes primero. */
  reviews: ReviewWithProfile[];
  myReview: ReviewWithProfile | null;
  averageRating: number | null;
  totalCount: number;
}

/**
 * reviews.user_id referencia auth.users, no profiles, así que no hay FK
 * directa entre reviews y profiles para pedirle a PostgREST que las una en
 * una sola consulta (embed). Se resuelve con una segunda consulta + join en
 * memoria, igual que ya hace getProducts() para los usage_logs.
 */
export async function getReviewsForCatalogProduct(
  catalogProductId: string,
): Promise<ReviewsSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviewRows, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("catalog_product_id", catalogProductId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const reviews = (reviewRows ?? []) as Review[];

  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const { data: profileRows } =
    userIds.length > 0
      ? await supabase.from("profiles").select("*").in("id", userIds)
      : { data: [] as Profile[] };

  const profileById = new Map((profileRows ?? []).map((p) => [p.id, p as Profile]));

  const withProfiles: ReviewWithProfile[] = reviews.map((r) => ({
    ...r,
    profile: profileById.get(r.user_id) ?? {
      id: r.user_id,
      username: "Usuario",
      created_at: r.created_at,
    },
  }));

  const myReview = user ? (withProfiles.find((r) => r.user_id === user.id) ?? null) : null;
  const others = user ? withProfiles.filter((r) => r.user_id !== user.id) : withProfiles;

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return { reviews: others, myReview, averageRating, totalCount: reviews.length };
}

/** Media + nº de reseñas por producto de catálogo, para el badge del buscador. */
export async function getCatalogRatings(): Promise<Map<string, CatalogRating>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reviews").select("catalog_product_id, rating");

  if (error) throw error;

  const sums = new Map<string, { sum: number; count: number }>();
  for (const row of data ?? []) {
    const existing = sums.get(row.catalog_product_id) ?? { sum: 0, count: 0 };
    existing.sum += row.rating;
    existing.count += 1;
    sums.set(row.catalog_product_id, existing);
  }

  const result = new Map<string, CatalogRating>();
  for (const [id, { sum, count }] of sums) {
    result.set(id, { average: sum / count, count });
  }
  return result;
}
