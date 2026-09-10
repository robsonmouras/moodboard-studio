// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Código gerado pelo Panda CSS — não versionado e não deve ser lintado.
    "styled-system/**",
    // Build estático do Storybook (`npm run build-storybook`) — não versionado.
    "storybook-static/**",
    // Service worker do MSW gerado por `npx msw init public` — arquivo de vendor.
    "public/mockServiceWorker.js",
  ]),
  ...storybook.configs["flat/recommended"],
]);

export default eslintConfig;
