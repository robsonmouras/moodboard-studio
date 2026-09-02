import { IconSparkles } from "@tabler/icons-react";
import { css } from "styled-system/css";
import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/components/Icon";

/**
 * Home — apenas prova de setup da stack (Fase 0, scaffold).
 *
 * NÃO é a tela do produto: a busca, o grid de resultados, os favoritos e o board
 * entram na Fase 1 (protótipo de interface com dados mockados). Aqui só confirmamos
 * visualmente que o tema (tokens 60/30/10, tipografia Outfit/Inter) e o Park UI + Tabler
 * estão ligados corretamente.
 */
export default function Home() {
  return (
    <main
      className={css({
        minH: "100dvh",
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6",
        px: "6",
        textAlign: "center",
      })}
    >
      <h1
        className={css({
          fontFamily: "display",
          fontWeight: "300",
          fontSize: "4xl",
          color: "textPrimary",
        })}
      >
        Moodboard Studio
      </h1>

      <p
        className={css({
          fontFamily: "body",
          fontSize: "md",
          color: "fg.muted",
          maxW: "40ch",
        })}
      >
        Scaffold da stack pronto. Next.js + TypeScript, Panda CSS + Park UI, ícones Tabler e
        client Supabase configurado — sem nenhuma tela do produto ainda.
      </p>

      {/* Prova de tema: Button do Park UI usando a paleta de marca (CTA #6A1F74) + ícone Tabler stroke-width 1. */}
      <Button colorPalette="brand" size="lg">
        <IconSparkles {...iconDefaults} />
        Começar um moodboard
      </Button>
    </main>
  );
}
