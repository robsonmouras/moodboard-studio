import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { BoardPanel } from "./BoardPanel";
import { sampleBoardItems } from "./__fixtures__/images";

/**
 * Bottom bar fixa do board em construção. Fechada (e `aria-hidden`) enquanto não
 * há favoritos; abre deslizando quando entra o 1º. No `variant="append"` (modo
 * contextual) some o campo de nome e o botão vira "Adicionar +N".
 */
const meta = {
  component: BoardPanel,
  tags: ["ai-generated"],
  args: {
    items: sampleBoardItems,
    name: "Sala clara",
    onNameChange: fn(),
    onRemove: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof BoardPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Board vazio — a barra fica fora da tela e escondida dos leitores. */
export const Empty: Story = {
  args: { items: [], name: "" },
  play: async ({ canvas }) => {
    // A barra fechada fica num container `aria-hidden` — fora da árvore acessível.
    expect(canvas.queryByRole("region", { name: "Board" })).toBeNull();
  },
};

/** Criando um board novo, com nome preenchido. */
export const Create: Story = {};

/**
 * "Salvar" sem nome: a barra sinaliza o erro e não chama `onSave`.
 */
export const CreateWithoutName: Story = {
  args: { name: "" },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Salvar" }));
    await expect(await canvas.findByText(/dê um nome ao board/i)).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

/** Modo contextual: sem campo de nome, o botão soma tudo de uma vez. */
export const AppendMode: Story = {
  args: { variant: "append", items: sampleBoardItems.slice(0, 2) },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Adicionar +2" }),
    ).toBeVisible();
  },
};

/** Gravação em voo — o botão desabilita. */
export const Saving: Story = {
  args: { saving: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Salvando" })).toBeDisabled();
  },
};

/** Remover um item do board pelo "x" do tile. */
export const RemoveItem: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const [first] = sampleBoardItems;
    await userEvent.click(
      canvas.getByRole("button", { name: `Remover "${first.description}" do board` }),
    );
    await expect(args.onRemove).toHaveBeenCalledWith(first.id);
  },
};
