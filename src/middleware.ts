import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware de sessão + proteção de rota (Fase 3).
 *
 * Toda request passa por aqui exceto assets estáticos e a rota de busca da API.
 * A lógica de sessão/redirect vive em `updateSession`.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Casa com tudo, menos:
     * - _next/static, _next/image (assets do build)
     * - favicon.ico e arquivos de imagem soltos em /public
     * - /api (Route Handlers — a busca não precisa de gate de sessão)
     */
    "/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
