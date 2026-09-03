"use client";

import { css } from "styled-system/css";

/**
 * Chips de sugestão de busca no hero da home (estado inicial, antes da 1ª busca).
 *
 * Termos comuns de briefing de identidade visual — um empurrão pra quem abre a tela
 * sem saber por onde começar. Clicar preenche o campo de busca (o pai controla o
 * valor) e dispara a busca real.
 */
const SUGGESTIONS = [
  "minimalista",
  "corporativo",
  "orgânico",
  "geométrico",
  "vintage",
] as const;

export function SearchSuggestions({ onPick }: { onPick: (term: string) => void }) {
  return (
    <div
      className={css({
        mt: "5",
        w: "full",
        display: "flex",
        flexWrap: "wrap",
        gap: "2",
        justifyContent: "center",
      })}
    >
      <span
        className={css({
          w: "full",
          fontFamily: "body",
          fontSize: "xs",
          color: "gray.9",
          mb: "1",
        })}
      >
        Sugestões pra começar
      </span>
      {SUGGESTIONS.map((term) => (
        <button
          key={term}
          type="button"
          onClick={() => onPick(term)}
          className={css({
            h: "34px",
            px: "3.5",
            rounded: "full",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "gray.6",
            bg: "surface",
            color: "gray.11",
            cursor: "pointer",
            fontFamily: "body",
            fontSize: "sm",
            transitionProperty: "background-color, border-color, color",
            transitionDuration: "0.15s",
            _hover: { borderColor: "ctaPurple", color: "ctaPurple" },
            _focusVisible: {
              outline: "2px solid",
              outlineColor: "ctaPurple",
              outlineOffset: "2px",
            },
          })}
        >
          {term}
        </button>
      ))}
    </div>
  );
}
