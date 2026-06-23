# Direct Promocoes Dashboard

Aplicativo web estatico em HTML, CSS e JavaScript puro para operacao da Direct Promocoes.

## Como abrir

Abra `index.html` no navegador depois de configurar o Supabase. Para uso real, o app exige Supabase Auth.

## Visual e uso

- Tema glass com modo claro/escuro.
- Cards compactos com sombras, bordas arredondadas e animacoes no hover.
- Dashboard com KPIs, faturamento, diarias atendidas e graficos.
- Abas funcionais para Painel, Demandas, Diaristas, Lojas & Redes, Financeiro, Configuracoes e Jarvis.
- Busca focada em Diaristas e Demandas.
- Cadastros, edicao, exclusao com confirmacao e escala basica de diaristas em demandas.

## Preparado para Supabase

Arquivos principais:

- `js/supabase-service.js`: cliente opcional do Supabase.
- `backend.config.js`: configuracao local do projeto Supabase.
- `backend.config.example.js`: exemplo de configuracao.
- `supabase.full-schema.sql`: instalacao completa recomendada, com multiempresa, tabelas, indices, validacoes, auditoria e RLS por organizacao.
- Os demais arquivos `supabase.*.sql` sao migrations antigas mantidas apenas para referencia e manutencao pontual.

## Estrutura JavaScript

O JavaScript fica organizado em `js/`:

- `js/app.js`: orquestrador principal do app.
- `js/auth.js`: fronteira do fluxo de autenticacao.
- `js/state.js`: fronteira de estado global.
- `js/storage.js`: fronteira de persistencia local segura.
- `js/supabase-service.js`: integracao Supabase.
- `js/diaristas.js`: fronteira da area de diaristas.
- `js/demandas.js`: fronteira da area de demandas.
- `js/lojas.js`: fronteira de lojas e redes.
- `js/financeiro.js`: fronteira financeira.
- `js/jarvis.js`: fronteira do assistente.
- `js/ui.js`: modais, toasts e utilitarios visuais.
- `js/utils.js`: fronteira de utilitarios gerais.

Para conectar:

1. Crie um projeto no Supabase.
2. Crie o usuario administrativo em Authentication > Users.
3. Rode apenas o conteudo de `supabase.full-schema.sql` no SQL Editor.
4. Copie a URL do projeto e a chave publica `anon`.
5. Preencha `backend.config.js`:

```js
window.DIRECT_BACKEND_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseAnonKey: "SUA_CHAVE_PUBLICA_ANON",
};
```

O app usa Supabase como fonte de verdade. Dados operacionais como diaristas, demandas, lojas e financeiro nao ficam salvos em `localStorage`; apenas preferencias nao sensiveis como tema e estado da sidebar ficam locais.

O schema completo tambem pode ser executado sobre uma instalacao existente. Ele usa comandos idempotentes, adiciona `organization_id`, `created_by`, `updated_at`, `neighborhood`, `end_date` e `start_time` quando estiverem ausentes, e move dados legados para a organizacao padrao `direct-promocoes`.

## Acesso administrativo

O sistema abre com Supabase Auth e sem opcao publica de criar conta. Usuarios devem ser criados/convocados pela administracao.

Para liberar seu acesso:

1. Crie um usuario em Authentication > Users com o email `marcosvinidirect@gmail.com`.
2. Rode `supabase.full-schema.sql` no SQL Editor.
3. Confirme na tabela `profiles` que esse usuario ficou com role `dono` e `organization_id` preenchido.

O schema completo remove todas as politicas antigas das tabelas principais e bloqueia acesso anonimo direto. A chave publica `anon` pode permanecer no frontend porque a protecao dos dados fica a cargo do Supabase Auth, das politicas RLS e do isolamento por `organization_id`.

## Multiempresa, perfis e auditoria

O arquivo `supabase.full-schema.sql` cria a base SaaS com:

- `organizations`: empresas/tenants.
- `profiles`: usuarios vinculados a uma organizacao.
- `roles`, `permissions` e `role_permissions`: base para permissoes avancadas.
- `audit_logs`: historico de alteracoes com antes/depois.
- `access_logs`: historico de login/logout.
- `plans`, `subscriptions` e `invoices`: estrutura inicial para assinatura.
- `notifications`, `whatsapp_messages`, `attachments`, `training_records` e `attendance_logs`: estrutura inicial para evoluir o SaaS.

Perfis aceitos:

- `dono`: acesso completo.
- `admin` ou `administrador`: acesso administrativo.
- `financeiro`: acesso financeiro.
- `rh`: acesso a CPF completo.
- `supervisor`, `operador` e `cliente`: operacao com dados limitados.

Todas as tabelas operacionais usam `organization_id`. As politicas RLS garantem que um usuario autenticado so leia ou altere dados da propria organizacao. Diaristas usam CPF mascarado para quem nao tem permissao de RH/admin. Financeiro so aparece para `dono`, `admin`, `administrador` e `financeiro`.

Os acessos sao registrados em `access_logs`. Inclusoes, alteracoes e exclusoes nas tabelas operacionais sao registradas automaticamente em `audit_logs`; somente administradores da organizacao podem consultar esses logs.

## O que ainda precisa de backend/Edge Functions

O schema resolve isolamento e validacao dentro do Supabase. Para producao comercial, ainda recomendo criar Edge Functions ou backend server-side para:

- convite de usuarios por e-mail;
- redefinicao de senha administrativa;
- WhatsApp oficial;
- checkout/assinaturas;
- exportacao de PDF/Excel;
- auditoria com IP real do request;
- validacoes de negocio que nao devem ficar no frontend.

## Preparado para Vercel

Arquivos de deploy:

- `vercel.json`
- `.vercelignore`
- `package.json`

Para publicar:

1. Suba a pasta para um repositorio GitHub.
2. Importe o projeto na Vercel como projeto estatico.
3. Mantenha `index.html` como entrada principal.
4. Se usar Supabase, garanta que `backend.config.js` esteja preenchido antes do deploy ou gere esse arquivo no processo de build.

Tambem e possivel publicar pela CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```
