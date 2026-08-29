import type { NextConfig } from "next"
import type { RemotePattern } from "next/dist/shared/lib/image-config"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

function directusAssetPattern(): RemotePattern[] {
  const raw = process.env.NEXT_PUBLIC_DIRECTUS_URL
  if (!raw) return []

  try {
    const url = new URL(raw)
    if (url.protocol !== "http:" && url.protocol !== "https:") return []

    const pattern: RemotePattern = {
      protocol: url.protocol === "https:" ? "https" : "http",
      hostname: url.hostname,
      pathname: "/assets/**",
    }

    if (url.port) pattern.port = url.port

    return [pattern]
  } catch {
    return []
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [55, 60, 65, 70, 75, 80],
    remotePatterns: directusAssetPattern(),
  },
}

export default withNextIntl(nextConfig)
