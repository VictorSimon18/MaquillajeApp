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
 * (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY), y que la
 * migración supabase/migrations/00000000000002_catalog_products_shelf_life.sql
 * ya esté aplicada (añade la columna shelf_life_days a catalog_products).
 *
 * ── Cómo se resuelven las categorías ────────────────────────────────────
 * En vez de mantener a mano una tabla de slugs "adivinados" (que resultó
 * estar mal: "mascaras"/"lipsticks" daban HTTP 500, "blushes"/"concealers"/
 * "highlighters" daban 0 resultados), el script descarga UNA VEZ al
 * arrancar la taxonomía real de categorías
 * (https://world.openbeautyfacts.org/categories.json) y busca, para cada
 * categoría de Glowbox, la entrada cuyo id o nombre contiene la palabra
 * clave correspondiente (CATEGORY_KEYWORDS). El tag exacto que devuelve esa
 * búsqueda es el que se usa para construir la URL de /api/v2/search — ya
 * no hay slugs inventados a mano.
 *
 * Si no encuentra ninguna coincidencia razonable para una categoría, lo
 * avisa por consola y la salta (no inventa nada ni detiene el resto del
 * script). Si una petición a la API devuelve un error, se imprime también
 * el cuerpo de la respuesta para poder diagnosticarlo.
 *
 * Nota: /categories.json pagina a 100 resultados por defecto (hay ~6500
 * categorías en total en su taxonomía), así que se pide con
 * page_size=TAXONOMY_PAGE_SIZE para traerlas de golpe en una sola
 * petición — comprobado en la práctica, no es el comportamiento por
 * defecto si se llama al endpoint sin ese parámetro.
 */
import { createClient } from "@supabase/supabase-js";

// ── Configuración ──────────────────────────────────────────────────────
const PAGE_SIZE = 50;
const MAX_PAGES_PER_CATEGORY = 5; // tope: 250 productos por categoría
const REQUEST_DELAY_MS = 400;
// /categories.json pagina por defecto a 100 resultados (comprobado en la
// práctica: hay ~6500 categorías en total). Como es una única petición al
// arrancar el script, pedimos de golpe muchas más de las que hacen falta
// para no depender de en qué posición del ranking caiga cada una de
// nuestras 9 categorías.
const TAXONOMY_PAGE_SIZE = 10000;

const POPULARITY_BASE = 1000; // el seed manual usa 1-40, así que esto siempre queda detrás
// Identifícate como pide Open Food/Beauty Facts: sustituye el contacto por
// uno real tuyo antes de usarlo de forma recurrente.
const USER_AGENT = "Glowbox - Personal makeup inventory app - contacto@ejemplo.com";

/** Categoría de Glowbox -> palabra clave a buscar en la taxonomía real de Open Beauty Facts. */
const CATEGORY_KEYWORDS: Record<string, string> = {
  "Rímel": "mascara",
  "Labial": "lipstick",
  "Base de maquillaje": "foundation",
  "Sombra de ojos": "eyeshadow",
  "Delineador": "eyeliner",
  "Rubor": "blush",
  "Corrector": "concealer",
  "Iluminador": "highlighter",
  "Prebase": "primer",
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

// ── Tipos de las respuestas de Open Beauty Facts ────────────────────────
interface ObfTaxonomyTag {
  id?: string;
  name?: string | Record<string, string>;
}

interface ObfCategoriesResponse {
  count?: number;
  tags?: ObfTaxonomyTag[];
}

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

/**
 * Descarga la taxonomía completa de categorías (una sola vez). De esta
 * llamada depende todo lo demás, así que se reintenta una vez si falla
 * (visto en la práctica: Open Beauty Facts puede devolver un 500
 * puntual/transitorio) — no es un bucle de reintentos, solo un segundo
 * intento tras una pequeña pausa antes de rendirse.
 *
 * /categories.json pagina a 100 resultados por defecto (comprobado en la
 * práctica), así que se pide explícitamente con page_size=TAXONOMY_PAGE_SIZE
 * para traer de una vez tantas como haga falta.
 */
async function fetchCategoryTaxonomy(): Promise<ObfTaxonomyTag[]> {
  const url = `https://world.openbeautyfacts.org/categories.json?page_size=${TAXONOMY_PAGE_SIZE}`;
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });

    if (response.ok) {
      const data = (await response.json()) as ObfCategoriesResponse;
      const tags = data.tags ?? [];
      if (data.count && tags.length < data.count) {
        console.warn(
          `  ⚠ Solo se descargaron ${tags.length} de ${data.count} categorías. ` +
            "Si faltan categorías de Glowbox por resolver, sube TAXONOMY_PAGE_SIZE.",
        );
      }
      return tags;
    }

    const body = await response.text().catch(() => "");
    lastError = `HTTP ${response.status}: ${body.slice(0, 300)}`;
    if (attempt === 1) {
      console.warn(`  ⚠ Intento 1 falló (${lastError}). Reintentando...`);
      await sleep(1000);
    }
  }

  throw new Error(`No se pudo descargar la taxonomía de categorías tras 2 intentos (${lastError}).`);
}

function tagMatchesKeyword(tag: ObfTaxonomyTag, keyword: string): boolean {
  if (tag.id?.toLowerCase().includes(keyword)) return true;

  if (typeof tag.name === "string") {
    return tag.name.toLowerCase().includes(keyword);
  }
  if (tag.name && typeof tag.name === "object") {
    return Object.values(tag.name).some((n) => n?.toLowerCase().includes(keyword));
  }
  return false;
}

/**
 * Busca en la taxonomía descargada el tag real para una palabra clave, y
 * devuelve el valor tal y como lo espera categories_tags_en (sin el
 * prefijo de idioma "en:"). Si hay varias coincidencias, se queda con la
 * de id más corto — normalmente es la categoría genérica ("en:lipsticks")
 * en vez de una variante más específica ("en:liquid-lipsticks").
 */
function resolveObfCategoryTag(tags: ObfTaxonomyTag[], keyword: string): string | null {
  const matches = tags.filter((tag) => tagMatchesKeyword(tag, keyword.toLowerCase()));
  if (matches.length === 0) return null;

  matches.sort((a, b) => (a.id?.length ?? Infinity) - (b.id?.length ?? Infinity));
  const id = matches[0].id;
  if (!id) return null;

  const colonIndex = id.indexOf(":");
  return colonIndex >= 0 ? id.slice(colonIndex + 1) : id;
}

async function fetchCategoryPage(
  obfCategoryTag: string,
  page: number,
): Promise<ObfSearchResponse | null> {
  const url = new URL("https://world.openbeautyfacts.org/api/v2/search");
  url.searchParams.set("categories_tags_en", obfCategoryTag);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(PAGE_SIZE));
  url.searchParams.set("fields", OBF_FIELDS);

  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `  ✗ HTTP ${response.status} en página ${page} de "${obfCategoryTag}": ${body.slice(0, 300)}`,
      );
      return null;
    }
    return (await response.json()) as ObfSearchResponse;
  } catch (err) {
    console.error(`  ✗ Error de red en página ${page} de "${obfCategoryTag}":`, (err as Error).message);
    return null;
  }
}

/** "en:12-months" -> 360, "en:6-months" -> 180, "en:15-days" -> 15... */
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
  obfTag: string | null;
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

  console.log("Descargando la taxonomía de categorías de Open Beauty Facts...");
  let taxonomyTags: ObfTaxonomyTag[];
  try {
    taxonomyTags = await fetchCategoryTaxonomy();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
  console.log(`  ${taxonomyTags.length} categorías encontradas en la taxonomía.\n`);

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

  for (const [glowboxCategory, keyword] of Object.entries(CATEGORY_KEYWORDS)) {
    const stats: CategoryStats = {
      glowboxCategory,
      obfTag: null,
      queried: 0,
      discarded: 0,
      duplicates: 0,
      inserted: 0,
    };
    statsByCategory.push(stats);

    console.log(`→ ${glowboxCategory}`);

    const categoryId = categoryIdByName.get(glowboxCategory);
    if (!categoryId) {
      console.error(
        `  ✗ La categoría "${glowboxCategory}" no existe en la base de datos. ` +
          "Ejecuta primero supabase/migrations/00000000000000_init_schema.sql.",
      );
      continue;
    }

    const obfTag = resolveObfCategoryTag(taxonomyTags, keyword);
    if (!obfTag) {
      console.warn(`  ⚠ No se encontró tag de taxonomía para "${glowboxCategory}" — la salto.`);
      continue;
    }
    stats.obfTag = obfTag;
    console.log(`  tag resuelto: "${obfTag}"`);

    const rowsToInsert: CatalogRow[] = [];

    for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
      const result = await fetchCategoryPage(obfTag, page);
      await sleep(REQUEST_DELAY_MS);

      if (!result) break; // error ya reportado por fetchCategoryPage; pasamos a la siguiente categoría

      if (result.products.length === 0) {
        if (page === 1) {
          console.warn(`  ⚠ 0 resultados para el tag "${obfTag}".`);
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
        console.error(`  ✗ Error insertando "${glowboxCategory}":`, insertError.message);
        continue;
      }
      stats.inserted = rowsToInsert.length;
    }

    console.log(
      `  ${stats.queried} consultados · ${stats.discarded} descartados (datos incompletos) · ` +
        `${stats.duplicates} ya existían · ${stats.inserted} insertados\n`,
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

  console.log("── Resumen ──────────────────────────────────────────");
  for (const s of statsByCategory) {
    const tagInfo = s.obfTag ? `tag="${s.obfTag}"` : "SIN TAG (saltada)";
    console.log(
      `${s.glowboxCategory.padEnd(20)} ${tagInfo.padEnd(28)} consultados=${s.queried}  ` +
        `descartados=${s.discarded}  duplicados=${s.duplicates}  insertados=${s.inserted}`,
    );
  }
  console.log("─────────────────────────────────────────────────────");
  console.log(
    `TOTAL  consultados=${totals.queried}  descartados=${totals.discarded}  ` +
      `duplicados=${totals.duplicates}  insertados=${totals.inserted}`,
  );
}

main();
