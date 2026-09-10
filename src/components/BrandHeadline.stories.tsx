import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BrandHeadline } from "./BrandHeadline";

/**
 * Headline-assinatura do produto ("Encontre, organize, compartilhe.") em Instrument
 * Serif com o acento à mão contornando "compartilhe". Tratamento único do `/login`
 * e da home logada — decisão 04. Depende da CSS var `--font-instrument-serif`
 * (carregada no `.storybook/preview.ts`).
 */
const meta = {
  title: "Marca/BrandHeadline",
  component: BrandHeadline,
  tags: ["autodocs"],
  parameters: { backgrounds: { value: "surface" } },
  argTypes: {
    size: { control: "inline-radio", options: ["entry", "hero", "compact"] },
  },
} satisfies Meta<typeof BrandHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Moldura do `/login` — a maior, em duas linhas com acento. */
export const Entry: Story = { args: { size: "entry" } };

/** Home no estado inicial (hero centralizado). */
export const Hero: Story = { args: { size: "hero" } };

/** Home depois da busca — uma linha, sem quebra e sem acento. */
export const Compact: Story = { args: { size: "compact" } };
