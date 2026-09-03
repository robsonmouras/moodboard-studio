import { NextResponse } from "next/server";
import type { SearchApiResponse, SearchImage } from "@/types";

/**
 * Route Handler da busca de imagens (Fase 2).
 *
 * O client (`SearchWorkspace`) chama `GET /api/search?q=<termo>`. A `UNSPLASH_ACCESS_KEY`
 * (sem prefixo `NEXT_PUBLIC_`) é lida só aqui, no servidor — nunca vai para o bundle do
 * browser. A resposta da Unsplash é mapeada para o formato enxuto da interface
 * (`SearchImage`), não repassada crua.
 */

const UNSPLASH_ENDPOINT = "https://api.unsplash.com/search/photos";
const PER_PAGE = 24;

interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  width: number;
  height: number;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  user: { name: string };
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
    description: photo.description ?? photo.alt_description ?? "Imagem sem descrição",
    author: photo.user.name,
    aspectRatio: hasSize ? `${photo.width} / ${photo.height}` : "1 / 1",
    imageUrl: photo.urls.regular,
    thumbUrl: photo.urls.thumb,
  };
}

function reply(body: SearchApiResponse, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * A Unsplash sinaliza estouro de cota com HTTP 403 (às vezes 429) + header
 * `X-Ratelimit-Remaining: 0` e/ou corpo `{"errors":["Rate Limit Exceeded"]}`.
 */
function isRateLimited(response: Response, bodyText: string) {
  if (response.status !== 403 && response.status !== 429) return false;
  return response.headers.get("x-ratelimit-remaining") === "0" || /rate limit/i.test(bodyText);
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) return reply({ ok: true, results: [] });

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("UNSPLASH_ACCESS_KEY ausente — preencha .env.local (ver .env.local.example).");
    return reply({ ok: false, error: "unsplash_error" }, 500);
  }

  let response: Response;
  try {
    const url = `${UNSPLASH_ENDPOINT}?query=${encodeURIComponent(query)}&per_page=${PER_PAGE}&content_filter=high`;
    response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}`, "Accept-Version": "v1" },
      cache: "no-store",
    });
  } catch {
    // Falha de rede servidor → Unsplash. O client mostra a mensagem de falha de conexão.
    return reply({ ok: false, error: "unsplash_error" }, 502);
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    if (isRateLimited(response, bodyText)) {
      return reply({ ok: false, error: "rate_limit" }, 429);
    }
    console.error(`Unsplash respondeu ${response.status}: ${bodyText.slice(0, 200)}`);
    return reply({ ok: false, error: "unsplash_error" }, 502);
  }

  const data = (await response.json()) as UnsplashSearchResponse;
  return reply({ ok: true, results: data.results.map(toSearchImage) });
}
