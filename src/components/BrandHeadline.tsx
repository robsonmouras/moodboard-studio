import { css } from "styled-system/css";

/**
 * Headline-assinatura do produto: "Encontre, organize, compartilhe." em Instrument
 * Serif (peso 400) com o acento circular à mão contornando "compartilhe".
 *
 * Tratamento ÚNICO, compartilhado pela tela de entrada (`/login`) e pela home logada
 * (`/`) — mesma frase, mesma fonte, mesmo peso, mesmo acento. Antes a home repetia a
 * frase em sans-serif sem acento, o que lia como sistema não resolvido. Ver
 * `decisões/decisao-04-headline-serifado-no-produto.md`.
 *
 * `size` só ajusta a escala ao contexto:
 * - `entry`  — moldura do /login, a maior, frase em duas linhas + acento;
 * - `hero`   — home no estado inicial (hero centralizado), um passo menor que `entry`
 *              porque tem subtítulo, busca e seções abaixo;
 * - `compact`— home depois da busca, quando o headline encolhe pro topo pra dar lugar
 *              ao grid: uma linha, sem quebra e sem acento (não cabe com legibilidade
 *              nesse tamanho — é o único ponto em que o acento não acompanha).
 */

// Escalas como objetos literais separados — o Panda só extrai `css()` com literal,
// não com variável computada. Um `css()` por tamanho.
const scaleClass = {
  entry: css({ fontSize: { base: "5xl", md: "7xl" }, lineHeight: "1.08" }),
  hero: css({ fontSize: { base: "4xl", md: "6xl" }, lineHeight: "1.1" }),
  compact: css({ fontSize: { base: "2xl", md: "3xl" }, lineHeight: "1.15" }),
};

const base = css({
  m: "0",
  fontFamily: "serif",
  fontWeight: "400",
  color: "textPrimary",
});

export function BrandHeadline({ size = "hero" }: { size?: "entry" | "hero" | "compact" }) {
  const className = `${base} ${scaleClass[size]}`;

  if (size === "compact") {
    return <h1 className={className}>Encontre, organize, compartilhe.</h1>;
  }

  return (
    <h1 className={className}>
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
  );
}
