import type { BoardItem, SearchImage } from "@/types";

/**
 * Fotos de exemplo para as stories (busca / board). URLs reais da Unsplash — o
 * `images.unsplash.com` já está liberado em `next.config.ts` e o `<Image>` do
 * `@storybook/nextjs-vite` as serve direto.
 */
export const sampleSearchImages: SearchImage[] = [
  {
    id: "sb-1",
    source: "unsplash",
    description: "Parede de tijolos claros com samambaia pendente",
    author: "Sarah Dorweiler",
    authorUrl: "https://unsplash.com/@sarahdorweiler",
    sourceUrl: "https://unsplash.com/photos/x2Tmfd1-SgA",
    aspectRatio: "4 / 5",
    width: 1600,
    height: 2000,
    imageUrl: "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=1080",
    thumbUrl: "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=200",
  },
  {
    id: "sb-2",
    source: "pexels",
    description: "Mesa de trabalho minimalista com laptop e caderno",
    author: "Lum3n",
    authorUrl: "https://www.pexels.com/@lum3n-44775",
    aspectRatio: "3 / 2",
    width: 1500,
    height: 1000,
    imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1080",
    thumbUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=200",
  },
  {
    id: "sb-3",
    source: "unsplash",
    description: "Cadeira de design em tom terracota sobre fundo bege",
    author: "Nathan Oakley",
    aspectRatio: "1 / 1",
    width: 1200,
    height: 1200,
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1080",
    thumbUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200",
  },
];

export const sampleSearchImage = sampleSearchImages[0];

/**
 * Os mesmos exemplos na forma `BoardItem` (favoritado, ainda em memória) — pro
 * `BoardPanel` e outras stories do board em construção.
 */
export const sampleBoardItems: BoardItem[] = sampleSearchImages.map((image) => ({
  id: image.id,
  unsplashId: image.id,
  description: image.description,
  author: image.author,
  imageUrl: image.imageUrl,
  thumbUrl: image.thumbUrl,
  aspectRatio: image.aspectRatio,
  width: image.width,
  height: image.height,
}));

/** Miniaturas para a capa de um board (`BoardCover`, `BoardCard`). */
export const sampleCover = sampleSearchImages.map((image) => ({
  thumbUrl: image.thumbUrl,
  description: image.description,
}));
