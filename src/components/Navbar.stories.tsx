import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Navbar } from "./Navbar";

/**
 * Barra de navegação global (home e biblioteca). Marca à esquerda, Home |
 * Favoritos à direita, e o menu de conta quando há sessão. Sem sessão nas stories,
 * o menu não aparece; o link ativo segue o `pathname`.
 */
const meta = {
  component: Navbar,
  tags: ["ai-generated"],
  parameters: {
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Na home: "Home" é o item da rota atual. */
export const OnHome: Story = {
  parameters: { nextjs: { navigation: { pathname: "/" } } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      canvas.getByRole("link", { name: "Favoritos" }),
    ).not.toHaveAttribute("aria-current");
  },
};

/** Na biblioteca: "Favoritos" fica ativo (rota e subrotas). */
export const OnFavorites: Story = {
  parameters: { nextjs: { navigation: { pathname: "/favoritos" } } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "Favoritos" }),
    ).toHaveAttribute("aria-current", "page");
  },
};
