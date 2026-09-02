"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { MOCK_BOARDS } from "@/lib/mock-boards";
import type { Board } from "@/types";

/**
 * Estado dos boards salvos, compartilhado entre a biblioteca (`/favoritos`) e a tela
 * de detalhe (`/favoritos/[id]`).
 *
 * Vive num provider montado no layout de `/favoritos`, então renomear um board na
 * tela de detalhe e voltar pra lista mantém a mudança durante a navegação. Sair do
 * fluxo (ir pra `/`) e voltar re-semeia a partir de `MOCK_BOARDS`.
 *
 * TODO(Fase 3): trocar o seed mockado por leitura do Supabase e persistir as edições.
 */
interface BoardsContextValue {
  boards: Board[];
  getBoard: (id: string) => Board | undefined;
  renameBoard: (id: string, name: string) => void;
  deleteBoard: (id: string) => void;
  removeItem: (boardId: string, itemId: string) => void;
}

const BoardsContext = createContext<BoardsContextValue | null>(null);

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>(MOCK_BOARDS);

  const value = useMemo<BoardsContextValue>(
    () => ({
      boards,
      getBoard: (id) => boards.find((board) => board.id === id),
      renameBoard: (id, name) =>
        setBoards((current) =>
          current.map((board) => (board.id === id ? { ...board, name } : board)),
        ),
      deleteBoard: (id) =>
        setBoards((current) => current.filter((board) => board.id !== id)),
      removeItem: (boardId, itemId) =>
        setBoards((current) =>
          current.map((board) =>
            board.id === boardId
              ? { ...board, items: board.items.filter((item) => item.id !== itemId) }
              : board,
          ),
        ),
    }),
    [boards],
  );

  return <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>;
}

export function useBoards() {
  const context = useContext(BoardsContext);
  if (!context) {
    throw new Error("useBoards precisa estar dentro de <BoardsProvider>");
  }
  return context;
}
