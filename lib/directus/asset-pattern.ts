import type { RemotePattern } from "next/dist/shared/lib/image-config"
// Relative on purpose: next.config's SWC hook rewrites `@/` from the repo root,
// so a nested `@/` import fails module resolution during typegen and build.
import { DIRECTUS_URL } from "../env/constants"

export function assetsRemotePatterns(): RemotePattern[] {
  const raw = DIRECTUS_URL
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
