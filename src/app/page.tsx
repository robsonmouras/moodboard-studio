import type { Metadata } from "next";
import { SearchWorkspace } from "@/components/SearchWorkspace";

/**
 * Home do produto (`/`) — a tela onde a Marina já faz a busca.
 *
 * Fase 1: protótipo navegável com dados mockados (busca → grid → favoritar → montar board),
 * sem backend e sem porta de login. A tela de login segue existindo em código (`/login`),
 * fora deste fluxo, para a Fase 3.
 *
 * A parte interativa vive em <SearchWorkspace> (client).
 */
export const metadata: Metadata = {
  title: "Moodboard Studio — do briefing ao board",
};

export default function Home() {
  return <SearchWorkspace />;
}
