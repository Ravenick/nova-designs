
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- PLANS (publicly readable catalog)
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  plan_number text not null unique,
  name text not null,
  description text,
  image_url text,
  gallery jsonb default '[]'::jsonb,
  base_price numeric(10,2) not null,
  architectural_addon_price numeric(10,2) not null default 250,
  cad_addon_price numeric(10,2) not null default 500,
  sqft integer not null,
  beds integer not null,
  baths integer not null,
  half_baths integer not null default 0,
  cars integer not null default 0,
  stories integer not null default 1,
  width_ft integer not null,
  width_in integer not null default 0,
  depth_ft integer not null,
  depth_in integer not null default 0,
  style text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.plans to anon, authenticated;
grant all on public.plans to service_role;
alter table public.plans enable row level security;
create policy "plans public read" on public.plans for select using (true);

-- CART
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  file_type text not null check (file_type in ('pdf','cad_pdf')),
  include_architectural boolean not null default false,
  unit_price numeric(10,2) not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;
create policy "own cart all" on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10,2) not null,
  payment_provider text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders select" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "own orders insert" on public.orders for insert to authenticated with check (auth.uid() = user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  file_type text not null,
  include_architectural boolean not null default false,
  unit_price numeric(10,2) not null
);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "own order items select" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own order items insert" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- DOWNLOADS
create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  file_type text not null,
  include_architectural boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.downloads to authenticated;
grant all on public.downloads to service_role;
alter table public.downloads enable row level security;
create policy "own downloads select" on public.downloads for select to authenticated using (auth.uid() = user_id);
create policy "own downloads insert" on public.downloads for insert to authenticated with check (auth.uid() = user_id);
