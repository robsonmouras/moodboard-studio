import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { BoardCover } from "./BoardCover";
import { sampleCover } from "@/components/__fixtures__/images";

/**
 * Capa de um board: colagem das primeiras miniaturas. 1 imagem ocupa tudo, 2
 * dividem em colunas, 3+ formam uma grade 2x2 (máx. 4). Board vazio mostra um
 * aviso.
 */
const meta = {
  component: BoardCover,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BoardCover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sem imagens. */
export const Empty: Story = {
  args: { cover: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Board vazio")).toBeVisible();
  },
};

/** Uma imagem ocupa a capa inteira. */
export const Single: Story = { args: { cover: sampleCover.slice(0, 1) } };

/** Duas imagens, lado a lado. */
export const Pair: Story = { args: { cover: sampleCover.slice(0, 2) } };

/** Três ou mais: grade 2x2. */
export const Quad: Story = {
  args: {
    cover: [...sampleCover, ...sampleCover].slice(0, 4),
  },
};

/** Mais de quatro — só as 4 primeiras entram. */
export const Overflow: Story = {
  args: { cover: [...sampleCover, ...sampleCover] },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("img")).toHaveLength(4);
  },
};
