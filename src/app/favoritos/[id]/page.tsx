import type { Metadata } from "next";
import { BoardDetailView } from "@/components/boards/BoardDetailView";

/**
 * Rota `/favoritos/[id]` — detalhe de um board: renomear, remover inspirações, excluir.
 *
 * Fase 1: o board é resolvido no cliente a partir do estado do `BoardsProvider`
 * (seed mockado), por isso o título é estático. A parte visual vive em <BoardDetailView>.
 */
export const metadata: Metadata = {
  title: "Board — Moodboard Studio",
};

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BoardDetailView boardId={id} />;
}
