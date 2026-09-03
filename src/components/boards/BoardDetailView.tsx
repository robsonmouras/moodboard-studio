"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LinkSimple, Plus, Trash, X } from "@phosphor-icons/react";
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
  fontWeight: "normal",
  fontSize: "sm",
  transition: "background-color 0.15s ease",
  _hover: { bg: "brand.10" },
  _focusVisible: { outline: "2px solid", outlineColor: "ctaPurple", outlineOffset: "2px" },
});

const headerButtonBase = {
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
  transitionProperty: "background-color, color",
  transitionDuration: "0.15s",
  _focusVisible: { outline: "2px solid", outlineColor: "ctaPurple", outlineOffset: "2px" },
} as const;

const headerButton = css(headerButtonBase, { _hover: { bg: "gray.2" } });
// "Excluir board": mesmo botão, mas no hover só o ÍCONE vira vermelho (fundo igual).
const dangerIconHover = css({ _hover: { "& svg": { color: "red.11" } } });

// "Adicionar inspirações": ação primária do header — leva pra busca no modo
// contextual (`/?add=<id>`), onde favoritar grava direto neste board.
const addButton = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  flexShrink: "0",
  h: "40px",
  px: "4",
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
  _focusVisible: { outline: "2px solid", outlineColor: "ctaPurple", outlineOffset: "2px" },
});

/**
 * Card de uma inspiração no board — mesmo tratamento do grid de busca
 * (`ResultCard`): em repouso é só a foto; no hover (ou foco) a imagem dá um zoom
 * leve e sobe um overlay com o crédito do autor e a ação de remover.
 */
const photoCard = css({
  display: "block",
  mb: "3",
  breakInside: "avoid",
  position: "relative",
  rounded: "xl",
  overflow: "hidden",
  bg: "gray.3",
  "& img": {
    transition: "transform 0.5s cubic-bezier(0.2, 0, 0, 1)",
  },
  _hover: {
    "& img": { transform: "scale(1.045)" },
    "& [data-role='overlay']": { opacity: "1" },
  },
  _focusWithin: {
    "& [data-role='overlay']": { opacity: "1" },
  },
});

const photoOverlay = css({
  position: "absolute",
  insetInline: "0",
  bottom: "0",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "3",
  px: "3",
  pt: "12",
  pb: "2.5",
  backgroundImage: "linear-gradient(to top, token(colors.black.a9), transparent)",
  // Toque (sem hover) mostra sempre; no desktop, revela no hover/foco.
  opacity: { base: "1", md: "0" },
  transition: "opacity 0.25s ease",
  pointerEvents: "none",
});

const photoAuthor = css({
  minW: "0",
  flex: "1",
  color: "white",
  fontFamily: "body",
  fontSize: "xs",
  lineHeight: "1.3",
  textShadow: "0 1px 2px token(colors.black.a7)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// Sem "botão" visível — o X fica direto sobre o gradiente, na mesma linha do
// crédito, como o coração de favoritar no grid de busca.
const removeButton = css({
  pointerEvents: "auto",
  flexShrink: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "8",
  h: "8",
  mr: "-1",
  mb: "-0.5",
  rounded: "full",
  border: "none",
  cursor: "pointer",
  bg: "transparent",
  color: "white",
  filter: "drop-shadow(0 1px 3px token(colors.black.a9))",
  transitionProperty: "transform",
  transitionDuration: "0.15s",
  _hover: { transform: "scale(1.12)" },
  _active: { transform: "scale(0.9)" },
  _disabled: { opacity: 0.5, cursor: "not-allowed" },
  _focusVisible: { outline: "2px solid", outlineColor: "white", outlineOffset: "1px" },
});

/**
 * Detalhe de um board (`/favoritos/[id]`).
 *
 * Fase 3: renomear (salva em `boards.title` ao sair do campo), remover uma imagem
 * (deleta a linha em `board_images`) e excluir o board (deleta a linha em `boards`,
 * `on delete cascade` cuida das imagens) — tudo via server action, escrita real.
 * "Copiar link" copia `<origem>/b/<slug>` pra área de transferência.
 */
export function BoardDetailView({
  board,
  justAdded = 0,
}: {
  board: Board;
  /** Nº de inspirações recém-adicionadas no modo contextual (`?adicionadas=N`). */
  justAdded?: number;
}) {
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

  // Voltou da busca no modo contextual com inspirações novas: toast de contagem
  // e limpa o `?adicionadas=` da URL pra não repetir num refresh.
  useEffect(() => {
    if (justAdded < 1) return;
    queueMicrotask(() => {
      flashToast(
        `${justAdded} ${justAdded === 1 ? "inspiração adicionada" : "inspirações adicionadas"}.`,
      );
    });
    router.replace(`/favoritos/${board.id}`, { scroll: false });
    // Só na montagem — `justAdded` vem da URL de entrada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <ArrowLeft {...iconDefaults} size={16} aria-hidden />
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

          <div
            className={css({
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "2",
              flexShrink: "0",
            })}
          >
            <Link href={`/?add=${board.id}`} className={addButton}>
              <Plus {...iconDefaults} size={16} aria-hidden />
              Adicionar inspirações
            </Link>
            <button type="button" onClick={copyLink} className={headerButton}>
              <LinkSimple {...iconDefaults} size={16} aria-hidden />
              Copiar link
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={`${headerButton} ${dangerIconHover}`}
            >
              <Trash {...iconDefaults} size={16} aria-hidden />
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
            <Link href={`/?add=${board.id}`} className={ctaLink}>
              Adicionar inspirações
            </Link>
          </div>
        ) : (
          <div className={css({ columnCount: { base: 2, md: 3 }, columnGap: "3" })}>
            {board.items.map((item) => (
              <figure key={item.id} className={photoCard}>
                <ImageTile image={item} />

                <figcaption className={photoOverlay} data-role="overlay">
                  <span className={photoAuthor}>{item.author}</span>

                  <button
                    type="button"
                    disabled={pending}
                    aria-label={`Remover “${item.description}” do board`}
                    onClick={() => handleRemoveImage(item.id)}
                    className={removeButton}
                  >
                    <X size={20} weight="light" aria-hidden />
                  </button>
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
                  fontWeight: "normal",
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
