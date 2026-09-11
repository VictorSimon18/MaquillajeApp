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

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS v4 + lucide-react +
Supabase (`@supabase/supabase-js`, `@supabase/ssr`).
