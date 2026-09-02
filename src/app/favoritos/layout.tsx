import type { ReactNode } from "react";
import { BoardsProvider } from "@/components/boards/BoardsProvider";

/**
 * Layout do fluxo de Favoritos: mantém o estado dos boards (`BoardsProvider`) vivo
 * durante a navegação entre a biblioteca (`/favoritos`) e o detalhe (`/favoritos/[id]`).
 */
export default function FavoritosLayout({ children }: { children: ReactNode }) {
  return <BoardsProvider>{children}</BoardsProvider>;
}
