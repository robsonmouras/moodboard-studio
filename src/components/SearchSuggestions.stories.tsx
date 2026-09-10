import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SearchSuggestions } from "./SearchSuggestions";

/**
 * Chips de sugestão no hero da home (antes da 1ª busca). Clicar preenche o campo
 * e dispara a busca.
 */
const meta = {
  component: SearchSuggestions,
  tags: ["ai-generated"],
  args: { onPick: fn() },
} satisfies Meta<typeof SearchSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "vintage" }));
    await expect(args.onPick).toHaveBeenCalledWith("vintage");
  },
};
