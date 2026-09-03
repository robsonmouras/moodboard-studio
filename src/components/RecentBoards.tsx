import Link from "next/link";
import { css } from "styled-system/css";
import { BoardCard } from "@/components/boards/BoardCard";
import type { BoardSummary } from "@/types";

/**
 * Faixa de "Boards recentes" no hero da home (estado inicial).
 *
 * Reaproveita o `BoardCard` da biblioteca (`/favoritos`) — mesma capa, mesma
 * contagem, mesmos atalhos de editar/excluir. Substitui a ilustração open-peeps que
 * ficava solta abaixo da busca (decisão 05): em vez de enfeite, conteúdo real e um
 * caminho de volta pros boards salvos. Só aparece quando há ao menos 1 board.
 *
 * `totalCount` é o total de boards do usuário (não só os exibidos aqui) — o link
 * "Ver todos" só faz sentido quando há mais boards do que a faixa mostra.
 */
export function RecentBoards({
  boards,
  totalCount,
}: {
  boards: BoardSummary[];
  totalCount: number;
}) {
  return (
    <section
      className={css({
        w: "full",
        maxW: "960px",
        mx: "auto",
        mt: { base: "10", md: "12" },
      })}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "3",
          mb: "4",
        })}
      >
        <h2
          className={css({
            fontFamily: "display",
            fontWeight: "400",
            fontSize: { base: "lg", md: "xl" },
            color: "textPrimary",
          })}
        >
          Boards recentes
        </h2>
        {totalCount > 5 && (
          <Link
            href="/favoritos"
            className={css({
              fontFamily: "body",
              fontSize: "sm",
              color: "ctaPurple",
              _hover: { textDecoration: "underline" },
            })}
          >
            Ver todos
          </Link>
        )}
      </div>

      <ul
        className={css({
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: {
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: { base: "4", md: "5" },
        })}
      >
        {boards.map((board) => (
          <li key={board.id}>
            <BoardCard board={board} />
          </li>
        ))}
      </ul>
    </section>
  );
}
