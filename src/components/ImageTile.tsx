import Image from "next/image";
import { css } from "styled-system/css";
import { unsplashHiRes } from "@/lib/unsplash-image";

/** Proporção usada quando o item não carrega dimensão (imagens de board salvo). */
const DEFAULT_ASPECT_RATIO = "4 / 5";

/**
 * Forma mínima que o tile precisa: descrição + uma fonte visual (a URL real da
 * imagem). A proporção é opcional — a busca (Fase 2) traz o valor real da Unsplash;
 * boards salvos (Fase 3) não guardam dimensão e caem no padrão. Aceita tanto
 * `SearchImage` quanto `BoardItem`.
 */
interface ImageTileData {
  description: string;
  aspectRatio?: string;
  imageUrl?: string;
  thumbUrl?: string;
  placeholder?: { from: string; to: string };
}

/**
 * Tile de uma imagem no grid de busca e no board.
 *
 * Fase 2: se `imageUrl` (ou `thumbUrl`) existe, renderiza a foto real da Unsplash via
 * `next/image` sobre o gradiente (que serve de placeholder durante o carregamento).
 * Boards mockados da Fase 1 não têm URL — cai só no gradiente de `placeholder`.
 */
export function ImageTile({
  image,
  rounded = "xl",
  sizes = "(min-width: 768px) 340px, 45vw",
}: {
  image: ImageTileData;
  rounded?: "lg" | "xl";
  sizes?: string;
}) {
  // Foto principal em alta (Unsplash sob demanda); só cai no thumb se não houver
  // a URL cheia (boards mockados da Fase 1).
  const src = image.imageUrl ? unsplashHiRes(image.imageUrl) : image.thumbUrl;

  return (
    <div
      role={src ? undefined : "img"}
      aria-label={src ? undefined : image.description}
      className={css({
        position: "relative",
        w: "full",
        rounded,
        overflow: "hidden",
        bg: "gray.3",
      })}
      style={{
        aspectRatio: image.aspectRatio ?? DEFAULT_ASPECT_RATIO,
        backgroundImage: image.placeholder
          ? `linear-gradient(145deg, ${image.placeholder.from}, ${image.placeholder.to})`
          : undefined,
      }}
    >
      {src && (
        <Image
          src={src}
          alt={image.description}
          fill
          sizes={sizes}
          quality={90}
          className={css({ objectFit: "cover" })}
        />
      )}
    </div>
  );
}
