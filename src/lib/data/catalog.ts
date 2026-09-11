import { createClient } from "@/lib/supabase/server";
import type { CatalogProductWithCategory } from "@/lib/types";

export async function getCatalogProducts(): Promise<CatalogProductWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catalog_products")
    .select("*, category:categories(*)")
    .order("popularity_rank", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CatalogProductWithCategory[];
}
