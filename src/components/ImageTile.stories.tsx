import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ImageTile } from "./ImageTile";
import { sampleSearchImages } from "./__fixtures__/images";

/**
 * Tile de uma imagem no grid de busca e no board. Com `imageUrl`/`thumbUrl` mostra
 * a foto real (via `next/image`); sem URL nenhuma, cai só no gradiente de
 * `placeholder` e vira um `role="img"` rotulado pela descrição.
 */
const meta = {
  component: ImageTile,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Foto real da Unsplash, proporção retrato (4 / 5). */
export const Photo: Story = {
  args: { image: sampleSearchImages[0] },
};

/** Proporção quadrada — o `aspect-ratio` vem do próprio item. */
export const Square: Story = {
  args: { image: sampleSearchImages[2] },
};

/** Cantos menos arredondados (usado no grid denso do `BoardPanel`). */
export const RoundedLg: Story = {
  args: { image: sampleSearchImages[1], rounded: "lg" },
};

/**
 * Sem URL de imagem (board mockado antigo): sem `<img>`, o tile é exposto como
 * `role="img"` com a descrição no `aria-label`.
 */
export const PlaceholderOnly: Story = {
  args: {
    image: {
      description: "Paleta terrosa com bege e terracota",
      aspectRatio: "4 / 5",
      placeholder: { from: "#d8c3a5", to: "#8a5a44" },
    },
  },
  play: async ({ canvas }) => {
    // Prova o ramo sem-src: o próprio tile carrega o papel de imagem e o rótulo.
    await expect(
      canvas.getByRole("img", { name: /paleta terrosa/i }),
    ).toBeVisible();
  },
};
