alter table public.diaristas enable row level security;
alter table public.lojas_redes enable row level security;
alter table public.demandas enable row level security;
alter table public.setores enable row level security;
alter table public.diarias_setor enable row level security;
alter table public.diarias_empresas enable row level security;

drop policy if exists "anon_select_diaristas" on public.diaristas;
drop policy if exists "anon_insert_diaristas" on public.diaristas;
drop policy if exists "anon_update_diaristas" on public.diaristas;
drop policy if exists "anon_delete_diaristas" on public.diaristas;
drop policy if exists "auth_manage_diaristas" on public.diaristas;
create policy "auth_manage_diaristas" on public.diaristas for all to authenticated using (true) with check (true);

drop policy if exists "anon_select_lojas_redes" on public.lojas_redes;
drop policy if exists "anon_insert_lojas_redes" on public.lojas_redes;
drop policy if exists "anon_update_lojas_redes" on public.lojas_redes;
drop policy if exists "anon_delete_lojas_redes" on public.lojas_redes;
drop policy if exists "auth_manage_lojas_redes" on public.lojas_redes;
create policy "auth_manage_lojas_redes" on public.lojas_redes for all to authenticated using (true) with check (true);

drop policy if exists "anon_select_demandas" on public.demandas;
drop policy if exists "anon_insert_demandas" on public.demandas;
drop policy if exists "anon_update_demandas" on public.demandas;
drop policy if exists "anon_delete_demandas" on public.demandas;
drop policy if exists "auth_manage_demandas" on public.demandas;
create policy "auth_manage_demandas" on public.demandas for all to authenticated using (true) with check (true);

drop policy if exists "anon_select_setores" on public.setores;
drop policy if exists "anon_insert_setores" on public.setores;
drop policy if exists "anon_update_setores" on public.setores;
drop policy if exists "anon_delete_setores" on public.setores;
drop policy if exists "auth_manage_setores" on public.setores;
create policy "auth_manage_setores" on public.setores for all to authenticated using (true) with check (true);

drop policy if exists "anon_select_diarias_setor" on public.diarias_setor;
drop policy if exists "anon_insert_diarias_setor" on public.diarias_setor;
drop policy if exists "anon_update_diarias_setor" on public.diarias_setor;
drop policy if exists "anon_delete_diarias_setor" on public.diarias_setor;
drop policy if exists "auth_manage_diarias_setor" on public.diarias_setor;
create policy "auth_manage_diarias_setor" on public.diarias_setor for all to authenticated using (true) with check (true);

drop policy if exists "anon_select_diarias_empresas" on public.diarias_empresas;
drop policy if exists "anon_insert_diarias_empresas" on public.diarias_empresas;
drop policy if exists "anon_update_diarias_empresas" on public.diarias_empresas;
drop policy if exists "anon_delete_diarias_empresas" on public.diarias_empresas;
drop policy if exists "auth_manage_diarias_empresas" on public.diarias_empresas;
create policy "auth_manage_diarias_empresas" on public.diarias_empresas for all to authenticated using (true) with check (true);
