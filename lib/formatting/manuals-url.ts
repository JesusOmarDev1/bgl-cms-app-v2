import { WEBSITE_URL } from "@/lib/env/constants"

export function isManualsUrl(
  href: string | null | undefined,
  siteUrl = WEBSITE_URL || "https://website.invalid"
): boolean {
  if (!href) return false
  let site: URL
  try {
    site = new URL(siteUrl)
  } catch {
    site = new URL("https://website.invalid")
  }

  try {
    const target = new URL(href, site)
    if (target.origin !== site.origin) return false
    const pathname = decodeURIComponent(target.pathname)
    return pathname === "/manuales" || pathname.startsWith("/manuales/")
  } catch {
    return false
  }
}
