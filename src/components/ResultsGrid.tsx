"use client";

import { css } from "styled-system/css";
import { ResultCard } from "@/components/ResultCard";
import type { SearchImage } from "@/types";

/**
 * Área de resultados da busca. Cobre os estados "sem resultado" e "grid populado"
 * da matriz da Fase 1. O estado de carregando fica para a Fase 2 (busca real na Unsplash).
 */
export function ResultsGrid({
  query,
  results,
  favoriteIds,
  onToggleFavorite,
}: {
  query: string;
  results: SearchImage[];
  favoriteIds: Set<string>;
  onToggleFavorite: (image: SearchImage) => void;
}) {
  if (results.length === 0) {
    return (
      <Empty
        title={`Nada por aqui para “${query.trim()}”`}
        body="Tenta um termo mais aberto."
      />
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
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
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
        {title}
      </p>
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
    </div>
  );
}
