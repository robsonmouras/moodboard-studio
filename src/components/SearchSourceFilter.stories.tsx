import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SearchSourceFilter } from "./SearchSourceFilter";
import type { ImageSource } from "@/types";

/**
 * Filtro de fontes da busca — um chip-checkbox por API (Unsplash, Pexels,
 * Pixabay), multi-seleção, com pelo menos uma sempre marcada.
 */
const meta = {
  component: SearchSourceFilter,
  tags: ["ai-generated"],
  args: { selected: ["unsplash", "pexels", "pixabay"], onChange: fn() },
} satisfies Meta<typeof SearchSourceFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Todas as fontes ativas (o padrão do produto). */
export const AllSources: Story = {};

/**
 * Só o Unsplash: por ser a última marcada, o chip fica desabilitado — não dá pra
 * zerar o filtro.
 */
export const OnlyUnsplash: Story = {
  args: { selected: ["unsplash"] },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "Unsplash" }),
    ).toBeDisabled();
    await expect(canvas.getByRole("checkbox", { name: "Pexels" })).not.toBeChecked();
  },
};

/** Alternar uma fonte, com a seleção mantida em estado. */
export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<ImageSource[]>(["unsplash", "pexels"]);
    return (
      <SearchSourceFilter
        {...args}
        selected={selected}
        onChange={(next) => {
          setSelected(next);
          args.onChange(next);
        }}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const pixabay = canvas.getByRole("checkbox", { name: "Pixabay" });
    await expect(pixabay).not.toBeChecked();
    await userEvent.click(pixabay);
    await expect(pixabay).toBeChecked();
  },
};
