import type { Metadata } from "next";
import { SearchWorkspace } from "@/components/SearchWorkspace";
import { getBoard, listBoardMemberships, listBoards } from "@/lib/boards";

/**
 * Home do produto (`/`) — a tela onde a Marina faz a busca.
 *
 * Fase 3: busca real na Unsplash → grid → favoritar → montar board → salvar no
 * Supabase. Atrás do middleware de sessão (`src/middleware.ts`): sem login,
 * redireciona pra `/login`.
 *
 * Server Component busca os boards recentes do usuário (faixa no hero, decisão 05);
 * a parte interativa vive em <SearchWorkspace> (client).
 *
 * `?add=<boardId>` liga o **modo contextual de adição**: o usuário veio de um
 * board (`/favoritos/[id]` → "Adicionar inspirações") e o que favoritar aqui vai
 * direto pra aquele board, sem passar pelo modal de nomear. Se o id não bate com
 * nenhum board do usuário (ex.: board excluído em outra aba), cai no
 * comportamento normal de busca, sem erro.
 */
export const metadata: Metadata = {
  title: "Moodboard Studio — do briefing ao board",
};

// Sessão por request — nada de cache entre usuários.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const { add } = await searchParams;
  const [boards, boardMemberships] = await Promise.all([
    listBoards(),
    // Mapa foto → boards que já a contêm, pra marcar os resultados da busca.
    listBoardMemberships(),
  ]);

  // Modo contextual: só liga se o `add` aponta pra um board que é mesmo do usuário.
  let activeBoard: {
    id: string;
    name: string;
    itemIds: { unsplashId: string; imageId: string }[];
  } | null = null;
  if (add && boards.some((board) => board.id === add)) {
    const full = await getBoard(add);
    if (full) {
      activeBoard = {
        id: full.id,
        name: full.name,
        itemIds: full.items.map((item) => ({
          unsplashId: item.unsplashId,
          imageId: item.id,
        })),
      };
    }
  }

  return (
    <SearchWorkspace
      recentBoards={boards.slice(0, 3)}
      totalBoardCount={boards.length}
      // Lista enxuta (id + nome) pra checar, na hora de salvar, se o nome digitado
      // bate com um board que já existe — e oferecer somar nele em vez de duplicar.
      existingBoards={boards.map((board) => ({ id: board.id, name: board.name }))}
      boardMemberships={boardMemberships}
      activeBoard={activeBoard}
    />
  );
}
