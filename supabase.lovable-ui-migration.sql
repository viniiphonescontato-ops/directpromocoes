alter table public.diaristas
add column if not exists neighborhood text;

alter table public.demandas
add column if not exists start_time time default '08:00';

update public.demandas
set start_time = '08:00'
where start_time is null;
