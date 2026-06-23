-- Direct Promocoes - schema completo e seguro para Supabase
-- Execute este arquivo no SQL Editor do Supabase.
-- Ele consolida tabelas, multiempresa, RLS por organization_id, perfis,
-- auditoria, logs de acesso e validacoes server-side.

begin;

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'internal',
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'blocked', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.organizations (name, slug, plan, status)
values ('Direct Promocoes', 'direct-promocoes', 'internal', 'active')
on conflict (slug) do update
set name = excluded.name,
    plan = excluded.plan,
    status = excluded.status,
    updated_at = now();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  email text,
  name text not null,
  role text not null default 'operador',
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('dono', 'admin', 'administrador', 'financeiro', 'rh', 'supervisor', 'operador', 'cliente'))
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.user_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invited_by uuid references auth.users(id) on delete set null,
  email text not null,
  name text not null,
  role text not null default 'operador',
  status text not null default 'pending' check (status in ('pending', 'sent', 'accepted', 'cancelled', 'expired')),
  token_hash text,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_invites_role_check check (role in ('dono', 'admin', 'administrador', 'financeiro', 'rh', 'supervisor', 'operador', 'cliente'))
);

create table if not exists public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'completed', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.diaristas (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  cpf text,
  neighborhood text,
  sectors text,
  status text not null default 'Ativa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lojas_redes (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  network text,
  type text,
  owner text,
  city text,
  address text,
  health text default 'Alta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.demandas (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  store_id text references public.lojas_redes(id) on delete cascade,
  date date,
  end_date date,
  start_time time default '08:00',
  sector text,
  spots integer default 1,
  daily_rate numeric(12, 2) default 0,
  worker_cost numeric(12, 2) default 0,
  assigned_diarist_ids jsonb default '[]'::jsonb,
  status text default 'Aberta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.setores (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.setores drop constraint if exists setores_name_key;

create table if not exists public.diarias_setor (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  sector text not null,
  min_value numeric(12, 2) default 0,
  max_value numeric(12, 2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diarias_empresas (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  company text not null,
  value numeric(12, 2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registros_financeiros (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  diarist_id text references public.diaristas(id) on delete set null,
  diarist_name text not null,
  store text not null,
  date date not null,
  start_time time,
  end_time time,
  sector text,
  daily_value numeric(12, 2) default 0,
  transport numeric(12, 2) default 0,
  advance numeric(12, 2) default 0,
  extra_costs numeric(12, 2) default 0,
  paid boolean default false,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.access_logs (
  id bigint generated by default as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  event text not null check (event in ('login', 'logout')),
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated by default as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  monthly_price numeric(12, 2) not null default 0,
  max_users integer,
  max_demands integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(12, 2) not null default 0,
  status text not null default 'open',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  phone text not null,
  template text,
  body text not null,
  status text not null default 'draft',
  related_table text,
  related_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  related_table text,
  related_id text,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.training_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  diarist_id text references public.diaristas(id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  demand_id text references public.demandas(id) on delete cascade,
  diarist_id text references public.diaristas(id) on delete cascade,
  status text not null check (status in ('check_in', 'check_out', 'falta', 'substituicao')),
  event_at timestamptz not null default now(),
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Compatibilidade com bancos criados por versoes anteriores.
alter table public.access_logs add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.audit_logs add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.audit_logs add column if not exists user_agent text;

alter table public.profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.profiles add column if not exists organization_id uuid references public.organizations(id) on delete restrict;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists blocked boolean not null default false;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('dono', 'admin', 'administrador', 'financeiro', 'rh', 'supervisor', 'operador', 'cliente'));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'diaristas', 'lojas_redes', 'demandas', 'setores',
    'diarias_setor', 'diarias_empresas', 'registros_financeiros'
  ] loop
    execute format('alter table public.%I add column if not exists organization_id uuid references public.organizations(id) on delete restrict', table_name);
    execute format('alter table public.%I add column if not exists created_by uuid references auth.users(id) on delete set null', table_name);
    execute format('alter table public.%I add column if not exists updated_at timestamptz not null default now()', table_name);
  end loop;
end;
$$;

alter table public.diaristas add column if not exists neighborhood text;
alter table public.demandas add column if not exists end_date date;
alter table public.demandas add column if not exists start_time time default '08:00';

update public.demandas set end_date = date where end_date is null;
update public.demandas set start_time = '08:00' where start_time is null;

update public.profiles
set user_id = id
where user_id is null;

update public.profiles
set organization_id = (select id from public.organizations where slug = 'direct-promocoes')
where organization_id is null;

update public.profiles
set name = coalesce(nullif(name, ''), email, 'Usuario')
where name is null or name = '';

update public.profiles
set role = 'dono',
    email = coalesce(email, 'marcosvinidirect@gmail.com'),
    name = coalesce(name, 'Marcos Vini Direct'),
    blocked = false,
    updated_at = now()
where id in (select id from auth.users where lower(email) = 'marcosvinidirect@gmail.com');

alter table public.profiles alter column user_id set not null;
alter table public.profiles alter column organization_id set not null;
alter table public.profiles alter column name set not null;

insert into public.profiles (id, user_id, organization_id, email, name, role)
select id, id, (select id from public.organizations where slug = 'direct-promocoes'), email, coalesce(raw_user_meta_data ->> 'name', email), 'operador'
from auth.users
on conflict (id) do nothing;

update public.profiles
set role = 'dono',
    organization_id = coalesce(organization_id, (select id from public.organizations where slug = 'direct-promocoes')),
    email = coalesce(email, 'marcosvinidirect@gmail.com'),
    name = coalesce(name, 'Marcos Vini Direct'),
    blocked = false,
    updated_at = now()
where id in (select id from auth.users where lower(email) = 'marcosvinidirect@gmail.com');

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'diaristas', 'lojas_redes', 'demandas', 'setores',
    'diarias_setor', 'diarias_empresas', 'registros_financeiros'
  ] loop
    execute format(
      'update public.%I set organization_id = (select id from public.organizations where slug = %L) where organization_id is null',
      table_name,
      'direct-promocoes'
    );
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'diaristas', 'lojas_redes', 'demandas', 'setores',
    'diarias_setor', 'diarias_empresas', 'registros_financeiros'
  ] loop
    execute format('alter table public.%I alter column organization_id set not null', table_name);
  end loop;
end;
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where id = auth.uid()
    and blocked = false
  limit 1;
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid() and blocked = false), 'operador');
$$;

create or replace function public.is_direct_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in ('dono', 'admin', 'administrador');
$$;

create or replace function public.can_view_finance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in ('dono', 'admin', 'administrador', 'financeiro');
$$;

create or replace function public.can_view_full_cpf()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in ('dono', 'admin', 'administrador', 'rh');
$$;

create or replace function public.belongs_to_current_org(row_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select row_org_id is not null and row_org_id = public.current_organization_id();
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_tenant_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_org uuid := public.current_organization_id();
begin
  if auth.uid() is null then
    raise exception 'Autenticacao obrigatoria';
  end if;
  if current_org is null then
    raise exception 'Usuario sem organizacao ativa';
  end if;
  if tg_op = 'INSERT' then
    new.organization_id := coalesce(new.organization_id, current_org);
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;
  if new.organization_id is distinct from current_org then
    raise exception 'Registro fora da organizacao do usuario';
  end if;
  return new;
end;
$$;

create or replace function public.is_valid_cpf(value text)
returns boolean
language plpgsql
immutable
as $$
declare
  digits text := regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g');
  total integer;
  digit integer;
  index integer;
begin
  if length(digits) <> 11
     or digits ~ '^([0-9])\1{10}$'
     or digits in ('01234567890', '12345678909', '98765432100')
  then return false; end if;
  total := 0;
  for index in 1..9 loop total := total + substring(digits, index, 1)::integer * (11 - index); end loop;
  digit := (total * 10) % 11;
  if digit = 10 then digit := 0; end if;
  if digit <> substring(digits, 10, 1)::integer then return false; end if;
  total := 0;
  for index in 1..10 loop total := total + substring(digits, index, 1)::integer * (12 - index); end loop;
  digit := (total * 10) % 11;
  if digit = 10 then digit := 0; end if;
  return digit = substring(digits, 11, 1)::integer;
end;
$$;

create or replace function public.is_valid_phone(value text)
returns boolean
language sql
immutable
as $$
  with normalized as (select regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g') as digits)
  select length(digits) in (10, 11)
    and left(digits, 2) <> '00'
    and (length(digits) = 10 or substring(digits, 3, 1) = '9')
  from normalized;
$$;

create or replace function public.protect_diarist_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_valid_cpf(new.cpf) then
    raise exception 'CPF invalido';
  end if;
  if not public.is_valid_phone(new.phone) then
    raise exception 'Telefone invalido';
  end if;
  if tg_op = 'UPDATE'
     and old.cpf is distinct from new.cpf
     and not public.can_view_full_cpf()
  then
    raise exception 'Sem permissao para alterar CPF';
  end if;
  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_org uuid;
begin
  row_org := case
    when tg_op = 'DELETE' then old.organization_id
    else new.organization_id
  end;
  insert into public.audit_logs (organization_id, user_id, table_name, record_id, action, old_data, new_data)
  values (
    row_org,
    auth.uid(),
    tg_table_name,
    case when tg_op = 'DELETE' then old.id::text else new.id::text end,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, organization_id, email, name, role)
  values (
    new.id,
    new.id,
    (select id from public.organizations where slug = 'direct-promocoes'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    case when lower(new.email) = 'marcosvinidirect@gmail.com' then 'dono' else 'operador' end
  )
  on conflict (id) do update set
    email = excluded.email,
    user_id = excluded.user_id,
    organization_id = coalesce(public.profiles.organization_id, excluded.organization_id),
    role = case when lower(excluded.email) = 'marcosvinidirect@gmail.com' then 'dono' else public.profiles.role end,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists create_app_profile on auth.users;
create trigger create_app_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.log_app_access(event_name text, client_user_agent text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or event_name not in ('login', 'logout') then
    raise exception 'Evento de acesso invalido';
  end if;
  insert into public.access_logs (organization_id, user_id, event, user_agent)
  values (public.current_organization_id(), auth.uid(), event_name, left(client_user_agent, 500));
end;
$$;

create or replace function public.request_user_invite(invite_email text, invite_name text, invite_role text default 'operador')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_id uuid;
  current_org uuid := public.current_organization_id();
begin
  if auth.uid() is null or not public.is_direct_admin() then
    raise exception 'Sem permissao para convidar usuarios';
  end if;
  if current_org is null then
    raise exception 'Usuario sem organizacao ativa';
  end if;
  if invite_role not in ('dono', 'admin', 'administrador', 'financeiro', 'rh', 'supervisor', 'operador', 'cliente') then
    raise exception 'Perfil invalido';
  end if;
  insert into public.user_invites (organization_id, invited_by, email, name, role)
  values (current_org, auth.uid(), lower(trim(invite_email)), coalesce(nullif(trim(invite_name), ''), lower(trim(invite_email))), invite_role)
  returning id into invite_id;
  return invite_id;
end;
$$;

create or replace function public.request_password_reset(profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_id uuid;
  target_profile public.profiles%rowtype;
begin
  if auth.uid() is null or not public.is_direct_admin() then
    raise exception 'Sem permissao para redefinir senha';
  end if;
  select * into target_profile
  from public.profiles
  where id = profile_id
    and organization_id = public.current_organization_id();
  if target_profile.id is null then
    raise exception 'Usuario nao encontrado nesta organizacao';
  end if;
  insert into public.password_reset_requests (organization_id, requested_by, user_id, email)
  values (target_profile.organization_id, auth.uid(), target_profile.user_id, target_profile.email)
  returning id into request_id;
  return request_id;
end;
$$;

create or replace function public.upsert_diarista(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_org uuid := public.current_organization_id();
  existing_cpf text;
  supplied_cpf text := nullif(payload ->> 'cpf', '');
begin
  if auth.uid() is null then raise exception 'Autenticacao obrigatoria'; end if;
  if current_org is null then raise exception 'Usuario sem organizacao ativa'; end if;
  if supplied_cpf like '%*%' then supplied_cpf := null; end if;
  select cpf into existing_cpf
  from public.diaristas
  where id = payload ->> 'id'
    and organization_id = current_org;

  if existing_cpf is not null
     and supplied_cpf is not null
     and existing_cpf is distinct from supplied_cpf
     and not public.can_view_full_cpf()
  then
    raise exception 'Sem permissao para alterar CPF';
  end if;

  insert into public.diaristas (id, organization_id, created_by, name, phone, cpf, neighborhood, sectors, status)
  values (
    payload ->> 'id',
    current_org,
    auth.uid(),
    payload ->> 'name',
    payload ->> 'phone',
    coalesce(supplied_cpf, existing_cpf),
    payload ->> 'neighborhood',
    payload ->> 'sectors',
    coalesce(payload ->> 'status', 'Ativa')
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    cpf = coalesce(supplied_cpf, public.diaristas.cpf),
    neighborhood = excluded.neighborhood,
    sectors = excluded.sectors,
    status = excluded.status,
    updated_at = now()
  where public.diaristas.organization_id = current_org;
end;
$$;

create unique index if not exists setores_org_name_idx on public.setores (organization_id, lower(name));
create index if not exists profiles_organization_id_idx on public.profiles (organization_id);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists user_invites_org_status_idx on public.user_invites (organization_id, status);
create index if not exists user_invites_email_idx on public.user_invites (lower(email));
create index if not exists password_reset_requests_org_status_idx on public.password_reset_requests (organization_id, status);
create index if not exists diaristas_org_status_idx on public.diaristas (organization_id, status);
create index if not exists lojas_redes_org_idx on public.lojas_redes (organization_id);
create index if not exists demandas_org_store_idx on public.demandas (organization_id, store_id);
create index if not exists demandas_org_date_idx on public.demandas (organization_id, date);
create index if not exists demandas_org_status_idx on public.demandas (organization_id, status);
create index if not exists registros_financeiros_org_date_idx on public.registros_financeiros (organization_id, date);
create index if not exists registros_financeiros_org_paid_idx on public.registros_financeiros (organization_id, paid);
create index if not exists audit_logs_org_created_at_idx on public.audit_logs (organization_id, created_at desc);
create index if not exists access_logs_org_created_at_idx on public.access_logs (organization_id, created_at desc);
create index if not exists attendance_logs_org_demand_idx on public.attendance_logs (organization_id, demand_id);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'organizations', 'profiles', 'subscriptions', 'user_invites'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', target_table);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', target_table);
  end loop;

  foreach target_table in array array[
    'diaristas', 'lojas_redes', 'demandas', 'setores',
    'diarias_setor', 'diarias_empresas', 'registros_financeiros'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', target_table);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', target_table);
    execute format('drop trigger if exists set_tenant_fields on public.%I', target_table);
    execute format('create trigger set_tenant_fields before insert or update on public.%I for each row execute function public.set_tenant_fields()', target_table);
    execute format('drop trigger if exists audit_changes on public.%I', target_table);
    execute format('create trigger audit_changes after insert or update or delete on public.%I for each row execute function public.write_audit_log()', target_table);
  end loop;

  foreach target_table in array array[
    'user_invites', 'password_reset_requests'
  ] loop
    execute format('drop trigger if exists audit_changes on public.%I', target_table);
    execute format('create trigger audit_changes after insert or update or delete on public.%I for each row execute function public.write_audit_log()', target_table);
  end loop;
end;
$$;

drop trigger if exists protect_diarist_identity on public.diaristas;
create trigger protect_diarist_identity
before insert or update of cpf, phone on public.diaristas
for each row execute function public.protect_diarist_identity();

drop view if exists public.diaristas_masked;

create or replace view public.diaristas_masked
with (security_barrier = true)
as
select
  id,
  organization_id,
  created_by,
  name,
  phone,
  case
    when cpf is null then null
    else '***.***.***-' || right(regexp_replace(cpf, '[^0-9]', '', 'g'), 2)
  end as cpf,
  neighborhood,
  sectors,
  status,
  created_at,
  updated_at
from public.diaristas
where organization_id = public.current_organization_id();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_invites enable row level security;
alter table public.password_reset_requests enable row level security;
alter table public.diaristas enable row level security;
alter table public.lojas_redes enable row level security;
alter table public.demandas enable row level security;
alter table public.setores enable row level security;
alter table public.diarias_setor enable row level security;
alter table public.diarias_empresas enable row level security;
alter table public.registros_financeiros enable row level security;
alter table public.access_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.notifications enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.attachments enable row level security;
alter table public.training_records enable row level security;
alter table public.attendance_logs enable row level security;

-- Remove TODAS as politicas antigas destas tabelas para eliminar acesso anon/aberto.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'organizations', 'profiles', 'roles', 'permissions', 'role_permissions',
        'user_invites', 'password_reset_requests',
        'diaristas', 'lojas_redes', 'demandas', 'setores', 'diarias_setor',
        'diarias_empresas', 'registros_financeiros', 'access_logs', 'audit_logs',
        'plans', 'subscriptions', 'invoices', 'notifications', 'whatsapp_messages',
        'attachments', 'training_records', 'attendance_logs'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end;
$$;

create policy org_read_own on public.organizations
  for select to authenticated
  using (id = public.current_organization_id() or public.current_app_role() = 'dono');

create policy profiles_read_scoped on public.profiles
  for select to authenticated
  using (id = auth.uid() or (organization_id = public.current_organization_id() and public.is_direct_admin()));

create policy profiles_admin_manage on public.profiles
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.is_direct_admin())
  with check (organization_id = public.current_organization_id() and public.is_direct_admin());

create policy roles_admin_manage on public.roles
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.is_direct_admin())
  with check (organization_id = public.current_organization_id() and public.is_direct_admin());

create policy permissions_read on public.permissions
  for select to authenticated
  using (auth.uid() is not null);

create policy role_permissions_admin_manage on public.role_permissions
  for all to authenticated
  using (exists (
    select 1 from public.roles r
    where r.id = role_permissions.role_id
      and r.organization_id = public.current_organization_id()
      and public.is_direct_admin()
  ))
  with check (exists (
    select 1 from public.roles r
    where r.id = role_permissions.role_id
      and r.organization_id = public.current_organization_id()
      and public.is_direct_admin()
  ));

create policy user_invites_admin_manage on public.user_invites
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.is_direct_admin())
  with check (organization_id = public.current_organization_id() and public.is_direct_admin());

create policy password_reset_requests_admin_manage on public.password_reset_requests
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.is_direct_admin())
  with check (organization_id = public.current_organization_id() and public.is_direct_admin());

create policy diaristas_select_full on public.diaristas
  for select to authenticated
  using (public.belongs_to_current_org(organization_id) and public.can_view_full_cpf());

create policy diaristas_insert on public.diaristas
  for insert to authenticated
  with check (public.belongs_to_current_org(organization_id));

create policy diaristas_update on public.diaristas
  for update to authenticated
  using (public.belongs_to_current_org(organization_id))
  with check (public.belongs_to_current_org(organization_id));

create policy lojas_redes_org_all on public.lojas_redes
  for all to authenticated
  using (public.belongs_to_current_org(organization_id))
  with check (public.belongs_to_current_org(organization_id));

create policy demandas_org_all on public.demandas
  for all to authenticated
  using (public.belongs_to_current_org(organization_id))
  with check (public.belongs_to_current_org(organization_id));

create policy setores_org_all on public.setores
  for all to authenticated
  using (public.belongs_to_current_org(organization_id))
  with check (public.belongs_to_current_org(organization_id));

create policy diarias_setor_org_all on public.diarias_setor
  for all to authenticated
  using (public.belongs_to_current_org(organization_id))
  with check (public.belongs_to_current_org(organization_id));

create policy diarias_empresas_org_all on public.diarias_empresas
  for all to authenticated
  using (public.belongs_to_current_org(organization_id))
  with check (public.belongs_to_current_org(organization_id));

create policy registros_financeiros_org_finance on public.registros_financeiros
  for all to authenticated
  using (public.belongs_to_current_org(organization_id) and public.can_view_finance())
  with check (public.belongs_to_current_org(organization_id) and public.can_view_finance());

create policy access_logs_admin_read on public.access_logs
  for select to authenticated
  using (public.belongs_to_current_org(organization_id) and public.is_direct_admin());

create policy audit_logs_admin_read on public.audit_logs
  for select to authenticated
  using (public.belongs_to_current_org(organization_id) and public.is_direct_admin());

create policy plans_authenticated_read on public.plans
  for select to authenticated
  using (active = true or public.current_app_role() = 'dono');

create policy subscriptions_admin_read on public.subscriptions
  for select to authenticated
  using (public.belongs_to_current_org(organization_id) and public.is_direct_admin());

create policy invoices_admin_read on public.invoices
  for select to authenticated
  using (public.belongs_to_current_org(organization_id) and public.is_direct_admin());

create policy notifications_user_read on public.notifications
  for select to authenticated
  using (organization_id = public.current_organization_id() and (user_id = auth.uid() or user_id is null));

create policy notifications_admin_manage on public.notifications
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.is_direct_admin())
  with check (organization_id = public.current_organization_id() and public.is_direct_admin());

create policy whatsapp_org_all on public.whatsapp_messages
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy attachments_org_all on public.attachments
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy training_records_org_all on public.training_records
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy attendance_logs_org_all on public.attendance_logs
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select on public.diaristas_masked to authenticated;

revoke all on function public.log_app_access(text, text) from public;
grant execute on function public.log_app_access(text, text) to authenticated;
revoke all on function public.upsert_diarista(jsonb) from public;
grant execute on function public.upsert_diarista(jsonb) to authenticated;
revoke all on function public.request_user_invite(text, text, text) from public;
grant execute on function public.request_user_invite(text, text, text) to authenticated;
revoke all on function public.request_password_reset(uuid) from public;
grant execute on function public.request_password_reset(uuid) to authenticated;
revoke all on function public.current_organization_id() from public;
grant execute on function public.current_organization_id() to authenticated;
revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;
revoke all on function public.can_view_finance() from public;
grant execute on function public.can_view_finance() to authenticated;
revoke all on function public.can_view_full_cpf() from public;
grant execute on function public.can_view_full_cpf() to authenticated;

commit;
