import {
  HttpRedirectEnum,
  type HttpRedirectType,
} from "@/types/enums/http-redirect"

export type RedirectRecord = {
  origin: string
  destiny: string
  http_code: string
}

export type ResolvedRedirect = {
  location: URL
  status: 301 | 302 | 307 | 308
}

function isHttpRedirect(value: string): value is HttpRedirectType {
  return (HttpRedirectEnum as readonly string[]).includes(value)
}

function redirectStatus(code: string): ResolvedRedirect["status"] | null {
  if (!isHttpRedirect(code)) return null
  return Number(code) as ResolvedRedirect["status"]
}

/** Pathname key for origin/destiny. Rejects empty, protocol-relative, and off-path values. */
function normalizeRedirectPath(value: string): string | null {
  const trimmed = value.trim()
  if (
    !trimmed ||
    trimmed.startsWith("//") ||
    /[\u0000-\u001F\\]/.test(trimmed)
  ) {
    return null
  }

  let url: URL
  try {
    if (trimmed.startsWith("/")) {
      url = new URL(trimmed, "http://redirect.local")
    } else if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      url = new URL(trimmed)
    } else {
      return null
    }
  } catch {
    return null
  }

  if (url.username || url.password) return null

  let pathname = url.pathname
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1)
  }

  try {
    pathname = decodeURI(pathname)
  } catch {
    return null
  }

  if (!pathname.startsWith("/") || pathname.startsWith("//")) return null
  return pathname
}

function safeDestination(
  destiny: string,
  requestUrl: URL,
  siteOrigin: string | null
): URL | null {
  const trimmed = destiny.trim()
  if (
    !trimmed ||
    trimmed.startsWith("//") ||
    /[\u0000-\u001F\\]/.test(trimmed)
  ) {
    return null
  }

  let url: URL
  try {
    if (trimmed.startsWith("/")) {
      url = new URL(trimmed, requestUrl.origin)
    } else {
      url = new URL(trimmed)
    }
  } catch {
    return null
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null
  if (url.username || url.password) return null

  const sameRequest = url.origin === requestUrl.origin
  const sameSite = siteOrigin !== null && url.origin === siteOrigin
  if (!sameRequest && !sameSite) return null

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1)
  }

  return url
}

function applyRequestSearch(location: URL, requestUrl: URL): URL {
  if (location.search !== "" || requestUrl.search === "") return location
  location.search = requestUrl.search
  return location
}

/** One match from the request pathname to `origin`. Skips empty, off-site, and origin === destiny. */
export function matchRedirect(
  requestUrl: URL,
  rows: readonly RedirectRecord[],
  siteOrigin: string | null
): ResolvedRedirect | null {
  const requestPath = normalizeRedirectPath(requestUrl.pathname)
  if (!requestPath) return null

  for (const row of rows) {
    if (
      typeof row.origin !== "string" ||
      typeof row.destiny !== "string" ||
      typeof row.http_code !== "string"
    ) {
      continue
    }

    const origin = normalizeRedirectPath(row.origin)
    if (origin !== requestPath) continue

    const status = redirectStatus(row.http_code)
    const location = status
      ? safeDestination(row.destiny, requestUrl, siteOrigin)
      : null
    if (!status || !location) continue

    const path = normalizeRedirectPath(location.pathname)
    if (!path || path === origin) continue

    const next = applyRequestSearch(location, requestUrl)
    if (next.href === requestUrl.href) continue
    return { location: next, status }
  }

  return null
}

function assertRedirectMatches(): void {
  const home = new URL("/", "http://localhost:3000")
  const hit = matchRedirect(
    home,
    [{ origin: "/", destiny: "/inicio", http_code: "301" }],
    null
  )
  if (hit?.location.pathname !== "/inicio" || hit.status !== 301) {
    throw new Error("redirect self-check: / -> /inicio")
  }
  if (
    matchRedirect(
      home,
      [{ origin: "/", destiny: "https://evil.example/x", http_code: "302" }],
      null
    ) !== null
  ) {
    throw new Error("redirect self-check: off-site")
  }
}

assertRedirectMatches()
