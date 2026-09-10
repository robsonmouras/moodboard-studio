import type { Preview } from "@storybook/nextjs-vite";
import { mswLoader } from "msw-storybook-addon/csf3";

// Sobe o Service Worker do MSW deixando passar tudo que não tem handler (as fotos
// reais da Unsplash nas fixtures, os assets do próprio Storybook) — sem o warning
// "intercepted a request without a matching request handler" poluindo cada story.
const startMswWorker = async () => {
  const { setupWorker } = await import("msw/browser");
  const worker = setupWorker();
  await worker.start({ quiet: true, onUnhandledRequest: "bypass" });
  return worker;
};

// Entry CSS do Panda (`@layer reset, base, tokens, recipes, utilities`) — o plugin
// PostCSS preenche as camadas com reset + tokens + recipes + utilities do tema.
import "../src/app/globals.css";
import { fontVariables } from "./fonts";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: "todo" },
    backgrounds: {
      options: {
        page: { name: "page (#F2F2F2)", value: "#F2F2F2" },
        surface: { name: "surface (#FFFFFF)", value: "#FFFFFF" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "page" },
  },
  // Inicializa o Mock Service Worker e aplica os `parameters.msw` de cada story.
  // Só o `SearchWorkspace` bate em `/api/search` hoje — as demais stories recebem
  // dados por props e não tocam a rede.
  loaders: [mswLoader(startMswWorker)],
  decorators: [
    // Aplica as CSS vars das fontes da identidade visual ao container da story
    // (elas herdam para os filhos). Padding pra respirar no canvas.
    (Story) => (
      <div
        className={fontVariables}
        style={{ padding: "1.5rem", fontFamily: "var(--font-inter), sans-serif" }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
