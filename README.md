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
- `supabase.schema.sql`: estrutura inicial das tabelas.
- `supabase.policies.sql`: políticas RLS para liberar leitura e escrita pela chave pública `anon`.

Para conectar:

1. Crie um projeto no Supabase.
2. Rode o conteúdo de `supabase.schema.sql` no SQL Editor.
3. Rode o conteúdo de `supabase.policies.sql` no SQL Editor.
4. Copie a URL do projeto e a chave pública `anon`.
5. Preencha `backend.config.js`:

```js
window.DIRECT_BACKEND_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseAnonKey: "SUA_CHAVE_PUBLICA_ANON",
};
```

O app está em modo híbrido: abre com `localStorage`, carrega dados do Supabase quando disponível e sincroniza alterações de cadastros, demandas, lojas, setores e valores. Se uma tabela estiver vazia, o app envia a base local atual para iniciar o banco.

As políticas atuais liberam CRUD para a chave pública `anon`, adequado para um protótipo sem login. Para produção, o ideal é adicionar autenticação e restringir as políticas por usuário ou equipe.

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
