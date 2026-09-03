import type { Metadata } from "next";
import Link from "next/link";
import { css } from "styled-system/css";
import { ImageTile } from "@/components/ImageTile";
import { getPublicBoard } from "@/lib/boards";

/**
 * Página pública de compartilhamento (`/b/[slug]`).
 *
 * Server Component, sem exigir sessão — o requisito central: a Beatriz (persona
 * cliente) abre o link sem ter conta. Lê pela função Postgres `get_public_board`
 * (nunca `select` direto). Slug inexistente → mensagem neutra, sem revelar se
 * outros slugs existem.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Board — Moodboard Studio",
  robots: { index: false },
};

const shell = css({
  minH: "100dvh",
  bg: "page",
  display: "flex",
  flexDir: "column",
  overflowX: "hidden",
});

const brand = css({
  fontFamily: "body",
  fontWeight: "semibold",
  fontSize: "sm",
  letterSpacing: "0.01em",
  color: "textPrimary",
});

export default async function PublicBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getPublicBoard(slug);

  if (!board) {
    return (
      <div className={shell}>
        <header className={css({ px: { base: "5", md: "8" }, py: "5" })}>
          <Link href="/" className={brand}>
            Moodboard Studio
          </Link>
        </header>
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
            Este board não existe ou não está mais disponível.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={shell}>
      <header className={css({ px: { base: "5", md: "8" }, py: "5" })}>
        <Link href="/" className={brand}>
          Moodboard Studio
        </Link>
      </header>

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
        <div className={css({ display: "flex", flexDir: "column", gap: "1.5" })}>
          <h1
            className={css({
              fontFamily: "display",
              fontWeight: "300",
              fontSize: { base: "2xl", md: "4xl" },
              color: "textPrimary",
            })}
          >
            {board.title}
          </h1>
          <span className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11" })}>
            {board.images.length}{" "}
            {board.images.length === 1 ? "inspiração" : "inspirações"}
          </span>
        </div>

        <div className={css({ columnCount: { base: 2, md: 3 }, columnGap: "3" })}>
          {board.images.map((image, index) => (
            <figure
              key={`${image.imageUrl}-${index}`}
              className={css({ display: "block", mb: "3", breakInside: "avoid" })}
            >
              <ImageTile image={image} />
              <figcaption
                className={css({ mt: "1.5", fontFamily: "body", fontSize: "xs", color: "gray.11" })}
              >
                {image.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </main>

      <footer
        className={css({
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderColor: "border",
          px: { base: "5", md: "8" },
          py: "5",
          textAlign: "center",
        })}
      >
        <span className={css({ fontFamily: "body", fontSize: "xs", color: "gray.9" })}>
          Feito no Moodboard Studio
        </span>
      </footer>
    </div>
  );
}
