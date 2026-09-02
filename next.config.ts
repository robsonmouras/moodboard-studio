import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Não gerar AGENTS.md/CLAUDE.md automaticamente — o scaffold é mantido enxuto de propósito.
  agentRules: false,
};

export default nextConfig;
