import "server-only";
import { unsplashHiRes } from "@/lib/unsplash-image";
import type { SearchImage } from "@/types";
import { PER_PAGE, type ImageSourceAdapter, type SourceOutcome } from "./types";

/**
 * Fonte Unsplash — `GET /search/photos`. A `UNSPLASH_ACCESS_KEY` (sem prefixo
 * `NEXT_PUBLIC_`) é lida só aqui, no servidor. Foi a primeira fonte do produto;
 * o `SearchImage.id` fica com o id cru da foto (sem prefixo) pra continuar batendo
 * com os boards salvos antes da agregação.
 */

const ENDPOINT = "https://api.unsplash.com/search/photos";

interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  width: number;
  height: number;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  links: { html: string };
  user: { name: string; links: { html: string } };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

function toSearchImage(photo: UnsplashPhoto): SearchImage {
  const hasSize = photo.width > 0 && photo.height > 0;
  return {
    id: photo.id,
    source: "unsplash",
    description: photo.description ?? photo.alt_description ?? "Imagem sem descrição",
    author: photo.user.name,
    authorUrl: photo.user.links?.html,
    sourceUrl: photo.links?.html,
    aspectRatio: hasSize ? `${photo.width} / ${photo.height}` : "1 / 1",
    width: photo.width,
    height: photo.height,
    // De `urls.raw` (sem recorte), pede a foto em alta pela Unsplash sob demanda —
    // é o que vai pra tela e o que se grava no board (não trava mais em 1080px).
    imageUrl: unsplashHiRes(photo.urls.raw),
    thumbUrl: photo.urls.small,
  };
}

/**
 * A Unsplash sinaliza estouro de cota com HTTP 403 (às vezes 429) + header
 * `X-Ratelimit-Remaining: 0` e/ou corpo `{"errors":["Rate Limit Exceeded"]}`.
 */
function isRateLimited(response: Response, bodyText: string) {
  if (response.status !== 403 && response.status !== 429) return false;
  return response.headers.get("x-ratelimit-remaining") === "0" || /rate limit/i.test(bodyText);
}

export const unsplashSource: ImageSourceAdapter = {
  label: "Unsplash",

  isConfigured() {
    return Boolean(process.env.UNSPLASH_ACCESS_KEY);
  },

  async search(query, page): Promise<SourceOutcome> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) return { ok: false, error: "source_error" };

    let response: Response;
    try {
      const endpoint = `${ENDPOINT}?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}&content_filter=high`;
      response = await fetch(endpoint, {
        headers: { Authorization: `Client-ID ${accessKey}`, "Accept-Version": "v1" },
        cache: "no-store",
      });
    } catch {
      return { ok: false, error: "source_error" };
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      if (isRateLimited(response, bodyText)) return { ok: false, error: "rate_limit" };
      console.error(`Unsplash respondeu ${response.status}: ${bodyText.slice(0, 200)}`);
      return { ok: false, error: "source_error" };
    }

    const data = (await response.json().catch(() => null)) as UnsplashSearchResponse | null;
    if (!data || !Array.isArray(data.results)) return { ok: false, error: "source_error" };

    return {
      ok: true,
      images: data.results.map(toSearchImage),
      hasMore: page < data.total_pages,
    };
  },
};
