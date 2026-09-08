import type { ImageSource } from "@/types";

/**
 * Catálogo das fontes de imagem da busca — seguro para o client.
 *
 * O agregador (`./index.ts`) é `server-only`; este módulo não é, então o filtro
 * de fontes no `SearchWorkspace`, a Route Handler e os adaptadores compartilham
 * daqui a mesma lista, os mesmos rótulos e o mesmo formato do parâmetro `sources`.
 */

export interface ImageSourceInfo {
  readonly id: ImageSource;
  readonly label: string;
}

/** As fontes na ordem canônica em que o grid combinado as intercala. */
export const IMAGE_SOURCES: readonly ImageSourceInfo[] = [
  { id: "unsplash", label: "Unsplash" },
  { id: "pexels", label: "Pexels" },
  { id: "pixabay", label: "Pixabay" },
];

export const ALL_SOURCE_IDS: readonly ImageSource[] = IMAGE_SOURCES.map(
  (source) => source.id,
);

export const SOURCE_LABEL: Record<ImageSource, string> = {
  unsplash: "Unsplash",
  pexels: "Pexels",
  pixabay: "Pixabay",
};

const KNOWN_IDS = new Set<string>(ALL_SOURCE_IDS);

/**
 * Lê o parâmetro `?sources=unsplash,pexels` numa lista validada e na ordem
 * canônica. Ausente, vazio ou só com lixo → todas as fontes (o padrão do produto).
 */
export function parseSources(raw: string | null | undefined): ImageSource[] {
  if (!raw) return [...ALL_SOURCE_IDS];
  const picked = new Set(
    raw
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .filter((token) => KNOWN_IDS.has(token)),
  );
  const ordered = ALL_SOURCE_IDS.filter((id) => picked.has(id));
  return ordered.length > 0 ? ordered : [...ALL_SOURCE_IDS];
}

/**
 * Serializa a escolha pra query string, na ordem canônica. Devolve `null` quando
 * é o conjunto completo (ou vazio) — aí o parâmetro é omitido e o servidor
 * consulta todas as fontes.
 */
export function serializeSources(sources: readonly ImageSource[]): string | null {
  const chosen = ALL_SOURCE_IDS.filter((id) => sources.includes(id));
  if (chosen.length === 0 || chosen.length === ALL_SOURCE_IDS.length) return null;
  return chosen.join(",");
}
