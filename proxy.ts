import { NextResponse, type NextRequest } from "next/server"
import { setSecurityHeaders } from "@/config/headers"
import { getClientIp, tryConsume } from "@/lib/server/rate-limit"

const SKIP_CONSUME_PATHS = new Set([
  "/503",
  "/maintenance",
  "/debug",
  "/health",
])

function withRetryAfter(
  response: NextResponse,
  msBeforeNext: number
): NextResponse {
  response.headers.set("Retry-After", String(Math.ceil(msBeforeNext / 1000)))
  setSecurityHeaders(response)
  return response
}

function isMutationRequest(request: NextRequest): boolean {
  return request.method === "POST" || request.headers.has("next-action")
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (SKIP_CONSUME_PATHS.has(pathname)) {
    const response = NextResponse.next()
    setSecurityHeaders(response)
    return response
  }

  const result = await tryConsume(getClientIp(request.headers))

  if (result.ok) {
    const response = NextResponse.next()
    setSecurityHeaders(response)
    return response
  }

  if (isMutationRequest(request)) {
    return withRetryAfter(
      new NextResponse(null, { status: 503 }),
      result.msBeforeNext
    )
  }

  return withRetryAfter(
    NextResponse.redirect(new URL("/503", request.url)),
    result.msBeforeNext
  )
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
