import { createClient } from "@/lib/supabase/server";
import type { Category, Occasion, Product, ProductWithRelations } from "@/lib/types";

interface ProductRow extends Product {
  category: Category;
  product_occasions: { occasion: Occasion }[];
}

const PRODUCT_SELECT = "*, category:categories(*), product_occasions(occasion:occasions(*))";

export async function getProducts(): Promise<ProductWithRelations[]> {
  const supabase = await createClient();

  const [{ data: products, error }, { data: usageRows }] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }),
    supabase.from("usage_logs").select("product_id"),
  ]);

  if (error) throw error;

  const usageCounts = new Map<string, number>();
  for (const row of usageRows ?? []) {
    usageCounts.set(row.product_id, (usageCounts.get(row.product_id) ?? 0) + 1);
  }

  return ((products ?? []) as ProductRow[]).map((product) => ({
    ...product,
    occasions: product.product_occasions.map((po) => po.occasion),
    usage_count: usageCounts.get(product.id) ?? 0,
  }));
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const product = data as ProductRow;

  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  return {
    ...product,
    occasions: product.product_occasions.map((po) => po.occasion),
    usage_count: count ?? 0,
  };
}
