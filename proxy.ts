import { NextResponse, type NextRequest } from "next/server"
import { setSecurityHeaders } from "@/config/headers"
import { WEBSITE_URL } from "@/lib/env/constants"
import { matchRedirect, type RedirectRecord } from "@/lib/formatting/redirects"

function websiteOrigin(): string | null {
  const raw = WEBSITE_URL
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.origin
  } catch {
    return null
  }
}

function isRedirectRecord(value: unknown): value is RedirectRecord {
  if (typeof value !== "object" || value === null) return false
  if (
    !("origin" in value) ||
    !("destiny" in value) ||
    !("http_code" in value)
  ) {
    return false
  }
  return (
    typeof value.origin === "string" &&
    typeof value.destiny === "string" &&
    typeof value.http_code === "string"
  )
}

async function loadRedirectRecords(
  requestUrl: URL
): Promise<readonly RedirectRecord[]> {
  try {
    // Cached lookup lives in the route. Proxy cannot run "use cache" itself.
    const endpoint = new URL("/api/redirects", requestUrl.origin)
    endpoint.searchParams.set("origin", requestUrl.pathname)
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(2_500),
    })
    if (!response.ok) return []
    const data: unknown = await response.json()
    if (!Array.isArray(data)) return []
    return data.filter(isRedirectRecord)
  } catch {
    return []
  }
}

export async function proxy(request: NextRequest) {
  const redirect = matchRedirect(
    request.nextUrl,
    await loadRedirectRecords(request.nextUrl),
    websiteOrigin()
  )
  if (redirect) {
    const response = NextResponse.redirect(redirect.location, redirect.status)
    setSecurityHeaders(response)
    return response
  }

  const response = NextResponse.next()
  setSecurityHeaders(response)
  return response
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|503|health|.*\\.png$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
