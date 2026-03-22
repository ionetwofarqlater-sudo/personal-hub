create extension if not exists "pgcrypto";

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('text', 'link', 'file', 'image', 'voice')),
  title text,
  content text,
  source_url text,
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'dark',
  locale text not null default 'uk-UA',
  city text,
  time_format text not null default '24h',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists saved_items_user_id_created_at_idx on public.saved_items (user_id, created_at desc);
create index if not exists saved_items_tags_gin_idx on public.saved_items using gin (tags);
create index if not exists admin_audit_logs_actor_id_created_at_idx on public.admin_audit_logs (actor_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saved_items_set_updated_at on public.saved_items;
create trigger saved_items_set_updated_at
before update on public.saved_items
for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
before update on public.user_roles
for each row execute function public.set_updated_at();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = uid and ur.role = 'admin'
  );
$$;

alter table public.saved_items enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_roles enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "saved_items_select_own" on public.saved_items;
create policy "saved_items_select_own"
on public.saved_items
for select
using (auth.uid() = user_id);

drop policy if exists "saved_items_insert_own" on public.saved_items;
create policy "saved_items_insert_own"
on public.saved_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "saved_items_update_own" on public.saved_items;
create policy "saved_items_update_own"
on public.saved_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "saved_items_delete_own" on public.saved_items;
create policy "saved_items_delete_own"
on public.saved_items
for delete
using (auth.uid() = user_id);

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
on public.user_settings
for select
using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
on public.user_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
on public.user_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own"
on public.user_settings
for delete
using (auth.uid() = user_id);

drop policy if exists "user_roles_select_self_or_admin" on public.user_roles;
create policy "user_roles_select_self_or_admin"
on public.user_roles
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "user_roles_insert_admin" on public.user_roles;
create policy "user_roles_insert_admin"
on public.user_roles
for insert
with check (public.is_admin(auth.uid()));

drop policy if exists "user_roles_update_admin" on public.user_roles;
create policy "user_roles_update_admin"
on public.user_roles
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "user_roles_delete_admin" on public.user_roles;
create policy "user_roles_delete_admin"
on public.user_roles
for delete
using (public.is_admin(auth.uid()));

drop policy if exists "admin_audit_logs_select_admin" on public.admin_audit_logs;
create policy "admin_audit_logs_select_admin"
on public.admin_audit_logs
for select
using (public.is_admin(auth.uid()));

drop policy if exists "admin_audit_logs_insert_admin" on public.admin_audit_logs;
create policy "admin_audit_logs_insert_admin"
on public.admin_audit_logs
for insert
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_audit_logs_update_admin" on public.admin_audit_logs;
create policy "admin_audit_logs_update_admin"
on public.admin_audit_logs
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_audit_logs_delete_admin" on public.admin_audit_logs;
create policy "admin_audit_logs_delete_admin"
on public.admin_audit_logs
for delete
using (public.is_admin(auth.uid()));
