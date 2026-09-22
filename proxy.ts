import { NextResponse, type NextRequest } from "next/server"
import { setSecurityHeaders } from "@/config/headers"

export async function proxy(request: NextRequest) {
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
