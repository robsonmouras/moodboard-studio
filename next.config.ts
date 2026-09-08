import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Não gerar AGENTS.md/CLAUDE.md automaticamente — o scaffold é mantido enxuto de propósito.
  agentRules: false,
  images: {
    // As fotos vêm das fontes agregadas (`src/lib/image-sources`) — a URL cheia é
    // pedida em alta sob demanda (`src/lib/unsplash-image.ts`, `pexels-image.ts`),
    // então o `next/image` otimiza a partir de um original grande. `qualities`
    // precisa listar o valor usado nos `<Image>`.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
    ],
    qualities: [75, 90],
  },
};

export default nextConfig;
