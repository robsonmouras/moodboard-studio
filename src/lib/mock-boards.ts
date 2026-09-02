import { MOCK_IMAGES } from "@/lib/mock-images";
import type { Board, BoardItem } from "@/types";

/**
 * Boards mockados da Fase 1 — a "biblioteca" que aparece em `/favoritos`.
 *
 * Nenhuma persistência: este array é o seed do `BoardsProvider`. Renomear, excluir e
 * remover imagens acontece em memória e se perde ao recarregar / sair do fluxo de
 * `/favoritos`. Na Fase 3 isto sai e os boards passam a vir do Supabase (ver [[Board]]).
 *
 * Os itens de cada board reaproveitam o dataset de `mock-images.ts` — assim as capas
 * usam os mesmos placeholders de gradiente do grid de busca.
 */
const byId = new Map(MOCK_IMAGES.map((image) => [image.id, image]));

/** Monta a lista de itens de um board a partir dos ids (mantendo a ordem dada). */
function pick(...ids: string[]): BoardItem[] {
  return ids.map((id) => {
    const image = byId.get(id);
    if (!image) throw new Error(`mock-boards: imagem "${id}" não existe em MOCK_IMAGES`);
    return image;
  });
}

export const MOCK_BOARDS: Board[] = [
  {
    id: "banco-vortice-rebrand",
    name: "Banco Vórtice — rebrand",
    savedAt: "2026-08-28T14:12:00.000Z",
    items: pick("mock-01", "mock-03", "mock-06", "mock-13", "mock-26"),
  },
  {
    id: "escritorio-minimalista",
    name: "Escritório minimalista",
    savedAt: "2026-08-25T09:40:00.000Z",
    items: pick("mock-02", "mock-04", "mock-09", "mock-14", "mock-17", "mock-20"),
  },
  {
    id: "natureza-e-pausa",
    name: "Natureza & pausa",
    savedAt: "2026-08-19T18:05:00.000Z",
    items: pick("mock-07", "mock-08", "mock-10", "mock-15", "mock-21", "mock-25", "mock-28"),
  },
  {
    id: "texturas-neutras",
    name: "Texturas neutras",
    savedAt: "2026-08-11T11:20:00.000Z",
    items: pick("mock-11", "mock-19", "mock-23", "mock-27"),
  },
  {
    id: "noturno-neon",
    name: "Noturno / neon",
    savedAt: "2026-08-03T22:30:00.000Z",
    items: pick("mock-12", "mock-18", "mock-24"),
  },
  {
    id: "so-uma-ideia-solta",
    name: "Só uma ideia solta",
    savedAt: "2026-07-30T16:00:00.000Z",
    items: pick("mock-16"),
  },
];
