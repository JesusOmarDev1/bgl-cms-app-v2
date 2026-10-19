/**
 * Server HTML sanitization for CMS strings before they reach a client component.
 */
import DOMPurify from "isomorphic-dompurify"

const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "br",
  "hr",
  "blockquote",
  "code",
  "pre",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "colgroup",
  "col",
  "caption",
  "span",
  "div",
  "sub",
  "sup",
  "small",
  "mark",
]

const ALLOWED_ATTR = [
  "class",
  "id",
  "style",
  "href",
  "target",
  "rel",
  "title",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "colspan",
  "rowspan",
  "scope",
  "headers",
  "abbr",
  "span",
]

/**
 * Sanitize an HTML string, removing dangerous tags/attributes (scripts, event handlers, etc.)
 * while preserving safe formatting tags.
 *
 * @param dirty - Raw HTML string from Directus
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ""
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

const HTML_KEYS = new Set(["excerpt", "answer", "content", "address"])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function sanitizeHtmlFieldsUnchecked<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeHtmlFieldsUnchecked(item)) as T
  }
  if (!isRecord(value)) return value
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    out[key] =
      HTML_KEYS.has(key) && typeof child === "string"
        ? sanitizeHtml(child)
        : sanitizeHtmlFieldsUnchecked(child)
  }
  return out as T
}

let selfChecked = false

export function sanitizeHtmlFields<T>(value: T): T {
  if (!selfChecked) {
    selfChecked = true
    const sample = sanitizeHtmlFieldsUnchecked({
      title: "<script>",
      excerpt: "<script>x</script><p>ok</p>",
    })
    if (
      sample.title !== "<script>" ||
      sample.excerpt.includes("<script") ||
      !sample.excerpt.includes("ok")
    ) {
      throw new Error("sanitize html fields self-check failed")
    }
  }
  return sanitizeHtmlFieldsUnchecked(value)
}
