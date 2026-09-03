import type { Metadata } from "next";
import { BoardDetailView } from "@/components/boards/BoardDetailView";
import { BoardNotFound } from "@/components/boards/BoardNotFound";
import { getBoard } from "@/lib/boards";

/**
 * Rota `/favoritos/[id]` — detalhe de um board: renomear, remover inspirações, excluir.
 *
 * Fase 3: o board vem do Supabase (RLS garante que só o dono lê). Server Component
 * resolve o board; a interatividade vive em <BoardDetailView>.
 */
export const metadata: Metadata = {
  title: "Board — Moodboard Studio",
};

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const board = await getBoard(id);

  if (!board) return <BoardNotFound />;
  return <BoardDetailView board={board} />;
}
