
-- Roles enum & table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- has_role security definer
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Update signup handler to grant admin to whitelisted emails
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  if lower(new.email) in ('nelsononuemmanuel@gmail.com', 'n3428093@gmail.com', 'joewest3714@gmail.com') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

-- Backfill existing accounts
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users
where lower(email) in ('nelsononuemmanuel@gmail.com','n3428093@gmail.com','joewest3714@gmail.com')
on conflict do nothing;

-- Admin-grants on plans
grant insert, update, delete on public.plans to authenticated;

create policy "admins manage plans insert" on public.plans
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins manage plans update" on public.plans
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins manage plans delete" on public.plans
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Admin SELECT on activity tables
create policy "admins read all orders" on public.orders
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins read all order_items" on public.order_items
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins read all downloads" on public.downloads
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins read all profiles" on public.profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
