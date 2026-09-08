"use client";

import { Check, Heart } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { ImageTile } from "@/components/ImageTile";
import { SOURCE_LABEL } from "@/lib/image-sources/catalog";
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
    "& [data-role='source']": { opacity: "0" },
  },
  _focusWithin: {
    "& [data-role='overlay']": { opacity: "1" },
    "& [data-role='source']": { opacity: "0" },
  },
  "&[data-fav='true'] [data-role='overlay']": { opacity: "1" },
  "&[data-fav='true'] [data-role='source']": { opacity: "0" },
});

// Selo permanente no canto: esta foto já está salva em algum board do usuário
// (mostra o nome do board). O usuário ainda pode marcá-la — a validação final
// avisa e ignora —, mas fica claro de cara onde ela já está.
const inBoardBadge = css({
  position: "absolute",
  top: "2",
  left: "2",
  maxW: "calc(100% - 1rem)",
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  pl: "1.5",
  pr: "2.5",
  py: "1",
  rounded: "full",
  bg: "brand.9",
  color: "white",
  fontFamily: "body",
  fontSize: "11px",
  fontWeight: "medium",
  lineHeight: "1.2",
  boxShadow: "sm",
  pointerEvents: "none",
});

const inBoardBadgeText = css({
  minW: "0",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
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

// Bloco de crédito: nome do fotógrafo (link pra fonte quando há) + a origem da
// foto. A licença de Unsplash/Pexels pede atribuição ao autor; o rótulo da fonte
// deixa claro de onde a imagem veio no grid combinado.
const credit = css({
  minW: "0",
  flex: "1",
  display: "flex",
  flexDir: "column",
  gap: "0.5",
  // O overlay é `pointer-events: none`; o link do autor volta a ser clicável.
  pointerEvents: "auto",
});

const authorName = css({
  maxW: "full",
  color: "white",
  fontFamily: "body",
  fontSize: "xs",
  lineHeight: "1.3",
  textShadow: "0 1px 2px token(colors.black.a7)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const authorLink = css({
  textDecoration: "none",
  _hover: { textDecoration: "underline" },
  _focusVisible: { outline: "2px solid", outlineColor: "white", outlineOffset: "2px" },
});

const sourceTag = css({
  color: "white",
  opacity: "0.7",
  fontFamily: "body",
  fontSize: "10px",
  lineHeight: "1",
  textShadow: "0 1px 2px token(colors.black.a7)",
});

// Selo permanente e discreto com a origem da foto (Unsplash/Pexels/Pixabay) — dá
// sentido visual ao filtro de fontes. Some no hover/foco/favorito, quando o
// crédito completo do overlay assume, e no mobile, onde o overlay já fica sempre visível.
const sourceBadge = css({
  position: "absolute",
  bottom: "2",
  left: "2",
  px: "2",
  py: "0.5",
  rounded: "full",
  bg: "black.a7",
  color: "white",
  fontFamily: "body",
  fontSize: "10px",
  fontWeight: "medium",
  lineHeight: "1.4",
  letterSpacing: "0.02em",
  pointerEvents: "none",
  opacity: { base: "0", md: "1" },
  transition: "opacity 0.2s ease",
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
  inBoardLabel,
  inBoardTitle,
  onToggleFavorite,
}: {
  image: SearchImage;
  isFavorite: boolean;
  /**
   * Selo no canto: "em «Board»" quando a foto já está salva em algum board do
   * usuário (ou "já neste board" no modo contextual). Só informativo — o clique
   * continua livre; a validação final avisa quais já estavam lá e ignora as repetidas.
   */
  inBoardLabel?: string;
  /** Texto completo pro `title` quando a foto está em vários boards. */
  inBoardTitle?: string;
  onToggleFavorite: (image: SearchImage) => void;
}) {
  const inBoard = Boolean(inBoardLabel);
  return (
    <figure className={card} data-fav={isFavorite}>
      <ImageTile image={image} />

      <span className={sourceBadge} data-role="source" aria-hidden>
        {SOURCE_LABEL[image.source]}
      </span>

      {inBoardLabel && (
        <span className={inBoardBadge} title={inBoardTitle ?? inBoardLabel}>
          <Check size={11} weight="bold" aria-hidden />
          <span className={inBoardBadgeText}>{inBoardLabel}</span>
        </span>
      )}

      <figcaption className={overlay} data-role="overlay">
        <span className={credit}>
          {image.authorUrl ? (
            <a
              href={image.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${authorName} ${authorLink}`}
              title={`${image.author} — abrir na ${SOURCE_LABEL[image.source]}`}
            >
              {image.author}
            </a>
          ) : (
            <span className={authorName}>{image.author}</span>
          )}
          <span className={sourceTag}>{SOURCE_LABEL[image.source]}</span>
        </span>

        <button
          type="button"
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Tirar "${image.description}" da seleção`
              : inBoard
                ? `Marcar "${image.description}" (${inBoardTitle ?? inBoardLabel})`
                : `Marcar "${image.description}"`
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
