/**
 * Convert text to a URL-safe slug for heading anchors.
 *
 * - Lowercases, replaces spaces with hyphens
 * - Keeps Spanish accented characters (áéíóúüñ)
 * - Collapses consecutive hyphens
 * - Trims leading/trailing hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-áéíóúüñ]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}
