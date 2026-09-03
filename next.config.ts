import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Não gerar AGENTS.md/CLAUDE.md automaticamente — o scaffold é mantido enxuto de propósito.
  agentRules: false,
  images: {
    // Fase 2: as fotos da busca vêm da Unsplash (`urls.regular` / `urls.thumb`).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
