/**
 * Importación puntual de productos desde Open Beauty Facts hacia
 * `catalog_products`, para ampliar el catálogo curado a mano de
 * scripts/seed-catalog.ts (que sigue siendo la fuente principal: sus
 * productos usan popularity_rank bajo, así que aparecen primero en el
 * buscador de la app).
 *
 * Esto NO es una sincronización automática. Se ejecuta una vez, o cada vez
 * que decidas ampliar el catálogo a mano:
 *
 *   npm run import:obf
 *
 * Requiere las mismas variables que seed-catalog.ts en .env.local
 * (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY — ver ese script
 * para más detalle).
 *
 * ── Sobre el mapeo de categorías de Open Beauty Facts ──────────────────
 * No he podido verificar estos valores contra la API en vivo: este entorno
 * de desarrollo no tiene salida de red hacia world.openbeautyfacts.org.
 * Lo que SÍ verifiqué contra fuentes oficiales:
 *  - El endpoint correcto es /api/v2/search con el parámetro
 *    categories_tags_en=<valor en inglés> (no el antiguo /category/<slug>.json
 *    que había planteado al principio — ese es el patrón legacy que la
 *    propia documentación de Open Food/Beauty Facts desaconseja para
 *    proyectos nuevos). Fuente: docs/api/ref/api.yaml del repo
 *    openfoodfacts/openfoodfacts-server.
 *  - El formato de periods_after_opening_tags (en:<N>-month(s) /
 *    en:<N>-day(s)) — verificado contra taxonomies/periods_after_opening.txt
 *    del mismo repo.
 *  - Ojo: revisé taxonomies/beauty/categories.txt (la taxonomía "oficial"
 *    de categorías de belleza de ese repo) y, sorprendentemente, NO
 *    contiene categorías de maquillaje de color (solo higiene/cuidado de
 *    piel y pelo) — así que los valores de abajo son una estimación
 *    razonable basada en el nombre inglés habitual de cada categoría, NO
 *    una verificación 1:1 contra la taxonomía real de Open Beauty Facts.
 *
 * El script avisa por consola si una categoría devuelve 0 resultados en su
 * primera página — eso es la señal de que el valor de abajo está mal.
 * Para comprobar/corregir el valor real, visita
 * https://world.openbeautyfacts.org/categories (buscador de categorías) o
 * prueba directamente:
 *   https://world.openbeautyfacts.org/api/v2/search?categories_tags_en=TU_PRUEBA&page_size=1
 * y ajusta CATEGORY_MAP.
 */
import { createClient } from "@supabase/supabase-js";

// ── Configuración ──────────────────────────────────────────────────────
const PAGE_SIZE = 50;
const MAX_PAGES_PER_CATEGORY = 5; // tope: 250 productos por categoría
const REQUEST_DELAY_MS = 400;
const POPULARITY_BASE = 1000; // el seed manual usa 1-40, así que esto siempre queda detrás
// Identifícate como pide Open Food/Beauty Facts: sustituye el contacto por
// uno real tuyo antes de usarlo de forma recurrente.
const USER_AGENT = "Glowbox - Personal makeup inventory app - contacto@ejemplo.com";

/** Categoría Open Beauty Facts (en inglés, tal y como la espera categories_tags_en) -> categoría de Glowbox. */
const CATEGORY_MAP: Record<string, string> = {
  mascaras: "Rímel",
  lipsticks: "Labial",
  foundations: "Base de maquillaje",
  eyeshadows: "Sombra de ojos",
  eyeliners: "Delineador",
  blushes: "Rubor",
  concealers: "Corrector",
  highlighters: "Iluminador",
  primers: "Prebase",
};

const OBF_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "image_url",
  "image_front_url",
  "periods_after_opening_tags",
].join(",");

// ── Setup Supabase ──────────────────────────────────────────────────────
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

// ── Tipos de la respuesta de Open Beauty Facts ──────────────────────────
interface ObfProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  periods_after_opening_tags?: string[];
}

interface ObfSearchResponse {
  count: number;
  page: number;
  page_count: number;
  products: ObfProduct[];
}

interface CatalogRow {
  name: string;
  brand: string;
  category_id: string;
  shade: null;
  default_photo_url: string;
  shelf_life_days: number | null;
  popularity_rank: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCategoryPage(
  obfCategory: string,
  page: number,
): Promise<ObfSearchResponse | null> {
  const url = new URL("https://world.openbeautyfacts.org/api/v2/search");
  url.searchParams.set("categories_tags_en", obfCategory);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(PAGE_SIZE));
  url.searchParams.set("fields", OBF_FIELDS);

  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) {
      console.error(`  ✗ HTTP ${response.status} en página ${page} de "${obfCategory}"`);
      return null;
    }
    return (await response.json()) as ObfSearchResponse;
  } catch (err) {
    console.error(`  ✗ Error de red en página ${page} de "${obfCategory}":`, (err as Error).message);
    return null;
  }
}

/** "en:12-months" -> 365, "en:6-months" -> 180, "en:15-days" -> 15... */
function shelfLifeDaysFromPao(tags: string[] | undefined): number | null {
  if (!tags) return null;
  for (const tag of tags) {
    const match = /^en:(\d+)[- ]?(day|days|month|months)$/.exec(tag.trim().toLowerCase());
    if (match) {
      const amount = Number(match[1]);
      const isMonths = match[2].startsWith("month");
      return isMonths ? amount * 30 : amount;
    }
  }
  return null;
}

function firstBrand(brands: string | undefined): string | null {
  const first = brands?.split(",")[0]?.trim();
  return first || null;
}

interface CategoryStats {
  glowboxCategory: string;
  queried: number;
  discarded: number;
  duplicates: number;
  inserted: number;
}

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

  // Catálogo existente (manual + importaciones previas) para deduplicar por
  // nombre+marca, ignorando mayúsculas/minúsculas.
  const { data: existingProducts, error: existingError } = await supabase
    .from("catalog_products")
    .select("name, brand, popularity_rank");

  if (existingError) {
    console.error("No se pudo leer el catálogo existente:", existingError.message);
    process.exit(1);
  }

  const existingKeys = new Set(
    (existingProducts ?? []).map((p) => `${p.name.toLowerCase()}|${p.brand.toLowerCase()}`),
  );

  // Sigue numerando a partir del popularity_rank más alto ya usado por una
  // importación anterior de este script (los productos del seed manual
  // usan rangos bajos, por debajo de POPULARITY_BASE, así que se ignoran aquí).
  let maxObfPopularityRank = POPULARITY_BASE - 1;
  for (const p of existingProducts ?? []) {
    if (p.popularity_rank >= POPULARITY_BASE && p.popularity_rank > maxObfPopularityRank) {
      maxObfPopularityRank = p.popularity_rank;
    }
  }
  let nextPopularityRank = maxObfPopularityRank + 1;

  const statsByCategory: CategoryStats[] = [];

  for (const [obfCategory, glowboxCategory] of Object.entries(CATEGORY_MAP)) {
    const stats: CategoryStats = {
      glowboxCategory,
      queried: 0,
      discarded: 0,
      duplicates: 0,
      inserted: 0,
    };
    statsByCategory.push(stats);

    console.log(`\n→ ${obfCategory} (${glowboxCategory})`);

    const categoryId = categoryIdByName.get(glowboxCategory);
    if (!categoryId) {
      console.error(
        `  ✗ La categoría "${glowboxCategory}" no existe en la base de datos. ` +
          "Ejecuta primero supabase/migrations/00000000000000_init_schema.sql.",
      );
      continue;
    }

    const rowsToInsert: CatalogRow[] = [];

    for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
      const result = await fetchCategoryPage(obfCategory, page);
      await sleep(REQUEST_DELAY_MS);

      if (!result) break; // error ya reportado por fetchCategoryPage; pasamos a la siguiente categoría

      if (result.products.length === 0) {
        if (page === 1) {
          console.warn(
            `  ⚠ 0 resultados para "${obfCategory}". Puede que el nombre no coincida con la ` +
              "taxonomía real de Open Beauty Facts — revisa el comentario al principio del script.",
          );
        }
        break;
      }

      stats.queried += result.products.length;

      for (const product of result.products) {
        const name = (product.product_name || product.product_name_en || "").trim();
        const brand = firstBrand(product.brands);
        const photoUrl = product.image_url || product.image_front_url || null;

        if (!name || !brand || !photoUrl) {
          stats.discarded++;
          continue;
        }

        const key = `${name.toLowerCase()}|${brand.toLowerCase()}`;
        if (existingKeys.has(key)) {
          stats.duplicates++;
          continue;
        }
        existingKeys.add(key); // evita duplicados también dentro de esta misma tanda

        rowsToInsert.push({
          name,
          brand,
          category_id: categoryId,
          shade: null,
          default_photo_url: photoUrl,
          shelf_life_days: shelfLifeDaysFromPao(product.periods_after_opening_tags),
          popularity_rank: nextPopularityRank++,
        });
      }

      if (page >= result.page_count) break;
    }

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase.from("catalog_products").insert(rowsToInsert);
      if (insertError) {
        console.error(`  ✗ Error insertando "${obfCategory}":`, insertError.message);
        continue;
      }
      stats.inserted = rowsToInsert.length;
    }

    console.log(
      `  ${stats.queried} consultados · ${stats.discarded} descartados (datos incompletos) · ` +
        `${stats.duplicates} ya existían · ${stats.inserted} insertados`,
    );
  }

  const totals = statsByCategory.reduce(
    (acc, s) => ({
      queried: acc.queried + s.queried,
      discarded: acc.discarded + s.discarded,
      duplicates: acc.duplicates + s.duplicates,
      inserted: acc.inserted + s.inserted,
    }),
    { queried: 0, discarded: 0, duplicates: 0, inserted: 0 },
  );

  console.log("\n── Resumen ──────────────────────────────────────────");
  for (const s of statsByCategory) {
    console.log(
      `${s.glowboxCategory.padEnd(20)} consultados=${s.queried}  descartados=${s.discarded}  ` +
        `duplicados=${s.duplicates}  insertados=${s.inserted}`,
    );
  }
  console.log("─────────────────────────────────────────────────────");
  console.log(
    `TOTAL  consultados=${totals.queried}  descartados=${totals.discarded}  ` +
      `duplicados=${totals.duplicates}  insertados=${totals.inserted}`,
  );
}

main();
