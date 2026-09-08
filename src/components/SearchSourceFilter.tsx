"use client";

import { css } from "styled-system/css";
import { IMAGE_SOURCES } from "@/lib/image-sources/catalog";
import type { ImageSource } from "@/types";

/**
 * Filtro de fontes da busca: um chip por API de imagem (Unsplash, Pexels, Pixabay),
 * multi-seleção. Fica logo abaixo do `SearchField`; mudar a seleção no
 * `SearchWorkspace` dispara nova busca e reinicia a paginação.
 *
 * Todas as fontes começam ativas. É preciso manter pelo menos uma marcada — a
 * última selecionada fica desabilitada, então não dá pra zerar o filtro.
 *
 * O estado ativo é só visual — borda e fundo destacados, sem marca de check.
 * Acessibilidade: `fieldset`/`legend` agrupa e rotula; cada chip é um
 * `<input type="checkbox">` real (visualmente escondido) dentro de um `<label>`,
 * navegável por Tab e alternável com Espaço.
 */
export function SearchSourceFilter({
  selected,
  onChange,
}: {
  selected: ImageSource[];
  onChange: (next: ImageSource[]) => void;
}) {
  const active = new Set(selected);

  function toggle(id: ImageSource) {
    if (active.has(id)) {
      if (selected.length === 1) return; // mínimo uma fonte
      onChange(selected.filter((source) => source !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <fieldset
      className={css({
        border: "none",
        p: "0",
        m: "0",
        mt: "3.5",
        display: "flex",
        flexWrap: "wrap",
        gap: "2",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <legend className={css({ srOnly: true })}>Fontes de imagem para buscar</legend>
      <span
        aria-hidden
        className={css({ fontFamily: "body", fontSize: "xs", color: "gray.9" })}
      >
        Buscar em
      </span>

      {IMAGE_SOURCES.map(({ id, label }) => {
        const isOn = active.has(id);
        const isLastOn = isOn && selected.length === 1;
        return (
          <label
            key={id}
            className={css({
              display: "inline-flex",
              alignItems: "center",
              h: "34px",
              px: "3.5",
              rounded: "full",
              borderWidth: "1px",
              borderStyle: "solid",
              cursor: isLastOn ? "not-allowed" : "pointer",
              fontFamily: "body",
              fontSize: "sm",
              userSelect: "none",
              transitionProperty: "background-color, border-color, color",
              transitionDuration: "0.15s",
              borderColor: isOn ? "ctaPurple" : "gray.6",
              bg: isOn ? "brand.3" : "surface",
              color: isOn ? "ctaPurple" : "gray.11",
              _hover: isLastOn ? {} : { borderColor: "ctaPurple" },
              _focusWithin: {
                outline: "2px solid",
                outlineColor: "ctaPurple",
                outlineOffset: "2px",
              },
            })}
          >
            <input
              type="checkbox"
              name="sources"
              value={id}
              checked={isOn}
              disabled={isLastOn}
              onChange={() => toggle(id)}
              className={css({ srOnly: true })}
            />
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}
