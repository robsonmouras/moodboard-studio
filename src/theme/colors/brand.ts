import { defineSemanticTokens } from "@pandacss/dev";

/**
 * Paleta "brand" da identidade visual do produto.
 *
 * Ancorada no roxo de CTA definitivo #6A1F74 (regra 60/30/10, faixa dos 10%).
 * Segue a mesma estrutura das paletas do Park UI (escala 1..12 + alfas + papéis
 * solid/subtle/surface/outline/plain) para poder ser usada como `colorPalette="brand"`
 * em qualquer componente. Como o produto tem apenas tema claro, _light e _dark
 * carregam o mesmo valor de propósito.
 */
const step = (light: string) => ({ value: { _light: light, _dark: light } });

export const brand = defineSemanticTokens.colors({
  "1": step("#fbf6fc"),
  "2": step("#f6ebf8"),
  "3": step("#efdcf2"),
  "4": step("#e6c9eb"),
  "5": step("#dbb4e1"),
  "6": step("#cd9bd4"),
  "7": step("#bc7ec4"),
  "8": step("#a659b0"),
  "9": step("{colors.ctaPurple}"),
  "10": step("#5e1b67"),
  "11": step("#7d2c88"),
  "12": step("#3d1145"),

  a1: step("rgba(106, 31, 116, 0.03)"),
  a2: step("rgba(106, 31, 116, 0.06)"),
  a3: step("rgba(106, 31, 116, 0.12)"),
  a4: step("rgba(106, 31, 116, 0.20)"),
  a5: step("rgba(106, 31, 116, 0.28)"),
  a6: step("rgba(106, 31, 116, 0.38)"),
  a7: step("rgba(106, 31, 116, 0.50)"),
  a8: step("rgba(106, 31, 116, 0.64)"),
  a9: step("rgba(106, 31, 116, 0.87)"),
  a10: step("rgba(106, 31, 116, 0.90)"),
  a11: step("rgba(106, 31, 116, 0.93)"),
  a12: step("rgba(61, 17, 69, 0.95)"),

  solid: {
    bg: {
      // Fonte única do roxo de CTA: o token semântico ctaPurple (#6A1F74).
      DEFAULT: step("{colors.ctaPurple}"),
      hover: step("#5e1b67"),
    },
    fg: { DEFAULT: step("#ffffff") },
  },
  subtle: {
    bg: {
      DEFAULT: step("rgba(106, 31, 116, 0.12)"),
      hover: step("rgba(106, 31, 116, 0.20)"),
      active: step("rgba(106, 31, 116, 0.28)"),
    },
    fg: { DEFAULT: step("#7d2c88") },
  },
  surface: {
    bg: {
      DEFAULT: step("rgba(106, 31, 116, 0.06)"),
      active: step("rgba(106, 31, 116, 0.12)"),
    },
    border: {
      DEFAULT: step("rgba(106, 31, 116, 0.38)"),
      hover: step("rgba(106, 31, 116, 0.50)"),
    },
    fg: { DEFAULT: step("#7d2c88") },
  },
  outline: {
    bg: {
      hover: step("rgba(106, 31, 116, 0.06)"),
      active: step("rgba(106, 31, 116, 0.12)"),
    },
    border: { DEFAULT: step("rgba(106, 31, 116, 0.50)") },
    fg: { DEFAULT: step("#7d2c88") },
  },
  plain: {
    bg: {
      hover: step("rgba(106, 31, 116, 0.12)"),
      active: step("rgba(106, 31, 116, 0.20)"),
    },
    fg: { DEFAULT: step("#7d2c88") },
  },
});
