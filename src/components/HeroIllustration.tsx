import { css } from "styled-system/css";

/**
 * Ilustração do hero — abaixo do campo de busca.
 *
 * Peep (Open Peeps, "Flat Assets") observando um board de referências em formação.
 * O peep vem de `public/illustrations/peep-designer.svg` (traço preto original, roupa
 * lavada no tom `brand.3` da identidade). Os quadros do board são desenhados aqui com
 * tokens do tema — paleta `brand` em tons pastel (passos claros da escala), sem o roxo
 * de CTA cheio, pra não competir com o conteúdo.
 *
 * Decorativa: `aria-hidden`, sem texto alternativo.
 */
export function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className={css({
        mt: { base: "10", md: "14" },
        w: "full",
        maxW: "616px",
        mx: "auto",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: { base: "4", md: "8" },
        userSelect: "none",
      })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustrations/peep-designer.svg"
        alt=""
        className={css({
          h: { base: "252px", md: "325px" },
          w: "auto",
          flexShrink: "0",
        })}
      />

      <svg
        viewBox="0 0 260 210"
        role="presentation"
        className={css({
          h: { base: "235px", md: "294px" },
          w: "auto",
          flexShrink: "0",
        })}
      >
        {/* Quadro do fundo — superfície branca, leve rotação */}
        <g transform="rotate(-7 70 120)">
          <rect x="14" y="70" width="92" height="112" rx="8" fill="var(--colors-surface)" stroke="var(--colors-gray-6)" strokeWidth="2" />
          <rect x="26" y="82" width="68" height="64" rx="4" fill="var(--colors-brand-2)" />
          <rect x="26" y="154" width="44" height="7" rx="3.5" fill="var(--colors-gray-6)" />
        </g>

        {/* Quadro central — roxo pastel (passo claro da escala brand) */}
        <g transform="rotate(4 150 96)">
          <rect x="100" y="34" width="96" height="118" rx="8" fill="var(--colors-brand-5)" />
          <rect x="112" y="46" width="72" height="70" rx="4" fill="var(--colors-brand-3)" />
          <rect x="112" y="126" width="50" height="8" rx="4" fill="var(--colors-brand-7)" />
        </g>

        {/* Quadro da frente — branco com bloco no tom brand pastel */}
        <g transform="rotate(-3 196 130)">
          <rect x="158" y="86" width="88" height="104" rx="8" fill="var(--colors-surface)" stroke="var(--colors-gray-6)" strokeWidth="2" />
          <rect x="170" y="98" width="64" height="58" rx="4" fill="var(--colors-brand-3)" />
          <rect x="170" y="164" width="40" height="7" rx="3.5" fill="var(--colors-gray-6)" />
        </g>

        {/* Alfinetes — toques do roxo pastel */}
        <circle cx="60" cy="66" r="5" fill="var(--colors-brand-7)" />
        <circle cx="150" cy="30" r="5" fill="var(--colors-brand-7)" />
        <circle cx="202" cy="82" r="5" fill="var(--colors-brand-7)" />
      </svg>
    </div>
  );
}
