import type { Metadata } from "next";
import { BoardsLibrary } from "@/components/boards/BoardsLibrary";
import { listBoards } from "@/lib/boards";

/**
 * Rota `/favoritos` — a biblioteca de boards salvos do usuário logado.
 *
 * Fase 3: os boards vêm do Supabase (RLS por `user_id`). Server Component busca a
 * lista; a interatividade (filtro, excluir) vive em <BoardsLibrary>.
 *
 * `?excluido=1` chega do redirect da action `deleteBoard` (excluir pelo card ou
 * pela tela de detalhe): vira o toast "Board excluído." e é limpo da URL pelo
 * próprio <BoardsLibrary>.
 */
export const metadata: Metadata = {
  title: "Favoritos — Moodboard Studio",
};

// Sessão por request — nada de cache entre usuários.
export const dynamic = "force-dynamic";

export default async function FavoritosPage({
  searchParams,
}: {
  searchParams: Promise<{ excluido?: string }>;
}) {
  const { excluido } = await searchParams;
  const boards = await listBoards();
  return <BoardsLibrary boards={boards} justDeleted={excluido === "1"} />;
}
