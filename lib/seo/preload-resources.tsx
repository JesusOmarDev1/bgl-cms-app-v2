import { preconnect, prefetchDNS } from "react-dom"

const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps/embed"
const SITEVERIFY_URL = process.env.NEXT_PUBLIC_SITEVERIFY_URL ?? ""
const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_HOST ?? ""
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ""

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
  preconnectOrigin(SITEVERIFY_URL, "anonymous")
  preconnectOrigin(MEILISEARCH_URL, "anonymous")
  preconnectOrigin(DIRECTUS_URL, "anonymous")
  if (DIRECTUS_URL) prefetchDNS(DIRECTUS_URL)
}
