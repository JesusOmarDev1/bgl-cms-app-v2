import { preconnect, prefetchDNS } from "react-dom"
import { DIRECTUS_URL, MEILISEARCH_HOST } from "@/lib/env/constants"

const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps/embed"

function preconnectOrigin(href: string, crossOrigin?: "anonymous") {
  if (!href) return
  if (crossOrigin) {
    preconnect(href, { crossOrigin })
    return
  }
  preconnect(href)
}

export function preloadResources(): void {
  preconnectOrigin(GOOGLE_MAPS_EMBED_URL)
  preconnectOrigin(MEILISEARCH_HOST, "anonymous")
  preconnectOrigin(DIRECTUS_URL, "anonymous")
  if (DIRECTUS_URL) prefetchDNS(DIRECTUS_URL)
}
