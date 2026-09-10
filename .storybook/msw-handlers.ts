import { http, HttpResponse } from "msw";
import type { SearchApiResponse } from "@/types";
import { sampleSearchImages } from "@/components/__fixtures__/images";

/**
 * Handlers do MSW para as stories que batem em rede. Hoje só a busca real da home
 * (`SearchWorkspace` → `GET /api/search`) — nada de catch-all.
 */

/** Busca com sucesso: devolve as fotos de exemplo das fixtures para qualquer termo. */
export const searchOk = http.get("/api/search", ({ request }) => {
  const term = new URL(request.url).searchParams.get("q") ?? "";
  const body: SearchApiResponse = {
    ok: true,
    results: term ? sampleSearchImages : [],
    page: 1,
    totalPages: 1,
  };
  return HttpResponse.json(body);
});
