import type { NextConfig } from "next"

import createNextIntlPlugin from "next-intl/plugin"
import { assetsRemotePatterns } from "@/lib/directus/asset-pattern"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  logging: {
    browserToTerminal: true,
  },
  images: {
    qualities: [55, 60, 65, 70, 75, 80],
    remotePatterns: assetsRemotePatterns(),
    formats: ["image/avif", "image/webp"],
    loader: "custom",
    loaderFile: "./assets/loaders/BarsRotateDots.tsx",
  },
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
    turbopackGc: true,
    turbopackLazyDynamicImports: true,
    turbopackPluginRuntimeStrategy: "workerThreads",
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
}

export default withNextIntl(nextConfig)
