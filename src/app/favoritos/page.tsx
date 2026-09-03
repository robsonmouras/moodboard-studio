import type { Metadata } from "next";
import { BoardsLibrary } from "@/components/boards/BoardsLibrary";
import { listBoards } from "@/lib/boards";

/**
 * Rota `/favoritos` — a biblioteca de boards salvos do usuário logado.
 *
 * Fase 3: os boards vêm do Supabase (RLS por `user_id`). Server Component busca a
 * lista; a interatividade (filtro, excluir) vive em <BoardsLibrary>.
 */
export const metadata: Metadata = {
  title: "Favoritos — Moodboard Studio",
};

// Sessão por request — nada de cache entre usuários.
export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const boards = await listBoards();
  return <BoardsLibrary boards={boards} />;
}
