"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { css } from "styled-system/css";
import { BoardPanel } from "@/components/BoardPanel";
import { HeroIllustration } from "@/components/HeroIllustration";
import { Navbar } from "@/components/Navbar";
import { ResultsGrid, type SearchStatus } from "@/components/ResultsGrid";
import { SearchField } from "@/components/SearchField";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { BoardItem, SearchApiResponse, SearchImage } from "@/types";

/** Uma imagem favoritada na busca vira `BoardItem` (ainda em memória, antes de salvar). */
function toBoardItem(image: SearchImage): BoardItem {
  return {
    id: image.id,
    unsplashId: image.id,
    description: image.description,
    author: image.author,
    aspectRatio: image.aspectRatio,
    imageUrl: image.imageUrl,
    thumbUrl: image.thumbUrl,
  };
}

/** Desfecho da última busca concluída, marcado com o termo a que pertence. */
type SearchOutcome =
  | { query: string; kind: "response"; body: SearchApiResponse }
  | { query: string; kind: "networkError" };

/**
 * Traduz o desfecho guardado + o termo atual em `status`/`results` para o `ResultsGrid`.
 * Enquanto o desfecho não corresponde ao termo atual (debounce pendente ou requisição
 * em voo), o estado é "loading".
 */
function deriveSearchState(
  currentQuery: string,
  outcome: SearchOutcome | null,
): { status: SearchStatus; results: SearchImage[] } {
  if (!currentQuery || !outcome || outcome.query !== currentQuery) {
    return { status: "loading", results: [] };
  }
  if (outcome.kind === "networkError") {
    return { status: "networkError", results: [] };
  }
  if (!outcome.body.ok) {
    return {
      status: outcome.body.error === "rate_limit" ? "rateLimit" : "apiError",
      results: [],
    };
  }
  const results = outcome.body.results;
  return { status: results.length === 0 ? "empty" : "success", results };
}

/**
 * Tela principal do produto (rota `/`): busca → grid de resultados → favoritar → montar board.
 *
 * Estado inicial: título + campo de busca centralizados na tela (hero limpo). Depois da
 * primeira busca, a busca sobe para o topo, o grid aparece e o board se forma abaixo dos
 * resultados.
 *
 * Fluxo:
 * - a busca consome a Unsplash de verdade via `GET /api/search` (Fase 2), com debounce
 *   na digitação para não disparar uma requisição por tecla;
 * - favoritos persistem entre buscas diferentes (só na sessão, até salvar);
 * - "Salvar" grava o board no Supabase (`POST /api/boards`) — cria a linha em
 *   `boards` (com slug público) e uma em `board_images` por item — e só então o
 *   toast "Salvo." aparece. Salvo, o board limpa pra começar outro.
 *
 * O acesso a esta tela é protegido pelo middleware de sessão (Fase 3).
 */
export function SearchWorkspace() {
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [boardName, setBoardName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Só guarda o desfecho da última busca concluída (com o termo a que ele pertence).
  // `status` e `results` são derivados disso — assim o efeito nunca chama setState de
  // forma síncrona, só dentro dos callbacks async do fetch.
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim(), 400);
  const favoriteIds = useMemo(() => new Set(board.map((item) => item.id)), [board]);
  const hasSearched = query.trim().length > 0;

  const { status, results } = deriveSearchState(debouncedQuery, outcome);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Busca real na Unsplash: dispara quando o termo (já com debounce) muda; aborta a
  // requisição anterior se o usuário continuar digitando.
  useEffect(() => {
    if (!debouncedQuery) return;

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as SearchApiResponse;
        setOutcome({ query: debouncedQuery, kind: "response", body });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setOutcome({ query: debouncedQuery, kind: "networkError" });
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery]);

  function flashToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function toggleFavorite(image: SearchImage) {
    setBoard((current) =>
      current.some((item) => item.id === image.id)
        ? current.filter((item) => item.id !== image.id)
        : [...current, toBoardItem(image)],
    );
  }

  function removeFromBoard(id: string) {
    setBoard((current) => current.filter((item) => item.id !== id));
  }

  async function saveBoard() {
    if (board.length === 0 || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: boardName.trim(),
          searchTerm: query.trim() || null,
          items: board.map((item) => ({
            unsplashId: item.unsplashId,
            imageUrl: item.imageUrl,
            thumbUrl: item.thumbUrl,
            author: item.author,
            description: item.description,
          })),
        }),
      });

      if (!response.ok) {
        flashToast("Não deu pra salvar agora. Tenta de novo.");
        return;
      }

      flashToast("Salvo.");
      setBoard([]);
      setBoardName("");
    } catch {
      flashToast("Falha de conexão. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={css({
        minH: "100dvh",
        bg: "page",
        display: "flex",
        flexDir: "column",
        overflowX: "hidden",
      })}
    >
      <Navbar />

      <main
        className={css({
          flex: "1",
          w: "full",
          maxW: "1120px",
          mx: "auto",
          px: { base: "5", md: "8" },
          // Espaço extra no rodapé enquanto a bottom bar do board está na tela,
          // pra ela não cobrir os últimos resultados.
          pb: board.length > 0 ? { base: "40", md: "44" } : { base: "10", md: "16" },
          display: "flex",
          flexDir: "column",
        })}
      >
        {/* Hero: no estado inicial fica centralizado vertical e horizontalmente. */}
        <div
          className={css({
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            textAlign: "center",
            w: "full",
            maxW: "560px",
            mx: "auto",
            flex: hasSearched ? undefined : "1",
            justifyContent: "center",
            pt: hasSearched ? { base: "4", md: "8" } : "0",
            pb: hasSearched ? "8" : "0",
          })}
        >
          <h1
            className={css({
              fontFamily: "display",
              fontWeight: "300",
              fontSize: hasSearched ? { base: "lg", md: "2xl" } : { base: "2xl", md: "4xl" },
              lineHeight: "1.15",
              textWrap: "balance",
              maxW: "full",
              color: "textPrimary",
              mb: hasSearched ? "4" : "3",
            })}
          >
            Encontre, organize, compartilhe.
          </h1>

          {!hasSearched && (
            <p
              className={css({
                fontFamily: "body",
                fontSize: "md",
                color: "gray.11",
                maxW: "44ch",
                mb: "7",
              })}
            >
              Do briefing a um board de referências que o cliente entende sem esforço.
            </p>
          )}

          <SearchField initialQuery={query} onSearch={setQuery} />

          {!hasSearched && <HeroIllustration />}
        </div>

        {hasSearched && (
          <ResultsGrid
            query={debouncedQuery || query.trim()}
            // Debounce ainda pendente (usuário digitando) também conta como carregando.
            status={query.trim() === debouncedQuery ? status : "loading"}
            results={results}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </main>

      {/* Bottom bar do board: presa ao rodapé, entra/sai conforme houver favoritos. */}
      <BoardPanel
        name={boardName}
        items={board}
        saving={saving}
        onNameChange={setBoardName}
        onRemove={removeFromBoard}
        onSave={saveBoard}
      />

      <div
        aria-live="polite"
        className={css({
          position: "fixed",
          left: "50%",
          // Sobe acima da bottom bar do board quando ela está na tela.
          bottom: board.length > 0 ? "6rem" : "6",
          zIndex: "toast",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        })}
      >
        {toast && (
          <span
            className={css({
              display: "inline-block",
              px: "4",
              py: "2.5",
              rounded: "full",
              bg: "textPrimary",
              color: "page",
              fontFamily: "body",
              fontSize: "sm",
              boxShadow: "lg",
            })}
          >
            {toast}
          </span>
        )}
      </div>
    </div>
  );
}
