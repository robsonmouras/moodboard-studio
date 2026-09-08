import "server-only";
import type { ImageSource, SearchImage } from "@/types";
import { ALL_SOURCE_IDS } from "./catalog";
import { pexelsSource } from "./pexels";
import { pixabaySource } from "./pixabay";
import { MAX_PAGE, type ImageSourceAdapter, type SourceOutcome } from "./types";
import { unsplashSource } from "./unsplash";

export { MAX_PAGE, PER_PAGE } from "./types";

/**
 * Agregador de fontes de imagem da busca.
 *
 * A ideia não é substituir a Unsplash, é somar: `searchImages` consulta em
 * paralelo as fontes pedidas (parâmetro `sources`, padrão todas) que estejam
 * configuradas (`ImageSourceAdapter.isConfigured()`), intercala os resultados num
 * único grid e de-duplica por `id`. Resiliência: a falha de uma
 * fonte só remove aquela origem da rodada — a busca segue com o que as outras
 * responderam. Só quando TODAS falham é que o erro sobe pro client (e vira
 * `rate_limit` apenas se todas bateram cota).
 *
 * Paginação combinada: a página N da busca pede a página N de cada fonte. Uma
 * fonte que se esgota antes das outras apenas para de contribuir; `hasMore` é
 * verdadeiro enquanto qualquer fonte ativa ainda tiver página seguinte.
 */

const SOURCES: ImageSourceAdapter[] = [unsplashSource, pexelsSource, pixabaySource];

export type AggregatedSearch =
  | { ok: true; results: SearchImage[]; hasMore: boolean }
  | { ok: false; error: "rate_limit" | "unsplash_error" };

/** Intercala as listas em rodízio (fonte A, fonte B, fonte A, …), de-dup por `id`. */
function interleave(lists: SearchImage[][]): SearchImage[] {
  const merged: SearchImage[] = [];
  const seen = new Set<string>();
  const maxLen = lists.reduce((max, list) => Math.max(max, list.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const list of lists) {
      const image = list[i];
      if (!image || seen.has(image.id)) continue;
      seen.add(image.id);
      merged.push(image);
    }
  }
  return merged;
}

export async function searchImages(
  query: string,
  page: number,
  sources: readonly ImageSource[] = ALL_SOURCE_IDS,
): Promise<AggregatedSearch> {
  const wanted = new Set<ImageSource>(
    sources.length > 0 ? sources : ALL_SOURCE_IDS,
  );
  const active = SOURCES.filter(
    (source) => wanted.has(source.id) && source.isConfigured(),
  );
  if (active.length === 0) {
    console.error(
      "Nenhuma fonte de imagem ativa para esta busca — verifique o filtro de fontes e as chaves UNSPLASH_ACCESS_KEY / PEXELS_API_KEY / PIXABAY_API_KEY em .env.local.",
    );
    return { ok: false, error: "unsplash_error" };
  }

  const settled = await Promise.allSettled(
    active.map((source) => source.search(query, page)),
  );

  const okOutcomes: Extract<SourceOutcome, { ok: true }>[] = [];
  let sawNonRateLimit = false;

  settled.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`${active[index].label} lançou:`, result.reason);
      sawNonRateLimit = true;
      return;
    }
    const outcome = result.value;
    if (outcome.ok) {
      okOutcomes.push(outcome);
      return;
    }
    if (outcome.error !== "rate_limit") sawNonRateLimit = true;
    console.warn(`${active[index].label} fora desta rodada: ${outcome.error}`);
  });

  if (okOutcomes.length === 0) {
    // Todas falharam: `rate_limit` só se nenhuma delas foi por outro motivo.
    return { ok: false, error: sawNonRateLimit ? "unsplash_error" : "rate_limit" };
  }

  const results = interleave(okOutcomes.map((outcome) => outcome.images));
  const hasMore = page < MAX_PAGE && okOutcomes.some((outcome) => outcome.hasMore);

  return { ok: true, results, hasMore };
}
