import type { NextConfig } from "next"

import createNextIntlPlugin from "next-intl/plugin"
import { assetsRemotePatterns } from "@/lib/directus/asset-pattern"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  logging: {
    browserToTerminal: true,
    // Dev action logs print full args (passwords, Turnstile tokens) — keep off; re-enable temporarily for timing diagnosis.
    serverFunctions: false,
  },
  images: {
    qualities: [55, 60, 65, 70, 75, 80],
    remotePatterns: [...assetsRemotePatterns()],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Avatar uploads are 2 MB-capped PNGs; the 1 MB default rejects them.
    serverActions: { bodySizeLimit: "3mb" },
    agentFeedback: true,
    agentUpgrade: "security",
    turbopackGc: true,
    // Disable the file system cache for development to avoid issues with file watching and caching.
    turbopackFileSystemCacheForDev: false,
  },
  poweredByHeader: false,
}

export default withNextIntl(nextConfig)
