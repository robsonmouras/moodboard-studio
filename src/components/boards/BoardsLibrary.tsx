"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { BoardCard } from "@/components/boards/BoardCard";
import { iconDefaults } from "@/components/Icon";
import { Navbar } from "@/components/Navbar";
import type { BoardSummary } from "@/types";

/**
 * Biblioteca de boards salvos (`/favoritos`).
 *
 * Lista os boards do usuário logado com a contagem de inspirações, uma busca que
 * filtra por nome e, em cada card, atalhos pra editar e excluir. Os dados vêm do
 * Supabase (Server Component pai); aqui é só a interatividade.
 */
export function BoardsLibrary({ boards }: { boards: BoardSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return boards;
    return boards.filter((board) => board.name.toLowerCase().includes(normalized));
  }, [boards, query]);

  const total = boards.length;

  return (
    <div
      className={css({
        minH: "100dvh",
        bg: "page",
        display: "flex",
        flexDir: "column",
        overflowX: "hidden",
      })}
    >
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
        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "3",
          })}
        >
          <h1
            className={css({
              fontFamily: "display",
              fontWeight: "300",
              fontSize: { base: "2xl", md: "4xl" },
              color: "textPrimary",
            })}
          >
            Favoritos
          </h1>
          {total > 0 && (
            <span className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11" })}>
              {total} {total === 1 ? "board salvo" : "boards salvos"}
            </span>
          )}
        </div>

        {total > 0 && (
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              w: "full",
              maxW: "420px",
              h: "44px",
              px: "4",
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
            <MagnifyingGlass {...iconDefaults} size={18} aria-hidden />
            <label htmlFor="boards-search" className={css({ srOnly: true })}>
              Buscar nos seus boards
            </label>
            <input
              id="boards-search"
              type="text"
              autoComplete="off"
              placeholder="Buscar nos seus boards"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className={css({
                  flexShrink: "0",
                  display: "grid",
                  placeItems: "center",
                  w: "26px",
                  h: "26px",
                  rounded: "full",
                  border: "none",
                  cursor: "pointer",
                  bg: "transparent",
                  color: "gray.11",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  _hover: { bg: "gray.3", color: "gray.12" },
                  _focusVisible: {
                    outline: "2px solid",
                    outlineColor: "ctaPurple",
                    outlineOffset: "2px",
                  },
                })}
              >
                <X {...iconDefaults} size={14} aria-hidden />
              </button>
            )}
          </div>
        )}

        {total === 0 ? (
          <EmptyState
            title="Nenhum board ainda."
            body="Busca um tema e começa a favoritar."
            action={{ href: "/", label: "Buscar referências" }}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`Nenhum board para “${query.trim()}”`}
            body="Tenta outro termo ou limpa a busca."
          />
        ) : (
          <ul
            className={css({
              listStyle: "none",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: { base: "4", md: "5" },
            })}
          >
            {filtered.map((board) => (
              <li key={board.id}>
                <BoardCard board={board} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div
      className={css({
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "3",
        py: { base: "16", md: "24" },
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
        {title}
      </p>
      <p
        className={css({
          fontFamily: "body",
          fontSize: "sm",
          color: "gray.11",
          maxW: "44ch",
        })}
      >
        {body}
      </p>
      {action && (
        <Link
          href={action.href}
          className={css({
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
            _focusVisible: {
              outline: "2px solid",
              outlineColor: "ctaPurple",
              outlineOffset: "2px",
            },
          })}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
