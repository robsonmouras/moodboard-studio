import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)", "../src/**/*.mdx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  viteFinal(config) {
    // Resolve os aliases do tsconfig (`@/*` e `styled-system/*`) — o Vite 8 faz
    // isso nativamente. O Panda entra pelo `postcss.config.cjs` (carregado da raiz
    // automaticamente), então as camadas de `src/app/globals.css` importadas no
    // preview são geradas normalmente.
    config.resolve ??= {};
    config.resolve.tsconfigPaths = true;
    return config;
  },
};

export default config;
