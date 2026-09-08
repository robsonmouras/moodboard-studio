import { NextResponse } from "next/server";
import { MAX_PAGE, searchImages } from "@/lib/image-sources";
import type { SearchApiResponse } from "@/types";

/**
 * Route Handler da busca de imagens.
 *
 * O client (`SearchWorkspace`) chama `GET /api/search?q=<termo>&page=<n>`. A busca
 * é agregada: o módulo `src/lib/image-sources` consulta todas as fontes ativas
 * (Unsplash, Pexels, …) no servidor e combina os resultados. As chaves das fontes
 * (sem prefixo `NEXT_PUBLIC_`) nunca chegam ao bundle do browser, e a resposta
 * crua de cada fonte é mapeada para `SearchImage`, não repassada.
 */

/** Lê `?page=`, com piso 1 e teto no limite do agregador. Vazio/lixo vira 1. */
function readPage(url: URL): number {
  const raw = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(raw, MAX_PAGE);
}

function reply(body: SearchApiResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const page = readPage(url);
  if (!query) return reply({ ok: true, results: [], page: 1, totalPages: 0 });

  const result = await searchImages(query, page);

  if (!result.ok) {
    return result.error === "rate_limit"
      ? reply({ ok: false, error: "rate_limit" }, 429)
      : reply({ ok: false, error: "unsplash_error" }, 502);
  }

  return reply({
    ok: true,
    results: result.results,
    page,
    // O client trata `nextPage <= totalPages` como "ainda há o que carregar".
    totalPages: result.hasMore ? page + 1 : page,
  });
}
