"use client";

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
 */
export function ResultsGrid({
  query,
  status,
  results,
  favoriteIds,
  lockedIds,
  onToggleFavorite,
}: {
  query: string;
  status: SearchStatus;
  results: SearchImage[];
  favoriteIds: Set<string>;
  /** Ids já no board de destino (modo contextual) — coração travado. */
  lockedIds?: Set<string>;
  onToggleFavorite: (image: SearchImage) => void;
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
        title="Unsplash bateu o limite de buscas agora."
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
    <div
      className={css({
        pt: "8",
        columnCount: { base: 2, md: 3 },
        columnGap: "3",
      })}
    >
      {results.map((image) => (
        <ResultCard
          key={image.id}
          image={image}
          isFavorite={favoriteIds.has(image.id)}
          locked={lockedIds?.has(image.id) ?? false}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
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
