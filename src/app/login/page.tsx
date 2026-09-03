import type { Metadata } from "next";
import { Suspense } from "react";
import { css } from "styled-system/css";
import { LoginForm } from "@/components/LoginForm";

/**
 * Tela de entrada do produto (/login) — decisão de design v3 ("referência tract.").
 *
 * Card branco "emoldurado" sobre a página cinza, contendo navbar mínima (só a marca),
 * headline serifado com acento à mão, subtítulo, formulário em duas colunas e rodapé.
 * A parte interativa vive em <LoginForm> (client). Aqui é só a moldura, estática.
 *
 * Tipografia: Instrument Serif (fonts.serif) exclusivamente no headline; Inter no resto.
 * Cores: tokens 60/30/10 do tema — page (fundo), surface (card), textPrimary, ctaPurple.
 */

export const metadata: Metadata = {
  title: "Entrar — Moodboard Studio",
};

export default function LoginPage() {
  return (
    <div
      className={css({
        minH: "100dvh",
        w: "full",
        bg: "page",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { base: "4", md: "10" },
        fontFamily: "body",
      })}
    >
      <div
        className={css({
          w: "1040px",
          maxW: "full",
          bg: "surface",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "border",
          rounded: "28px",
          boxShadow: "xl",
          display: "flex",
          flexDir: "column",
          overflow: "hidden",
        })}
      >
        {/* Navbar mínima: só a marca, sem navegação nem CTA de marketing (decisão v2). */}
        <header
          className={css({
            px: { base: "6", md: "11" },
            py: "6",
            display: "flex",
            alignItems: "center",
          })}
        >
          <span
            className={css({
              fontFamily: "body",
              fontWeight: "semibold",
              fontSize: "sm",
              letterSpacing: "0.01em",
              color: "textPrimary",
            })}
          >
            Moodboard Studio
          </span>
        </header>

        <main
          className={css({
            px: { base: "6", md: "11" },
            pt: "7",
            pb: { base: "10", md: "12" },
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            textAlign: "center",
          })}
        >
          <div
            className={css({
              display: "flex",
              flexDir: "column",
              alignItems: "center",
              gap: "4",
              mb: { base: "8", md: "12" },
            })}
          >
            <h1
              className={css({
                m: "0",
                fontFamily: "serif",
                fontWeight: "400",
                fontSize: { base: "5xl", md: "7xl" },
                lineHeight: "1.08",
                color: "textPrimary",
              })}
            >
              Encontre, organize,
              <br />
              <span
                className={css({
                  position: "relative",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                })}
              >
                compartilhe
                <svg
                  viewBox="0 0 320 110"
                  fill="none"
                  aria-hidden="true"
                  className={css({
                    position: "absolute",
                    left: "-6%",
                    top: "-34%",
                    w: "112%",
                    h: "168%",
                    pointerEvents: "none",
                    color: "brand.7",
                  })}
                >
                  <path
                    d="M14,58 C10,26 62,8 158,7 C258,6 306,24 302,56 C298,90 236,102 156,101 C70,100 18,92 14,58 Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            <p
              className={css({
                m: "0",
                fontFamily: "body",
                fontSize: "lg",
                lineHeight: "1.5",
                color: "gray.11",
                maxW: "420px",
              })}
            >
              Referências visuais prontas pra virar um board que o cliente entende sem esforço.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </main>

        <footer
          className={css({
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderColor: "border",
            px: { base: "6", md: "11" },
            py: "5",
            textAlign: "center",
          })}
        >
          <span
            className={css({ fontFamily: "body", fontSize: "xs", color: "gray.9" })}
          >
            Moodboard Studio
          </span>
        </footer>
      </div>
    </div>
  );
}
