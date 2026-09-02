"use client";

import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { css } from "styled-system/css";
import { iconDefaults } from "@/components/Icon";
import { ImageTile } from "@/components/ImageTile";
import type { SearchImage } from "@/types";

/**
 * Card de um resultado no grid de busca. Mostra o placeholder da imagem, o crédito
 * do autor e um botão de favoritar que adiciona/remove a imagem do board.
 *
 * O estado de favorito vive no `SearchWorkspace` (pai) — este componente só reflete
 * `isFavorite` e dispara `onToggleFavorite`.
 */
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
    <figure
      className={css({
        display: "block",
        mb: "3",
        breakInside: "avoid",
        position: "relative",
      })}
    >
      <ImageTile image={image} />

      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `Remover "${image.description}" do board`
            : `Favoritar "${image.description}"`
        }
        onClick={() => onToggleFavorite(image)}
        className={css({
          position: "absolute",
          top: "2.5",
          right: "2.5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          w: "9",
          h: "9",
          rounded: "full",
          cursor: "pointer",
          bg: isFavorite ? "ctaPurple" : "surface",
          color: isFavorite ? "white" : "textPrimary",
          boxShadow: "sm",
          transitionProperty: "background-color, color",
          transitionDuration: "0.15s",
          _hover: { bg: isFavorite ? "brand.10" : "gray.2" },
          _focusVisible: { outline: "2px solid", outlineColor: "ctaPurple", outlineOffset: "2px" },
        })}
      >
        {isFavorite ? (
          <IconHeartFilled size={18} />
        ) : (
          <IconHeart {...iconDefaults} size={18} />
        )}
      </button>

      <figcaption
        className={css({
          mt: "1.5",
          fontFamily: "body",
          fontSize: "xs",
          color: "gray.11",
        })}
      >
        {image.author}
      </figcaption>
    </figure>
  );
}
