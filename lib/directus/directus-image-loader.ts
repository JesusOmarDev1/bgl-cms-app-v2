import type { ImageLoaderProps } from "next/image"

/**
 * Per-component next/image loader. Directus Sharp resizes via query params.
 * Does not overwrite `fit` already present on the URL.
 */
export function directusImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const url = new URL(src)
  url.searchParams.set("width", String(width))
  url.searchParams.set("quality", String(quality ?? 75))
  url.searchParams.set("withoutEnlargement", "true")
  return url.toString()
}
