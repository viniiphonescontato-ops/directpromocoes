create table if not exists public.registros_financeiros (
  id text primary key,
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
  created_at timestamptz default now()
);

alter table public.registros_financeiros enable row level security;

drop policy if exists "auth_manage_registros_financeiros" on public.registros_financeiros;
create policy "auth_manage_registros_financeiros"
on public.registros_financeiros
for all
to authenticated
using (true)
with check (true);
