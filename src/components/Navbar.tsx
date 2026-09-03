"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOut, User } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { iconDefaults } from "@/components/Icon";
import { Menu } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

/**
 * Barra de navegação global do produto.
 *
 * Marca à esquerda (link pra home) + navegação à direita: Home | Favoritos +
 * um menu de conta (ícone de usuário). O menu mostra o e-mail da sessão e "Sair".
 * Quando a rota `/perfil` existir, "Ver perfil" entra como primeira opção do menu
 * (ver bloco comentado abaixo) — decisão 08.
 *
 * Usada na home (`/`) e na biblioteca (`/favoritos`) — ambas atrás do middleware de
 * sessão. Fora do fluxo de `/login` e da página pública `/b/[slug]`.
 */
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/favoritos", label: "Favoritos" },
] as const;

const accountItem = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  px: "2.5",
  py: "2",
  rounded: "l2",
  cursor: "pointer",
  fontFamily: "body",
  fontSize: "sm",
  color: "textPrimary",
});

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

        {email && (
          <Menu.Root
            positioning={{ placement: "bottom-end", gutter: 8 }}
            onSelect={(details) => {
              if (details.value === "sair") handleSignOut();
              // if (details.value === "perfil") router.push("/perfil");
            }}
          >
            <Menu.Trigger
              aria-label="Conta"
              className={css({
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: "0",
                w: "36px",
                h: "36px",
                rounded: "full",
                border: "none",
                cursor: "pointer",
                bg: "transparent",
                color: "gray.11",
                transitionProperty: "background-color, color",
                transitionDuration: "0.15s",
                _hover: { bg: "gray.3", color: "textPrimary" },
                "&[data-state='open']": { bg: "gray.3", color: "textPrimary" },
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "ctaPurple",
                  outlineOffset: "2px",
                },
              })}
            >
              <User {...iconDefaults} size={20} />
            </Menu.Trigger>

            <Menu.Positioner>
              <Menu.Content
                className={css({
                  minW: "232px",
                  p: "1.5",
                  fontFamily: "body",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "border",
                  bg: "surface",
                })}
              >
                <div
                  className={css({
                    display: "flex",
                    flexDir: "column",
                    gap: "0.5",
                    px: "2.5",
                    py: "2",
                  })}
                >
                  <span className={css({ fontSize: "xs", color: "gray.9" })}>
                    Conectado como
                  </span>
                  <span
                    className={css({
                      fontSize: "sm",
                      fontWeight: "medium",
                      color: "textPrimary",
                      wordBreak: "break-all",
                    })}
                  >
                    {email}
                  </span>
                </div>

                <Menu.Separator
                  className={css({ my: "1", mx: "1", h: "1px", bg: "border", border: "none" })}
                />

                {/* TODO(/perfil): quando a rota existir, "Ver perfil" entra aqui, antes de "Sair":
                <Menu.Item value="perfil" className={accountItem} asChild>
                  <Link href="/perfil">
                    <User {...iconDefaults} size={18} aria-hidden />
                    Ver perfil
                  </Link>
                </Menu.Item> */}

                <Menu.Item value="sair" className={accountItem}>
                  <SignOut {...iconDefaults} size={18} aria-hidden />
                  Sair
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        )}
      </nav>
    </header>
  );
}
