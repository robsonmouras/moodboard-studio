import { Inter, Instrument_Serif, Outfit } from "next/font/google";

/**
 * Mesmas famílias e pesos do `src/app/layout.tsx` — o Storybook não roda o layout
 * raiz, então sem isto as CSS vars `--font-*` não existem e os tokens
 * `fonts.display / body / serif` do Panda caem no fallback (o `<BrandHeadline>`
 * em Instrument Serif fica mais visível). O `@storybook/nextjs-vite` transforma
 * o `next/font/google` no build, igual ao Next.
 */
export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const fontVariables = `${outfit.variable} ${inter.variable} ${instrumentSerif.variable}`;
