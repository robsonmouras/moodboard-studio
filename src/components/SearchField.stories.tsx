import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SearchField } from "./SearchField";

/**
 * Campo de busca por texto livre (controlado — o valor mora no `SearchWorkspace`).
 * O "x" de limpar só aparece com texto; o submit dispara a busca imediata.
 */
const meta = {
  component: SearchField,
  tags: ["ai-generated"],
  args: { value: "", onSearch: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Vazio: sem o botão de limpar. */
export const Empty: Story = {
  play: async ({ canvas }) => {
    expect(canvas.queryByRole("button", { name: /limpar busca/i })).toBeNull();
  },
};

/** Com um termo digitado — o "x" de limpar aparece. */
export const WithValue: Story = {
  args: { value: "minimalismo escandinavo" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /limpar busca/i }),
    ).toBeVisible();
  },
};

/**
 * Digitação real e limpar, com o valor controlado por estado — como o
 * `SearchWorkspace` faria.
 */
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div style={{ maxWidth: 520 }}>
        <SearchField
          {...args}
          value={value}
          onSearch={(next) => {
            setValue(next);
            args.onSearch(next);
          }}
        />
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: /buscar referências/i });
    await userEvent.type(input, "orgânico");
    await expect(input).toHaveValue("orgânico");

    await userEvent.click(canvas.getByRole("button", { name: /limpar busca/i }));
    await expect(input).toHaveValue("");
  },
};

/**
 * O botão "Buscar" usa o token `ctaPurple` (#6A1F74) — se o CSS do Panda não
 * tivesse carregado no preview, a cor resolvida não bateria.
 */
export const CssCheck: Story = {
  args: { value: "corporativo" },
  play: async ({ canvas }) => {
    const submit = canvas.getByRole("button", { name: /^buscar$/i });
    await expect(getComputedStyle(submit).backgroundColor).toBe(
      "rgb(106, 31, 116)",
    );
  },
};
