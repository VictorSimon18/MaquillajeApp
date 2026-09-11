-- Glowbox — esquema inicial (categorías, ocasiones, productos, uso)
-- Ejecuta este archivo completo en Supabase Dashboard -> SQL Editor,
-- o con `supabase db push` si tienes el proyecto enlazado con la CLI.

create extension if not exists pgcrypto;

-- =========================================================
-- CATEGORIES
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  default_shelf_life_days integer not null check (default_shelf_life_days > 0),
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  constraint categories_custom_user_check check (
    (is_custom = false and user_id is null) or
    (is_custom = true and user_id is not null)
  )
);

create index if not exists categories_user_id_idx on public.categories (user_id);

-- Evita categorías globales duplicadas al re-ejecutar el seed de abajo.
create unique index if not exists categories_global_name_unique
  on public.categories (name) where user_id is null;

-- =========================================================
-- OCCASIONS
-- =========================================================
create table if not exists public.occasions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  constraint occasions_custom_user_check check (
    (is_custom = false and user_id is null) or
    (is_custom = true and user_id is not null)
  )
);

create index if not exists occasions_user_id_idx on public.occasions (user_id);

-- Evita ocasiones globales duplicadas al re-ejecutar el seed de abajo.
create unique index if not exists occasions_global_name_unique
  on public.occasions (name) where user_id is null;

-- =========================================================
-- PRODUCTS
-- =========================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  brand text not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  shade text,
  opened_at date,
  shelf_life_days integer check (shelf_life_days > 0),
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products (user_id);
create index if not exists products_category_id_idx on public.products (category_id);

-- =========================================================
-- PRODUCT_OCCASIONS (many-to-many)
-- =========================================================
create table if not exists public.product_occasions (
  product_id uuid not null references public.products (id) on delete cascade,
  occasion_id uuid not null references public.occasions (id) on delete cascade,
  primary key (product_id, occasion_id)
);

create index if not exists product_occasions_occasion_id_idx on public.product_occasions (occasion_id);

-- =========================================================
-- USAGE_LOGS
-- =========================================================
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  used_at timestamptz not null default now()
);

create index if not exists usage_logs_product_id_idx on public.usage_logs (product_id);
create index if not exists usage_logs_user_id_idx on public.usage_logs (user_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.categories enable row level security;
alter table public.occasions enable row level security;
alter table public.products enable row level security;
alter table public.product_occasions enable row level security;
alter table public.usage_logs enable row level security;

-- categories: predefinidas (user_id null) legibles por todos los
-- autenticados; cada usuario gestiona solo sus propias categorías custom.
create policy "categories_select" on public.categories
  for select to authenticated
  using (user_id is null or auth.uid() = user_id);

create policy "categories_insert" on public.categories
  for insert to authenticated
  with check (auth.uid() = user_id and is_custom = true);

create policy "categories_update" on public.categories
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete" on public.categories
  for delete to authenticated
  using (auth.uid() = user_id);

-- occasions: mismo patrón que categories.
create policy "occasions_select" on public.occasions
  for select to authenticated
  using (user_id is null or auth.uid() = user_id);

create policy "occasions_insert" on public.occasions
  for insert to authenticated
  with check (auth.uid() = user_id and is_custom = true);

create policy "occasions_update" on public.occasions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "occasions_delete" on public.occasions
  for delete to authenticated
  using (auth.uid() = user_id);

-- products: cada usuario solo ve/edita los suyos.
create policy "products_select" on public.products
  for select to authenticated
  using (auth.uid() = user_id);

create policy "products_insert" on public.products
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "products_update" on public.products
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "products_delete" on public.products
  for delete to authenticated
  using (auth.uid() = user_id);

-- product_occasions: no tiene user_id propio, se valida a través del
-- producto al que pertenece la fila.
create policy "product_occasions_select" on public.product_occasions
  for select to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_occasions.product_id and p.user_id = auth.uid()
    )
  );

create policy "product_occasions_insert" on public.product_occasions
  for insert to authenticated
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_occasions.product_id and p.user_id = auth.uid()
    )
  );

create policy "product_occasions_delete" on public.product_occasions
  for delete to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_occasions.product_id and p.user_id = auth.uid()
    )
  );

-- usage_logs: cada usuario solo ve/inserta/borra sus propios registros de uso.
create policy "usage_logs_select" on public.usage_logs
  for select to authenticated
  using (auth.uid() = user_id);

create policy "usage_logs_insert" on public.usage_logs
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "usage_logs_delete" on public.usage_logs
  for delete to authenticated
  using (auth.uid() = user_id);

-- =========================================================
-- SEED: categorías y ocasiones predefinidas (globales, sin user_id)
-- Vidas útiles de referencia estándar de la industria (en días).
-- =========================================================
insert into public.categories (name, default_shelf_life_days, is_custom, user_id)
values
  ('Rímel', 90, false, null),
  ('Base de maquillaje', 365, false, null),
  ('Labial', 730, false, null),
  ('Sombra de ojos', 730, false, null),
  ('Delineador', 180, false, null),
  ('Rubor', 730, false, null),
  ('Corrector', 365, false, null),
  ('Iluminador', 730, false, null),
  ('Prebase', 365, false, null)
on conflict (name) where user_id is null do nothing;

insert into public.occasions (name, is_custom, user_id)
values
  ('Diario', false, null),
  ('Trabajo', false, null),
  ('Noche', false, null),
  ('Evento especial', false, null),
  ('Deporte', false, null)
on conflict (name) where user_id is null do nothing;
