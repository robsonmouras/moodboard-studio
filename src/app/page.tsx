import type { Metadata } from "next";
import { SearchWorkspace } from "@/components/SearchWorkspace";

/**
 * Home do produto (`/`) — a tela onde a Marina faz a busca.
 *
 * Fase 3: busca real na Unsplash → grid → favoritar → montar board → salvar no
 * Supabase. Atrás do middleware de sessão (`src/middleware.ts`): sem login,
 * redireciona pra `/login`.
 *
 * A parte interativa vive em <SearchWorkspace> (client).
 */
export const metadata: Metadata = {
  title: "Moodboard Studio — do briefing ao board",
};

export default function Home() {
  return <SearchWorkspace />;
}
