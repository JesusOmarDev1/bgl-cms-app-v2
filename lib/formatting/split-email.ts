/**
 * Split an email address into local part and domain for display purposes.
 *
 * Useful as an anti-bot scraping technique: instead of rendering the full
 * email with an "@" sign, the caller can place a visual separator (icon,
 * SVG, etc.) between the two parts.
 *
 * @param email - The email address to split
 * @returns `{ localPart, domain }` or `null` if the email is invalid
 *
 * @example
 * ```ts
 * splitEmail("user@example.com")
 * // → { localPart: "user", domain: "example.com" }
 *
 * splitEmail("john.doe@sub.domain.co")
 * // → { localPart: "john.doe", domain: "sub.domain.co" }
 *
 * splitEmail(null)
 * // → null
 *
 * splitEmail("no-at-sign")
 * // → null
 * ```
 */
export function splitEmail(
  email: string | null | undefined
): { localPart: string; domain: string } | null {
  if (!email) return null

  const atIndex = email.indexOf("@")
  if (atIndex === -1) return null

  return {
    localPart: email.slice(0, atIndex),
    domain: email.slice(atIndex + 1),
  }
}
