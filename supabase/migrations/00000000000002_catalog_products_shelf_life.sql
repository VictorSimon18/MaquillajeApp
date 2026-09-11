-- Glowbox — añade shelf_life_days a catalog_products
-- Ejecuta este archivo en Supabase Dashboard -> SQL Editor DESPUÉS de
-- 00000000000001_catalog_products.sql, o con `supabase db push`.
--
-- Sin esta columna, scripts/import-openbeautyfacts.ts falla con:
-- "Could not find the 'shelf_life_days' column of 'catalog_products' in
-- the schema cache" — esa columna solo existía en `products` (el
-- inventario del usuario), nunca se creó en el catálogo público.

alter table public.catalog_products
  add column if not exists shelf_life_days integer;

-- Constraint como idempotente: Postgres no soporta
-- "add constraint if not exists" directamente.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'catalog_products_shelf_life_days_check'
  ) then
    alter table public.catalog_products
      add constraint catalog_products_shelf_life_days_check
      check (shelf_life_days is null or shelf_life_days > 0);
  end if;
end $$;
