import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "top-right",
  },
  agentRules: false,
};

export default nextConfig;

// Permite que `next dev` simule el entorno de Cloudflare Workers (bindings,
// etc.) cuando se despliega con @opennextjs/cloudflare. No afecta a un
// `next dev` normal si no se usa ningún binding de Cloudflare.
initOpenNextCloudflareForDev();
