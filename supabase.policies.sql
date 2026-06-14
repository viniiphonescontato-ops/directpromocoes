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
create policy "anon_select_diaristas" on public.diaristas for select to anon using (true);
create policy "anon_insert_diaristas" on public.diaristas for insert to anon with check (true);
create policy "anon_update_diaristas" on public.diaristas for update to anon using (true) with check (true);
create policy "anon_delete_diaristas" on public.diaristas for delete to anon using (true);

drop policy if exists "anon_select_lojas_redes" on public.lojas_redes;
drop policy if exists "anon_insert_lojas_redes" on public.lojas_redes;
drop policy if exists "anon_update_lojas_redes" on public.lojas_redes;
drop policy if exists "anon_delete_lojas_redes" on public.lojas_redes;
create policy "anon_select_lojas_redes" on public.lojas_redes for select to anon using (true);
create policy "anon_insert_lojas_redes" on public.lojas_redes for insert to anon with check (true);
create policy "anon_update_lojas_redes" on public.lojas_redes for update to anon using (true) with check (true);
create policy "anon_delete_lojas_redes" on public.lojas_redes for delete to anon using (true);

drop policy if exists "anon_select_demandas" on public.demandas;
drop policy if exists "anon_insert_demandas" on public.demandas;
drop policy if exists "anon_update_demandas" on public.demandas;
drop policy if exists "anon_delete_demandas" on public.demandas;
create policy "anon_select_demandas" on public.demandas for select to anon using (true);
create policy "anon_insert_demandas" on public.demandas for insert to anon with check (true);
create policy "anon_update_demandas" on public.demandas for update to anon using (true) with check (true);
create policy "anon_delete_demandas" on public.demandas for delete to anon using (true);

drop policy if exists "anon_select_setores" on public.setores;
drop policy if exists "anon_insert_setores" on public.setores;
drop policy if exists "anon_update_setores" on public.setores;
drop policy if exists "anon_delete_setores" on public.setores;
create policy "anon_select_setores" on public.setores for select to anon using (true);
create policy "anon_insert_setores" on public.setores for insert to anon with check (true);
create policy "anon_update_setores" on public.setores for update to anon using (true) with check (true);
create policy "anon_delete_setores" on public.setores for delete to anon using (true);

drop policy if exists "anon_select_diarias_setor" on public.diarias_setor;
drop policy if exists "anon_insert_diarias_setor" on public.diarias_setor;
drop policy if exists "anon_update_diarias_setor" on public.diarias_setor;
drop policy if exists "anon_delete_diarias_setor" on public.diarias_setor;
create policy "anon_select_diarias_setor" on public.diarias_setor for select to anon using (true);
create policy "anon_insert_diarias_setor" on public.diarias_setor for insert to anon with check (true);
create policy "anon_update_diarias_setor" on public.diarias_setor for update to anon using (true) with check (true);
create policy "anon_delete_diarias_setor" on public.diarias_setor for delete to anon using (true);

drop policy if exists "anon_select_diarias_empresas" on public.diarias_empresas;
drop policy if exists "anon_insert_diarias_empresas" on public.diarias_empresas;
drop policy if exists "anon_update_diarias_empresas" on public.diarias_empresas;
drop policy if exists "anon_delete_diarias_empresas" on public.diarias_empresas;
create policy "anon_select_diarias_empresas" on public.diarias_empresas for select to anon using (true);
create policy "anon_insert_diarias_empresas" on public.diarias_empresas for insert to anon with check (true);
create policy "anon_update_diarias_empresas" on public.diarias_empresas for update to anon using (true) with check (true);
create policy "anon_delete_diarias_empresas" on public.diarias_empresas for delete to anon using (true);
