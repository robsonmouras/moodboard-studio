# Moodboard Studio

Gerador de moodboard: busca de imagens (Unsplash), favoritar, montar board, login e link
público de compartilhamento.

> **Status:** Fase 3 — autenticação real (Supabase Auth, email/senha) e persistência de
> verdade. `/` e `/favoritos` são protegidas por middleware (`src/middleware.ts`): sem
> sessão, redireciona pra `/login`. A busca da home (`/`) consome a Unsplash via a Route
> Handler `src/app/api/search`; "Salvar" grava o board no Postgres (`POST /api/boards` →
> tabelas `boards` + `board_images`, RLS por `user_id`) e gera um slug público.
> `/favoritos` e `/favoritos/[id]` leem/escrevem no Supabase (renomear, remover imagem,
> excluir — tudo real, via Server Actions). Nova rota pública `/b/[slug]` mostra o board
> read-only sem exigir login, lendo pela função Postgres `get_public_board` (nunca `select`
> direto). `Navbar` global (`Home | Favoritos | Perfil` — Perfil desabilitado, decisão 03)
> mostra o email da sessão + "Sair". Ver
> `../prompts/fase3-autenticacao-persistencia-resultado.md` e
> `../decisões/decisao-03-fase3-auth-persistencia.md`.

---

## Stack

| Camada | Escolha | Observação |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** | `create-next-app`, com `src/` e ESLint |
| Linguagem | **TypeScript** (`strict`) | sem `any` solto |
| Gerenciador de pacotes | **npm** | |
| Estilização | **Panda CSS** + **Park UI** (sobre Ark UI) | ver nota abaixo |
| Ícones | **@tabler/icons-react** | outline, `stroke-width={1}`, 20px base |
| Auth / Banco | **@supabase/ssr** (+ `@supabase/supabase-js`) | clients de browser/servidor/middleware em `src/lib/supabase/` — sessão em cookie, lida no servidor |
| Slug público | **nanoid** | slug de 10 chars url-safe gerado ao salvar o board (`POST /api/boards`) |
| Imagens | **Unsplash** | `GET /search/photos` pela Route Handler `src/app/api/search` (server-side; chave sem `NEXT_PUBLIC_`) |
| Deploy alvo | **Vercel** | sem configuração específica de outro provedor |

### Nota sobre Park UI + Panda (decisão de execução)

O documento técnico previa **Tailwind CSS + Park UI**. Na data do setup (set/2026) o Park UI
oficial **abandonou o Tailwind** e passou a ser **Panda CSS only** (a doc de Tailwind saiu do
ar). Optou-se por seguir o caminho oficial vigente: **Panda CSS + Park UI via CLI** (modelo
tipo shadcn — os componentes e o tema são copiados para dentro de `src/`, não vêm de um pacote).

- Componentes ficam em `src/components/ui/` (código-fonte editável, versionado).
- O tema do Park UI fica em `src/theme/` (tokens, recipes, cores).
- `styled-system/` é **gerado** pelo Panda (`panda codegen`) e **não é versionado**.

## Identidade visual (tokens — nunca hex solto em componente)

Definida em `panda.config.ts` + `src/theme/`.

**Tipografia** (carregada via `next/font/google` no layout raiz, exposta como CSS variables):

- `fonts.display` → **Outfit** (`--font-outfit`) — títulos. Light 300 padrão, Regular 400, Semibold 600 pontual.
- `fonts.body` → **Inter** (`--font-inter`) — corpo / UI / navegação. Regular 400, Medium 500.

**Cores — regra 60/30/10** (tokens semânticos):

| Token | Valor | Uso |
|---|---|---|
| `colors.page` | `#F2F2F2` | 60% — fundo de página / áreas neutras |
| `colors.surface` | `#FFFFFF` | 30% — cards / painéis |
| `colors.textPrimary` | `#464645` | 30% — texto principal e ícones |
| `colors.ctaPurple` | `#6A1F74` | 10% — **exclusivo** para CTA e estados ativos |

A paleta `brand` (`src/theme/colors/brand.ts`) é a escala completa ancorada em `ctaPurple`
e é usada como `colorPalette="brand"` nos componentes do Park UI.

**Ícones:** Tabler, outline, `stroke-width={1}`, 20px base. Helper em `src/components/Icon.tsx`
(`iconDefaults`).

## Convenção de nomenclatura

Tudo que é identificador de código em **inglês** (pastas, arquivos, componentes, variáveis,
funções, tipos, props, chaves de tema). Comentários podem ficar em português quando registram
uma decisão de projeto.

| Item | Convenção | Exemplo |
|---|---|---|
| Componentes React (arquivo + nome) | PascalCase | `SearchInput.tsx` → `function SearchInput` |
| Hooks, utils, configs, tipos | kebab-case | `use-debounce.ts`, `format-date.ts` |
| Arquivos especiais do Next App Router | nome fixo | `page.tsx`, `layout.tsx` |
| Pastas | kebab-case | `search-bar/`, `favorites/` |
| Variáveis e funções | camelCase | `searchQuery`, `buildBoard()` |
| Tipos e interfaces | PascalCase | `type UnsplashImage`, `interface BoardItem` |
| Chaves de tema / tokens | camelCase | `fonts.display`, `colors.ctaPurple` |

## Estrutura

```
src/
  middleware.ts   proteção de rota + renovação de sessão Supabase (/, /favoritos)
  app/            rotas (App Router) — layout raiz + / (busca) + /favoritos (biblioteca) +
                  /favoritos/[id] (detalhe) + /favoritos/actions.ts (Server Actions) +
                  /login + /b/[slug] (board público read-only, sem sessão);
                  app/api/search/ = busca na Unsplash; app/api/boards/ = grava o board
  components/     componentes React (PascalCase); components/ui/ = Park UI;
                  components/boards/ = biblioteca, detalhe, capa, "não encontrado"
  lib/            supabase/ (client.ts, server.ts, middleware.ts), boards.ts (leituras),
                  use-debounced-value.ts
  theme/          tema do Park UI/Panda: tokens, recipes, cores
  types/          tipos de domínio (index.ts) + shape do banco (database.ts)
styled-system/    GERADO pelo Panda — não versionado
```

## Como rodar localmente

```bash
npm install
cp .env.local.example .env.local   # e preencha os valores
npm run dev                        # http://localhost:3000
```

Outros scripts: `npm run build`, `npm run lint`, `npm run start`.
O script `prepare` roda `panda codegen` automaticamente depois de `npm install`
(gera a pasta `styled-system/`). Para rodar na mão: `npx panda codegen`.

> Ao instalar, o npm pode avisar sobre `install scripts not covered` (esbuild, unrs-resolver).
> São otimizações opcionais de binário nativo; o projeto builda e linta normalmente sem elas.

## Variáveis de ambiente

Ver `.env.local.example`. `.env.local` não vai para o git.

| Variável | Para quê | Já usada? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | clients Supabase (browser/servidor/middleware) | **sim** — auth + leitura/escrita de boards |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem | **sim** |
| `UNSPLASH_ACCESS_KEY` | API da Unsplash | **sim** — lida só na Route Handler `src/app/api/search` (nunca no client) |
| `PEXELS_API_KEY` | API da Pexels (fonte agregada da busca) | opcional — lida só no servidor; sem ela, a Pexels só fica de fora da rodada |
| `PIXABAY_API_KEY` | API da Pixabay (fonte agregada da busca) | opcional — lida só no servidor; sem ela, a Pixabay só fica de fora da rodada |

Pré-requisito de banco: rodar o SQL de `../prompts/fase3-autenticacao-persistencia.md`
§"Schema do banco" no SQL Editor do Supabase (tabelas `boards`/`board_images`, RLS por dono,
função `get_public_board`). Para a demo fluir sem passo de email, desligar **Authentication →
Providers → Email → Confirm email** no painel do Supabase.

## Fora de escopo nesta fase

OAuth do Google (só o botão desabilitado, "Em breve"); tela `/perfil` (a `Navbar` reserva o
item, desabilitado); recuperação de senha real ("Esqueci a senha" segue só link); edição
colaborativa, múltiplos boards simultâneos por cliente, export em PDF/imagem.
