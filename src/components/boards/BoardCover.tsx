import Image from "next/image";
import { css } from "styled-system/css";

/**
 * Capa de um board: colagem das miniaturas das primeiras inspirações.
 *
 * 1 imagem ocupa a capa inteira; 2 dividem em duas colunas; 3+ formam uma grade 2x2
 * (mostrando no máximo 4). Board vazio mostra um aviso discreto.
 */
export function BoardCover({
  cover,
}: {
  cover: { thumbUrl: string; description: string }[];
}) {
  const tiles = cover.slice(0, 4);
  const columns = tiles.length <= 1 ? "1fr" : "1fr 1fr";
  const rows = tiles.length > 2 ? "1fr 1fr" : "1fr";

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
      {tiles.length === 0 && (
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

      {tiles.map((tile, index) => (
        <div
          key={`${tile.thumbUrl}-${index}`}
          className={css({ position: "relative", w: "full", h: "full", minH: "0", bg: "gray.3" })}
        >
          <Image
            src={tile.thumbUrl}
            alt={tile.description}
            fill
            sizes="(min-width: 768px) 240px, 45vw"
            className={css({ objectFit: "cover" })}
          />
        </div>
      ))}
    </div>
  );
}
