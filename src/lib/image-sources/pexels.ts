import "server-only";
import { pexelsHiRes, pexelsThumb } from "@/lib/pexels-image";
import type { SearchImage } from "@/types";
import { PER_PAGE, type ImageSourceAdapter, type SourceOutcome } from "./types";

/**
 * Fonte Pexels — `GET /v1/search` com header `Authorization: <PEXELS_API_KEY>`.
 * A chave (sem prefixo `NEXT_PUBLIC_`) é lida só aqui, no servidor. Rate limit
 * generoso (~200 req/h, 20 mil/mês). Docs: https://www.pexels.com/api/documentation/
 *
 * O `SearchImage.id` sai prefixado (`"pexels:1234"`) pra nunca colidir com ids da
 * Unsplash no grid combinado nem em `board_images.unsplash_id`.
 */

const ENDPOINT = "https://api.pexels.com/v1/search";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string | null;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  /** URL da próxima página — ausente quando não há mais resultados. */
  next_page?: string;
}

function toSearchImage(photo: PexelsPhoto): SearchImage {
  const hasSize = photo.width > 0 && photo.height > 0;
  const original = photo.src.original;
  return {
    id: `pexels:${photo.id}`,
    source: "pexels",
    description: photo.alt?.trim() || "Imagem sem descrição",
    author: photo.photographer,
    authorUrl: photo.photographer_url || undefined,
    sourceUrl: photo.url || undefined,
    aspectRatio: hasSize ? `${photo.width} / ${photo.height}` : "1 / 1",
    width: photo.width,
    height: photo.height,
    // Alta resolução sob demanda a partir do original — pronta pra tela e pra salvar.
    imageUrl: pexelsHiRes(original),
    thumbUrl: pexelsThumb(original),
  };
}

export const pexelsSource: ImageSourceAdapter = {
  id: "pexels",
  label: "Pexels",

  isConfigured() {
    return Boolean(process.env.PEXELS_API_KEY);
  },

  async search(query, page): Promise<SourceOutcome> {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return { ok: false, error: "source_error" };

    let response: Response;
    try {
      const endpoint = `${ENDPOINT}?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}`;
      response = await fetch(endpoint, {
        headers: { Authorization: apiKey },
        cache: "no-store",
      });
    } catch {
      return { ok: false, error: "source_error" };
    }

    if (!response.ok) {
      // A Pexels barra cota com HTTP 429; o header confirma quanto resta.
      if (response.status === 429 || response.headers.get("x-ratelimit-remaining") === "0") {
        return { ok: false, error: "rate_limit" };
      }
      const bodyText = await response.text().catch(() => "");
      console.error(`Pexels respondeu ${response.status}: ${bodyText.slice(0, 200)}`);
      return { ok: false, error: "source_error" };
    }

    const data = (await response.json().catch(() => null)) as PexelsSearchResponse | null;
    if (!data || !Array.isArray(data.photos)) return { ok: false, error: "source_error" };

    return {
      ok: true,
      images: data.photos.map(toSearchImage),
      hasMore: Boolean(data.next_page),
    };
  },
};
