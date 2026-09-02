"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconTrash, IconX } from "@tabler/icons-react";
import { css } from "styled-system/css";
import { useBoards } from "@/components/boards/BoardsProvider";
import { iconDefaults } from "@/components/Icon";
import { ImageTile } from "@/components/ImageTile";
import { Navbar } from "@/components/Navbar";

/** "3 inspirações" / "1 inspiração" / "Nenhuma inspiração". */
function countLabel(n: number) {
  if (n === 0) return "Nenhuma inspiração";
  return `${n} ${n === 1 ? "inspiração" : "inspirações"}`;
}

const shell = css({
  minH: "100dvh",
  bg: "page",
  display: "flex",
  flexDir: "column",
  overflowX: "hidden",
});

const backLink = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  fontFamily: "body",
  fontSize: "sm",
  color: "gray.11",
  transition: "color 0.15s ease",
  _hover: { color: "textPrimary" },
});

const ctaLink = css({
  mt: "2",
  h: "44px",
  display: "inline-flex",
  alignItems: "center",
  px: "6",
  rounded: "full",
  bg: "ctaPurple",
  color: "white",
  fontFamily: "body",
  fontWeight: "semibold",
  fontSize: "sm",
  transition: "background-color 0.15s ease",
  _hover: { bg: "brand.10" },
  _focusVisible: { outline: "2px solid", outlineColor: "ctaPurple", outlineOffset: "2px" },
});

/**
 * Detalhe de um board (`/favoritos/[id]`).
 *
 * Renomear acontece direto no título (input controlado pelo `BoardsProvider`, salva a
 * cada tecla). Cada imagem tem um "x" pra sair do board. "Excluir board" apaga e volta
 * pra biblioteca. Tudo em memória na Fase 1 — ver [[BoardsProvider]].
 */
export function BoardDetailView({ boardId }: { boardId: string }) {
  const router = useRouter();
  const { getBoard, renameBoard, deleteBoard, removeItem } = useBoards();
  const board = getBoard(boardId);
  const [confirming, setConfirming] = useState(false);

  if (!board) {
    return (
      <div className={shell}>
        <Navbar />
        <main
          className={css({
            flex: "1",
            w: "full",
            maxW: "1120px",
            mx: "auto",
            px: { base: "5", md: "8" },
            py: { base: "16", md: "24" },
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "3",
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
            Board não encontrado
          </p>
          <p className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11" })}>
            Ele pode ter sido excluído nesta sessão.
          </p>
          <Link href="/favoritos" className={ctaLink}>
            Voltar pra Favoritos
          </Link>
        </main>
      </div>
    );
  }

  const count = board.items.length;

  return (
    <div className={shell}>
      <Navbar />

      <main
        className={css({
          flex: "1",
          w: "full",
          maxW: "1120px",
          mx: "auto",
          px: { base: "5", md: "8" },
          py: { base: "6", md: "10" },
          display: "flex",
          flexDir: "column",
          gap: "6",
        })}
      >
        <Link href="/favoritos" className={backLink}>
          <IconArrowLeft {...iconDefaults} size={16} aria-hidden />
          Favoritos
        </Link>

        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "4",
          })}
        >
          <div className={css({ display: "flex", flexDir: "column", gap: "1.5", minW: "0", flex: "1" })}>
            <label htmlFor="board-name" className={css({ srOnly: true })}>
              Nome do board
            </label>
            <input
              id="board-name"
              type="text"
              value={board.name}
              onChange={(event) => renameBoard(board.id, event.target.value)}
              placeholder="Nome do board"
              className={css({
                w: "full",
                maxW: "40ch",
                bg: "transparent",
                fontFamily: "display",
                fontWeight: "300",
                fontSize: { base: "xl", md: "3xl" },
                color: "textPrimary",
                borderWidth: "0",
                borderBottomWidth: "1px",
                borderStyle: "solid",
                borderColor: "transparent",
                px: "0",
                py: "1",
                transition: "border-color 0.15s ease",
                _placeholder: { color: "gray.9" },
                _hover: { borderColor: "gray.6" },
                _focusVisible: { outline: "none", borderColor: "ctaPurple" },
              })}
            />
            <span className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11" })}>
              {countLabel(count)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "1.5",
              flexShrink: "0",
              h: "40px",
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
              transition: "background-color 0.15s ease",
              _hover: { bg: "gray.2" },
              _focusVisible: {
                outline: "2px solid",
                outlineColor: "ctaPurple",
                outlineOffset: "2px",
              },
            })}
          >
            <IconTrash {...iconDefaults} size={16} aria-hidden />
            Excluir board
          </button>
        </div>

        {count === 0 ? (
          <div
            className={css({
              display: "flex",
              flexDir: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "3",
              py: { base: "14", md: "20" },
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
              Esse board está vazio
            </p>
            <p className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11", maxW: "44ch" })}>
              Volte pra busca e favorite algumas referências pra colocar aqui.
            </p>
            <Link href="/" className={ctaLink}>
              Buscar referências
            </Link>
          </div>
        ) : (
          <div className={css({ columnCount: { base: 2, md: 3 }, columnGap: "3" })}>
            {board.items.map((item) => (
              <figure
                key={item.id}
                className={css({ display: "block", mb: "3", breakInside: "avoid", position: "relative" })}
              >
                <ImageTile image={item} />
                <button
                  type="button"
                  aria-label={`Remover “${item.description}” do board`}
                  onClick={() => removeItem(board.id, item.id)}
                  className={css({
                    position: "absolute",
                    top: "2.5",
                    right: "2.5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    w: "9",
                    h: "9",
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
                  <IconX size={16} stroke={1.5} />
                </button>
                <figcaption
                  className={css({ mt: "1.5", fontFamily: "body", fontSize: "xs", color: "gray.11" })}
                >
                  {item.author}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </main>

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusão do board"
          className={css({
            position: "fixed",
            inset: "0",
            zIndex: "modal",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: "5",
            bg: "black.a7",
          })}
          onClick={() => setConfirming(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={css({
              w: "full",
              maxW: "380px",
              display: "flex",
              flexDir: "column",
              gap: "4",
              bg: "surface",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "border",
              rounded: "2xl",
              boxShadow: "xl",
              p: "6",
            })}
          >
            <div className={css({ display: "flex", flexDir: "column", gap: "1.5" })}>
              <p
                className={css({
                  fontFamily: "display",
                  fontWeight: "400",
                  fontSize: "lg",
                  color: "textPrimary",
                })}
              >
                Excluir “{board.name}”?
              </p>
              <p className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11" })}>
                O board e suas {count === 1 ? "1 inspiração" : `${count} inspirações`} saem da
                sua biblioteca. Não dá pra desfazer.
              </p>
            </div>
            <div className={css({ display: "flex", justifyContent: "flex-end", gap: "2" })}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={css({
                  h: "40px",
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
              <button
                type="button"
                onClick={() => {
                  deleteBoard(board.id);
                  router.push("/favoritos");
                }}
                className={css({
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
