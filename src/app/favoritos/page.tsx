import type { Metadata } from "next";
import { BoardsLibrary } from "@/components/boards/BoardsLibrary";

/**
 * Rota `/favoritos` — a biblioteca de boards salvos do usuário (item "Favoritos" da navbar).
 *
 * Fase 1: boards mockados, edições em memória. A parte interativa vive em <BoardsLibrary>.
 */
export const metadata: Metadata = {
  title: "Favoritos — Moodboard Studio",
};

export default function FavoritosPage() {
  return <BoardsLibrary />;
}
