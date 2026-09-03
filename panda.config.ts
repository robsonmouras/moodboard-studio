import { defineConfig } from "@pandacss/dev";

// Park UI theme (gerado via `@park-ui/cli add`), importado peça a peça de src/theme.
import { conditions } from "@/theme/conditions";
import { globalCss } from "@/theme/global-css";
import { keyframes } from "@/theme/keyframes";
import { layerStyles } from "@/theme/layer-styles";
import { textStyles } from "@/theme/text-styles";
import { animationStyles } from "@/theme/animation-styles";
import { recipes, slotRecipes } from "@/theme/recipes";
import { colors } from "@/theme/tokens/colors";
import { durations } from "@/theme/tokens/durations";
import { shadows } from "@/theme/tokens/shadows";
import { zIndex } from "@/theme/tokens/z-index";
import { plum } from "@/theme/colors/plum";
import { neutral } from "@/theme/colors/neutral";
import { red } from "@/theme/colors/red";
import { green } from "@/theme/colors/green";
import { brand } from "@/theme/colors/brand";

export default defineConfig({
  preflight: true,
  jsxFramework: "react",

  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  outdir: "styled-system",

  conditions,
  globalCss: {
    extend: {
      ...globalCss.extend,
      // Regra 60/30/10: fundo de página nos 60% (#F2F2F2), texto principal em grafite,
      // tipografia de corpo (Inter) como padrão do documento.
      body: {
        background: "page",
        color: "textPrimary",
        fontFamily: "body",
      },
    },
  },

  theme: {
    extend: {
      animationStyles,
      recipes,
      slotRecipes,
      keyframes,
      layerStyles,
      textStyles,

      tokens: {
        colors,
        durations,
        zIndex,
        // Tipografia da identidade visual (Vortex): Outfit para display, Inter para corpo/UI.
        // Carregadas via next/font no layout raiz e expostas como CSS variables.
        fonts: {
          display: { value: "var(--font-outfit), sans-serif" },
          body: { value: "var(--font-inter), sans-serif" },
          // Serifada da headline-assinatura do produto ("Encontre, organize,
          // compartilhe.") — /login + home logada, via <BrandHeadline>. Decisão 04.
          serif: { value: "var(--font-instrument-serif), Georgia, 'Times New Roman', serif" },
        },
      },

      semanticTokens: {
        colors: {
          fg: {
            default: { value: { _light: "{colors.gray.12}", _dark: "{colors.gray.12}" } },
            muted: { value: { _light: "{colors.gray.11}", _dark: "{colors.gray.11}" } },
            subtle: { value: { _light: "{colors.gray.10}", _dark: "{colors.gray.10}" } },
          },
          border: { value: { _light: "{colors.gray.4}", _dark: "{colors.gray.4}" } },
          error: { value: { _light: "{colors.red.9}", _dark: "{colors.red.9}" } },

          plum,
          gray: neutral,
          red,
          green,
          brand,

          // Regra 60/30/10 da identidade visual, como tokens semânticos (nunca hex solto):
          //   60% fundo de página / áreas neutras
          //   30% superfícies (cards, painéis) + texto principal
          //   10% CTA e estados ativos, exclusivamente
          page: { value: "#F2F2F2" },
          surface: { value: "#FFFFFF" },
          textPrimary: { value: "#464645" },
          ctaPurple: { value: "#6A1F74" },
        },
        shadows,
        radii: {
          l1: { value: "{radii.xs}" },
          l2: { value: "{radii.sm}" },
          l3: { value: "{radii.md}" },
        },
      },
    },
  },

  staticCss: {
    recipes: "*",
  },
});