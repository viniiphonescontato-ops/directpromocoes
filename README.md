# Direct Promoções Dashboard

Aplicativo web estático em HTML, CSS e JavaScript puro para operação da Direct Promoções.

## Como abrir

Abra `index.html` no navegador. O app continua funcionando localmente com `localStorage`.

## Visual e uso

- Tema glass com modo claro/escuro.
- Cards compactos com sombras, bordas arredondadas e animações no hover.
- Dashboard com KPIs, faturamento, diárias atendidas e gráficos de pizza/rosca.
- Abas funcionais para Diaristas, Demandas, Lojas & Redes, Financeiro e Configurações.
- Busca focada em Diaristas e Demandas.
- Cadastros, edição, exclusão e escala básica de diaristas em demandas.

## Preparado para Supabase

Arquivos adicionados:

- `supabase-client.js`: cliente opcional do Supabase.
- `backend.config.js`: configuração local do projeto Supabase.
- `backend.config.example.js`: exemplo de configuração.
- `supabase.full-schema.sql`: instalação completa recomendada, com tabelas, colunas, índices e RLS.
- Os demais arquivos `supabase.*.sql` são migrations antigas mantidas para referência e manutenção pontual.

Para conectar:

1. Crie um projeto no Supabase.
2. Crie o usuário administrativo em Authentication > Users.
3. Rode apenas o conteúdo de `supabase.full-schema.sql` no SQL Editor.
4. Copie a URL do projeto e a chave pública `anon`.
5. Preencha `backend.config.js`:

```js
window.DIRECT_BACKEND_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseAnonKey: "SUA_CHAVE_PUBLICA_ANON",
};
```

O app está em modo híbrido: abre com `localStorage`, carrega dados do Supabase quando disponível e sincroniza alterações de cadastros, demandas, lojas, setores e valores. Se uma tabela estiver vazia, o app envia a base local atual para iniciar o banco.

O schema completo também pode ser executado sobre uma instalação existente. Ele usa comandos idempotentes e adiciona `neighborhood`, `end_date` e `start_time` quando estiverem ausentes.

## Acesso administrativo

O sistema abre com login interno e sem opcao de criar conta.

- Login: `marcosvinidirect@gmail.com`
- Senha: definida no app apenas como hash SHA-256, nao em texto puro.

Para seguranca real no Supabase:

1. Crie um usuario em Authentication > Users com o email `marcosvinidirect@gmail.com` e a mesma senha administrativa.
2. Rode `supabase.full-schema.sql` no SQL Editor.

O schema completo remove as políticas anônimas antigas e libera CRUD somente para usuários autenticados. A chave pública pode permanecer no frontend porque a proteção dos dados fica a cargo do Supabase Auth e das políticas RLS.

### Perfis e auditoria

O arquivo `supabase.full-schema.sql` cria quatro funções de acesso:

- `admin`: acesso completo, financeiro, CPF completo e logs.
- `financeiro`: acesso ao financeiro, sem CPF completo.
- `rh`: acesso ao CPF completo, sem financeiro.
- `operador`: operação diária, sem financeiro e com CPF mascarado.

Novos usuários recebem automaticamente o perfil `operador`. Para alterar uma função, edite a coluna `role` da tabela `profiles` pelo Table Editor do Supabase usando um usuário administrador.

Os acessos são registrados em `access_logs`. Inclusões e alterações nas tabelas operacionais são registradas automaticamente em `audit_logs`; somente administradores podem consultar esses logs.

## Preparado para Vercel

Arquivo adicionado:

- `vercel.json`
- `.vercelignore`
- `package.json`

Para publicar:

1. Suba a pasta para um repositório GitHub.
2. Importe o projeto na Vercel como projeto estático.
3. Mantenha `index.html` como entrada principal.
4. Se usar Supabase, garanta que `backend.config.js` esteja preenchido antes do deploy ou gere esse arquivo no processo de build.

Também é possível publicar pela CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```
