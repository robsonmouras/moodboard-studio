import { NextResponse } from "next/server";
import { unsplashHiRes } from "@/lib/unsplash-image";
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
// A Unsplash rejeita páginas além disso (~10 mil resultados / PER_PAGE). Passar
// disso é sempre 4xx, então nem manda a requisição.
const MAX_PAGE = Math.floor(10_000 / PER_PAGE);

/** Lê `?page=`, com piso 1 e teto no limite da Unsplash. Vazio/lixo vira 1. */
function readPage(url: URL): number {
  const raw = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(raw, MAX_PAGE);
}

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
    width: photo.width,
    height: photo.height,
    // A partir de `urls.raw` (sem recorte), pede a foto em alta pela Unsplash —
    // é o que vai pra tela e o que se grava no board (não trava mais em 1080px).
    imageUrl: unsplashHiRes(photo.urls.raw),
    thumbUrl: photo.urls.small,
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
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const page = readPage(url);
  if (!query) return reply({ ok: true, results: [], page: 1, totalPages: 0 });

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("UNSPLASH_ACCESS_KEY ausente — preencha .env.local (ver .env.local.example).");
    return reply({ ok: false, error: "unsplash_error" }, 500);
  }

  let response: Response;
  try {
    const endpoint = `${UNSPLASH_ENDPOINT}?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}&content_filter=high`;
    response = await fetch(endpoint, {
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
  return reply({
    ok: true,
    results: data.results.map(toSearchImage),
    page,
    totalPages: Math.min(data.total_pages, MAX_PAGE),
  });
}
