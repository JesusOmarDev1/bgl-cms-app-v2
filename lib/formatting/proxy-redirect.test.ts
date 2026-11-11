import { afterEach, describe, expect, it, vi } from "vitest"
import type { NextRequest } from "next/server"

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL, status: number) =>
      new Response(null, { status, headers: { location: url.href } }),
    next: () => new Response(null, { status: 200 }),
  },
}))
vi.mock("@/config/headers", () => ({
  setSecurityHeaders: (response: Response) =>
    response.headers.set("X-Content-Type-Options", "nosniff"),
}))
vi.mock("@/lib/env/constants", () => ({ WEBSITE_URL: "https://example.com" }))

import { proxy } from "@/proxy"

afterEach(() => vi.unstubAllGlobals())

const request = (path: string) =>
  ({ nextUrl: new URL(path, "https://example.com") }) as NextRequest

describe("redirect proxy", () => {
  it("does not redirect two records that point back to one another", async () => {
    const fetch = vi.fn(async (url: URL) =>
      Response.json(
        url.searchParams.get("origin") === "/a"
          ? [{ origin: "/a", destiny: "/b", http_code: "301" }]
          : [{ origin: "/b", destiny: "/a", http_code: "301" }]
      )
    )
    vi.stubGlobal("fetch", fetch)

    const response = await proxy(request("/a"))

    expect(response.status).toBe(200)
    expect(response.headers.get("location")).toBeNull()
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("keeps normal redirects and headers", async () => {
    const fetch = vi.fn(async (url: URL) =>
      Response.json(
        url.searchParams.get("origin") === "/a"
          ? [{ origin: "/a", destiny: "/b", http_code: "301" }]
          : []
      )
    )
    vi.stubGlobal("fetch", fetch)

    const response = await proxy(request("/a"))

    expect(response.status).toBe(301)
    expect(response.headers.get("location")).toBe("https://example.com/b")
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
  })

  it("continues without a redirect when lookup fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 }))
    )

    const response = await proxy(request("/a"))

    expect(response.status).toBe(200)
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
  })
})
