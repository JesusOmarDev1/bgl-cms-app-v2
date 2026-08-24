import { slugify } from "@/lib/formatting/slugify"
import { htmlToText } from "@/lib/formatting/sanitize"

export type InjectOptions = {
  /** Heading levels to inject IDs into. Default: ["h1","h2","h3","h4"] */
  levels?: string[]
}

const DEFAULT_LEVELS = ["h1", "h2", "h3", "h4"]

/**
 * Injects `id` attributes into heading tags that don't already have one.
 * Handles collision detection with numeric suffixes (-1, -2, etc.).
 *
 * @param html - Raw HTML string
 * @param options - Optional configuration
 * @returns HTML with heading IDs injected
 */
export function injectHeadingIds(
  html: string,
  options?: InjectOptions
): string {
  if (!html) return html

  const levels = options?.levels ?? DEFAULT_LEVELS
  const pattern = levels.join("|")
  const headingRegex = new RegExp(
    `<(${pattern})(\\s[^>]*)?>([\\s\\S]*?)<\\/\\1>`,
    "gi"
  )

  const seen = new Map<string, number>()

  return html.replace(headingRegex, (match, tag, attrs, inner) => {
    // Skip if already has an id attribute
    if (attrs && /\sid\s*=\s*["']/i.test(attrs)) {
      return match
    }

    // Strip inner HTML, decode entities, and slugify
    const text = htmlToText(inner)
    if (!text) return match

    let baseSlug = slugify(text)

    // Handle collision with numeric suffix
    let slug = baseSlug
    if (seen.has(baseSlug)) {
      const count = seen.get(baseSlug)!
      seen.set(baseSlug, count + 1)
      slug = `${baseSlug}-${count}`
    } else {
      seen.set(baseSlug, 1)
    }

    return `<${tag} id="${slug}"${attrs ?? ""}>${inner}</${tag}>`
  })
}
