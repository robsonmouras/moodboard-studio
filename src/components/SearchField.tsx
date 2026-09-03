"use client";

import { type FormEvent } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { iconDefaults } from "@/components/Icon";

/**
 * Campo de busca por texto livre. Componente controlado: o valor mora no
 * `SearchWorkspace` (pai), que aplica o debounce antes de bater na Unsplash e
 * também consegue preencher o campo a partir dos chips de sugestão.
 */
export function SearchField({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (query: string) => void;
}) {
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
      <MagnifyingGlass {...iconDefaults} aria-hidden />
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
        onChange={(event) => onSearch(event.target.value)}
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
