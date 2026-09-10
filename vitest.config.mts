import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Roda as stories como testes (browser mode via Playwright): cada story monta de
 * verdade e as `play` funcionam como asserções. `npm run test-storybook`.
 *
 * O Panda entra pelo `postcss.config.cjs` (carregado da raiz), igual ao preview —
 * então as stories renderizam com o CSS real do tema. O `@storybook/addon-vitest`
 * já injeta os decorators/loaders do `.storybook/preview.tsx` automaticamente
 * (desde a 10.3), então não há setup file.
 */
export default defineConfig({
  plugins: [
    storybookTest({ configDir: path.join(dirname, ".storybook") }),
  ],
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
      "styled-system": path.join(dirname, "styled-system"),
    },
  },
  // Pré-empacota as libs que as stories puxam (Ark UI, Supabase, helpers do Next),
  // senão o Vite as descobre no meio do run e recarrega a página — o que derruba
  // a conexão do browser mode e falha suites inteiras de forma intermitente.
  optimizeDeps: {
    include: [
      "@ark-ui/react/menu",
      "@supabase/ssr",
      "@supabase/supabase-js",
      "next/cache",
      "next/headers",
      "next/link",
      "next/navigation",
      "@phosphor-icons/react",
      "msw",
      "msw/browser",
    ],
  },
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
