import "server-only";
import { pixabayThumb } from "@/lib/pixabay-image";
import type { SearchImage } from "@/types";
import { PER_PAGE, type ImageSourceAdapter, type SourceOutcome } from "./types";

/**
 * Fonte Pixabay — `GET https://pixabay.com/api/` com `key=<PIXABAY_API_KEY>` na
 * query. A chave (sem prefixo `NEXT_PUBLIC_`) é lida só aqui, no servidor. Rate
 * limit: 100 req/min. Docs: https://pixabay.com/api/docs/
 *
 * `image_type=photo` de propósito: o grid combina com Unsplash/Pexels, que são só
 * fotografia. Ilustrações e vetores da Pixabay ficam pra um filtro na UI (#7).
 *
 * Termos da Pixabay: a resposta da API deve ser cacheada por 24 h (`revalidate`
 * abaixo) e as imagens não podem ser hotlinkadas de forma permanente — no produto
 * elas passam pelo otimizador do `next/image`, que busca no servidor e re-serve do
 * nosso domínio, então o browser nunca bate direto na `pixabay.com`.
 *
 * O `SearchImage.id` sai prefixado (`"pixabay:1234"`) pra nunca colidir com ids da
 * Unsplash/Pexels no grid combinado nem em `board_images.unsplash_id`.
 */

const ENDPOINT = "https://pixabay.com/api/";
const CACHE_TTL_SECONDS = 60 * 60 * 24;

interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  user_id: number;
}

interface PixabaySearchResponse {
  /** Total de resultados; `totalHits` é o quanto a API deixa paginar (máx. 500). */
  total: number;
  totalHits: number;
  hits: PixabayHit[];
}

function toSearchImage(hit: PixabayHit): SearchImage {
  const hasSize = hit.imageWidth > 0 && hit.imageHeight > 0;
  const tags = hit.tags?.trim();
  return {
    id: `pixabay:${hit.id}`,
    source: "pixabay",
    // A Pixabay não tem descrição/alt — só as tags. É o melhor rótulo disponível.
    description: tags || "Imagem sem descrição",
    author: hit.user,
    authorUrl: hit.user && hit.user_id
      ? `https://pixabay.com/users/${encodeURIComponent(hit.user)}-${hit.user_id}/`
      : undefined,
    sourceUrl: hit.pageURL || undefined,
    aspectRatio: hasSize ? `${hit.imageWidth} / ${hit.imageHeight}` : "1 / 1",
    width: hit.imageWidth,
    height: hit.imageHeight,
    // `largeImageURL` = 1280 px, teto da licença sem conta confirmada.
    imageUrl: hit.largeImageURL,
    thumbUrl: pixabayThumb(hit.webformatURL),
  };
}

export const pixabaySource: ImageSourceAdapter = {
  id: "pixabay",
  label: "Pixabay",

  isConfigured() {
    return Boolean(process.env.PIXABAY_API_KEY);
  },

  async search(query, page): Promise<SourceOutcome> {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) return { ok: false, error: "source_error" };

    let response: Response;
    try {
      const endpoint =
        `${ENDPOINT}?key=${apiKey}&q=${encodeURIComponent(query)}` +
        `&image_type=photo&safesearch=true&page=${page}&per_page=${PER_PAGE}`;
      response = await fetch(endpoint, {
        // Exigência da Pixabay: cachear a resposta da API por 24 h.
        next: { revalidate: CACHE_TTL_SECONDS },
      });
    } catch {
      return { ok: false, error: "source_error" };
    }

    if (!response.ok) {
      // Cota estourada: HTTP 429 e/ou `X-RateLimit-Remaining: 0`.
      if (response.status === 429 || response.headers.get("x-ratelimit-remaining") === "0") {
        return { ok: false, error: "rate_limit" };
      }
      const bodyText = await response.text().catch(() => "");
      // A Pixabay devolve 400 quando `page` passa de `totalHits` — não é falha,
      // é fim da paginação desta fonte. Sai da rodada sem derrubar a busca.
      if (response.status === 400 && /out of valid range/i.test(bodyText)) {
        return { ok: true, images: [], hasMore: false };
      }
      console.error(`Pixabay respondeu ${response.status}: ${bodyText.slice(0, 200)}`);
      return { ok: false, error: "source_error" };
    }

    const data = (await response.json().catch(() => null)) as PixabaySearchResponse | null;
    if (!data || !Array.isArray(data.hits)) return { ok: false, error: "source_error" };

    return {
      ok: true,
      images: data.hits.map(toSearchImage),
      // Ainda há página seguinte enquanto o que já veio não cobre o `totalHits`.
      hasMore: data.hits.length === PER_PAGE && page * PER_PAGE < data.totalHits,
    };
  },
};
