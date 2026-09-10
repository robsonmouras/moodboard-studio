import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ResultsGrid } from "./ResultsGrid";
import { sampleSearchImages } from "./__fixtures__/images";

/**
 * Área de resultados da busca. Uma `status` dirige o que aparece: carregando,
 * grid populado, vazio, falha de rede, rate limit ou erro da API. Com mais
 * páginas, o rodapé de scroll infinito (decisão 10) entra.
 */
const meta = {
  component: ResultsGrid,
  tags: ["ai-generated"],
  args: {
    query: "minimalista",
    status: "success",
    results: sampleSearchImages,
    favoriteIds: new Set<string>(),
    onToggleFavorite: fn(),
  },
} satisfies Meta<typeof ResultsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Primeira busca em andamento. */
export const Loading: Story = { args: { status: "loading", results: [] } };

/** Termo sem nenhum resultado. */
export const Empty: Story = { args: { status: "empty", results: [] } };

/** Sem internet. */
export const NetworkError: Story = { args: { status: "networkError", results: [] } };

/** Todas as fontes bateram o limite de requisições. */
export const RateLimit: Story = { args: { status: "rateLimit", results: [] } };

/** Falha genérica da busca. */
export const ApiError: Story = { args: { status: "apiError", results: [] } };

/** Grid populado. */
export const Populated: Story = {
  play: async ({ canvas }) => {
    // Cada resultado das fixtures virou um card com a sua foto.
    await expect(
      canvas.getByRole("img", { name: /parede de tijolos claros/i }),
    ).toBeVisible();
    await expect(canvas.getAllByRole("img")).toHaveLength(sampleSearchImages.length);
  },
};

/** Uma das fotos já está na seleção — o coração fica marcado. */
export const WithFavorite: Story = {
  args: { favoriteIds: new Set([sampleSearchImages[0].id]) },
};

/** Ainda há páginas — o rodapé mostra "Carregar mais". */
export const HasMorePages: Story = { args: { hasMore: true } };

/** Um append (página 2+) em voo. */
export const LoadingMore: Story = { args: { hasMore: true, loadingMore: true } };

/** O último append falhou — o rodapé oferece o retry. */
export const LoadMoreFailed: Story = {
  args: { hasMore: true, loadMoreFailed: true, onLoadMore: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /tentar de novo/i }));
    await expect(args.onLoadMore).toHaveBeenCalled();
  },
};
