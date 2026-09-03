import type { Metadata } from "next";
import { SearchWorkspace } from "@/components/SearchWorkspace";
import { listBoards } from "@/lib/boards";

/**
 * Home do produto (`/`) — a tela onde a Marina faz a busca.
 *
 * Fase 3: busca real na Unsplash → grid → favoritar → montar board → salvar no
 * Supabase. Atrás do middleware de sessão (`src/middleware.ts`): sem login,
 * redireciona pra `/login`.
 *
 * Server Component busca os boards recentes do usuário (faixa no hero, decisão 05);
 * a parte interativa vive em <SearchWorkspace> (client).
 */
export const metadata: Metadata = {
  title: "Moodboard Studio — do briefing ao board",
};

// Sessão por request — nada de cache entre usuários.
export const dynamic = "force-dynamic";

export default async function Home() {
  const boards = await listBoards();
  return (
    <SearchWorkspace
      recentBoards={boards.slice(0, 3)}
      totalBoardCount={boards.length}
      // Lista enxuta (id + nome) pra checar, na hora de salvar, se o nome digitado
      // bate com um board que já existe — e oferecer somar nele em vez de duplicar.
      existingBoards={boards.map((board) => ({ id: board.id, name: board.name }))}
    />
  );
}
