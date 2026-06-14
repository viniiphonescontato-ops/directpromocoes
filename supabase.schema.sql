create table if not exists public.diaristas (
  id text primary key,
  name text not null,
  phone text,
  cpf text,
  sectors text,
  status text default 'Ativa',
  created_at timestamptz default now()
);

create table if not exists public.lojas_redes (
  id text primary key,
  name text not null,
  network text,
  type text,
  owner text,
  city text,
  address text,
  health text default 'Alta',
  created_at timestamptz default now()
);

create table if not exists public.demandas (
  id text primary key,
  store_id text references public.lojas_redes(id) on delete cascade,
  date date,
  sector text,
  spots integer default 1,
  daily_rate numeric(12, 2) default 0,
  worker_cost numeric(12, 2) default 0,
  assigned_diarist_ids jsonb default '[]'::jsonb,
  status text default 'Aberta',
  created_at timestamptz default now()
);

create table if not exists public.setores (
  id text primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.diarias_setor (
  id text primary key,
  sector text not null,
  min_value numeric(12, 2) default 0,
  max_value numeric(12, 2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.diarias_empresas (
  id text primary key,
  company text not null,
  value numeric(12, 2) default 0,
  created_at timestamptz default now()
);
