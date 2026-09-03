"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconLink, IconTrash, IconX } from "@tabler/icons-react";
import { css } from "styled-system/css";
import { iconDefaults } from "@/components/Icon";
import { ImageTile } from "@/components/ImageTile";
import { Navbar } from "@/components/Navbar";
import { deleteBoard, removeBoardImage, renameBoard } from "@/app/favoritos/actions";
import type { Board } from "@/types";

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

const headerButton = css({
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
  _focusVisible: { outline: "2px solid", outlineColor: "ctaPurple", outlineOffset: "2px" },
});

/**
 * Detalhe de um board (`/favoritos/[id]`).
 *
 * Fase 3: renomear (salva em `boards.title` ao sair do campo), remover uma imagem
 * (deleta a linha em `board_images`) e excluir o board (deleta a linha em `boards`,
 * `on delete cascade` cuida das imagens) — tudo via server action, escrita real.
 * "Copiar link" copia `<origem>/b/<slug>` pra área de transferência.
 */
export function BoardDetailView({ board }: { board: Board }) {
  const router = useRouter();
  const [name, setName] = useState(board.name);
  const [syncedName, setSyncedName] = useState(board.name);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quando o board volta do servidor com outro título (após renomear/refresh),
  // realinha o campo — padrão "ajustar estado no render" do React, sem effect.
  if (board.name !== syncedName) {
    setSyncedName(board.name);
    setName(board.name);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function flashToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function commitName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === board.name) {
      setName(board.name);
      return;
    }
    startTransition(async () => {
      const result = await renameBoard(board.id, trimmed);
      if (!result.ok) {
        setName(board.name);
        flashToast("Não deu pra renomear agora.");
        return;
      }
      router.refresh();
    });
  }

  function handleRemoveImage(imageId: string) {
    startTransition(async () => {
      const result = await removeBoardImage(board.id, imageId);
      if (!result.ok) {
        flashToast("Não deu pra remover agora.");
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBoard(board.id);
      if (result && !result.ok) {
        setConfirming(false);
        flashToast("Não deu pra excluir agora.");
      }
    });
  }

  async function copyLink() {
    const url = `${window.location.origin}/b/${board.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      flashToast("Link copiado.");
    } catch {
      flashToast("Não deu pra copiar. Copia da barra de endereço.");
    }
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
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
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

          <div className={css({ display: "flex", alignItems: "center", gap: "2", flexShrink: "0" })}>
            <button type="button" onClick={copyLink} className={headerButton}>
              <IconLink {...iconDefaults} size={16} aria-hidden />
              Copiar link
            </button>
            <button type="button" onClick={() => setConfirming(true)} className={headerButton}>
              <IconTrash {...iconDefaults} size={16} aria-hidden />
              Excluir board
            </button>
          </div>
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
                  disabled={pending}
                  aria-label={`Remover “${item.description}” do board`}
                  onClick={() => handleRemoveImage(item.id)}
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
                    _disabled: { opacity: 0.5, cursor: "not-allowed" },
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

      <div
        aria-live="polite"
        className={css({
          position: "fixed",
          left: "50%",
          bottom: "6",
          zIndex: "toast",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        })}
      >
        {toast && (
          <span
            className={css({
              display: "inline-block",
              px: "4",
              py: "2.5",
              rounded: "full",
              bg: "textPrimary",
              color: "page",
              fontFamily: "body",
              fontSize: "sm",
              boxShadow: "lg",
            })}
          >
            {toast}
          </span>
        )}
      </div>

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
                disabled={pending}
                onClick={handleDelete}
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
                  _disabled: { opacity: 0.5, cursor: "not-allowed" },
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
