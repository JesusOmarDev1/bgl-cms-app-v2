/**
 * Convert an HTML string to plain text.
 *
 * Strips all tags AND decodes HTML entities (`&aacute;` → `á`, `&#241;` → `ñ`, etc.)
 * using the browser's DOMParser. Falls back to regex stripping on the server.
 */
export function htmlToText(html: string): string {
  if (!html) return ""

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim()
  }

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
