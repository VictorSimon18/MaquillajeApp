-- Glowbox — catálogo de productos precargado
-- Ejecuta este archivo en Supabase Dashboard -> SQL Editor DESPUÉS de
-- 00000000000000_init_schema.sql, o con `supabase db push`.

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  shade text,
  default_photo_url text,
  popularity_rank integer not null default 999,
  created_at timestamptz not null default now()
);

create index if not exists catalog_products_category_id_idx on public.catalog_products (category_id);
create index if not exists catalog_products_popularity_rank_idx on public.catalog_products (popularity_rank);

alter table public.catalog_products enable row level security;

-- Solo lectura desde el cliente: cualquier usuario autenticado puede ver el
-- catálogo. No hay políticas de insert/update/delete a propósito — la
-- escritura se hace con scripts/seed-catalog.ts usando la service role key,
-- que salta RLS. La app nunca escribe en esta tabla.
create policy "catalog_products_select" on public.catalog_products
  for select to authenticated
  using (true);
