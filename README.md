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
4. En **SQL Editor**, pega y ejecuta, EN ESTE ORDEN (cada una depende de la
   anterior):
   1. `supabase/migrations/00000000000000_init_schema.sql`
   2. `supabase/migrations/00000000000001_catalog_products.sql`
   3. `supabase/migrations/00000000000002_catalog_products_shelf_life.sql`
   4. `supabase/migrations/00000000000003_profiles_and_reviews.sql`

   Crea las tablas, activa Row Level Security y siembra las
   categorías/ocasiones predefinidas. La última también crea
   automáticamente un perfil (username provisional a partir del email) para
   cualquier usuario que ya tuvieras registrado antes de esta migración.

   Si después de ejecutar una migración sigues viendo un error tipo
   *"Could not find the '...' column ... in the schema cache"* al usar la
   app o los scripts, el schema cache de PostgREST a veces tarda unos
   segundos en refrescarse — espera un poco o fuerza el refresco en
   **Project Settings → API → Reload schema**.
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

### Ampliar el catálogo con Open Beauty Facts (opcional)

`npm run seed:catalog` ya deja la app funcional por sí solo — este paso es
opcional, solo para tener más productos donde buscar. `scripts/import-openbeautyfacts.ts`
importa productos adicionales desde [Open Beauty Facts](https://world.openbeautyfacts.org),
una base de datos abierta de cosmética, sin necesidad de API key.

Es una importación **puntual bajo demanda**, no una sincronización
automática — ni se ejecuta sola, ni hay cron ni webhook. La ejecutas tú
cuando quieras ampliar el catálogo:

```bash
npm run import:obf
```

Usa el mismo `SUPABASE_SERVICE_ROLE_KEY` que `seed:catalog`. Es idempotente
(evita duplicados por nombre+marca, tanto contra el seed manual como contra
ejecuciones anteriores de este mismo script) y respetuoso con el servidor
de Open Beauty Facts: máximo 5 páginas de 50 productos por categoría, con
una pausa entre peticiones. Al terminar imprime un resumen por categoría
(consultados / descartados por datos incompletos / duplicados / insertados).

Antes de reutilizarlo con frecuencia, abre el script y cambia el contacto
de ejemplo en `USER_AGENT` por el tuyo (es la práctica recomendada por Open
Food/Beauty Facts para identificar quién hace las peticiones).

El script no mantiene una lista de categorías "adivinada" a mano: al
arrancar descarga una vez la taxonomía real de categorías de Open Beauty
Facts y busca ahí, por palabra clave (`CATEGORY_KEYWORDS` al principio del
archivo), el tag exacto de cada una de las 9 categorías de Glowbox. Si para
alguna no encuentra ninguna coincidencia razonable, lo avisa por consola
(`⚠ No se encontró tag de taxonomía para "..."`) y la salta sin detener el
resto; si una petición a la API devuelve un error, imprime también el
cuerpo de la respuesta para poder diagnosticarlo.

## Nombre de usuario y reseñas

Al registrarte eliges un nombre de usuario (3-20 caracteres: letras,
números y guion bajo), guardado en `profiles` mediante un trigger de
Postgres sobre `auth.users` — no hace falta llamarlo a mano desde la app.
Se muestra en el header en vez del email.

Cada producto de tu armario que venga del catálogo (`catalog_product_id`
no nulo) tiene una sección de reseñas en su detalle: media de estrellas,
reseñas de otros usuarios, y la tuya propia (crear y editar son la misma
operación, un upsert). Los productos añadidos a mano no tienen
`catalog_product_id`, así que muestran un aviso en vez del formulario de
reseña — no hay a qué producto compartido asociarlas. El buscador de
"Añadir producto" también muestra la media de estrellas de cada producto
del catálogo, si tiene alguna.

Un detalle de implementación: como el username duplicado se detecta
dentro del trigger que crea el perfil (no antes de intentar el registro
— RLS no deja leer `profiles` sin estar ya autenticado), el mensaje "Ese
nombre de usuario ya está en uso" se basa en reconocer palabras clave en
el error que devuelve Supabase Auth, no en una comprobación 100%
garantizada; si alguna vez ves un error genérico en vez de ese mensaje
claro al repetir username, es por eso.

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

### Despliegue automático con cada commit (Workers Builds / Git)

Si conectaste el repo a Cloudflare desde el dashboard (Workers & Pages →
tu Worker → Settings → Builds) en vez de desplegar con Wrangler en local,
Cloudflare usa dos comandos **separados** que configuras ahí: uno de
**Build** y otro de **Deploy**. Tienen que ser:

- **Build command:** `npm run build:worker`
- **Deploy command:** `npx wrangler deploy`

Si el campo de Build command está en `npm run build` (el valor que suele
autodetectar), el build de Cloudflare corre solo `next build` — el Next.js
normal, sin adaptar al runtime de Workers — y el paso de deploy falla con
`ERROR Could not find compiled Open Next config, did you run the build
command?`, porque nunca se generó la carpeta `.open-next/` que
`wrangler deploy` necesita. `npm run build:worker` corre
`opennextjs-cloudflare build`, que sí hace ese paso (incluye el `next
build` normal y además adapta el resultado).

Además, para que el build en Cloudflare tenga acceso a
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (hacen falta
en build time para inyectarlas en el bundle del cliente), configúralas
también como variables de entorno del proyecto en esa misma pantalla de
Settings — los secrets subidos con `wrangler secret put` desde tu máquina
son para runtime, no se usan durante el build de Cloudflare.

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
- `src/lib/data` — lecturas server-side (categorías, ocasiones, productos,
  perfiles, reseñas).
- `src/lib/actions` — Server Actions: auth (login/registro/logout) y CRUD de
  productos (crear, editar, borrar, registrar uso, crear desde el catálogo,
  categorías/ocasiones personalizadas, aviso de duplicados) y reseñas
  (`upsertReview`).
- `src/components/reviews` — estrellas de solo lectura/interactivas y la
  sección de reseñas del detalle de producto.
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
- `scripts/import-openbeautyfacts.ts` — importación puntual y opcional que
  amplía el catálogo desde Open Beauty Facts (ver `npm run import:obf`).
- `wrangler.jsonc` / `open-next.config.ts` — configuración del despliegue en
  Cloudflare Workers (ver sección de despliegue más abajo).

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS v4 + lucide-react +
Supabase (`@supabase/supabase-js`, `@supabase/ssr`) + Cloudflare Workers
(`@opennextjs/cloudflare`, `wrangler`).
