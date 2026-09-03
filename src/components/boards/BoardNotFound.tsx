import Link from "next/link";
import { css } from "styled-system/css";
import { Navbar } from "@/components/Navbar";

/** Estado "board não encontrado" de `/favoritos/[id]` — id inválido ou board já excluído. */
export function BoardNotFound() {
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
          Ele pode ter sido excluído.
        </p>
        <Link
          href="/favoritos"
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
            fontWeight: "normal",
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
          Voltar pra Favoritos
        </Link>
      </main>
    </div>
  );
}
