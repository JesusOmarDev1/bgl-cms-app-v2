import { DIRECTUS_URL } from "@/lib/env/constants"

export type DirectusAssetFit = "cover" | "contain" | "inside" | "outside"

/**
 * Build a public Directus `/assets/{id}` URL. Returns null when the CMS
 * origin is missing or not a valid URL. Never appends a static token.
 */
export function getAssetUrl(
  assetId: string,
  transforms?: { fit?: DirectusAssetFit }
): string | null {
  const base = DIRECTUS_URL
  if (!base) return null

  try {
    const url = new URL(`${base.replace(/\/$/, "")}/assets/${assetId}`)
    if (transforms?.fit) url.searchParams.set("fit", transforms.fit)
    return url.href
  } catch {
    return null
  }
}
