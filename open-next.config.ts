import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Glowbox no usa ISR ni fetch caching (todas las rutas son dinámicas y
// leen de Supabase en cada petición), así que no hace falta configurar
// incrementalCache/tagCache/queue con R2, D1 o Durable Objects todavía.
// Si en el futuro se añade `revalidate` o páginas estáticas, revisa
// https://opennext.js.org/cloudflare/caching para añadir esos backends.
export default defineCloudflareConfig();
