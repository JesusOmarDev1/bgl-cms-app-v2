/**
 * Get the URL of an asset from Directus
 * @param assetId - The ID of the asset
 * @returns The URL of the asset
 */
export function getAssetUrl(path: string, assetId: string): string {
  return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${assetId}`
}
