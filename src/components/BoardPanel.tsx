"use client";

import { useState } from "react";
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
 */
export function BoardPanel({
  name,
  items,
  saving = false,
  onNameChange,
  onRemove,
  onSave,
}: {
  name: string;
  items: BoardItem[];
  saving?: boolean;
  onNameChange: (name: string) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
}) {
  const isOpen = items.length > 0;

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
              Board
            </h2>
            <span className={css({ fontFamily: "body", fontSize: "xs", color: "gray.11" })}>
              {visible.length} {visible.length === 1 ? "imagem" : "imagens"}
            </span>
          </div>

          <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
            <label htmlFor="board-name" className={css({ srOnly: true })}>
              Nome do board
            </label>
            <input
              id="board-name"
              type="text"
              placeholder="Nome do board"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className={css({
                w: { base: "full", sm: "260px" },
                h: "40px",
                px: "3.5",
                rounded: "full",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "gray.6",
                bg: "page",
                fontFamily: "body",
                fontSize: "sm",
                color: "textPrimary",
                _placeholder: { color: "gray.9" },
                _focusVisible: { outline: "none", borderColor: "gray.9" },
              })}
            />
            <button
              type="button"
              disabled={visible.length === 0 || saving}
              onClick={onSave}
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
                _disabled: { opacity: 0.5, cursor: "not-allowed", _hover: { bg: "ctaPurple" } },
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "ctaPurple",
                  outlineOffset: "2px",
                },
              })}
            >
              {saving ? "Salvando" : "Salvar"}
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
