/**
 * Seed del catálogo de productos de Glowbox (tabla `catalog_products`).
 *
 * La lista CATALOG de abajo es un punto de partida editable: añade, quita o
 * reordena entradas a mano cuando quieras ampliar el catálogo — no hace
 * falta tocar nada más, este script vuelve a sembrar su propio rango cada
 * vez que se ejecuta (borra solo las filas con popularity_rank por debajo
 * de OBF_POPULARITY_BASE e inserta el array actual, así siempre queda en
 * sync con este archivo). No toca los productos importados con
 * scripts/import-openbeautyfacts.ts (usan popularity_rank más alto).
 *
 * Usa nombres de producto y marcas reales tal y como se comercializan
 * (sin inventar marcas), pero `default_photo_url` se deja en null a
 * propósito: todavía no hay imágenes reales, y el placeholder visual
 * (color + icono según categoría) ya lo genera la interfaz sin necesidad
 * de foto. Cuando llegue la fase de fotos reales, solo hay que rellenar
 * esa columna.
 *
 * Requiere la service role key (salta RLS) porque `catalog_products` no
 * tiene política de escritura para el cliente — solo lectura autenticada
 * desde la app. NUNCA expongas esta clave en código de cliente.
 *
 * Uso:
 *   npm run seed:catalog
 *
 * (el script npm carga las variables de .env.local automáticamente con
 * `tsx --env-file=.env.local`; asegúrate de tener ahí NEXT_PUBLIC_SUPABASE_URL
 * y SUPABASE_SERVICE_ROLE_KEY — esta última la sacas de Supabase Dashboard ->
 * Project Settings -> API -> service_role)
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en tu .env.local.\n" +
      "Añade SUPABASE_SERVICE_ROLE_KEY=... (Project Settings -> API -> service_role) y vuelve a intentarlo.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface SeedEntry {
  name: string;
  brand: string;
  /** Debe coincidir EXACTO con el nombre de una fila en `categories` (ver la migración init_schema). */
  category: string;
  shade: string | null;
  popularity_rank: number;
}

const CATALOG: SeedEntry[] = [
  // Rímel
  { name: "Lash Sensational", brand: "Maybelline", category: "Rímel", shade: null, popularity_rank: 1 },
  { name: "They're Real!", brand: "Benefit Cosmetics", category: "Rímel", shade: null, popularity_rank: 6 },
  { name: "Better Than Sex", brand: "Too Faced", category: "Rímel", shade: null, popularity_rank: 10 },
  { name: "Hypnôse", brand: "Lancôme", category: "Rímel", shade: null, popularity_rank: 22 },
  { name: "Full Fat Lashes", brand: "NYX Professional Makeup", category: "Rímel", shade: null, popularity_rank: 33 },

  // Base de maquillaje
  { name: "Pro Filt'r Soft Matte", brand: "Fenty Beauty", category: "Base de maquillaje", shade: "220", popularity_rank: 2 },
  { name: "Double Wear Stay-in-Place", brand: "Estée Lauder", category: "Base de maquillaje", shade: "2C2 Pale Almond", popularity_rank: 5 },
  { name: "Superstay Full Coverage", brand: "Maybelline", category: "Base de maquillaje", shade: "128 Warm Nude", popularity_rank: 9 },
  { name: "Studio Fix Fluid", brand: "MAC Cosmetics", category: "Base de maquillaje", shade: "NC30", popularity_rank: 14 },
  { name: "Airbrush Flawless", brand: "Charlotte Tilbury", category: "Base de maquillaje", shade: "6 Neutral", popularity_rank: 20 },
  { name: "True Match", brand: "L'Oréal Paris", category: "Base de maquillaje", shade: "3.N Creamy Beige", popularity_rank: 28 },

  // Labial
  { name: "Rouge Pur Couture", brand: "Yves Saint Laurent", category: "Labial", shade: "1 Rouge Nu", popularity_rank: 3 },
  { name: "Retro Matte Lipstick", brand: "MAC Cosmetics", category: "Labial", shade: "Ruby Woo", popularity_rank: 4 },
  { name: "Superstay Matte Ink", brand: "Maybelline", category: "Labial", shade: "Pioneer", popularity_rank: 8 },
  { name: "Rouge Dior", brand: "Dior", category: "Labial", shade: "999 Rouge", popularity_rank: 12 },
  { name: "Soft Matte Lip Cream", brand: "NYX Professional Makeup", category: "Labial", shade: "San Francisco", popularity_rank: 16 },
  { name: "Lip Glow Oil", brand: "Dior", category: "Labial", shade: "001 Pink", popularity_rank: 24 },
  { name: "Pillow Talk Lipstick", brand: "Charlotte Tilbury", category: "Labial", shade: "Pillow Talk", popularity_rank: 27 },

  // Sombra de ojos
  { name: "Naked3", brand: "Urban Decay", category: "Sombra de ojos", shade: null, popularity_rank: 7 },
  { name: "Modern Renaissance", brand: "Anastasia Beverly Hills", category: "Sombra de ojos", shade: null, popularity_rank: 13 },
  { name: "The Nudes Palette", brand: "Maybelline", category: "Sombra de ojos", shade: null, popularity_rank: 19 },
  { name: "Momentville", brand: "Rare Beauty", category: "Sombra de ojos", shade: null, popularity_rank: 31 },

  // Corrector
  { name: "Radiant Creamy Concealer", brand: "NARS", category: "Corrector", shade: "Vanilla", popularity_rank: 11 },
  { name: "Instant Age Rewind", brand: "Maybelline", category: "Corrector", shade: "120 Light", popularity_rank: 15 },
  { name: "Pro Filt'r Concealer", brand: "Fenty Beauty", category: "Corrector", shade: "220", popularity_rank: 23 },
  { name: "Touche Éclat", brand: "Yves Saint Laurent", category: "Corrector", shade: "2 Ivory", popularity_rank: 29 },

  // Rubor
  { name: "Soft Pinch Liquid Blush", brand: "Rare Beauty", category: "Rubor", shade: "Joy", popularity_rank: 17 },
  { name: "Cheek to Chic", brand: "Charlotte Tilbury", category: "Rubor", shade: "Pillow Talk", popularity_rank: 21 },
  { name: "Blush Duo", brand: "NARS", category: "Rubor", shade: "Orgasm", popularity_rank: 25 },
  { name: "Puma Swede", brand: "Milani", category: "Rubor", shade: "Luminoso", popularity_rank: 38 },

  // Iluminador
  { name: "Fenty Glow", brand: "Fenty Beauty", category: "Iluminador", shade: "Trophy Wife", popularity_rank: 18 },
  { name: "Hollywood Flawless Filter", brand: "Charlotte Tilbury", category: "Iluminador", shade: "2", popularity_rank: 26 },
  { name: "Strobe Cream", brand: "MAC Cosmetics", category: "Iluminador", shade: null, popularity_rank: 34 },

  // Delineador
  { name: "Tattoo Liner", brand: "Maybelline", category: "Delineador", shade: "Deep Onyx", popularity_rank: 30 },
  { name: "Kohl Pencil", brand: "MAC Cosmetics", category: "Delineador", shade: "Feline", popularity_rank: 32 },
  { name: "Micro Precise Liquid Eyeliner", brand: "L'Oréal Paris", category: "Delineador", shade: "Black", popularity_rank: 36 },

  // Prebase (varias no tienen tono, como indica el modelo de datos)
  { name: "Photo Finish Primer", brand: "Smashbox", category: "Prebase", shade: null, popularity_rank: 35 },
  { name: "Prep + Prime Fix+", brand: "MAC Cosmetics", category: "Prebase", shade: null, popularity_rank: 39 },
  { name: "The Porefessional", brand: "Benefit Cosmetics", category: "Prebase", shade: null, popularity_rank: 40 },
];

async function main() {
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .is("user_id", null);

  if (categoriesError) {
    console.error("No se pudieron leer las categorías:", categoriesError.message);
    process.exit(1);
  }

  const categoryIdByName = new Map((categories ?? []).map((c) => [c.name, c.id as string]));
  const missingCategories = new Set<string>();

  const rows = CATALOG.flatMap((entry) => {
    const categoryId = categoryIdByName.get(entry.category);
    if (!categoryId) {
      missingCategories.add(entry.category);
      return [];
    }
    return [
      {
        name: entry.name,
        brand: entry.brand,
        category_id: categoryId,
        shade: entry.shade,
        default_photo_url: null,
        popularity_rank: entry.popularity_rank,
      },
    ];
  });

  if (missingCategories.size > 0) {
    console.error(
      `Categorías no encontradas en la base de datos: ${[...missingCategories].join(", ")}.\n` +
        "Ejecuta primero supabase/migrations/00000000000000_init_schema.sql.",
    );
    process.exit(1);
  }

  console.log("Borrando el seed manual anterior...");
  // Solo el rango del seed manual (por debajo de OBF_POPULARITY_BASE en
  // scripts/import-openbeautyfacts.ts) — no toca lo importado de Open Beauty Facts.
  const { error: deleteError } = await supabase
    .from("catalog_products")
    .delete()
    .lt("popularity_rank", 1000);

  if (deleteError) {
    console.error("No se pudo limpiar el catálogo anterior:", deleteError.message);
    process.exit(1);
  }

  console.log(`Insertando ${rows.length} productos...`);
  const { error: insertError, count } = await supabase
    .from("catalog_products")
    .insert(rows, { count: "exact" });

  if (insertError) {
    console.error("Error insertando el catálogo:", insertError.message);
    process.exit(1);
  }

  console.log(`Listo: ${count ?? rows.length} productos insertados en catalog_products.`);
}

main();
