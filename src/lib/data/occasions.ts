import { createClient } from "@/lib/supabase/server";
import type { Occasion } from "@/lib/types";

export async function getOccasions(): Promise<Occasion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("occasions")
    .select("*")
    .order("is_custom", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Occasion[];
}
