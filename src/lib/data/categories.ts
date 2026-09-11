import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("is_custom", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}
