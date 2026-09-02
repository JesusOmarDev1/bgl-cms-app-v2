import type { NextConfig } from "next"

import createNextIntlPlugin from "next-intl/plugin"
import { assetsRemotePatterns } from "@/lib/directus/asset-pattern"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [55, 60, 65, 70, 75, 80],
    remotePatterns: assetsRemotePatterns(),
    formats: ["image/avif", "image/webp"],
  },
}

export default withNextIntl(nextConfig)
