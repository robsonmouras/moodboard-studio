"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "styled-system/css";

/**
 * Barra de navegação global do produto.
 *
 * Marca à esquerda (link pra home) + navegação à direita: Home | Favoritos | Perfil.
 * "Perfil" ainda não tem tela — fica visível como item desabilitado até a Fase seguinte.
 *
 * Usada na home (`/`) e na biblioteca de boards (`/favoritos`). Fora do fluxo de
 * `/login`, que mantém o cabeçalho mínimo próprio.
 */
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/favoritos", label: "Favoritos" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "4",
        px: { base: "5", md: "8" },
        py: "5",
      })}
    >
      <Link
        href="/"
        className={css({
          fontFamily: "body",
          fontWeight: "semibold",
          fontSize: "sm",
          letterSpacing: "0.01em",
          color: "textPrimary",
        })}
      >
        Moodboard Studio
      </Link>

      <nav
        aria-label="Navegação principal"
        className={css({ display: "flex", alignItems: "center", gap: { base: "4", md: "6" } })}
      >
        {NAV_LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={css({
                fontFamily: "body",
                fontSize: "sm",
                transition: "color 0.15s ease",
                fontWeight: active ? "semibold" : "normal",
                color: active ? "ctaPurple" : "gray.11",
                _hover: { color: active ? "ctaPurple" : "textPrimary" },
              })}
            >
              {link.label}
            </Link>
          );
        })}

        <span
          aria-disabled="true"
          title="Em breve"
          className={css({
            fontFamily: "body",
            fontSize: "sm",
            color: "gray.8",
            cursor: "not-allowed",
          })}
        >
          Perfil
        </span>
      </nav>
    </header>
  );
}
