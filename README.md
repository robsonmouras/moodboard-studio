# Moodboard Studio

Gerador de moodboard: busca de imagens em múltiplos bancos (Unsplash, Pexels, Pixabay),
favoritar, montar board, login e link público de compartilhamento.

> **Status:** pós-Fase 3 — em refinamento de produto. A base da Fase 3 (auth real com
> Supabase, persistência no Postgres, link público) está no ar; desde então entraram a
> **busca agregada multi-fonte**, o **scroll infinito** no grid, o **merge de board por
> nome** ao salvar e o **modo contextual "Adicionar inspirações"**. Ver a pasta
> `../decisões/` (decisões 01–10) e os prompts em `../prompts/`.

### O que já funciona

- **Busca (`/`)** — agregada: o servidor consulta em paralelo Unsplash + Pexels + Pixabay
  (`src/lib/image-sources/`), intercala num único grid e de-duplica. A falha de uma fonte só
  a tira da rodada; erro só sobe quando **todas** falham. Filtro de fontes na UI
  (`SearchSourceFilter` → `?sources=`). Scroll infinito com sentinela `IntersectionObserver`
  e botão "Carregar mais" como fallback de teclado (decisão 10).
- **Favoritar + board** — `BoardPanel` é uma bottom bar fixa que só entra quando há ≥1
  favorito. "Salvar" grava em `boards` + `board_images` (`POST /api/boards`, RLS por
  `user_id`) e gera um slug público.
- **Merge por nome** — se o nome digitado bate com um board que já existe, um modal oferece
  **somar nele** em vez de duplicar. Rascunho do board fica em `localStorage` enquanto não
  se salva.
- **Modo contextual "Adicionar inspirações"** — a partir de um board salvo
  (`/favoritos/[id]`), a busca abre com `?add=<boardId>`: o que se favorita vai direto pra
  aquele board (`BoardPanel` `variant="append"`, append em lote), com `DuplicateDialog`
  avisando o que já estava lá e dedup também no servidor.
- **Biblioteca (`/favoritos` e `/favoritos/[id]`)** — lista, renomear, remover imagem e
  excluir board, tudo via Server Actions (`src/app/favoritos/actions.ts`).
- **Link público (`/b/[slug]`)** — board read-only, sem exigir login, lido pela função
  Postgres `get_public_board` (nunca `select` direto).
- **Navbar global** — `Home | Favoritos | Perfil` (Perfil desabilitado, decisão 03), com o
  email da sessão e "Sair" num menu de conta (decisão 08).
- Rotas `/` e `/favoritos*` protegidas por middleware (`src/middleware.ts`): sem sessão,
  redireciona pra `/login`.

---

## Stack

| Camada | Escolha | Observação |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** | `create-next-app`, com `src/` e ESLint |
| Linguagem | **TypeScript** (`strict`) | sem `any` solto — nem na resposta da API, nem no client |
| Gerenciador de pacotes | **npm** | |
| Estilização | **Panda CSS** + **Park UI** (sobre Ark UI) | ver nota abaixo |
| Ícones | **@phosphor-icons/react** | peso `light`, 20px base — ênfase por tamanho/cor, nunca engrossando o traço (decisão 07) |
| Auth / Banco | **@supabase/ssr** (+ `@supabase/supabase-js`) | clients de browser/servidor/middleware em `src/lib/supabase/` — sessão em cookie, lida no servidor |
| Slug público | **nanoid** | slug de 10 chars url-safe gerado ao salvar o board (`POST /api/boards`) |
| Imagens | **busca agregada** — Unsplash, Pexels, Pixabay | `src/lib/image-sources/` (`server-only`); a Route Handler `src/app/api/search` orquestra. Todas as chaves ficam no servidor (sem `NEXT_PUBLIC_`) |
| Deploy alvo | **Vercel** | sem configuração específica de outro provedor |

### Nota sobre Park UI + Panda (decisão de execução)

O documento técnico previa **Tailwind CSS + Park UI**. Na data do setup (set/2026) o Park UI
oficial **abandonou o Tailwind** e passou a ser **Panda CSS only** (a doc de Tailwind saiu do
ar). Optou-se por seguir o caminho oficial vigente: **Panda CSS + Park UI via CLI** (modelo
tipo shadcn — os componentes e o tema são copiados para dentro de `src/`, não vêm de um pacote).

- Componentes ficam em `src/components/ui/` (código-fonte editável, versionado):
  `button`, `spinner`, `group`, `absolute-center`, `span`, `loader`, `menu`.
- O tema do Park UI fica em `src/theme/` (tokens, recipes, cores).
- `styled-system/` é **gerado** pelo Panda (`panda codegen`) e **não é versionado**.

## Identidade visual (tokens — nunca hex solto em componente)

Definida em `panda.config.ts` + `src/theme/`.

**Tipografia** (carregada via `next/font/google` no layout raiz, exposta como CSS variables):

| Token | Fonte | CSS var | Uso |
|---|---|---|---|
| `fonts.display` | **Outfit** | `--font-outfit` | títulos / display — Light 300 padrão, Regular 400, Semibold 600 pontual |
| `fonts.body` | **Inter** | `--font-inter` | corpo / UI / navegação — Regular 400, Medium 500 |
| `fonts.serif` | **Instrument Serif** | `--font-instrument-serif` | headline-assinatura do produto ("Encontre, organize, compartilhe.") no `/login` e na home logada, via `<BrandHeadline>` (decisão 04). Só peso 400 |

**Cores — regra 60/30/10** (tokens semânticos):

| Token | Valor | Uso |
|---|---|---|
| `colors.page` | `#F2F2F2` | 60% — fundo de página / áreas neutras |
| `colors.surface` | `#FFFFFF` | 30% — cards / painéis |
| `colors.textPrimary` | `#464645` | 30% — texto principal e ícones |
| `colors.ctaPurple` | `#6A1F74` | 10% — **exclusivo** para CTA e estados ativos |

A paleta `brand` (`src/theme/colors/brand.ts`) é a escala completa ancorada em `ctaPurple`
e é usada como `colorPalette="brand"` nos componentes do Park UI. Chaves de token são
**camelCase flat** (`ctaPurple`, não `cta.purple` — o ponto quebra a resolução de CSS var no Panda).

**Ícones:** Phosphor, peso `light`, 20px base. Helper em `src/components/Icon.tsx`
(`iconDefaults = { weight: "light", size: 20 }`). Estados ativos podem usar o peso `fill` do
mesmo ícone (ex.: o coração cheio no card já favoritado).

## Convenção de nomenclatura

Tudo que é identificador de código em **inglês** (pastas, arquivos, componentes, variáveis,
funções, tipos, props, chaves de tema). Comentários podem ficar em português quando registram
uma decisão de projeto.

| Item | Convenção | Exemplo |
|---|---|---|
| Componentes React (arquivo + nome) | PascalCase | `SearchField.tsx` → `function SearchField` |
| Hooks, utils, libs, tipos | kebab-case | `use-debounced-value.ts`, `unsplash-image.ts` |
| Arquivos especiais do Next App Router | nome fixo | `page.tsx`, `layout.tsx`, `middleware.ts` |
| Pastas | kebab-case | `image-sources/`, `boards/` |
| Variáveis e funções | camelCase | `searchQuery`, `searchImages()` |
| Tipos e interfaces | PascalCase | `type SearchImage`, `interface BoardItem` |
| Chaves de tema / tokens | camelCase | `fonts.display`, `colors.ctaPurple` |

## Estrutura

```
src/
  middleware.ts   proteção de rota + renovação de sessão Supabase (/, /favoritos)
  app/
    layout.tsx         layout raiz + next/font (Outfit, Inter, Instrument Serif)
    page.tsx           / — busca (Server Component + <SearchWorkspace>); lê ?add=<boardId>
    login/             /login — auth email/senha (Google OAuth só como botão "Em breve")
    favoritos/         /favoritos (biblioteca) + [id] (detalhe) + actions.ts (Server Actions:
                       renameBoard, removeBoardImage, deleteBoard)
    b/[slug]/          board público read-only, sem sessão (função get_public_board)
    api/search/        busca agregada — orquestra src/lib/image-sources
    api/boards/        POST: cria um board novo OU anexa itens a um board (boardId no corpo)
  components/          componentes React (PascalCase)
    ui/                Park UI (button, spinner, group, absolute-center, span, loader, menu)
    boards/            BoardsLibrary, BoardCard, BoardCover, BoardDetailView, BoardNotFound
    Navbar, SearchWorkspace, SearchField, SearchSourceFilter, SearchSuggestions,
    ResultsGrid, ResultCard, ImageTile, BoardPanel, BrandHeadline, RecentBoards, Icon
    __fixtures__/      fixtures das stories
  lib/
    supabase/          client.ts (browser), server.ts, middleware.ts
    image-sources/     agregador `server-only` (index.ts) + catalog.ts (seguro p/ client) +
                       adaptadores unsplash.ts / pexels.ts / pixabay.ts + types.ts
    boards.ts          leituras: listBoards, listBoardMemberships, getBoard, getPublicBoard
    unsplash-image.ts / pexels-image.ts / pixabay-image.ts   reescrita de URL p/ alta resolução
    use-debounced-value.ts   debounce da busca (400ms)
  theme/              tema do Park UI/Panda: tokens, recipes, cores
  types/              index.ts (tipos de domínio) + database.ts (forma das tabelas Postgres)
scripts/clean-ports.ps1   libera as portas do dev/Storybook sem matar abas do Edge
styled-system/       GERADO pelo Panda — não versionado
```

## Como rodar localmente

```bash
npm install
cp .env.local.example .env.local   # e preencha os valores
npm run dev                        # http://localhost:3000
```

Basta **uma** fonte de imagem configurada para a busca funcionar (ver
[Variáveis de ambiente](#variáveis-de-ambiente)). Para persistência e login é preciso um
projeto Supabase com o schema aplicado (ver [Pré-requisito de banco](#pré-requisito-de-banco)).

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`,
`npm run clean-ports`, `npm run storybook`, `npm run build-storybook`.
O script `prepare` roda `panda codegen` automaticamente depois de `npm install`
(gera a pasta `styled-system/`). Para rodar na mão: `npx panda codegen`.

> O `package.json` declara `allowScripts` (recurso do npm 11) liberando os `install scripts`
> de `esbuild` e `unrs-resolver` — o `esbuild` é binário nativo e é obrigatório para o
> builder Vite do Storybook. Se aparecer `install scripts not yet covered` para outro
> pacote novo, revise com `npm approve-scripts <pkg>`.

## Storybook

```bash
npm run storybook          # http://localhost:6006
npm run build-storybook    # build estático em storybook-static/ (não versionado)
```

- **Storybook 10** com o framework `@storybook/nextjs-vite` (builder Vite) — o pipeline do
  Panda é PostCSS puro (`postcss.config.cjs`, carregado pelo Vite da raiz) e casa direto.
- Config em `.storybook/`: `main.ts` (stories + aliases via `resolve.tsconfigPaths`,
  addons `a11y` e `docs`), `preview.ts` (importa `src/app/globals.css` — a entry do Panda —
  e aplica as CSS vars das fontes), `fonts.ts` (replica o `next/font` do `layout.tsx`, que o
  Storybook não roda).
- Stories co-locadas ao lado do componente (`src/components/**/*.stories.tsx`), títulos
  espelhando a área: `UI/*`, `Busca/*`, `Marca/*`. Fixtures em `src/components/__fixtures__/`.
- Pilotos nesta primeira leva: `UI/Button`, `Busca/ResultCard`, `Marca/BrandHeadline`.
  Componentes acoplados a roteamento / Server Actions (`BoardCard`, `SearchWorkspace`,
  `LoginForm`, `BoardDetailView`) ainda precisam de uma view apresentacional extraída —
  ver a issue de setup (#17 / PR #18).

## Variáveis de ambiente

Ver `.env.local.example`. `.env.local` não vai para o git. Nenhuma chave de fonte de imagem
leva o prefixo `NEXT_PUBLIC_` — todas são lidas só no servidor.

| Variável | Para quê | Obrigatória? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | clients Supabase (browser/servidor/middleware) | **sim** — auth + leitura/escrita de boards |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem | **sim** |
| `UNSPLASH_ACCESS_KEY` | fonte de imagem — Unsplash (tier Demo: 50 req/h) | pelo menos **uma** fonte |
| `PEXELS_API_KEY` | fonte de imagem — Pexels (~200 req/h, 20.000/mês) | pelo menos **uma** fonte |
| `PIXABAY_API_KEY` | fonte de imagem — Pixabay (100 req/min) | pelo menos **uma** fonte |

Sem nenhuma fonte configurada a busca devolve erro; com uma ou mais, cada fonte ausente
apenas fica de fora do grid.

### Pré-requisito de banco

No SQL Editor do Supabase, aplicar nesta ordem:

1. `../prompts/fase3-autenticacao-persistencia.md` §"Schema do banco" — tabelas
   `boards` / `board_images`, RLS por dono, função `get_public_board`.
2. `../decisões/decisao-09-qualidade-imagem-no-board.md` §"Migração no Supabase" — adiciona
   `width` / `height` em `board_images` e recria `get_public_board` devolvendo essas colunas.

Para a demo fluir sem passo de email, desligar **Authentication → Providers → Email →
Confirm email** no painel do Supabase.

## Fora de escopo por enquanto

- **OAuth do Google** (só o botão desabilitado, "Em breve") e tela `/perfil` (a `Navbar`
  reserva o item, desabilitado).
- Recuperação de senha real ("Esqueci a senha" segue só link).
- **Busca por proximidade de cor (hexadecimal)** — registrada em
  `../decisões/backlog-pos-fase3.md`.
- Backfill das dimensões de boards salvos antes da decisão 09 (ficam no fallback `4 / 5`
  até serem re-salvos), reordenar imagens dentro de um board, export em PDF/imagem, edição
  colaborativa e múltiplos boards simultâneos por cliente.

## Decisões

Registro em `../decisões/` (cada uma com contexto, alternativas e consequência no código):

| # | Assunto |
|---|---|
| 01 | Home é a tela de busca, sem login na entrada |
| 02 | Tela `/favoritos` — biblioteca de boards |
| 03 | Tipos da Fase 2 (Unsplash) · Fase 3 — auth + persistência |
| 04 | Headline serifada (Instrument Serif) no produto |
| 05 | Home sem ilustração (chips + boards recentes) |
| 06 | Grid de resultados com hover autoral (masonry livre) |
| 07 | Biblioteca de ícones: Phosphor (Tabler saiu) |
| 08 | Menu de conta na Navbar |
| 09 | Board salvo — proporção real da foto + imagem em alta |
| 10 | Grid de resultados — scroll infinito |
