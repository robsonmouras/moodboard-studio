"use client";

import { Heart } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { ImageTile } from "@/components/ImageTile";
import type { SearchImage } from "@/types";

/**
 * Card de um resultado no grid de busca (masonry, proporção livre da foto).
 *
 * Sem chrome no estado de repouso: só a imagem. No hover (ou foco, ou já favoritada)
 * a imagem dá um zoom leve e sobe um overlay com o crédito do autor e o coração de
 * favoritar juntos — em vez do ícone solto flutuando no canto (decisão 06). Card
 * favoritado mantém o overlay visível pra marcar o que já está no board.
 *
 * O estado de favorito vive no `SearchWorkspace` (pai).
 */

const card = css({
  display: "block",
  mb: "3",
  breakInside: "avoid",
  position: "relative",
  rounded: "xl",
  overflow: "hidden",
  bg: "gray.3",
  "& img": {
    transition: "transform 0.5s cubic-bezier(0.2, 0, 0, 1)",
  },
  _hover: {
    "& img": { transform: "scale(1.045)" },
    "& [data-role='overlay']": { opacity: "1" },
  },
  _focusWithin: {
    "& [data-role='overlay']": { opacity: "1" },
  },
  "&[data-fav='true'] [data-role='overlay']": { opacity: "1" },
});

const overlay = css({
  position: "absolute",
  insetInline: "0",
  bottom: "0",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "3",
  px: "3",
  pt: "12",
  pb: "2.5",
  backgroundImage: "linear-gradient(to top, token(colors.black.a9), transparent)",
  // Toque (sem hover) mostra sempre; no desktop, revela no hover/foco.
  opacity: { base: "1", md: "0" },
  transition: "opacity 0.25s ease",
  pointerEvents: "none",
});

const authorName = css({
  minW: "0",
  flex: "1",
  color: "white",
  fontFamily: "body",
  fontSize: "xs",
  lineHeight: "1.3",
  textShadow: "0 1px 2px token(colors.black.a7)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// Sem "botão" — o coração fica direto sobre o gradiente, na mesma linha do crédito,
// como uma legenda só. Sombra dá leitura em qualquer foto (clara ou escura).
const heartButton = css({
  pointerEvents: "auto",
  flexShrink: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "8",
  h: "8",
  mr: "-1",
  mb: "-0.5",
  rounded: "full",
  border: "none",
  cursor: "pointer",
  bg: "transparent",
  color: "white",
  filter: "drop-shadow(0 1px 3px token(colors.black.a9))",
  transitionProperty: "transform",
  transitionDuration: "0.15s",
  _hover: { transform: "scale(1.12)" },
  _active: { transform: "scale(0.9)" },
  _focusVisible: { outline: "2px solid", outlineColor: "white", outlineOffset: "1px" },
});

export function ResultCard({
  image,
  isFavorite,
  onToggleFavorite,
}: {
  image: SearchImage;
  isFavorite: boolean;
  onToggleFavorite: (image: SearchImage) => void;
}) {
  return (
    <figure className={card} data-fav={isFavorite}>
      <ImageTile image={image} />

      <figcaption className={overlay} data-role="overlay">
        <span className={authorName}>{image.author}</span>

        <button
          type="button"
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remover "${image.description}" do board`
              : `Favoritar "${image.description}"`
          }
          onClick={() => onToggleFavorite(image)}
          className={heartButton}
        >
          <Heart size={22} weight={isFavorite ? "fill" : "light"} />
        </button>
      </figcaption>
    </figure>
  );
}
