/**
 * Contrato comum das fontes de imagem do agregador de busca.
 *
 * Cada fonte (Unsplash, Pexels, …) implementa `ImageSourceAdapter`: diz se está
 * configurada (chave no ambiente) e sabe buscar uma página de resultados já
 * mapeada para `SearchImage`. O agregador (`./index.ts`) consulta todas as fontes
 * ativas em paralelo e combina — a falha de uma não derruba a busca inteira.
 */

import type { ImageSource, SearchImage } from "@/types";

/** Quantos resultados cada fonte devolve por página. */
export const PER_PAGE = 24;

/**
 * Teto de página aceito pelo agregador. A Unsplash rejeita páginas além de
 * ~10 mil resultados / `PER_PAGE`; passar disso é sempre 4xx. As outras fontes
 * têm limites parecidos ou maiores, então esse teto serve para todas.
 */
export const MAX_PAGE = Math.floor(10_000 / PER_PAGE);

/**
 * Desfecho da busca numa única fonte.
 * - `ok: true` — `images` (pode vir vazio) e `hasMore` (a fonte tem página seguinte).
 * - `ok: false` — `rate_limit` (a fonte barrou por cota) ou `source_error`
 *   (rede, 5xx, resposta inesperada). O agregador só propaga erro se TODAS falharem.
 */
export type SourceOutcome =
  | { ok: true; images: SearchImage[]; hasMore: boolean }
  | { ok: false; error: "rate_limit" | "source_error" };

export interface ImageSourceAdapter {
  /** Id canônico da fonte — casa com `SearchImage.source` e com o filtro da busca. */
  readonly id: ImageSource;
  /** Rótulo curto pra logs e diagnóstico. */
  readonly label: string;
  /** `true` quando a chave de ambiente da fonte está presente. Fonte sem chave é pulada. */
  isConfigured(): boolean;
  /** Busca `page` (1-based) de `query`. Nunca lança — falha vira `{ ok: false }`. */
  search(query: string, page: number): Promise<SourceOutcome>;
}
