import type { Metadata } from "next";
import { BoardDetailView } from "@/components/boards/BoardDetailView";
import { BoardNotFound } from "@/components/boards/BoardNotFound";
import { getBoard } from "@/lib/boards";

/**
 * Rota `/favoritos/[id]` — detalhe de um board: renomear, remover inspirações, excluir.
 *
 * Fase 3: o board vem do Supabase (RLS garante que só o dono lê). Server Component
 * resolve o board; a interatividade vive em <BoardDetailView>.
 *
 * `?adicionadas=N` chega de volta do modo contextual da busca ("Adicionar
 * inspirações" → favoritar → "Voltar ao board"): vira o toast "N inspirações
 * adicionadas." e é limpo da URL pelo próprio <BoardDetailView>.
 */
export const metadata: Metadata = {
  title: "Board — Moodboard Studio",
};

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ adicionadas?: string }>;
}) {
  const { id } = await params;
  const { adicionadas } = await searchParams;
  const board = await getBoard(id);

  if (!board) return <BoardNotFound />;

  const parsed = Number(adicionadas);
  const justAdded = Number.isInteger(parsed) && parsed > 0 ? parsed : 0;

  return <BoardDetailView board={board} justAdded={justAdded} />;
}
