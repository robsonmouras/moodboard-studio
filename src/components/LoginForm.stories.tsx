import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { LoginForm } from "./LoginForm";

/**
 * Formulário do `/login` (Supabase Auth). Duas colunas: email + senha à esquerda,
 * "Entrar com o Google" (Em breve) à direita. Um toggle troca entre entrar e
 * criar conta sem redesenhar a tela.
 */
const meta = {
  component: LoginForm,
  tags: ["ai-generated"],
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/login" } },
    backgrounds: { value: "surface" },
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Modo entrar (padrão). */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Entrar" })).toBeVisible();
  },
};

/** O toggle vira o formulário para "Criar conta" sem trocar de tela. */
export const SignupMode: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /não tem conta\? criar conta/i }),
    );
    await expect(canvas.getByRole("button", { name: "Criar conta" })).toBeVisible();
  },
};

/** O olho revela a senha — o input passa de `password` para `text`. */
export const RevealPassword: Story = {
  play: async ({ canvas, userEvent }) => {
    const senha = canvas.getByPlaceholderText("Senha");
    await expect(senha).toHaveAttribute("type", "password");
    await userEvent.click(canvas.getByRole("button", { name: "Mostrar senha" }));
    await expect(senha).toHaveAttribute("type", "text");
  },
};
