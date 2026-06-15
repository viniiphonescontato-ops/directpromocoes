alter table public.demandas
  add column if not exists end_date date;

update public.demandas
set end_date = date
where end_date is null;
