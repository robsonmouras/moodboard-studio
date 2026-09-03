"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { css } from "styled-system/css";
import { createClient } from "@/lib/supabase/client";

/**
 * Barra de navegação global do produto.
 *
 * Marca à esquerda (link pra home) + navegação à direita: Home | Favoritos | Perfil.
 * "Perfil" segue sem tela — item desabilitado ("Em breve"), decisão 03.
 *
 * Fase 3: mostra a sessão ativa (email do usuário) e um "Sair". Usada na home (`/`)
 * e na biblioteca (`/favoritos`) — ambas atrás do middleware de sessão. Fora do
 * fluxo de `/login` e da página pública `/b/[slug]`.
 */
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/favoritos", label: "Favoritos" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

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
        className={css({ display: "flex", alignItems: "center", gap: { base: "3", md: "5" } })}
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

        {email && (
          <span
            className={css({
              display: { base: "none", sm: "inline" },
              fontFamily: "body",
              fontSize: "xs",
              color: "gray.9",
              maxW: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
            title={email}
          >
            {email}
          </span>
        )}

        {email && (
          <button
            type="button"
            onClick={handleSignOut}
            className={css({
              flexShrink: "0",
              h: "32px",
              px: "3.5",
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
            Sair
          </button>
        )}
      </nav>
    </header>
  );
}
