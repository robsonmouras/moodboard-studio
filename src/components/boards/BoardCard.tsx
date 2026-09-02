"use client";

import Link from "next/link";
import { useState } from "react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { css } from "styled-system/css";
import { BoardCover } from "@/components/boards/BoardCover";
import { useBoards } from "@/components/boards/BoardsProvider";
import { iconDefaults } from "@/components/Icon";
import type { Board } from "@/types";

/** "3 inspirações" / "1 inspiração" / "Nenhuma inspiração". */
function countLabel(n: number) {
  if (n === 0) return "Nenhuma inspiração";
  return `${n} ${n === 1 ? "inspiração" : "inspirações"}`;
}

/**
 * Um board na biblioteca (`/favoritos`). O card inteiro leva pra tela de detalhe
 * (onde se renomeia e se removem imagens); o botão de lixeira exclui, com uma
 * confirmação de dois toques pra não apagar sem querer.
 */
export function BoardCard({ board }: { board: Board }) {
  const { deleteBoard } = useBoards();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={css({ position: "relative" })}>
      <Link
        href={`/favoritos/${board.id}`}
        className={css({
          display: "flex",
          flexDir: "column",
          gap: "3",
          p: "3",
          rounded: "2xl",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "border",
          bg: "surface",
          transitionProperty: "border-color, box-shadow",
          transitionDuration: "0.15s",
          _hover: { borderColor: "gray.6", boxShadow: "sm" },
          _focusVisible: {
            outline: "2px solid",
            outlineColor: "ctaPurple",
            outlineOffset: "2px",
          },
        })}
      >
        <BoardCover items={board.items} />

        <div className={css({ display: "flex", flexDir: "column", gap: "0.5", px: "1", pb: "1" })}>
          <span
            className={css({
              fontFamily: "display",
              fontWeight: "400",
              fontSize: "md",
              color: "textPrimary",
              lineHeight: "1.3",
            })}
          >
            {board.name}
          </span>
          <span className={css({ fontFamily: "body", fontSize: "xs", color: "gray.11" })}>
            {countLabel(board.items.length)}
          </span>
        </div>
      </Link>

      {confirming ? (
        <div
          className={css({
            position: "absolute",
            inset: "0",
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3",
            p: "5",
            rounded: "2xl",
            bg: "surface",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "gray.6",
            textAlign: "center",
          })}
        >
          <p
            className={css({
              fontFamily: "body",
              fontSize: "sm",
              color: "textPrimary",
              maxW: "26ch",
            })}
          >
            Excluir “{board.name}”? Não dá pra desfazer.
          </p>
          <div className={css({ display: "flex", gap: "2" })}>
            <button
              type="button"
              onClick={() => deleteBoard(board.id)}
              className={css({
                h: "36px",
                px: "4",
                rounded: "full",
                border: "none",
                cursor: "pointer",
                bg: "ctaPurple",
                color: "white",
                fontFamily: "body",
                fontWeight: "semibold",
                fontSize: "sm",
                _hover: { bg: "brand.10" },
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "ctaPurple",
                  outlineOffset: "2px",
                },
              })}
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={css({
                h: "36px",
                px: "4",
                rounded: "full",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "gray.6",
                cursor: "pointer",
                bg: "surface",
                color: "textPrimary",
                fontFamily: "body",
                fontSize: "sm",
                _hover: { bg: "gray.2" },
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "ctaPurple",
                  outlineOffset: "2px",
                },
              })}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div
          className={css({
            position: "absolute",
            top: "5",
            right: "5",
            display: "flex",
            gap: "1.5",
          })}
        >
          <Link
            href={`/favoritos/${board.id}`}
            aria-label={`Editar board “${board.name}”`}
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              w: "8",
              h: "8",
              rounded: "full",
              bg: "surface",
              color: "textPrimary",
              boxShadow: "sm",
              _hover: { bg: "gray.2" },
              _focusVisible: {
                outline: "2px solid",
                outlineColor: "ctaPurple",
                outlineOffset: "2px",
              },
            })}
          >
            <IconPencil {...iconDefaults} size={15} />
          </Link>
          <button
            type="button"
            aria-label={`Excluir board “${board.name}”`}
            onClick={() => setConfirming(true)}
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              w: "8",
              h: "8",
              rounded: "full",
              border: "none",
              cursor: "pointer",
              bg: "surface",
              color: "textPrimary",
              boxShadow: "sm",
              _hover: { bg: "gray.2" },
              _focusVisible: {
                outline: "2px solid",
                outlineColor: "ctaPurple",
                outlineOffset: "2px",
              },
            })}
          >
            <IconTrash {...iconDefaults} size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
