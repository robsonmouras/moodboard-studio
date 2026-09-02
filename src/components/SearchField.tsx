"use client";

import { type FormEvent, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { css } from "styled-system/css";
import { iconDefaults } from "@/components/Icon";

/**
 * Campo de busca por texto livre. Na Fase 1 não chama nenhuma API — ao enviar,
 * dispara `onSearch` e o `SearchWorkspace` filtra os dados mockados em memória.
 */
export function SearchField({
  initialQuery = "",
  onSearch,
}: {
  initialQuery?: string;
  onSearch: (query: string) => void;
}) {
  const [value, setValue] = useState(initialQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "2",
        w: "full",
        h: "52px",
        px: "5",
        rounded: "full",
        bg: "surface",
        color: "gray.9",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "gray.6",
        transition: "border-color 0.15s ease",
        _focusWithin: { borderColor: "gray.9" },
      })}
    >
      <IconSearch {...iconDefaults} aria-hidden />
      <label
        htmlFor="search-query"
        className={css({ srOnly: true })}
      >
        Buscar referências por tema
      </label>
      <input
        id="search-query"
        name="query"
        type="text"
        autoComplete="off"
        placeholder="Busca um tema do briefing"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={css({
          flex: "1",
          minW: "0",
          h: "full",
          border: "none",
          bg: "transparent",
          fontFamily: "body",
          fontSize: "sm",
          color: "textPrimary",
          _placeholder: { color: "gray.9" },
          _focusVisible: { outline: "none" },
        })}
      />
      <button
        type="submit"
        className={css({
          flexShrink: "0",
          h: "40px",
          px: "5",
          rounded: "full",
          border: "none",
          cursor: "pointer",
          bg: "ctaPurple",
          color: "white",
          fontFamily: "body",
          fontWeight: "semibold",
          fontSize: "sm",
          transition: "background-color 0.15s ease",
          _hover: { bg: "brand.10" },
          _focusVisible: { outline: "2px solid", outlineColor: "ctaPurple", outlineOffset: "2px" },
        })}
      >
        Buscar
      </button>
    </form>
  );
}
