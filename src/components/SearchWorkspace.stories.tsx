import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SearchWorkspace } from "./SearchWorkspace";
import { searchOk } from "../../.storybook/msw-handlers";

/**
 * Tela principal do produto (rota `/`): busca real → grid → favoritar → board.
 * As stories cobrem o hero inicial, uma busca que volta com resultados (via MSW)
 * e o modo contextual de adição (`?add=<id>`).
 */
const meta = {
  component: SearchWorkspace,
  tags: ["ai-generated"],
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
  args: {
    recentBoards: [],
    totalBoardCount: 0,
    existingBoards: [],
  },
} satisfies Meta<typeof SearchWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estado inicial: headline-assinatura + campo de busca centralizados. */
export const Initial: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /encontre, organize, compartilhe/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("textbox", { name: /buscar referências/i }),
    ).toBeVisible();
  },
};

/**
 * Digitar um termo dispara a busca real (interceptada pelo MSW) e o grid troca o
 * "Buscando imagens." pelos resultados.
 */
export const SearchResults: Story = {
  parameters: { msw: [searchOk] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: /buscar referências/i }),
      "minimalista",
    );
    // Debounce de 400ms + fetch mockado + render — espera o card aparecer.
    await expect(
      await canvas.findByRole(
        "img",
        { name: /parede de tijolos claros/i },
        { timeout: 5000 },
      ),
    ).toBeVisible();
  },
};

/** Modo contextual: chegou de um board pelo "Adicionar inspirações". */
export const ContextMode: Story = {
  args: {
    activeBoard: {
      id: "board-1",
      name: "Sala de estar clara",
      itemIds: [],
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/adicionando a/i)).toBeVisible();
    await expect(canvas.getByText("Sala de estar clara")).toBeVisible();
  },
};
