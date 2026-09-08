"use client";

import { type KeyboardEvent, useState } from "react";
import { X } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { ImageTile } from "@/components/ImageTile";
import type { BoardItem } from "@/types";

/**
 * Board em construção, fixado no rodapé da página como uma bottom bar.
 *
 * Só existe visualmente depois que o usuário favorita a primeira imagem: entra
 * deslizando de baixo para cima e volta a sumir (deslizando para baixo) quando o
 * board fica vazio de novo. Fica sempre preso ao rodapé enquanto houver favoritos.
 *
 * Fase 3: "Salvar" grava o board no Supabase (a chamada vive no `SearchWorkspace`);
 * `saving` desabilita o botão enquanto a gravação está em voo.
 *
 * O campo de nome tem autocomplete: `nameSuggestions` traz os boards já salvos
 * cujo nome contém o que foi digitado (calculado no `SearchWorkspace`). Escolher
 * uma sugestão só preenche o campo — o "Salvar" ainda confirma somar no board.
 *
 * `variant="append"` (modo contextual "Adicionar inspirações"): sem campo de
 * nome — o destino já é um board existente. A barra conta as escolhidas e o
 * botão soma tudo de uma vez ("Adicionar +N").
 */
export function BoardPanel({
  name = "",
  items,
  saving = false,
  nameSuggestions = [],
  variant = "create",
  onNameChange = () => {},
  onRemove,
  onSave,
}: {
  name?: string;
  items: BoardItem[];
  saving?: boolean;
  nameSuggestions?: string[];
  variant?: "create" | "append";
  onNameChange?: (name: string) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
}) {
  const isOpen = items.length > 0;
  const isAppend = variant === "append";
  // No fluxo de criar board, o nome é obrigatório — sem nome não dá pra salvar.
  const needsName = !isAppend && name.trim().length === 0;

  // Autocomplete do nome do board.
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const showSuggestions = suggestOpen && nameSuggestions.length > 0;

  // Vira `true` quando o usuário tenta salvar sem nome — aí o aviso aparece.
  const [nameError, setNameError] = useState(false);
  const showNameError = nameError && needsName && isOpen;

  // "Salvar" só passa adiante com nome preenchido; senão sinaliza o erro.
  function requestSave() {
    if (needsName) {
      setNameError(true);
      return;
    }
    onSave();
  }

  function pickSuggestion(value: string) {
    onNameChange(value);
    setSuggestOpen(false);
    setActiveIndex(-1);
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) {
      if (event.key === "Enter") requestSave();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % nameSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? nameSuggestions.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0) pickSuggestion(nameSuggestions[activeIndex]);
      else {
        setSuggestOpen(false);
        requestSave();
      }
    } else if (event.key === "Escape") {
      setSuggestOpen(false);
      setActiveIndex(-1);
    }
  }

  // Mantém os últimos favoritos renderizados durante a animação de saída — quando
  // `items` já esvaziou mas a barra ainda está deslizando para fora da tela.
  // (padrão "ajustar estado durante o render" do React, sem effect.)
  const [snapshot, setSnapshot] = useState<BoardItem[]>(items);
  if (isOpen && items !== snapshot) setSnapshot(items);
  const visible = isOpen ? items : snapshot;

  return (
    <div
      aria-hidden={!isOpen}
      className={css({
        position: "fixed",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: "banner",
        display: "flex",
        justifyContent: "center",
        px: { base: "0", md: "5" },
        pb: { base: "0", md: "5" },
        transitionProperty: "transform, opacity",
        transitionDuration: "0.34s",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isOpen ? "translateY(0)" : "translateY(108%)",
        opacity: isOpen ? "1" : "0",
        pointerEvents: isOpen ? "auto" : "none",
      })}
    >
      <section
        id="board"
        aria-label="Board"
        className={css({
          w: "full",
          maxW: "1120px",
          display: "flex",
          flexDir: "column",
          gap: "3.5",
          bg: "surface",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "border",
          roundedTop: "2xl",
          roundedBottom: { base: "0", md: "2xl" },
          boxShadow: "lg",
          p: { base: "4", md: "5" },
          pb: { base: "calc(1rem + env(safe-area-inset-bottom))", md: "5" },
          maxH: "62dvh",
        })}
      >
        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "3",
          })}
        >
          <div className={css({ display: "flex", alignItems: "baseline", gap: "2.5" })}>
            <h2
              className={css({
                fontFamily: "display",
                fontWeight: "400",
                fontSize: "lg",
                color: "textPrimary",
              })}
            >
              {isAppend ? "Adicionar" : "Board"}
            </h2>
            <span className={css({ fontFamily: "body", fontSize: "xs", color: "gray.11" })}>
              {isAppend
                ? `${visible.length} ${visible.length === 1 ? "escolhida" : "escolhidas"}`
                : `${visible.length} ${visible.length === 1 ? "imagem" : "imagens"}`}
            </span>
          </div>

          <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
            {!isAppend && (
            <label htmlFor="board-name" className={css({ srOnly: true })}>
              Nome do board
            </label>
            )}
            {!isAppend && (
            <div
              className={css({ position: "relative", w: { base: "full", sm: "260px" } })}
            >
              <input
                id="board-name"
                type="text"
                placeholder="Nome do board"
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls="board-name-suggestions"
                aria-autocomplete="list"
                aria-invalid={showNameError}
                aria-describedby={showNameError ? "board-name-hint" : undefined}
                required
                value={name}
                onChange={(event) => {
                  onNameChange(event.target.value);
                  setSuggestOpen(true);
                  setActiveIndex(-1);
                  if (event.target.value.trim()) setNameError(false);
                }}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => setSuggestOpen(false)}
                onKeyDown={handleNameKeyDown}
                className={css({
                  w: "full",
                  h: "40px",
                  px: "3.5",
                  rounded: "full",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: showNameError ? "red.9" : "gray.6",
                  bg: "page",
                  fontFamily: "body",
                  fontSize: "sm",
                  color: "textPrimary",
                  _placeholder: { color: "gray.9" },
                  _focusVisible: {
                    outline: "none",
                    borderColor: showNameError ? "red.9" : "gray.9",
                  },
                })}
              />

              {showSuggestions && (
                <ul
                  id="board-name-suggestions"
                  role="listbox"
                  aria-label="Boards salvos com esse nome"
                  className={css({
                    listStyle: "none",
                    position: "absolute",
                    left: "0",
                    right: "0",
                    bottom: "calc(100% + 6px)",
                    zIndex: "dropdown",
                    maxH: "196px",
                    overflowY: "auto",
                    bg: "surface",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "border",
                    rounded: "xl",
                    boxShadow: "lg",
                    p: "1",
                  })}
                >
                  {nameSuggestions.map((suggestion, index) => (
                    <li key={suggestion} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === activeIndex}
                        // `onMouseDown` (não `onClick`): roda antes do `blur` do
                        // input, então a sugestão é escolhida sem a lista fechar antes.
                        onMouseDown={(event) => {
                          event.preventDefault();
                          pickSuggestion(suggestion);
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={css({
                          display: "block",
                          w: "full",
                          textAlign: "left",
                          px: "3",
                          py: "2",
                          rounded: "lg",
                          border: "none",
                          cursor: "pointer",
                          bg: index === activeIndex ? "gray.3" : "transparent",
                          color: "textPrimary",
                          fontFamily: "body",
                          fontSize: "sm",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        })}
                      >
                        Somar em <strong className={css({ fontWeight: "semibold" })}>{suggestion}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showNameError && !showSuggestions && (
                <p
                  id="board-name-hint"
                  role="alert"
                  className={css({
                    position: "absolute",
                    left: "0",
                    right: "0",
                    bottom: "calc(100% + 6px)",
                    zIndex: "dropdown",
                    bg: "surface",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "border",
                    rounded: "xl",
                    boxShadow: "lg",
                    px: "3",
                    py: "2",
                    fontFamily: "body",
                    fontSize: "xs",
                    color: "red.11",
                  })}
                >
                  Dê um nome ao board para salvar.
                </p>
              )}
            </div>
            )}
            <button
              type="button"
              disabled={visible.length === 0 || saving}
              onClick={isAppend ? onSave : requestSave}
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
                fontWeight: "normal",
                fontSize: "sm",
                transition: "background-color 0.15s ease",
                _hover: { bg: "brand.10" },
                _disabled: { opacity: 0.5, cursor: "not-allowed", _hover: { bg: "ctaPurple" } },
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "ctaPurple",
                  outlineOffset: "2px",
                },
              })}
            >
              {saving
                ? isAppend
                  ? "Adicionando"
                  : "Salvando"
                : isAppend
                  ? `Adicionar +${visible.length}`
                  : "Salvar"}
            </button>
          </div>
        </div>

        <ul
          className={css({
            listStyle: "none",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: "2.5",
            overflowY: "auto",
            flex: "1",
            minH: "0",
            pr: "1",
          })}
        >
          {visible.map((item) => (
            <li key={item.id} className={css({ position: "relative" })}>
              <ImageTile image={item} rounded="lg" />
              <button
                type="button"
                aria-label={`Remover "${item.description}" do board`}
                onClick={() => onRemove(item.id)}
                className={css({
                  position: "absolute",
                  top: "1.5",
                  right: "1.5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  w: "7",
                  h: "7",
                  rounded: "full",
                  cursor: "pointer",
                  border: "none",
                  bg: "surface",
                  color: "textPrimary",
                  boxShadow: "sm",
                  _hover: { bg: "gray.2" },
                  _focusVisible: {
                    outline: "2px solid",
                    outlineColor: "ctaPurple",
                    outlineOffset: "1px",
                  },
                })}
              >
                <X size={14} weight="light" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
