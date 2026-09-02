import type { RemotePattern } from "next/dist/shared/lib/image-config"

export function assetsRemotePatterns(): RemotePattern[] {
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
