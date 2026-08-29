import { NextResponse } from "next/server"
import { setSecurityHeaders } from "@/config/headers"

export function proxy() {
  const response = NextResponse.next()
  setSecurityHeaders(response)
  return response
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
