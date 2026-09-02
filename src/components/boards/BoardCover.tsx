import { css } from "styled-system/css";
import type { BoardItem } from "@/types";

/**
 * Capa de um board: colagem dos placeholders das primeiras inspirações.
 *
 * 1 imagem ocupa a capa inteira; 2 dividem em duas colunas; 3+ formam uma grade 2x2
 * (mostrando no máximo 4). Board vazio mostra um aviso discreto. Usa o mesmo gradiente
 * data-driven do `ImageTile` (cores vêm do conteúdo da foto, não são token de tema).
 */
export function BoardCover({ items }: { items: BoardItem[] }) {
  const cover = items.slice(0, 4);
  const columns = cover.length <= 1 ? "1fr" : "1fr 1fr";
  const rows = cover.length > 2 ? "1fr 1fr" : "1fr";

  return (
    <div
      className={css({
        aspectRatio: "4 / 3",
        w: "full",
        rounded: "xl",
        overflow: "hidden",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "border",
        bg: "gray.4",
        display: "grid",
        gap: "2px",
      })}
      style={{ gridTemplateColumns: columns, gridTemplateRows: rows }}
    >
      {cover.length === 0 && (
        <span
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "surface",
            fontFamily: "body",
            fontSize: "xs",
            color: "gray.9",
          })}
        >
          Board vazio
        </span>
      )}

      {cover.map((item) => (
        <div
          key={item.id}
          role="img"
          aria-label={item.description}
          className={css({ w: "full", h: "full", minH: "0", bg: "gray.3" })}
          style={{
            backgroundImage: `linear-gradient(145deg, ${item.placeholder.from}, ${item.placeholder.to})`,
          }}
        />
      ))}
    </div>
  );
}
