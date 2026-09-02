# Moodboard Studio

Gerador de moodboard: busca de imagens (Unsplash), favoritar, montar board, login e link
público de compartilhamento. Case Design Engineer — EuGencia.

> **Status:** Fase 0 — scaffold da stack. Ainda **não há nenhuma tela do produto**
> (busca, grid, board, favoritos, login). Isso entra na Fase 1 (protótipo de interface com
> dados mockados). Ver `../decisões/fase-1-checklist.md`.

---

## Stack

| Camada | Escolha | Observação |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** | `create-next-app`, com `src/` e ESLint |
| Linguagem | **TypeScript** (`strict`) | sem `any` solto |
| Gerenciador de pacotes | **npm** | |
| Estilização | **Panda CSS** + **Park UI** (sobre Ark UI) | ver nota abaixo |
| Ícones | **@tabler/icons-react** | outline, `stroke-width={1}`, 20px base |
| Auth / Banco | **@supabase/supabase-js** | só o client (`src/lib/supabase.ts`) — sem login nesta fase |
| Imagens | **Unsplash** | só variável de ambiente documentada — sem chamadas ainda |
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
uma decisão para o case.

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
  app/            rotas (App Router) — layout raiz + home (só prova de setup)
  components/     componentes React (PascalCase); components/ui/ = Park UI
  lib/            clients e utilitários (ex: supabase.ts)
  theme/          tema do Park UI/Panda: tokens, recipes, cores
  types/          tipos TypeScript compartilhados (começa vazio)
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
| `NEXT_PUBLIC_SUPABASE_URL` | client Supabase | client instanciado, sem chamadas |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client Supabase | idem |
| `UNSPLASH_ACCESS_KEY` | API da Unsplash | não — placeholder para a Fase 2 |

## Fora de escopo nesta fase

Nenhuma tela de busca/grid/board/favoritos; nenhum dado mockado; nenhuma lógica de fetch
(Unsplash) ou de autenticação (Supabase); nenhuma tabela no Supabase.
