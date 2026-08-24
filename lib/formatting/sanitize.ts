/**
 * Isomorphic HTML sanitization utility.
 *
 * Uses DOMPurify (via isomorphic-dompurify) for reliable, safe sanitization
 * across server and client runtimes.
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

/**
 * Convert an HTML string to plain text.
 *
 * Strips all tags AND decodes HTML entities (`&aacute;` → `á`, `&#241;` → `ñ`, etc.)
 * using the browser's DOMParser. Falls back to regex stripping on the server.
 *
 * @param html - Raw HTML string (e.g. from Directus rich text fields)
 * @returns Plain text string
 */
export function htmlToText(html: string): string {
  if (!html) return ""

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim()
  }

  // SSR fallback: strip tags + decode common named entities
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&Aacute;/gi, "Á")
    .replace(/&Eacute;/gi, "É")
    .replace(/&Iacute;/gi, "Í")
    .replace(/&Oacute;/gi, "Ó")
    .replace(/&Uacute;/gi, "Ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&Ntilde;/gi, "Ñ")
    .replace(/&uuml;/gi, "ü")
    .replace(/&Uuml;/gi, "Ü")
    .replace(/&nbsp;/gi, " ")
    .replace(/&iquest;/gi, "¿")
    .replace(/&iexcl;/gi, "¡")
    .replace(/&ordf;/gi, "ª")
    .replace(/&ordm;/gi, "º")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&bull;/gi, "•")
    .replace(/&hellip;/gi, "…")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&middot;/gi, "·")
    .replace(/&sect;/gi, "§")
    .replace(/&copy;/gi, "©")
    .replace(/&reg;/gi, "®")
    .replace(/&deg;/gi, "°")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim()
}
