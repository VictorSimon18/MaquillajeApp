# Glowbox

Glowbox es un armario virtual de maquillaje: un inventario personal de productos
pensado para evitar duplicados, avisar de caducidad y sugerir qué usar según la
ocasión.

Esta fase conecta la interfaz a datos reales con **Supabase** (Postgres + Auth):
modelo de datos, autenticación por email/contraseña, CRUD de productos y un
catálogo de productos precargado para añadir sin rellenar un formulario desde
cero. Las fotos reales (del catálogo y de producto), la integración con APIs
externas de belleza, el cálculo automático de alertas de caducidad y las
notificaciones se abordarán en una fase posterior.

## Configurar Supabase (pasos manuales)

1. Crea un proyecto en [supabase.com](https://supabase.com/dashboard).
2. En **Project Settings → API**, copia la `Project URL` y la clave
   `anon public`.
3. Copia `.env.local.example` a `.env.local` y rellena esas dos variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. En **SQL Editor**, pega y ejecuta el contenido de
   `supabase/migrations/00000000000000_init_schema.sql` y, a continuación,
   `supabase/migrations/00000000000001_catalog_products.sql` (en ese orden:
   el segundo depende de las categorías creadas por el primero). Crea las
   tablas, activa Row Level Security y siembra las categorías/ocasiones
   predefinidas.
5. (Recomendado para probar en local) En **Authentication → Providers →
   Email**, puedes desactivar "Confirm email" para no depender del envío de
   correos mientras desarrollas. Actívalo de nuevo antes de producción.
6. Para poblar el catálogo de productos precargados (rímel, labiales, bases...
   de marcas reconocibles), añade también `SUPABASE_SERVICE_ROLE_KEY` a tu
   `.env.local` (Project Settings → API → `service_role` — nunca la expongas
   en código de cliente) y ejecuta:
   ```bash
   npm run seed:catalog
   ```
   Es idempotente: puedes editar `scripts/seed-catalog.ts` y volver a
   ejecutarlo cuando quieras ampliar o cambiar la lista de productos.

## Desplegar en Cloudflare Workers (pasos manuales)

El proyecto está preparado para desplegarse en Cloudflare Workers con
[OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare` +
`wrangler`, ya instalados). Como usa Server Actions, sesión con cookies y
rutas dinámicas, necesita un runtime completo — no vale un export estático.

> **Aviso:** `src/proxy.ts` usa APIs de Node.js (vía `@supabase/ssr`), así
> que Cloudflare lo trata como "Node.js middleware". Al compilar con
> `opennextjs-cloudflare build` verás el aviso *"Node.js middleware support
> is experimental in cloudflare, and not officially maintained by OpenNext
> maintainers"*. En mis pruebas el build funciona bien y protege las rutas
> correctamente, pero al ser un soporte marcado como experimental por el
> propio proyecto, vale la pena probar el login/logout y el acceso a rutas
> protegidas a fondo tras cada despliegue.

1. Crea una cuenta en [dash.cloudflare.com](https://dash.cloudflare.com) si
   no tienes una (el plan gratuito de Workers es suficiente para empezar).
2. Autentica Wrangler en tu máquina:
   ```bash
   npx wrangler login
   ```
   Se abrirá el navegador para autorizar el acceso.
3. Sube las variables públicas de Supabase como secretos del Worker (se
   necesitan en build time para inyectarlas en el bundle del cliente y en
   runtime para el código de servidor). Cada comando te pedirá el valor:
   ```bash
   npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
   npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. Revisa `wrangler.jsonc`: el campo `"name"` es el nombre del Worker (y de
   subdominio `<name>.<tu-cuenta>.workers.dev` por defecto) — cámbialo si
   quieres otro. `compatibility_date` puede quedarse tal cual salvo que
   Wrangler te pida actualizarlo.
5. Despliega:
   ```bash
   npm run deploy:worker
   ```
   Esto compila con `opennextjs-cloudflare build` (adapta la build de
   Next.js al runtime de Workers) y publica con `opennextjs-cloudflare
   deploy`. Al terminar imprime la URL pública (`*.workers.dev`, o tu
   dominio si has configurado uno en el dashboard de Cloudflare).
6. Para probar el build de producción en local antes de publicarlo, usa
   `npm run preview:worker` en su lugar (misma build, pero lo sirve con
   Wrangler en local en vez de subirlo).

Nota: en este entorno de sandbox no pude ejecutar `wrangler login` ni un
despliegue real (no hay credenciales de Cloudflare ni salida de red hacia
`workers.dev`/`cloudflare.com`), así que estos pasos no están probados
end-to-end por mí — si algo falla al ejecutarlos en tu máquina, pégame el
error y lo resolvemos.

## Empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Te pedirá crear una
cuenta o iniciar sesión antes de acceder al armario.

## Estructura

- `src/app/(app)` — páginas protegidas por sesión: inicio, armario, detalle
  de producto, editar, añadir producto, recomendación y alertas.
- `src/app/(auth)` — login y registro.
- `src/proxy.ts` — protege las rutas de `(app)` y refresca la sesión en cada
  petición (convención `proxy` de Next.js, sustituye a `middleware.ts`).
- `src/lib/supabase` — clientes de Supabase para navegador, Server
  Components/Actions y el proxy.
- `src/lib/data` — lecturas server-side (categorías, ocasiones, productos).
- `src/lib/actions` — Server Actions: auth (login/registro/logout) y CRUD de
  productos (crear, editar, borrar, registrar uso, crear desde el catálogo,
  categorías/ocasiones personalizadas, aviso de duplicados).
- `src/lib/expiry.ts` — cálculo simple de días hasta caducidad a partir de
  `opened_at` + `shelf_life_days` (aritmética directa, no hay todavía un
  sistema de alertas/notificaciones automático).
- `src/components` — componentes reutilizables y los formularios/listas
  conectados a datos reales. `AddProductFlow` orquesta el flujo de "Añadir
  producto": busca en `catalog_products` primero (`CatalogSearch` +
  `CatalogConfirmForm`) y solo cae al formulario manual completo
  (`ProductForm`) si el usuario no encuentra su producto.
- `supabase/migrations` — esquema SQL (tablas, RLS, datos semilla).
- `scripts/seed-catalog.ts` — siembra `catalog_products` con una lista
  curada y editable de productos reconocibles (ver `npm run seed:catalog`).
- `wrangler.jsonc` / `open-next.config.ts` — configuración del despliegue en
  Cloudflare Workers (ver sección de despliegue más abajo).

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS v4 + lucide-react +
Supabase (`@supabase/supabase-js`, `@supabase/ssr`) + Cloudflare Workers
(`@opennextjs/cloudflare`, `wrangler`).
