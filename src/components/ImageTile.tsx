import { css } from "styled-system/css";
import type { SearchImage } from "@/types";

/**
 * Placeholder visual de uma imagem de resultado (Fase 1).
 *
 * Renderiza um gradiente a partir de `image.placeholder` — as fotos reais da Unsplash
 * entram no lugar disto na Fase 2 (provavelmente via `next/image`). O `aria-label`
 * carrega a descrição para leitores de tela.
 */
export function ImageTile({
  image,
  rounded = "xl",
}: {
  image: SearchImage;
  rounded?: "lg" | "xl";
}) {
  return (
    <div
      role="img"
      aria-label={image.description}
      className={css({
        w: "full",
        rounded,
        overflow: "hidden",
        bg: "gray.3",
      })}
      style={{
        aspectRatio: image.aspectRatio,
        backgroundImage: `linear-gradient(145deg, ${image.placeholder.from}, ${image.placeholder.to})`,
      }}
    />
  );
}
