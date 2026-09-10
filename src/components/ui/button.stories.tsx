import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

/**
 * Botão do Park UI (recipe `button` em `src/theme/recipes/button.ts`), com a
 * paleta `brand` da identidade visual como `colorPalette` padrão do produto.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Salvar board",
    colorPalette: "brand",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["solid", "surface", "subtle", "outline", "plain"],
    },
    size: {
      control: "inline-radio",
      options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = { args: { variant: "solid" } };

export const Outline: Story = { args: { variant: "outline" } };

export const Subtle: Story = { args: { variant: "subtle" } };

export const Plain: Story = { args: { variant: "plain" } };

export const Loading: Story = {
  args: { variant: "solid", loading: true, loadingText: "Salvando…" },
};

export const Disabled: Story = { args: { variant: "solid", disabled: true } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Button {...args} size="xs" />
      <Button {...args} size="sm" />
      <Button {...args} size="md" />
      <Button {...args} size="lg" />
      <Button {...args} size="xl" />
    </div>
  ),
};
