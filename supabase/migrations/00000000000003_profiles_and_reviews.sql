-- Glowbox — perfiles de usuario, vínculo inventario↔catálogo y reseñas
-- Ejecuta este archivo en Supabase Dashboard -> SQL Editor DESPUÉS de
-- 00000000000002_catalog_products_shelf_life.sql.

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_format_check check (username ~ '^[A-Za-z0-9_]{3,20}$')
);

-- Único ignorando mayúsculas/minúsculas (evita "Foo" y "foo" a la vez).
create unique index if not exists profiles_username_unique on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select to authenticated
  using (true);

create policy "profiles_update" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Sin política de insert/delete a propósito: la fila la crea el trigger de
-- abajo (security definer, salta RLS) al registrarse. La app nunca inserta
-- en profiles directamente.

-- Crea el perfil automáticamente al registrarse, leyendo el username de
-- los metadatos que manda supabase.auth.signUp({ options: { data: { username } } }).
-- security definer: corre con permisos elevados porque se ejecuta dentro
-- de la misma transacción que crea el usuario, antes de que exista sesión
-- alguna con la que insertar en profiles respetando RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: crea perfil para cuentas que ya existían antes de esta
-- migración (el trigger de arriba solo aplica a altas nuevas). Usa la
-- parte local del email + un sufijo del id para un username provisional
-- único; no hay pantalla de edición de perfil todavía, así que si quieres
-- cambiarlo hazlo a mano en la tabla por ahora.
insert into public.profiles (id, username)
select
  u.id,
  left(
    regexp_replace(split_part(u.email, '@', 1), '[^A-Za-z0-9_]', '_', 'g') || '_' || substr(u.id::text, 1, 6),
    20
  )
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- =========================================================
-- PRODUCTS: vínculo con el producto de catálogo del que proviene
-- =========================================================
alter table public.products
  add column if not exists catalog_product_id uuid references public.catalog_products (id) on delete set null;

create index if not exists products_catalog_product_id_idx on public.products (catalog_product_id);

-- =========================================================
-- REVIEWS
-- =========================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  catalog_product_id uuid not null references public.catalog_products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_catalog_product_user_unique unique (catalog_product_id, user_id)
);

create index if not exists reviews_catalog_product_id_idx on public.reviews (catalog_product_id);
create index if not exists reviews_user_id_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

create policy "reviews_select" on public.reviews
  for select to authenticated
  using (true);

create policy "reviews_insert" on public.reviews
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "reviews_update" on public.reviews
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reviews_delete" on public.reviews
  for delete to authenticated
  using (auth.uid() = user_id);

-- Mantiene updated_at al día tanto en updates directos como en la rama
-- "update" de un upsert (la app usa upsert sobre catalog_product_id+user_id
-- para que crear y editar reseña sean la misma operación).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();
