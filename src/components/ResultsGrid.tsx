"use client";

import { useEffect, useRef } from "react";
import { css } from "styled-system/css";
import { ResultCard } from "@/components/ResultCard";
import { Spinner } from "@/components/ui";
import type { SearchImage } from "@/types";

/** Estado da busca real (Fase 2) — dirige o que o grid renderiza. */
export type SearchStatus =
  | "loading"
  | "success"
  | "empty"
  | "networkError"
  | "rateLimit"
  | "apiError";

/**
 * Área de resultados da busca. Cobre os estados da Fase 2: carregando, grid populado,
 * sem resultado, falha de rede e rate limit da Unsplash. As mensagens seguem o
 * `decisões/guia-tom-de-voz.md`.
 *
 * Scroll infinito (decisão 10): quando há mais páginas, uma sentinela no rodapé do
 * grid chama `onLoadMore` ao entrar na viewport (com folga, antes de bater no fim).
 * O rodapé mostra um indicador discreto — nunca um loading full-screen, que fica
 * só para a primeira busca. O botão "Carregar mais" é o fallback de teclado e o
 * caminho de retry quando um append falha.
 */
export function ResultsGrid({
  query,
  status,
  results,
  favoriteIds,
  inBoardLabels,
  onToggleFavorite,
  hasMore = false,
  loadingMore = false,
  loadMoreFailed = false,
  onLoadMore,
}: {
  query: string;
  status: SearchStatus;
  results: SearchImage[];
  favoriteIds: Set<string>;
  /** `unsplashId → { label, title }` do selo "em «Board»" quando a foto já está salva. */
  inBoardLabels?: Map<string, { label: string; title: string }>;
  onToggleFavorite: (image: SearchImage) => void;
  /** Ainda há páginas a carregar para este termo. */
  hasMore?: boolean;
  /** Um append (página 2+) está em voo. */
  loadingMore?: boolean;
  /** O último append falhou — mostra o retry no rodapé. */
  loadMoreFailed?: boolean;
  onLoadMore?: () => void;
}) {
  if (status === "loading") {
    return (
      <Notice>
        <span className={css({ display: "inline-flex", alignItems: "center", gap: "2.5" })}>
          <Spinner size="sm" className={css({ color: "ctaPurple" })} aria-hidden />
          Buscando imagens.
        </span>
      </Notice>
    );
  }

  if (status === "networkError") {
    return <Notice title="Falha de conexão." body="Verifica sua internet e tenta de novo." />;
  }

  if (status === "rateLimit") {
    return (
      <Notice
        title="As fontes de imagem bateram o limite de buscas agora."
        body="Espera um minuto e tenta de novo."
      />
    );
  }

  if (status === "apiError") {
    return <Notice title="A busca falhou agora." body="Tenta de novo." />;
  }

  if (status === "empty" || results.length === 0) {
    return (
      <Notice title={`Nada por aqui para “${query}”.`} body="Tenta um termo mais aberto." />
    );
  }

  return (
    <>
      <div
        className={css({
          pt: "8",
          columnCount: { base: 2, md: 3 },
          columnGap: "3",
        })}
      >
        {results.map((image) => {
          const badge = inBoardLabels?.get(image.id);
          return (
            <ResultCard
              key={image.id}
              image={image}
              isFavorite={favoriteIds.has(image.id)}
              inBoardLabel={badge?.label}
              inBoardTitle={badge?.title}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </div>

      <GridFooter
        hasMore={hasMore}
        loadingMore={loadingMore}
        loadMoreFailed={loadMoreFailed}
        onLoadMore={onLoadMore}
      />
    </>
  );
}

/**
 * Rodapé do grid no scroll infinito: a sentinela (auto-load ao aparecer na tela)
 * e o indicador discreto do estado atual. Fora do container de colunas, ocupando
 * a largura toda — dentro do masonry a sentinela cairia numa coluna só.
 */
function GridFooter({
  hasMore,
  loadingMore,
  loadMoreFailed,
  onLoadMore,
}: {
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreFailed: boolean;
  onLoadMore?: () => void;
}) {
  const sentinel = useRef<HTMLDivElement | null>(null);

  // Auto-load: dispara `onLoadMore` quando a sentinela entra na viewport, com
  // `rootMargin` generoso pra carregar antes de o usuário bater no fim. Pausa
  // quando um append falhou — aí quem retoma é o botão, não o scroll.
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !onLoadMore || !hasMore || loadMoreFailed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadMoreFailed]);

  if (!hasMore && !loadingMore && !loadMoreFailed) return null;

  return (
    <div
      className={css({
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        gap: "2",
        pt: "6",
        pb: "2",
        minH: "12",
      })}
    >
      <div ref={sentinel} aria-hidden className={css({ w: "px", h: "px" })} />

      {loadingMore && (
        <span
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "2",
            fontFamily: "body",
            fontSize: "sm",
            color: "gray.11",
          })}
        >
          <Spinner size="sm" className={css({ color: "ctaPurple" })} aria-hidden />
          Carregando mais imagens.
        </span>
      )}

      {!loadingMore && loadMoreFailed && (
        <div
          className={css({
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            gap: "1.5",
            textAlign: "center",
          })}
        >
          <p className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11" })}>
            Não deu pra carregar mais imagens.
          </p>
          <LoadMoreButton onClick={onLoadMore}>Tentar de novo</LoadMoreButton>
        </div>
      )}

      {!loadingMore && !loadMoreFailed && hasMore && (
        <LoadMoreButton onClick={onLoadMore}>Carregar mais</LoadMoreButton>
      )}
    </div>
  );
}

function LoadMoreButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={css({
        h: "36px",
        px: "5",
        rounded: "full",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "gray.6",
        cursor: "pointer",
        bg: "surface",
        color: "textPrimary",
        fontFamily: "body",
        fontSize: "sm",
        transition: "background-color 0.15s ease",
        _hover: { bg: "gray.2" },
        _focusVisible: {
          outline: "2px solid",
          outlineColor: "ctaPurple",
          outlineOffset: "2px",
        },
      })}
    >
      {children}
    </button>
  );
}

function Notice({
  title,
  body,
  children,
}: {
  title?: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={css({
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2",
        py: { base: "16", md: "24" },
        px: "6",
      })}
    >
      <p
        className={css({
          fontFamily: "display",
          fontWeight: "400",
          fontSize: "xl",
          color: "textPrimary",
        })}
      >
        {title ?? children}
      </p>
      {body && (
        <p
          className={css({
            fontFamily: "body",
            fontSize: "sm",
            color: "gray.11",
            maxW: "42ch",
          })}
        >
          {body}
        </p>
      )}
    </div>
  );
}
