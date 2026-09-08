/**
 * Tipos de domínio do produto.
 *
 * - Busca (`/`): consome a Unsplash de verdade via a Route Handler `src/app/api/search`.
 * - Biblioteca de boards (`/favoritos`) e link público (`/b/[slug]`): Postgres/Supabase
 *   (Fase 3 — ver `src/types/database.ts` para a forma das tabelas).
 *
 * Nada de `any` solto — nem na resposta da API, nem no client.
 */

/**
 * Fontes de imagem que o agregador de busca (`src/lib/image-sources`) consulta.
 * A busca combina o resultado de todas num único grid; cada `SearchImage` carrega
 * a sua origem para atribuição e de-duplicação.
 */
export type ImageSource = "unsplash" | "pexels";

/**
 * Uma imagem de resultado de busca — montada pela Route Handler `src/app/api/search`
 * a partir da resposta real de uma das fontes (`src/lib/image-sources`). A resposta
 * bruta da fonte nunca chega ao client; só esta forma enxuta.
 */
export interface SearchImage {
  /**
   * Identificador estável e único no grid combinado. Para a Unsplash é o `id` cru
   * da foto (compatível com boards salvos antes da agregação); para as demais
   * fontes vem prefixado (`"pexels:1234"`) pra nunca colidir entre origens.
   * É o que se grava em `board_images.unsplash_id` e a chave de de-dup dos favoritos.
   */
  id: string;
  /** Qual fonte serviu esta imagem — usado na atribuição e na de-duplicação. */
  source: ImageSource;
  /** `description` ou, na falta dela, `alt_description` — usado em `alt`. */
  description: string;
  /** Nome do fotógrafo — crédito exigido/pedido pela licença das fontes. */
  author: string;
  /** Página do fotógrafo na fonte, quando disponível — link do crédito na UI. */
  authorUrl?: string;
  /** Página da foto na fonte, quando disponível — atribuição da imagem em si. */
  sourceUrl?: string;
  /** `width / height` da foto, no formato aceito por `aspect-ratio` (ex.: "3 / 4"). */
  aspectRatio: string;
  /** `width` da foto na Unsplash — persistido pra reconstruir a proporção no board salvo. */
  width: number;
  /** `height` da foto na Unsplash. */
  height: number;
  /** Foto em alta (Unsplash sob demanda), pronta pra exibição e pra salvar no board. */
  imageUrl: string;
  /** `urls.thumb` — miniatura, para grids densos como o board. */
  thumbUrl: string;
}

/**
 * Um item favoritado, presente num board em construção (`/`) ou já salvo (`/favoritos`).
 *
 * Antes de salvar, `id` é o `id` da foto na Unsplash e `aspectRatio` vem da busca.
 * Depois de salvo, `id` é o `id` da linha em `board_images` e `aspectRatio` fica
 * indefinido (o schema não guarda dimensão) — o `ImageTile` usa uma proporção padrão.
 */
export interface BoardItem {
  id: string;
  /**
   * `SearchImage.id` da foto (id cru da Unsplash ou `"fonte:id"` das demais) —
   * usado para de-duplicar favoritos e gravado em `board_images.unsplash_id`.
   */
  unsplashId: string;
  description: string;
  author: string;
  imageUrl: string;
  thumbUrl: string;
  /**
   * Proporção da foto (`"3 / 4"`). Vem da busca e, desde 09/2026, é reconstruída
   * de `width`/`height` no board salvo. Indefinida em boards antigos → padrão do tile.
   */
  aspectRatio?: string;
  /** Dimensões da foto na Unsplash — persistidas em `board_images` desde 09/2026. */
  width?: number;
  height?: number;
}

/**
 * Resposta da Route Handler `GET /api/search`.
 *
 * `page` é a página devolvida (1-based) e `totalPages` é `page + 1` enquanto
 * alguma fonte ainda tem resultado para o termo, ou `page` quando todas se
 * esgotaram — o client usa os dois para saber se ainda há o que carregar no
 * scroll infinito do grid (decisão 10).
 */
export type SearchApiResponse =
  | { ok: true; results: SearchImage[]; page: number; totalPages: number }
  | { ok: false; error: SearchApiError };

/**
 * Causas de falha que o client sabe traduzir para uma mensagem específica.
 * `rate_limit` = TODAS as fontes ativas bateram limite de requisições agora;
 * `unsplash_error` = qualquer outra falha que zerou o resultado (nome mantido
 * por compatibilidade com o client). A falha de uma fonte só, com outra
 * respondendo, não vira erro — aquela origem apenas fica de fora da rodada.
 */
export type SearchApiError = "rate_limit" | "unsplash_error";

/**
 * Um board salvo, com todas as inspirações — usado na tela de detalhe
 * (`/favoritos/[id]`). Vem das tabelas `boards` + `board_images` (Fase 3).
 */
export interface Board {
  /** `boards.id` — usado na rota `/favoritos/[id]`. */
  id: string;
  /** `boards.title`. */
  name: string;
  /** `boards.slug` — habilita o link público `/b/<slug>`. */
  slug: string;
  /** `boards.search_term` — termo de busca que originou o board, se houver. */
  searchTerm: string | null;
  /** `boards.created_at` (ISO 8601). */
  savedAt: string;
  /** As inspirações guardadas no board, na ordem de `sort_order`. */
  items: BoardItem[];
}

/**
 * Versão enxuta de um board para a listagem da biblioteca (`/favoritos`) — sem
 * carregar todas as imagens, só a contagem e as primeiras para a capa.
 */
export interface BoardSummary {
  id: string;
  name: string;
  slug: string;
  savedAt: string;
  /** Total de imagens no board. */
  itemCount: number;
  /** Até 4 miniaturas para montar a capa. */
  cover: { thumbUrl: string; description: string }[];
}

/**
 * Board na visão pública read-only (`/b/[slug]`) — o que a função Postgres
 * `get_public_board(slug)` devolve, sem `user_id`, sem `slug`, sem ações.
 */
export interface PublicBoard {
  title: string;
  savedAt: string;
  images: {
    imageUrl: string;
    thumbUrl: string;
    author: string;
    description: string;
    /** Proporção reconstruída de `width`/`height` (indefinida em boards antigos). */
    aspectRatio?: string;
  }[];
}
