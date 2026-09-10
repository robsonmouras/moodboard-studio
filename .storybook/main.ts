import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)", "../src/**/*.mdx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  // Stubs pras chaves públicas do Supabase — `src/lib/supabase/client.ts` lança no
  // import se faltarem, e ele é puxado pelo `Navbar` (logo, por quase toda tela).
  // O client nunca conecta nas stories (sem cookie de sessão), então valor fake basta.
  env: (config) => ({
    ...config,
    NEXT_PUBLIC_SUPABASE_URL:
      config.NEXT_PUBLIC_SUPABASE_URL || "https://stub.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_stub_anon_key",
  }),
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
