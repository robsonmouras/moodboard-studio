"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { css } from "styled-system/css";
import { BoardPanel } from "@/components/BoardPanel";
import { HeroIllustration } from "@/components/HeroIllustration";
import { Navbar } from "@/components/Navbar";
import { ResultsGrid } from "@/components/ResultsGrid";
import { SearchField } from "@/components/SearchField";
import { searchMockImages } from "@/lib/mock-images";
import type { BoardItem, SearchImage } from "@/types";

/**
 * Tela principal do produto (rota `/`): busca → grid de resultados → favoritar → montar board.
 *
 * Estado inicial: título + campo de busca centralizados na tela (hero limpo). Depois da
 * primeira busca, a busca sobe para o topo, o grid aparece e o board se forma abaixo dos
 * resultados.
 *
 * Fluxo completo navegável da Fase 1, tudo em estado local:
 * - a busca filtra dados mockados em memória (sem API — isso é Fase 2);
 * - favoritos persistem entre buscas diferentes (só na sessão — persistência real é Fase 3);
 * - "Salvar" devolve feedback visual (toast), sem gravar em lugar nenhum.
 *
 * A tela de login existe em código (`/login`) mas está fora deste fluxo.
 */
export function SearchWorkspace() {
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [boardName, setBoardName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => searchMockImages(query), [query]);
  const favoriteIds = useMemo(() => new Set(board.map((item) => item.id)), [board]);
  const hasSearched = query.trim().length > 0;

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function flashToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function toggleFavorite(image: SearchImage) {
    setBoard((current) =>
      current.some((item) => item.id === image.id)
        ? current.filter((item) => item.id !== image.id)
        : [...current, image],
    );
  }

  function removeFromBoard(id: string) {
    setBoard((current) => current.filter((item) => item.id !== id));
  }

  function saveBoard() {
    // TODO(Fase 3): persistir board + favoritos no Supabase e gerar slug público.
    flashToast("Salvo.");
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
            query={query}
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
