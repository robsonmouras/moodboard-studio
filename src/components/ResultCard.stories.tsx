import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ResultCard } from "./ResultCard";
import { sampleSearchImage } from "./__fixtures__/images";

/**
 * Card de um resultado no grid de busca (masonry). Sem chrome em repouso; no
 * hover/foco sobe o overlay com crédito do autor + coração de favoritar. O selo
 * "em «Board»" aparece quando a foto já está salva. O estado de favorito vive no
 * pai (`SearchWorkspace`) — aqui as stories simulam.
 */
const meta = {
  title: "Busca/ResultCard",
  component: ResultCard,
  tags: ["autodocs"],
  args: {
    image: sampleSearchImage,
    isFavorite: false,
    onToggleFavorite: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Repouso — só a imagem. Passe o mouse pra revelar o overlay. */
export const Default: Story = {};

/** Favoritada: o overlay fica fixo e o coração preenchido. */
export const Favorited: Story = { args: { isFavorite: true } };

/** A foto já está em outro board do usuário — selo permanente no canto. */
export const AlreadyInBoard: Story = {
  args: {
    inBoardLabel: "em «Referências de sala»",
    inBoardTitle: "Já salva em «Referências de sala»",
  },
};

/** Alterna o favorito de verdade, como o `SearchWorkspace` faria. */
export const Interactive: Story = {
  render: (args) => {
    const [fav, setFav] = useState(false);
    return (
      <div style={{ maxWidth: 340 }}>
        <ResultCard
          {...args}
          isFavorite={fav}
          onToggleFavorite={(img) => {
            setFav((v) => !v);
            args.onToggleFavorite(img);
          }}
        />
      </div>
    );
  },
};
